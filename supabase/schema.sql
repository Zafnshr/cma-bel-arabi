create table if not exists public.terms (
  id text primary key,
  term text not null,
  translation text not null,
  definition text not null,
  context text,
  aliases text[] not null default '{}'
);

create table if not exists public.study_units (
  id text primary key,
  title text not null,
  part text not null,
  estimated_minutes integer not null default 0,
  summary text not null,
  paragraphs jsonb not null default '[]'::jsonb,
  key_takeaways jsonb not null default '[]'::jsonb
);

create table if not exists public.mcqs (
  id text primary key,
  unit_id text not null references public.study_units(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_option_id text not null,
  explanation text not null
);

alter table public.terms enable row level security;
alter table public.study_units enable row level security;
alter table public.mcqs enable row level security;

drop policy if exists "Public read terms" on public.terms;
create policy "Public read terms"
  on public.terms for select
  to anon
  using (true);

drop policy if exists "Public read study units" on public.study_units;
create policy "Public read study units"
  on public.study_units for select
  to anon
  using (true);

drop policy if exists "Public read mcqs" on public.mcqs;
create policy "Public read mcqs"
  on public.mcqs for select
  to anon
  using (true);
