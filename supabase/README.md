# Database Schema

This directory contains the SQL schema for the multi-tenant CMS.

## Setup Instructions

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `schema.sql`
4. Click **Run** to execute the schema

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db reset
# Or apply the migration
psql "postgresql://postgres:fHbPhUcTRWjKjpCA@db.qgisnksjztjczsrbjryr.supabase.co:5432/postgres" -f schema.sql
```

### Option 3: Using psql directly

```bash
psql "postgresql://postgres:fHbPhUcTRWjKjpCA@db.qgisnksjztjczsrbjryr.supabase.co:5432/postgres" -f schema.sql
```

## Schema Overview

### Tables

1. **tenants** - Multi-tenant organization data
2. **tenant_users** - Junction table linking users to tenants with roles
3. **globals** - Global blocks/settings per tenant (with draft/published status)
4. **pages** - Page content per tenant
5. **page_versions** - Version history for pages
6. **posts** - Blog posts/content per tenant

### Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Multi-tenant isolation via `tenant_id`
- ✅ Versioning system for pages
- ✅ Draft/Published status for pages, posts, and globals
- ✅ Automatic `updated_at` timestamps
- ✅ Indexes for performance
- ✅ Seed data: "kalitechnia" tenant

### Row Level Security

All tables have RLS policies that ensure users can only access data for tenants they belong to (via the `tenant_users` junction table).

**Note:** RLS policies use `auth.uid()` which requires Supabase Auth to be properly configured. Make sure you have authentication set up in your Supabase project.

## Seed Data

The schema includes a seed tenant:
- **Name:** Kalitechnia
- **Slug:** kalitechnia
- **ID:** `00000000-0000-0000-0000-000000000001`

After running the schema, you'll need to:
1. Create a user in Supabase Auth
2. Link the user to the tenant by inserting a record in `tenant_users`

Example:
```sql
INSERT INTO tenant_users (tenant_id, user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'your-user-id-here',
  'owner'
);
```

