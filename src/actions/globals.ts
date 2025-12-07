"use server";

import { supabaseServer } from "@/lib/supabase";
import { getTenantIdForServerAction } from "@/lib/tenant-server";
import { revalidatePath } from "next/cache";

/**
 * Get all globals for the current tenant
 */
export async function getGlobals() {
  try {
    const tenantId = await getTenantIdForServerAction();
    if (!tenantId) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Get all globals for tenant
    const { data: globals, error: globalsError } = await supabase
      .from("globals")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("status", "published");

    if (globalsError) {
      return { error: globalsError.message };
    }

    return { data: globals || [] };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get all globals (including drafts) for editing
 */
export async function getAllGlobals() {
  try {
    const tenantId = await getTenantIdForServerAction();
    if (!tenantId) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Get all globals for tenant
    const { data: globals, error: globalsError } = await supabase
      .from("globals")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("key");

    if (globalsError) {
      return { error: globalsError.message };
    }

    return { data: globals || [] };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Save globals
 */
export async function saveGlobals(globals: Array<{ key: string; value: any; status?: string }>) {
  try {
    const tenantId = await getTenantIdForServerAction();
    if (!tenantId) {
      return { error: "Tenant not found" };
    }

    const supabase = supabaseServer();

    // Upsert each global
    const results = [];
    for (const globalItem of globals) {
      const { data, error } = await supabase
        .from("globals")
        .upsert(
          {
            tenant_id: tenantId,
            key: globalItem.key,
            value: globalItem.value,
            status: globalItem.status || "published",
          },
          {
            onConflict: "tenant_id,key",
          }
        )
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }
      results.push(data);
    }

    revalidatePath("/api/public/globals");
    return { data: results };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

