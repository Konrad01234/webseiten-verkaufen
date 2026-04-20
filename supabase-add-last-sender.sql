-- Add last_sender_id to chats table for unread message tracking.
-- Run this once in your Supabase SQL editor.
ALTER TABLE chats ADD COLUMN IF NOT EXISTS last_sender_id uuid REFERENCES auth.users(id);
