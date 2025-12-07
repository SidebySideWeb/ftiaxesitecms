"use server";

import { supabaseServer } from "@/lib/supabase";
import { getTenantId } from "@/lib/tenant";

/**
 * Upload an image to Supabase Storage
 */
export async function uploadImage(file: File, tenantId: string) {
  try {
    const supabase = supabaseServer();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `/${tenantId}/uploads/${fileName}`;

    // Convert File to Blob/ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("public")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      return { error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("public").getPublicUrl(filePath);

    return { data: { url: publicUrl, path: filePath } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Upload image for current tenant
 */
export async function uploadImageForTenant(file: File) {
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

    return uploadImage(file, tenant.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

