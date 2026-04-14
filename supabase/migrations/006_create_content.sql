-- ============================================
-- FASE 6: Content items + media storage
-- ============================================

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'facebook', 'linkedin', 'x', 'youtube', 'threads')),
  format text not null default 'post' check (format in ('post', 'reel', 'story', 'carousel', 'video', 'short', 'article')),
  hook text,
  caption text not null default '',
  hashtags text[] default '{}',
  media_urls text[] default '{}',
  status text not null default 'draft' check (status in ('idea', 'draft', 'ready', 'scheduled', 'published', 'archived')),
  scheduled_for timestamptz,
  published_at timestamptz,
  metrics jsonb default '{}'::jsonb,
  notes text,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_content_workspace on public.content_items(workspace_id);
create index idx_content_status on public.content_items(workspace_id, status);
create index idx_content_platform on public.content_items(workspace_id, platform);
create index idx_content_scheduled on public.content_items(scheduled_for) where scheduled_for is not null;

create trigger content_items_updated_at
  before update on public.content_items
  for each row
  execute function public.handle_updated_at();

-- Storage bucket for content media (create via Supabase dashboard or API)
-- insert into storage.buckets (id, name, public) values ('content-media', 'content-media', true);
