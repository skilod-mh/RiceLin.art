# RiceLin — full-stack starter

RiceLin is a Linux customization tutorials and community website built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Requirements

- Node.js 20.9 or newer
- npm
- A Supabase project (free tier is enough to start)

## 1. Create the project

If you want to start from this starter bundle, unzip it and run:

```bash
cd ricelin-starter
npm install
```

If you prefer a fresh official Next.js scaffold, create it with `npx create-next-app@latest` and copy the `app/`, `lib/`, and `supabase/` folders from this bundle into it. Choose TypeScript, App Router, Tailwind CSS, and the `src/` directory option **No** so the paths match this starter.

## 2. Configure Supabase

1. Create a project at https://supabase.com/dashboard.
2. Open the SQL Editor and run `supabase/schema.sql`.
3. In Project Settings → API, copy the Project URL and publishable key.
4. Copy `.env.example` to `.env.local` and fill in the values.

```bash
cp .env.example .env.local
```

Never put a Supabase `service_role` key in a `NEXT_PUBLIC_` variable or commit secrets to Git.

### Email confirmation setup

In Supabase Dashboard → Authentication → URL Configuration, set your local Site URL to `http://localhost:3000` while developing. Add your production domain to the allowed redirect URLs when you deploy.

In Authentication → Email Templates → Confirm signup, set the confirmation link to:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

This starter includes the `/auth/confirm` route that verifies the email token and creates the session.

## 3. Create your first admin

1. Run the app and register an account at `/login` using the sign-up form.
2. In Supabase SQL Editor, run the following statement, replacing the email with the email you registered:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'you@example.com'
);
```

Only do this for your own account. Do not expose role editing to public users.

## 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## What is included

- Dark RiceLin landing page and responsive layout
- Supabase server-side session client
- Email/password sign-in and sign-up actions
- Protected admin page with role check
- Admin publishing action for tutorials/rices
- SQL schema for profiles, posts, comments, votes, bookmarks, tags, and row-level security
- Copy buttons for example shell commands

## Important limitations

This is a learning starter, not a production-audited app. Before public launch, add email confirmation and password-reset UX, rate limiting, moderation/report workflows, upload validation, automated tests, logging, and backups. Review all RLS policies before adding new tables. User-submitted commands are displayed as text; the site must never execute them on a visitor's computer.

## Next milestones

1. Confirm the homepage and Supabase connection work.
2. Add a tutorial detail route and search/filters.
3. Add community posts and threaded comments.
4. Add voting, bookmarks, profiles, and reports.
5. Add safe screenshot uploads and moderation tools.
