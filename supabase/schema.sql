-- RiceLin initial schema. Run in the Supabase SQL Editor.
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('member', 'admin', 'moderator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.post_kind as enum ('tutorial', 'rice', 'question', 'showcase');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.post_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text not null default '' check (char_length(bio) <= 500),
  distro text,
  desktop_environment text,
  avatar_url text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text check (excerpt is null or char_length(excerpt) <= 280),
  body text not null check (char_length(body) between 20 and 50000),
  kind public.post_kind not null default 'tutorial',
  status public.post_status not null default 'draft',
  difficulty text check (difficulty is null or difficulty in ('beginner','intermediate','advanced')),
  distro text[] not null default '{}',
  desktop_environment text[] not null default '{}',
  software text[] not null default '{}',
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.tags (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id bigint not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 1000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  check (post_id is not null or comment_id is not null)
);

create index if not exists posts_status_created_idx on public.posts(status, created_at desc);
create index if not exists posts_author_idx on public.posts(author_id);
create index if not exists comments_post_created_idx on public.comments(post_id, created_at);
create index if not exists reports_status_idx on public.reports(status, created_at);

-- Automatically create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Keep updated_at current.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts
for each row execute procedure public.set_updated_at();

drop trigger if exists comments_updated_at on public.comments;
create trigger comments_updated_at before update on public.comments
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.reports enable row level security;

-- Profiles are publicly readable; users can edit their own public fields, but never their role.
drop policy if exists "Profiles are readable" on public.profiles;
create policy "Profiles are readable" on public.profiles for select using (true);

drop policy if exists "Users update own profile fields" on public.profiles;
create policy "Users update own profile fields" on public.profiles for update
using (auth.uid() = id) with check (auth.uid() = id);
-- Note: role is still protected by database grants; do not grant direct role edits to the client.
revoke update on public.profiles from anon, authenticated;
grant update (username, display_name, bio, distro, desktop_environment, avatar_url) on public.profiles to authenticated;

drop policy if exists "Published posts readable" on public.posts;
create policy "Published posts readable" on public.posts for select
using (status = 'published' or author_id = auth.uid());

drop policy if exists "Members create community posts" on public.posts;
create policy "Members create community posts" on public.posts for insert to authenticated
with check (author_id = auth.uid() and kind in ('question','showcase') and status = 'published');

drop policy if exists "Authors edit own community posts" on public.posts;
create policy "Authors edit own community posts" on public.posts for update to authenticated
using (author_id = auth.uid() and kind in ('question','showcase'))
with check (author_id = auth.uid() and kind in ('question','showcase'));

drop policy if exists "Admins manage posts" on public.posts;
create policy "Admins manage posts" on public.posts for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Comments readable on published posts" on public.comments;
create policy "Comments readable on published posts" on public.comments for select
using (exists (select 1 from public.posts p where p.id = post_id and p.status = 'published'));

drop policy if exists "Signed-in users add comments" on public.comments;
create policy "Signed-in users add comments" on public.comments for insert to authenticated
with check (author_id = auth.uid() and exists (select 1 from public.posts p where p.id = post_id and p.status = 'published'));

drop policy if exists "Authors edit own comments" on public.comments;
create policy "Authors edit own comments" on public.comments for update to authenticated
using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "Authors or admins delete comments" on public.comments;
create policy "Authors or admins delete comments" on public.comments for delete to authenticated
using (author_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Votes readable" on public.votes;
create policy "Votes readable" on public.votes for select using (true);
drop policy if exists "Users manage own votes" on public.votes;
create policy "Users manage own votes" on public.votes for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users read own bookmarks" on public.bookmarks;
create policy "Users read own bookmarks" on public.bookmarks for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users manage own bookmarks" on public.bookmarks;
create policy "Users manage own bookmarks" on public.bookmarks for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Tags readable" on public.tags;
create policy "Tags readable" on public.tags for select using (true);
drop policy if exists "Post tags readable" on public.post_tags;
create policy "Post tags readable" on public.post_tags for select using (true);
drop policy if exists "Admins manage tags" on public.tags;
create policy "Admins manage tags" on public.tags for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Admins manage post tags" on public.post_tags;
create policy "Admins manage post tags" on public.post_tags for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Users create reports" on public.reports;
create policy "Users create reports" on public.reports for insert to authenticated
with check (reporter_id = auth.uid());
drop policy if exists "Users read own reports" on public.reports;
create policy "Users read own reports" on public.reports for select to authenticated
using (reporter_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')));
drop policy if exists "Moderators manage reports" on public.reports;
create policy "Moderators manage reports" on public.reports for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator')));

grant select on public.posts, public.profiles, public.comments, public.votes, public.tags, public.post_tags to anon, authenticated;
grant insert, update, delete on public.comments, public.votes, public.bookmarks, public.reports to authenticated;
grant select, insert, update, delete on public.posts, public.tags, public.post_tags to authenticated;
grant select, insert, update, delete on public.bookmarks to authenticated;
