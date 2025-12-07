# CMS Integration Guide

This document tracks the integration of the v0.app UI with the existing CMS backend.

## ✅ Completed

### 1. Auth Integration
- ✅ Created `SessionContextProvider` in `src/lib/session-context.tsx`
- ✅ Created `useUser` hook in `src/lib/useUser.ts`
- ✅ Updated root layout to wrap with `SessionContextProvider` and `TenantProvider`

### 2. Tenant Context
- ✅ Created `TenantProvider` in `src/lib/tenant-context.tsx`
- ✅ Tenant detection from host subdomain with fallback to "kalitechnia"
- ✅ Provides `tenantId` and `tenant` object to all components

### 3. Real Hooks (Replacing Mocked)
- ✅ `usePages` - Fetches from Supabase via `listPages()` server action
- ✅ `usePage` - Fetches single page with blocks
- ✅ `usePageBlocks` - Fetches blocks for a page
- ✅ `usePosts` - Fetches posts from Supabase
- ✅ `usePost` - Fetches single post
- ✅ `useGlobals` - Fetches globals from Supabase
- ✅ `useTenants` - Fetches tenants for current user

### 4. Server Actions
- ✅ `savePageSections` - Saves page blocks and creates version
- ✅ `publishPage` - Publishes a page
- ✅ `setDraft` - Sets page to draft
- ✅ `clonePage` - Clones a page
- ✅ `restoreVersion` - Restores a version
- ✅ `listVersions` - Lists all versions for a page
- ✅ `saveGlobals` - Saves global settings
- ✅ `uploadImage` / `uploadImageForTenant` - Uploads images to Supabase Storage
- ✅ Created `posts.ts` with `savePost`, `publishPost`, `deletePost`, `listPosts`, `getPostById`

## 🔄 In Progress / To Do

### Component Wiring

1. **Topbar** (`cms-frontend-builder/components/layout/topbar.tsx`)
   - [ ] Use `useSession()` to get user email
   - [ ] Populate profile dropdown with `user.email`
   - [ ] Add logout functionality
   - [ ] Dark mode toggle already exists, verify it works

2. **BlockList** (`cms-frontend-builder/components/editor/block-list.tsx`)
   - [ ] Wire `onReorder` to call `savePageSections` with debounce
   - [ ] Use `useTransition` for optimistic updates
   - [ ] Show toast "Saving..." then "Saved ✓"

3. **InlineText** (`cms-frontend-builder/components/editor/inline-text.tsx`)
   - [ ] On blur, trigger `savePageSections` via parent component
   - [ ] Add debounce to prevent too many saves

4. **ImageUploader** (`cms-frontend-builder/components/editor/image-uploader.tsx`)
   - [ ] Use `uploadImageForTenant` server action
   - [ ] Show preview immediately with `URL.createObjectURL`
   - [ ] Replace with Supabase public URL after upload

5. **Page Editor** (`cms-frontend-builder/app/(cms)/pages/[id]/edit/page.tsx`)
   - [ ] Wire Publish button to `publishPage(pageId)`
   - [ ] Wire Draft button to `setDraft(pageId)`
   - [ ] Show toast on publish
   - [ ] Refetch page data after publish

6. **Version History**
   - [ ] Fetch versions via `listVersions(pageId)`
   - [ ] Wire Restore button to `restoreVersion(pageId, versionId)`
   - [ ] Reload editor after restore

7. **Clone Page**
   - [ ] Wire form to `clonePage(pageId, newSlug, newTitle)`
   - [ ] Redirect to new page after clone

8. **Globals Editor** (`cms-frontend-builder/app/(cms)/globals/page.tsx`)
   - [ ] Replace mock save with `saveGlobals` server action
   - [ ] Fetch current globals via `getAllGlobals()`
   - [ ] Toast on save

9. **Posts Editor** (`cms-frontend-builder/app/(cms)/posts/[id]/page.tsx`)
   - [ ] Wire save to `savePost(postId, data)`
   - [ ] Wire publish to `publishPost(postId)`
   - [ ] Use real `usePost` and `usePosts` hooks

10. **Tenants Management**
    - [ ] Create `createTenant` server action
    - [ ] Wire form to create new tenant
    - [ ] Create default globals row for new tenant

### Auth & Layout

11. **CMS Layout Wrapper**
    - [ ] Create `CMSLayoutWrapper` that checks auth
    - [ ] Redirect to `/login` if not authenticated
    - [ ] Wrap all `/app/(cms)/*` routes

12. **Login Integration**
    - [ ] Update login to use `SessionContextProvider`
    - [ ] Redirect to dashboard after login

### Optional Enhancements

13. **Realtime Sync**
    - [ ] Add Supabase channel subscription for page updates
    - [ ] Sync blocks when other editors make changes

14. **AI Section Generator**
    - [ ] Create `aiGenerateSection` server action
    - [ ] Call OpenAI API
    - [ ] Append generated block to page

15. **Dark Mode**
    - [ ] Verify dark mode toggle works
    - [ ] Store preference in localStorage

## Usage Instructions

### For Developers

1. **Import hooks from main src:**
   ```typescript
   // In cms-frontend-builder components, import from:
   import { usePages } from "@/lib/hooks/use-pages" // This should point to src/lib/hooks
   ```

2. **Use Tenant Context:**
   ```typescript
   import { useTenant } from "@/lib/tenant-context"
   const { tenantId, tenant } = useTenant()
   ```

3. **Use Session Context:**
   ```typescript
   import { useSession } from "@/lib/session-context"
   const { user, loading } = useSession()
   ```

4. **Call Server Actions:**
   ```typescript
   import { savePageSections } from "@/actions/pages"
   import { uploadImageForTenant } from "@/actions/upload"
   ```

### Next Steps

1. Update all v0 UI components to import from `src/lib/hooks` instead of local mocks
2. Wire up all component handlers to call server actions
3. Add error handling and loading states
4. Test all user flows
5. Add security checks (verify user has tenant access before writes)

## File Structure

```
src/
  lib/
    hooks/
      use-pages.ts      ✅ Real Supabase queries
      use-posts.ts      ✅ Real Supabase queries
      use-globals.ts    ✅ Real Supabase queries
      use-tenants.ts    ✅ Real Supabase queries
    session-context.tsx ✅ Auth provider
    tenant-context.tsx  ✅ Tenant provider
    useUser.ts          ✅ User hook
  actions/
    pages.ts            ✅ All page actions
    posts.ts            ✅ All post actions (NEW)
    globals.ts          ✅ Global actions
    upload.ts           ✅ Image upload
```

## Notes

- All hooks use `useTenant()` to get `tenantId` for queries
- Server actions use `getTenantId()` server-side for tenant detection
- Components should use `useSession()` for auth state
- All writes should verify user has tenant access (TODO: add security checks)

