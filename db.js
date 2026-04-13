// =====================================================================
// EasyJobs — Database Wrapper (Supabase)
// ---------------------------------------------------------------------
// All Supabase calls live here. The rest of the app talks to these
// helpers instead of touching the SDK directly. Every helper either
// resolves with data or throws — the caller decides how to surface it.
// =====================================================================

(function () {
  if (!window.SUPABASE_CONFIG) {
    console.error('[db] config.js must be loaded before db.js');
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    console.error('[db] @supabase/supabase-js must be loaded before db.js');
    return;
  }

  const sb = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey,
    { auth: { persistSession: true, autoRefreshToken: true } }
  );

  // Convenience: turn a Supabase response into data or throw on error.
  function unwrap(res) {
    if (res.error) throw res.error;
    return res.data;
  }

  // -----------------------------------------------------------------
  // AUTH
  // -----------------------------------------------------------------
  async function signUp({ email, password, name, role, company, captchaToken }) {
    const opts = { data: { name, role, company: company || null } };
    if (captchaToken) opts.captchaToken = captchaToken;
    const res = await sb.auth.signUp({ email, password, options: opts });
    if (res.error) throw res.error;
    // The DB trigger inserts into profiles automatically. We then make
    // sure the row exists in case the trigger isn't installed yet.
    if (res.data.user) {
      await sb.from('profiles').upsert({
        id: res.data.user.id,
        email, name, role,
        company: company || null,
        approved: true
      }, { onConflict: 'id' });
    }
    return res.data;
  }

  async function signIn({ email, password }) {
    const res = await sb.auth.signInWithPassword({ email, password });
    if (res.error) throw res.error;
    return res.data;
  }

  async function signOut() {
    const res = await sb.auth.signOut();
    if (res.error) throw res.error;
  }

  async function resetPasswordForEmail(email, redirectTo) {
    const res = await sb.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
    if (res.error) throw res.error;
    return res.data;
  }

  async function updatePassword(newPassword) {
    const res = await sb.auth.updateUser({ password: newPassword });
    if (res.error) throw res.error;
    return res.data;
  }

  async function getSession() {
    const res = await sb.auth.getSession();
    return res.data?.session || null;
  }

  function onAuthChange(cb) {
    return sb.auth.onAuthStateChange((event, session) => cb(event, session));
  }

  // -----------------------------------------------------------------
  // PROFILES
  // -----------------------------------------------------------------
  async function getProfile(userId) {
    const res = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (res.error) throw res.error;
    return res.data;
  }

  async function updateProfile(userId, patch) {
    const res = await sb.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', userId).select().single();
    if (res.error) throw res.error;
    return res.data;
  }

  // -----------------------------------------------------------------
  // JOBS
  // -----------------------------------------------------------------
  async function listJobs(opts = {}) {
    let q = sb.from('jobs').select('*').eq('active', true).order('promoted', { ascending: false }).order('created_at', { ascending: false });
    if (opts.limit) q = q.limit(opts.limit);
    return unwrap(await q);
  }

  async function getJob(id) {
    return unwrap(await sb.from('jobs').select('*').eq('id', id).maybeSingle());
  }

  async function getJobsByEmployer(employerId) {
    return unwrap(await sb.from('jobs').select('*').eq('employer_id', employerId).order('created_at', { ascending: false }));
  }

  async function createJob(jobData) {
    const res = await sb.from('jobs').insert(jobData).select().single();
    if (res.error) throw res.error;
    return res.data;
  }

  async function updateJob(id, patch) {
    return unwrap(await sb.from('jobs').update(patch).eq('id', id).select().single());
  }

  async function deleteJob(id) {
    const res = await sb.from('jobs').delete().eq('id', id);
    if (res.error) throw res.error;
  }

  async function incrementJobMetric(id, field) {
    // Atomic increment via RPC would be cleaner, but for now we read-modify-write.
    const job = await getJob(id);
    if (!job) return;
    const patch = {}; patch[field] = (job[field] || 0) + 1;
    await sb.from('jobs').update(patch).eq('id', id);
  }

  // -----------------------------------------------------------------
  // APPLICATIONS
  // -----------------------------------------------------------------
  async function applyToJob(jobId, workerId, message) {
    const res = await sb.from('applications').insert({
      job_id: jobId, worker_id: workerId, message: message || null
    }).select().single();
    if (res.error) throw res.error;
    // Bump the count on the job
    await incrementJobMetric(jobId, 'applications_count');
    return res.data;
  }

  async function getApplicationsForWorker(workerId) {
    return unwrap(await sb.from('applications')
      .select('*, jobs(*)')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false }));
  }

  async function getApplicationsForJob(jobId) {
    return unwrap(await sb.from('applications')
      .select('*, profiles!applications_worker_id_fkey(*)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false }));
  }

  async function getApplicationsForEmployer(employerId) {
    // Fetch all jobs of this employer, then all applications for those jobs.
    const jobs = await getJobsByEmployer(employerId);
    if (!jobs.length) return [];
    const ids = jobs.map(j => j.id);
    return unwrap(await sb.from('applications')
      .select('*, profiles!applications_worker_id_fkey(*), jobs(*)')
      .in('job_id', ids)
      .order('created_at', { ascending: false }));
  }

  async function updateApplicationStatus(id, status) {
    return unwrap(await sb.from('applications').update({ status }).eq('id', id).select().single());
  }

  // -----------------------------------------------------------------
  // CHATS + MESSAGES
  // -----------------------------------------------------------------
  async function getOrCreateChat({ workerId, employerId, jobId, jobTitle }) {
    // Look for an existing chat between these two for this job.
    let q = sb.from('chats').select('*').eq('worker_id', workerId).eq('employer_id', employerId);
    if (jobId) q = q.eq('job_id', jobId); else q = q.is('job_id', null);
    const existing = unwrap(await q.maybeSingle());
    if (existing) return existing;
    return unwrap(await sb.from('chats').insert({
      worker_id: workerId, employer_id: employerId, job_id: jobId || null, job_title: jobTitle || null
    }).select().single());
  }

  async function listChatsForUser(userId) {
    return unwrap(await sb.from('chats')
      .select('*, worker:profiles!chats_worker_id_fkey(id,name,company), employer:profiles!chats_employer_id_fkey(id,name,company)')
      .or(`worker_id.eq.${userId},employer_id.eq.${userId}`)
      .order('last_message_at', { ascending: false }));
  }

  async function getMessages(chatId) {
    return unwrap(await sb.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true }));
  }

  async function sendMessage(chatId, senderId, text) {
    const res = await sb.from('messages').insert({ chat_id: chatId, sender_id: senderId, text }).select().single();
    if (res.error) throw res.error;
    // Update parent chat's last_message
    await sb.from('chats').update({ last_message: text, last_message_at: new Date().toISOString() }).eq('id', chatId);
    return res.data;
  }

  function subscribeToMessages(chatId, cb) {
    return sb.channel('messages-' + chatId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: 'chat_id=eq.' + chatId },
        payload => cb(payload.new))
      .subscribe();
  }

  function subscribeToChatList(userId, cb) {
    return sb.channel('chats-' + userId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => cb())
      .subscribe();
  }

  // -----------------------------------------------------------------
  // REVIEWS
  // -----------------------------------------------------------------
  async function getReviewsFor(userId) {
    return unwrap(await sb.from('reviews')
      .select('*, reviewer:profiles!reviews_reviewer_id_fkey(name,company)')
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false }));
  }

  async function createReview({ reviewerId, reviewedId, jobId, rating, text }) {
    return unwrap(await sb.from('reviews').insert({
      reviewer_id: reviewerId, reviewed_id: reviewedId, job_id: jobId || null, rating, text: text || null
    }).select().single());
  }

  // -----------------------------------------------------------------
  // SAVED JOBS
  // -----------------------------------------------------------------
  async function listSavedJobIds(userId) {
    const rows = unwrap(await sb.from('saved_jobs').select('job_id').eq('user_id', userId));
    return rows.map(r => r.job_id);
  }
  async function saveJob(userId, jobId) {
    await sb.from('saved_jobs').upsert({ user_id: userId, job_id: jobId });
  }
  async function unsaveJob(userId, jobId) {
    await sb.from('saved_jobs').delete().eq('user_id', userId).eq('job_id', jobId);
  }

  // -----------------------------------------------------------------
  // SUPPORT TICKETS
  // -----------------------------------------------------------------
  async function createSupportTicket({ userId, category, subject, message }) {
    return unwrap(await sb.from('support_tickets').insert({
      user_id: userId, category, subject, message
    }).select().single());
  }
  async function listSupportTickets(userId) {
    return unwrap(await sb.from('support_tickets').select('*').eq('user_id', userId).order('created_at', { ascending: false }));
  }

  // -----------------------------------------------------------------
  // STORAGE (optional — nur wenn window.IMAGE_BUCKET in config.js gesetzt)
  // -----------------------------------------------------------------
  // Lädt eine Datei in den public bucket hoch und gibt die public-URL
  // zurück. Wenn IMAGE_BUCKET leer ist, wirft das einen Fehler — der
  // Aufrufer kann dann auf base64 zurückfallen.
  async function uploadImage(file, path) {
    const bucket = window.IMAGE_BUCKET;
    if (!bucket) throw new Error('IMAGE_BUCKET nicht konfiguriert');
    if (!file) throw new Error('Keine Datei');
    // Eindeutigen Pfad bauen falls keiner mitgegeben (user-id/timestamp)
    const session = await getSession();
    const uid = session && session.user ? session.user.id : 'anon';
    const safeName = (file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalPath = path || `${uid}/${Date.now()}-${safeName}`;
    const res = await sb.storage.from(bucket).upload(finalPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg'
    });
    if (res.error) throw res.error;
    const { data } = sb.storage.from(bucket).getPublicUrl(finalPath);
    return { path: finalPath, url: data && data.publicUrl };
  }
  function getPublicImageUrl(path) {
    const bucket = window.IMAGE_BUCKET;
    if (!bucket || !path) return null;
    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    return data && data.publicUrl;
  }

  // -----------------------------------------------------------------
  // EXPORT
  // -----------------------------------------------------------------
  window.DB = {
    sb,
    // auth
    signUp, signIn, signOut, getSession, onAuthChange, resetPasswordForEmail, updatePassword,
    // profiles
    getProfile, updateProfile,
    // jobs
    listJobs, getJob, getJobsByEmployer, createJob, updateJob, deleteJob, incrementJobMetric,
    // applications
    applyToJob, getApplicationsForWorker, getApplicationsForJob, getApplicationsForEmployer, updateApplicationStatus,
    // chats + messages
    getOrCreateChat, listChatsForUser, getMessages, sendMessage,
    subscribeToMessages, subscribeToChatList,
    // reviews
    getReviewsFor, createReview,
    // saved jobs
    listSavedJobIds, saveJob, unsaveJob,
    // support
    createSupportTicket, listSupportTickets,
    // storage (optional)
    uploadImage, getPublicImageUrl
  };
})();
