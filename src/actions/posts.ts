"use server";

import { supabaseServer } from "@/lib/supabase";
import { getTenantIdForServerAction } from "@/lib/tenant-server";
import { revalidatePath } from "next/cache";

/**
 * List all posts for the current tenant
 */
export async function listPosts() {
  try {
    const tenantId = await getTenantIdForServerAction();
    if (!tenantId) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Get all posts for tenant
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false });

    if (postsError) {
      return { error: postsError.message };
    }

    return { data: posts || [] };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get a post by ID
 */
export async function getPostById(postId: string) {
  try {
    const tenantId = await getTenantIdForServerAction();
    if (!tenantId) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Get the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .single();

    if (postError) {
      return { error: postError.message };
    }

    return { data: post };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Save or create a post
 */
export async function savePost(postId: string | null, data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: any;
  coverImage?: string | null;
  status?: "draft" | "published" | "archived";
}) {
  try {
    const tenantId = await getTenantIdForServerAction();
    if (!tenantId) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    if (postId) {
      // Update existing post
      const { data: post, error: updateError } = await supabase
        .from("posts")
        .update({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || null,
          content: data.content,
          status: data.status || "draft",
          published_at: data.status === "published" ? new Date().toISOString() : null,
        })
        .eq("id", postId)
        .eq("tenant_id", tenantId)
        .select()
        .single();

      if (updateError) {
        return { error: updateError.message };
      }

      revalidatePath("/");
      return { data: post };
    } else {
      // Create new post
      const { data: post, error: createError } = await supabase
        .from("posts")
        .insert({
          tenant_id: tenantId,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || null,
          content: data.content,
          status: data.status || "draft",
          published_at: data.status === "published" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (createError) {
        return { error: createError.message };
      }

      revalidatePath("/");
      return { data: post };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Publish a post
 */
export async function publishPost(postId: string) {
  try {
    const tenantId = await getTenantIdForServerAction();
    if (!tenantId) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Update post status
    const { data: post, error: updateError } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/");
    return { data: post };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string) {
  try {
    const tenantId = await getTenantIdForServerAction();
    if (!tenantId) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Delete post
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("tenant_id", tenantId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    revalidatePath("/");
    return { data: { success: true } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

