-- Temporarily make created_by nullable while auth is disabled
alter table public.pages alter column created_by drop not null;
alter table public.pages drop constraint if exists pages_created_by_fkey;
