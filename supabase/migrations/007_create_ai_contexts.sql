-- AI Context: stores brand context for AI-powered content generation
CREATE TABLE IF NOT EXISTS ai_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL DEFAULT '',
  brand_description TEXT NOT NULL DEFAULT '',
  target_audience TEXT NOT NULL DEFAULT '',
  tone_of_voice TEXT NOT NULL DEFAULT '',
  key_topics TEXT[] DEFAULT '{}',
  differentiators TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'es',
  extra_instructions TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id)
);

-- One context per workspace
CREATE INDEX IF NOT EXISTS idx_ai_contexts_workspace ON ai_contexts(workspace_id);
