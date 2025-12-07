"use server";

import { supabaseServer } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateTenant(id: string, data: any) {
  const supabase = supabaseServer();

  // Update tenant name in tenants table
  const { error: tenantError } = await supabase
    .from("tenants")
    .update({
      name: data.name,
    })
    .eq("id", id);

  if (tenantError) throw new Error(tenantError.message);

  // Update domain, brandColor, and defaultLocale in globals settings
  const { data: existingSettings } = await supabase
    .from("globals")
    .select("value")
    .eq("tenant_id", id)
    .eq("key", "settings")
    .single();

  const currentSettings = (existingSettings?.value as any) || {};
  const updatedSettings = {
    ...currentSettings,
    ...(data.domain && { domain: data.domain.trim() }),
    ...(data.brandColor && { primaryColor: data.brandColor }),
    ...(data.defaultLocale && { defaultLocale: data.defaultLocale }),
  };

  const { error: globalsError } = await supabase
    .from("globals")
    .upsert(
      {
        tenant_id: id,
        key: "settings",
        value: updatedSettings,
        status: "published",
      },
      {
        onConflict: "tenant_id,key",
      }
    );

  if (globalsError) throw new Error(globalsError.message);

  revalidatePath("/tenants");
  revalidatePath(`/tenants/${id}/edit`);
  return { ok: true };
}

export async function deleteTenant(id: string) {
  const { error } = await supabaseServer()
    .from("tenants")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/tenants");
  return { ok: true };
}

