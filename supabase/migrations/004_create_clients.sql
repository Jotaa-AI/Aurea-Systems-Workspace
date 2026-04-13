-- ============================================
-- FASE 3: Clients + Client Metrics
-- ============================================

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  ghl_location_id text,
  ghl_api_key_encrypted text,
  status text not null default 'active' check (status in ('active', 'onboarding', 'paused', 'churned')),
  mrr numeric(10,2) default 0,
  notes text,
  health_score integer default 100 check (health_score >= 0 and health_score <= 100),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_clients_workspace on public.clients(workspace_id);

create trigger clients_updated_at
  before update on public.clients
  for each row
  execute function public.handle_updated_at();

create table public.client_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  date date not null,
  leads_count integer default 0,
  appointments_count integer default 0,
  no_show_count integer default 0,
  revenue_generated numeric(10,2) default 0,
  created_at timestamptz not null default now(),
  unique(client_id, date)
);

create index idx_client_metrics_client on public.client_metrics(client_id);
create index idx_client_metrics_date on public.client_metrics(client_id, date desc);

-- Add client_id FK to tasks
alter table public.tasks
  add constraint tasks_client_id_fkey
  foreign key (client_id) references public.clients(id) on delete set null;
