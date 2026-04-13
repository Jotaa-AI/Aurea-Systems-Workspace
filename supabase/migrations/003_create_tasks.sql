-- ============================================
-- FASE 2: Tasks + Task Boards
-- ============================================

create table public.task_boards (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null default 'Principal',
  columns jsonb not null default '[
    {"id": "backlog", "title": "Backlog"},
    {"id": "todo", "title": "Por hacer"},
    {"id": "in_progress", "title": "En progreso"},
    {"id": "done", "title": "Hecho"}
  ]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  board_id uuid not null references public.task_boards(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee_id uuid,
  due_date date,
  client_id uuid,
  page_id uuid references public.pages(id) on delete set null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_workspace on public.tasks(workspace_id);
create index idx_tasks_board on public.tasks(board_id);
create index idx_tasks_status on public.tasks(board_id, status);

create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();

alter publication supabase_realtime add table public.tasks;
