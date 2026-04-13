-- ============================================
-- FASE 4: Prompts library with versioning
-- ============================================

create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  content text not null default '',
  category text not null default 'general',
  tags text[] default '{}',
  variables jsonb default '[]'::jsonb,
  version integer not null default 1,
  parent_prompt_id uuid references public.prompts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_prompts_workspace on public.prompts(workspace_id);
create index idx_prompts_category on public.prompts(workspace_id, category);
create index idx_prompts_parent on public.prompts(parent_prompt_id);

create trigger prompts_updated_at
  before update on public.prompts
  for each row
  execute function public.handle_updated_at();
