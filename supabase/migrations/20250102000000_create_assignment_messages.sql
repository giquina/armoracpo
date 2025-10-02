-- Create assignment_messages table for in-app messaging between principals and CPOs
-- This enables secure, real-time communication during active assignments

CREATE TABLE IF NOT EXISTS assignment_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES protection_assignments(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('principal', 'cpo')),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_assignment_messages_assignment_id ON assignment_messages(assignment_id);
CREATE INDEX idx_assignment_messages_created_at ON assignment_messages(created_at DESC);
CREATE INDEX idx_assignment_messages_read ON assignment_messages(assignment_id, read) WHERE read = false;

-- Enable Row Level Security
ALTER TABLE assignment_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Principals can read messages for their assignments
CREATE POLICY "Principals can read messages for their assignments"
  ON assignment_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM protection_assignments
      WHERE protection_assignments.id = assignment_messages.assignment_id
      AND protection_assignments.principal_id = auth.uid()
    )
  );

-- RLS Policy: CPOs can read messages for assignments they're assigned to
CREATE POLICY "CPOs can read messages for their assignments"
  ON assignment_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM protection_assignments pa
      JOIN protection_officers po ON po.id = pa.cpo_id
      WHERE pa.id = assignment_messages.assignment_id
      AND po.user_id = auth.uid()
    )
  );

-- RLS Policy: Principals can send messages for their assignments
CREATE POLICY "Principals can send messages for their assignments"
  ON assignment_messages
  FOR INSERT
  WITH CHECK (
    sender_type = 'principal'
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM protection_assignments
      WHERE protection_assignments.id = assignment_messages.assignment_id
      AND protection_assignments.principal_id = auth.uid()
    )
  );

-- RLS Policy: CPOs can send messages for assignments they're assigned to
CREATE POLICY "CPOs can send messages for their assignments"
  ON assignment_messages
  FOR INSERT
  WITH CHECK (
    sender_type = 'cpo'
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM protection_assignments pa
      JOIN protection_officers po ON po.id = pa.cpo_id
      WHERE pa.id = assignment_messages.assignment_id
      AND po.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can mark their received messages as read
CREATE POLICY "Users can mark messages as read"
  ON assignment_messages
  FOR UPDATE
  USING (
    -- Principals can mark messages sent by CPOs as read
    (
      sender_type = 'cpo'
      AND EXISTS (
        SELECT 1 FROM protection_assignments
        WHERE protection_assignments.id = assignment_messages.assignment_id
        AND protection_assignments.principal_id = auth.uid()
      )
    )
    OR
    -- CPOs can mark messages sent by principals as read
    (
      sender_type = 'principal'
      AND EXISTS (
        SELECT 1 FROM protection_assignments pa
        JOIN protection_officers po ON po.id = pa.cpo_id
        WHERE pa.id = assignment_messages.assignment_id
        AND po.user_id = auth.uid()
      )
    )
  );

-- Enable real-time subscriptions for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE assignment_messages;

-- Add comment for documentation
COMMENT ON TABLE assignment_messages IS 'Stores in-app messages between principals and CPOs for active assignments. Supports real-time communication with RLS policies ensuring users only access messages for their own assignments.';
