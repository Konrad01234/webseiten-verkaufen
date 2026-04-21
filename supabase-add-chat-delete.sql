-- ============================================================================
-- WorkPilot — Chat- und Nachrichten-Loeschen erlauben
-- ----------------------------------------------------------------------------
-- Einmal im Supabase SQL Editor ausfuehren. Idempotent.
--
-- Ergaenzt fehlende DELETE-Policies damit:
--   - Der Absender einer Nachricht seine eigene Nachricht loeschen kann.
--   - Worker ODER Employer den kompletten Chat loeschen koennen. Durch das
--     vorhandene ON DELETE CASCADE auf messages.chat_id verschwinden dabei
--     automatisch alle Nachrichten des Chats.
-- ============================================================================

-- Nachrichten: jedes Chat-Mitglied (Worker ODER Employer) darf
-- jede Nachricht im Chat loeschen. Symmetrisch und passend zu
-- "beide Seiten koennen loeschen" aus der Produkt-Anforderung.
-- Die alte Sender-Only-Policy aufheben falls sie schon da ist.
DROP POLICY IF EXISTS "msgs_delete_sender" ON public.messages;
DROP POLICY IF EXISTS "msgs_delete_member" ON public.messages;
CREATE POLICY "msgs_delete_member"
  ON public.messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chats c
       WHERE c.id = chat_id
         AND (c.worker_id = auth.uid() OR c.employer_id = auth.uid())
    )
  );

-- Chat: jedes Mitglied (Worker oder Employer) darf den Chat loeschen.
-- Der Chat verschwindet dadurch fuer beide Seiten (gewuenschtes Verhalten).
DROP POLICY IF EXISTS "chats_delete_member" ON public.chats;
CREATE POLICY "chats_delete_member"
  ON public.chats
  FOR DELETE
  TO authenticated
  USING (auth.uid() = worker_id OR auth.uid() = employer_id);

-- Realtime: DELETE-Events auf messages/chats werden automatisch mit
-- publiziert (messages/chats liegen schon in supabase_realtime). Der
-- Client muss nur auf event='DELETE' subscriben.
