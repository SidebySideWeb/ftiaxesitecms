# Deployment Checklist

This checklist covers deployment to **Vercel** and **Hetzner**.

## Pre-Deployment

### 1. Environment Variables

Set the following environment variables in your deployment platform:

#### Required Variables

```bash
# Supabase Configuration (Client-safe - exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://qgisnksjztjczsrbjryr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Configuration (Server-only - NEVER expose to client)
SUPABASE_SERVICE_ROLE=your-service-role-key

# Supabase PostgreSQL Connection URL (for direct database access, migrations, etc.)
# Used for: psql, database management tools, migrations, backups
DATABASE_URL=postgresql://postgres:fHbPhUcTRWjKjpCA@db.qgisnksjztjczsrbjryr.supabase.co:5432/postgres

# Application Configuration
CMS_BASE_URL=https://your-domain.com
```

#### Supabase Storage Configuration (if using image uploads)

Ensure your Supabase Storage bucket `public` is configured with:
- Public access enabled
- CORS configured for your domain
- Bucket name: `public` (or update `src/actions/upload.ts` if different)

### 2. Supabase URL/Key Verification

#### Verify Supabase URL Format
- ✅ URL should be: `https://[project-ref].supabase.co`
- ✅ No trailing slash
- ✅ HTTPS protocol

#### Verify Keys
- ✅ **Anon Key**: Safe to expose, used in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ **Service Role Key**: **NEVER** expose to client, used in `SUPABASE_SERVICE_ROLE`
- ✅ Test keys in Supabase Dashboard → Settings → API

#### Test Connection
```bash
# Test anon key (client-safe)
curl https://your-project.supabase.co/rest/v1/tenants \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Service role key should work without RLS
# (Test in server-side code only)
```

### 3. Database Setup

- ✅ Run `supabase/schema.sql` in Supabase SQL Editor
- ✅ Verify all tables created: `tenants`, `tenant_users`, `globals`, `pages`, `page_versions`, `posts`
- ✅ Verify RLS policies are active
- ✅ Seed tenant "kalitechnia" exists
- ✅ Create test user in Supabase Auth
- ✅ Link user to tenant in `tenant_users` table

### 4. Authentication Setup

#### Supabase Auth Configuration
- ✅ Enable Email provider in Supabase Dashboard → Authentication → Providers
- ✅ Configure email templates (optional)
- ✅ Set Site URL: `https://your-domain.com`
- ✅ Add Redirect URLs:
  - `https://your-domain.com/auth/callback`
  - `https://your-domain.com/dashboard`

#### Magic Link Configuration
- ✅ Email redirect URL: `https://your-domain.com/auth/callback`
- ✅ Test magic link flow

### 5. Code Verification

#### Server Actions
- ✅ All server actions in `src/actions/` use `"use server"` directive
- ✅ Server actions use `supabaseServer()` for database operations
- ✅ Client components use `supabaseBrowser()` for auth

#### Route Handlers
- ✅ Public API routes (`app/api/public/*`) have `export const revalidate = 60`
- ✅ Auth callback route (`app/auth/callback/route.ts`) has `export const dynamic = "force-dynamic"`
- ✅ All route handlers properly handle errors

#### Middleware
- ✅ `src/middleware.ts` protects `/dashboard` and `/pages/*`
- ✅ Middleware redirects unauthenticated users to `/login`
- ✅ Middleware uses `@supabase/ssr` for session management

## Vercel Deployment

### 1. Project Setup

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### 2. Environment Variables

Add all environment variables in Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Add each variable for:
  - **Production**
  - **Preview** (optional, can use same values)
  - **Development** (optional)

### 3. Build Settings

Vercel auto-detects Next.js, but verify:
- ✅ Framework Preset: **Next.js**
- ✅ Build Command: `pnpm build` (or `npm run build`)
- ✅ Output Directory: `.next` (default)
- ✅ Install Command: `pnpm install` (or `npm install`)

### 4. Deploy

```bash
# Deploy to production
vercel --prod

# Or push to main branch (if connected to Git)
git push origin main
```

### 5. Post-Deployment

- ✅ Test login flow: `/login`
- ✅ Test protected routes: `/dashboard`, `/pages/*`
- ✅ Test public API: `/api/public/page?tenant=kalitechnia&slug=home`
- ✅ Test image upload (if using)
- ✅ Verify Supabase connection logs in Vercel Functions logs

## Hetzner Deployment

### 1. Server Setup

```bash
# SSH into your Hetzner server
ssh root@your-server-ip

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 for process management
npm install -g pm2
```

### 2. Application Setup

```bash
# Clone repository
git clone your-repo-url /var/www/cms
cd /var/www/cms

# Install dependencies
pnpm install

# Build application
pnpm build
```

### 3. Environment Variables

Create `.env.production` file:

```bash
# Create environment file
nano /var/www/cms/.env.production

# Add all environment variables (see Pre-Deployment section)
```

### 4. Process Management (PM2)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'cms',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/cms',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Start application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/cms`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
ln -s /etc/nginx/sites-available/cms /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

### 7. Post-Deployment

- ✅ Test login flow: `https://your-domain.com/login`
- ✅ Test protected routes
- ✅ Test public API endpoints
- ✅ Monitor logs: `pm2 logs cms`
- ✅ Set up automatic deployments (GitHub Actions, etc.)

## Revalidation Hints

### Static Generation
- Public API routes use `export const revalidate = 60` (60 seconds cache)
- Adjust based on content update frequency

### On-Demand Revalidation
For immediate updates after content changes:

```typescript
// In server actions after updates
import { revalidatePath } from "next/cache";

revalidatePath("/api/public/page");
revalidatePath("/api/public/globals");
revalidatePath("/api/public/posts");
```

### Manual Revalidation (Vercel)
```bash
# Revalidate specific path
curl -X POST "https://your-domain.com/api/revalidate?secret=YOUR_SECRET&path=/api/public/page"
```

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - ✅ Verify all env vars are set in deployment platform
   - ✅ Check variable names (case-sensitive)
   - ✅ Restart application after adding vars

2. **"Tenant not found"**
   - ✅ Verify tenant slug matches subdomain
   - ✅ Check `getTenantId()` function logic
   - ✅ Verify tenant exists in database

3. **Authentication not working**
   - ✅ Check Supabase Auth redirect URLs
   - ✅ Verify middleware is running
   - ✅ Check cookie settings (SameSite, Secure)

4. **Image upload fails**
   - ✅ Verify Supabase Storage bucket exists
   - ✅ Check bucket permissions (public access)
   - ✅ Verify service role key has storage access

5. **Build errors**
   - ✅ Check Node.js version (20+)
   - ✅ Verify all dependencies installed
   - ✅ Check TypeScript errors: `pnpm build`

## Security Checklist

- ✅ `SUPABASE_SERVICE_ROLE` is **NEVER** exposed to client
- ✅ All server actions validate tenant ownership
- ✅ RLS policies are enabled on all tables
- ✅ Middleware protects admin routes
- ✅ Public API routes use anon key (safe)
- ✅ HTTPS enabled (production)
- ✅ Environment variables secured

## Monitoring

### Vercel
- Monitor Function logs in Vercel Dashboard
- Set up alerts for errors
- Monitor build times

### Hetzner
- Monitor with PM2: `pm2 monit`
- Set up log rotation
- Monitor server resources

## Next Steps

1. Set up CI/CD pipeline
2. Configure error tracking (Sentry, etc.)
3. Set up monitoring and alerts
4. Configure backup strategy for database
5. Set up staging environment

