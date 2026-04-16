-- ============================================
-- 009: Page comments (async discussions on pages)
-- ============================================

CREATE TABLE IF NOT EXISTS page_comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  page_id       UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  -- Optional threading: reply-to another comment
  parent_id     UUID REFERENCES page_comments(id) ON DELETE CASCADE,
  -- Author metadata (denormalized for display without joining users)
  author_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name   TEXT NOT NULL DEFAULT 'Usuario',
  author_email  TEXT,
  body          TEXT NOT NULL CHECK (length(body) > 0 AND length(body) <= 5000),
  resolved      BOOLEAN NOT NULL DEFAULT false,
  resolved_at   TIMESTAMPTZ,
  resolved_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_page_comments_page      ON page_comments(page_id);
CREATE INDEX idx_page_comments_workspace ON page_comments(workspace_id);
CREATE INDEX idx_page_comments_parent    ON page_comments(parent_id);
CREATE INDEX idx_page_comments_unresolved
  ON page_comments(page_id)
  WHERE resolved = false;

-- Updated-at trigger
CREATE TRIGGER set_page_comments_updated_at
  BEFORE UPDATE ON page_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- RLS
ALTER TABLE page_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can manage page comments"
  ON page_comments FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- Allow service-role full access (bypass RLS for server actions)
CREATE POLICY "service role bypass page_comments"
  ON page_comments FOR ALL
  USING (true)
  WITH CHECK (true);

-- Realtime for live comment updates
ALTER PUBLICATION supabase_realtime ADD TABLE page_comments;
