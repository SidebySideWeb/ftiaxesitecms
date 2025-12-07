"use server";

import { supabaseServer } from "@/lib/supabase";
import { getTenantId } from "@/lib/tenant";
import { getTenantIdForServerAction } from "@/lib/tenant-server";
import { revalidatePath } from "next/cache";

interface PageSections {
  sections?: Array<{
    type: string;
    props: Record<string, any>;
  }>;
}

/**
 * Get a page by ID for the current tenant
 */
export async function getPageById(pageId: string) {
  try {
    const tenantSlug = await getTenantId();
    if (!tenantSlug) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // First, get the tenant ID
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return { error: "Tenant not found" };
    }

    // Get the page
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("id", pageId)
      .single();

    if (pageError) {
      return { error: pageError.message };
    }

    // Get the latest version content if page exists
    let content = null;
    if (page) {
      const { data: latestVersion } = await supabase
        .from("page_versions")
        .select("content")
        .eq("page_id", page.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      content = latestVersion?.content || null;
    }

    return { data: { ...page, content } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get a page by slug for the current tenant
 */
export async function getPageBySlug(slug: string) {
  try {
    const tenantSlug = await getTenantId();
    if (!tenantSlug) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // First, get the tenant ID
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return { error: "Tenant not found" };
    }

    // Get the page
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("slug", slug)
      .single();

    if (pageError) {
      return { error: pageError.message };
    }

    // Get the latest version content if page exists
    let content = null;
    if (page) {
      const { data: latestVersion } = await supabase
        .from("page_versions")
        .select("content")
        .eq("page_id", page.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      content = latestVersion?.content || null;
    }

    return { data: { ...page, content } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Save page sections and create a version snapshot
 */
export async function savePageSections(
  pageId: string,
  sections: PageSections["sections"]
) {
  try {
    const tenantSlug = await getTenantId();
    if (!tenantSlug) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Get tenant ID
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return { error: "Tenant not found" };
    }

    // Verify page belongs to tenant
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, tenant_id")
      .eq("id", pageId)
      .eq("tenant_id", tenant.id)
      .single();

    if (pageError || !page) {
      return { error: "Page not found" };
    }

    // Get the highest version number
    const { data: versions } = await supabase
      .from("page_versions")
      .select("version_number")
      .eq("page_id", pageId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (versions?.version_number || 0) + 1;

    // Create new version snapshot
    const { data: version, error: versionError } = await supabase
      .from("page_versions")
      .insert({
        page_id: pageId,
        tenant_id: tenant.id,
        version_number: nextVersion,
        content: { sections } as any,
      })
      .select()
      .single();

    if (versionError) {
      return { error: versionError.message };
    }

    revalidatePath("/");
    return { data: version };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Publish a page (set status to 'published')
 */
export async function publishPage(pageId: string, tenantDomain: string) {
  const { error } = await supabaseServer()
    .from("pages")
    .update({ status: "published" })
    .eq("id", pageId);

  if (error) throw new Error(error.message);

  // 🔔 Trigger Vercel revalidate
  await fetch(`https://${tenantDomain}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.VERCEL_REVALIDATE_SECRET,
      tenantDomain,
    }),
  }).catch(() => {});

  return { ok: true };
}

/**
 * Set page back to draft status
 */
export async function setDraft(pageId: string) {
  try {
    const tenantSlug = await getTenantId();
    if (!tenantSlug) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Get tenant ID
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return { error: "Tenant not found" };
    }

    // Verify page belongs to tenant and update
    const { data: updatedPage, error: updateError } = await supabase
      .from("pages")
      .update({ status: "draft" })
      .eq("id", pageId)
      .eq("tenant_id", tenant.id)
      .select()
      .single();

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/");
    return { data: updatedPage };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Clone a page (duplicate with new slug)
 */
export async function clonePage(pageId: string, newSlug: string, newTitle?: string) {
  try {
    const tenantSlug = await getTenantId();
    if (!tenantSlug) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Get tenant ID
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return { error: "Tenant not found" };
    }

    // Get original page
    const { data: originalPage, error: pageError } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .eq("tenant_id", tenant.id)
      .single();

    if (pageError || !originalPage) {
      return { error: "Page not found" };
    }

    // Get latest version of original page
    const { data: latestVersion } = await supabase
      .from("page_versions")
      .select("content")
      .eq("page_id", pageId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    // Create new page
    const { data: newPage, error: createError } = await supabase
      .from("pages")
      .insert({
        tenant_id: tenant.id,
        slug: newSlug,
        title: newTitle || `${originalPage.title} (Copy)`,
        status: "draft",
      })
      .select()
      .single();

    if (createError) {
      return { error: createError.message };
    }

    // Create initial version for cloned page
    if (latestVersion) {
      await supabase.from("page_versions").insert({
        page_id: newPage.id,
        tenant_id: tenant.id,
        version_number: 1,
        content: latestVersion.content,
      });
    }

    revalidatePath("/");
    return { data: newPage };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * List all versions for a page
 */
export async function listVersions(pageId: string) {
  try {
    const tenantSlug = await getTenantId();
    if (!tenantSlug) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Get tenant ID
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return { error: "Tenant not found" };
    }

    // Verify page belongs to tenant
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id")
      .eq("id", pageId)
      .eq("tenant_id", tenant.id)
      .single();

    if (pageError || !page) {
      return { error: "Page not found" };
    }

    // Get all versions
    const { data: versions, error: versionsError } = await supabase
      .from("page_versions")
      .select("*")
      .eq("page_id", pageId)
      .order("version_number", { ascending: false });

    if (versionsError) {
      return { error: versionsError.message };
    }

    return { data: versions || [] };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Create a new page
 */
export async function createPage(data: { title: string; slug: string }) {
  try {
    const tenantId = await getTenantIdForServerAction();
    if (!tenantId) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Create new page
    const { data: newPage, error: createError } = await supabase
      .from("pages")
      .insert({
        tenant_id: tenantId,
        title: data.title,
        slug: data.slug,
        status: "draft",
      })
      .select()
      .single();

    if (createError) {
      return { error: createError.message };
    }

    // Create initial version
    await supabase.from("page_versions").insert({
      page_id: newPage.id,
      tenant_id: tenantId,
      version_number: 1,
      content: { sections: [] },
    });

    revalidatePath("/");
    return { data: newPage };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * List all pages for the current tenant
 */
export async function listPages() {
  try {
    const tenantId = await getTenantIdForServerAction();
    if (!tenantId) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Get all pages for tenant
    const { data: pages, error: pagesError } = await supabase
      .from("pages")
      .select("id, title, slug, status, updated_at")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false });

    if (pagesError) {
      return { error: pagesError.message };
    }

    return { data: pages || [] };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Restore a specific version (create new version from old one)
 */
export async function restoreVersion(pageId: string, versionId: string) {
  try {
    const tenantSlug = await getTenantId();
    if (!tenantSlug) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Get tenant ID
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return { error: "Tenant not found" };
    }

    // Verify page belongs to tenant
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id")
      .eq("id", pageId)
      .eq("tenant_id", tenant.id)
      .single();

    if (pageError || !page) {
      return { error: "Page not found" };
    }

    // Get the version to restore
    const { data: versionToRestore, error: versionError } = await supabase
      .from("page_versions")
      .select("*")
      .eq("id", versionId)
      .eq("page_id", pageId)
      .single();

    if (versionError || !versionToRestore) {
      return { error: "Version not found" };
    }

    // Get the highest version number
    const { data: versions } = await supabase
      .from("page_versions")
      .select("version_number")
      .eq("page_id", pageId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (versions?.version_number || 0) + 1;

    // Create new version from restored content
    const { data: newVersion, error: createError } = await supabase
      .from("page_versions")
      .insert({
        page_id: pageId,
        tenant_id: tenant.id,
        version_number: nextVersion,
        content: versionToRestore.content,
        meta: {
          ...versionToRestore.meta,
          restored_from: versionId,
          restored_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (createError) {
      return { error: createError.message };
    }

    revalidatePath("/");
    return { data: newVersion };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

