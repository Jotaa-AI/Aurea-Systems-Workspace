-- ============================================
-- FASE 0: Core - Workspaces, Members
-- ============================================

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

-- Workspace Members (created before policies that reference it)
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.workspace_members enable row level security;

-- Policies for workspaces
create policy "Members can view their workspace"
  on public.workspaces for select
  using (
    id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Members can update their workspace"
  on public.workspaces for update
  using (
    id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

-- Policies for workspace_members
create policy "Members can view co-members"
  on public.workspace_members for select
  using (
    workspace_id in (
      select wm.workspace_id from public.workspace_members wm
      where wm.user_id = auth.uid()
    )
  );

-- ============================================
-- FASE 1: Pages
-- ============================================

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  parent_id uuid references public.pages(id) on delete set null,
  title text not null default 'Sin titulo',
  icon text,
  content jsonb default '[]'::jsonb,
  is_favorite boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pages enable row level security;

create index idx_pages_workspace on public.pages(workspace_id);
create index idx_pages_parent on public.pages(parent_id);
create index idx_pages_favorite on public.pages(workspace_id, is_favorite) where is_favorite = true;

create policy "Members can view workspace pages"
  on public.pages for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Members can insert pages"
  on public.pages for insert
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Members can update pages"
  on public.pages for update
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Members can delete pages"
  on public.pages for delete
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

-- Trigger para updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pages_updated_at
  before update on public.pages
  for each row
  execute function public.handle_updated_at();

-- Habilitar Realtime en pages
alter publication supabase_realtime add table public.pages;

-- Funcion helper: crear workspace + asignar owner
create or replace function public.create_workspace_for_user(
  p_name text,
  p_user_id uuid
)
returns uuid as $$
declare
  v_workspace_id uuid;
begin
  insert into public.workspaces (name)
  values (p_name)
  returning id into v_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, p_user_id, 'owner');

  return v_workspace_id;
end;
$$ language plpgsql security definer;
