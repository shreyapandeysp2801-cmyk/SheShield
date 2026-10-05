/*
# Create chat conversations and messages tables (single-tenant, no auth)

1. New Tables
- `chat_conversations`: Stores a conversation session with a title and timestamps.
  - `id` (uuid, primary key)
  - `title` (text, not null) — auto-generated from the first message
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

- `chat_messages`: Stores individual messages within a conversation.
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key to chat_conversations, ON DELETE CASCADE)
  - `role` (text, not null) — either 'user' or 'assistant'
  - `content` (text, not null) — the message text
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD because this app has no sign-in screen (single-tenant).
- Policies are intentionally permissive (USING true / WITH CHECK true) because all data is shared/public.

3. Indexes
- Index on `chat_messages.conversation_id` for fast message retrieval by conversation.
- Index on `chat_conversations.updated_at` for listing recent conversations first.

4. Important Notes
- This is a single-tenant app with no authentication. All visitors share the same conversation pool.
- Foreign key uses ON DELETE CASCADE so deleting a conversation also deletes its messages.
- The `updated_at` column on conversations is set on creation but not auto-updated by the database (the edge function updates it when new messages are added).
*/

CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New Conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON chat_conversations(updated_at DESC);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- chat_conversations policies (single-tenant: anon + authenticated)
DROP POLICY IF EXISTS "anon_select_conversations" ON chat_conversations;
CREATE POLICY "anon_select_conversations" ON chat_conversations
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_conversations" ON chat_conversations;
CREATE POLICY "anon_insert_conversations" ON chat_conversations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_conversations" ON chat_conversations;
CREATE POLICY "anon_update_conversations" ON chat_conversations
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_conversations" ON chat_conversations;
CREATE POLICY "anon_delete_conversations" ON chat_conversations
  FOR DELETE TO anon, authenticated USING (true);

-- chat_messages policies (single-tenant: anon + authenticated)
DROP POLICY IF EXISTS "anon_select_messages" ON chat_messages;
CREATE POLICY "anon_select_messages" ON chat_messages
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON chat_messages;
CREATE POLICY "anon_insert_messages" ON chat_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON chat_messages;
CREATE POLICY "anon_update_messages" ON chat_messages
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON chat_messages;
CREATE POLICY "anon_delete_messages" ON chat_messages
  FOR DELETE TO anon, authenticated USING (true);
