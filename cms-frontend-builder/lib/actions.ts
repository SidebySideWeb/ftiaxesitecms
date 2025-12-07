/**
 * Re-export server actions from main src directory
 * This file serves as a central export point for all server actions
 * Using relative paths for maximum compatibility with TypeScript module resolution
 */

// Pages actions
export {
  savePageSections,
  publishPage,
  setDraft,
  clonePage,
  restoreVersion,
  listVersions,
  listPages,
  getPageById,
} from "../../src/actions/pages"

// Globals actions
export { saveGlobals, getAllGlobals } from "../../src/actions/globals"

// Posts actions
export { savePost, publishPost, deletePost, listPosts, getPostById } from "../../src/actions/posts"

// Upload actions
export { uploadImageForTenant } from "../../src/actions/upload"

// Tenants actions
export { createTenant, linkUserToTenant } from "../../src/actions/tenants"

// Tenant wizard
export { createTenantWizard } from "../../src/actions/createTenantWizard"
