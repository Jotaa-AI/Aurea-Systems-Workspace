-- ============================================
-- 008: Processes / SOPs (BPMN methodology)
-- ============================================

CREATE TABLE IF NOT EXISTS processes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id     UUID REFERENCES processes(id) ON DELETE SET NULL,
  title         TEXT NOT NULL DEFAULT 'Sin título',
  description   TEXT DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'general',
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','active','review','archived')),
  version       INT NOT NULL DEFAULT 1,
  owner_id      TEXT,
  icon          TEXT DEFAULT '📋',
  -- BPMN-inspired structured steps
  steps         JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Rich-text documentation (BlockNote JSON)
  content       JSONB DEFAULT '[]'::jsonb,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  estimated_duration_minutes INT,
  is_template   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_processes_workspace  ON processes(workspace_id);
CREATE INDEX idx_processes_parent     ON processes(parent_id);
CREATE INDEX idx_processes_category   ON processes(category);
CREATE INDEX idx_processes_status     ON processes(status);
CREATE INDEX idx_processes_template   ON processes(is_template) WHERE is_template = true;

-- Updated-at trigger (reuse existing function)
CREATE TRIGGER set_processes_updated_at
  BEFORE UPDATE ON processes
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- RLS
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can manage processes"
  ON processes FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- Allow service-role full access (bypass RLS)
CREATE POLICY "service role bypass processes"
  ON processes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE processes;

-- ============================================
-- Seed: SOP templates (BPMN methodology)
-- ============================================

-- We'll insert templates with workspace_id = NULL approach won't work due to FK.
-- Instead, templates will be seeded per-workspace via the app.
-- The is_template flag marks them as reusable.
