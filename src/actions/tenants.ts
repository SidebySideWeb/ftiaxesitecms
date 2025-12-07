"use server";

import { supabaseServer } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export interface CreateTenantData {
  id: string; // slug/id (lowercase)
  name: string;
  domain: string;
  primaryColor?: string;
  defaultLocale?: string;
}

/**
 * Get a tenant by ID or slug
 */
export async function getTenantById(tenantIdOrSlug: string) {
  try {
    const supabase = supabaseServer();

    // Try to find by slug first, then by ID
    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("id, name, slug, created_at")
      .or(`slug.eq.${tenantIdOrSlug},id.eq.${tenantIdOrSlug}`)
      .single();

    if (error || !tenant) {
      return { error: "Tenant not found" };
    }

    // Get domain and settings from globals
    const { data: settings } = await supabase
      .from("globals")
      .select("value")
      .eq("tenant_id", tenant.id)
      .eq("key", "settings")
      .maybeSingle();

    const settingsValue = settings?.value as any;
    const domain = settingsValue?.domain || "";
    const brandColor = settingsValue?.primaryColor || "#6366f1";
    const defaultLocale = settingsValue?.defaultLocale || "en";

    return {
      data: {
        ...tenant,
        domain,
        brandColor,
        defaultLocale,
      },
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Update tenant settings
 */
export async function updateTenant(
  tenantId: string,
  data: {
    name?: string;
    domain?: string;
    brandColor?: string;
    defaultLocale?: string;
  }
) {
  try {
    // Get current user to verify access
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Ignore cookie setting errors in server actions
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, "", { ...options, maxAge: 0 });
            } catch (error) {
              // Ignore cookie removal errors in server actions
            }
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Unauthorized. Please log in." };
    }

    // Verify user has access to this tenant
    const adminSupabase = supabaseServer();
    const { data: tenantUser } = await adminSupabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .single();

    if (!tenantUser) {
      return { error: "Forbidden. You don't have access to this tenant." };
    }

    // Update tenant name if provided
    if (data.name) {
      const { error: updateError } = await adminSupabase
        .from("tenants")
        .update({ name: data.name.trim() })
        .eq("id", tenantId);

      if (updateError) {
        return { error: updateError.message };
      }
    }

    // Update settings in globals
    const { data: existingSettings } = await adminSupabase
      .from("globals")
      .select("value")
      .eq("tenant_id", tenantId)
      .eq("key", "settings")
      .maybeSingle();

    const currentSettings = (existingSettings?.value as any) || {};
    const updatedSettings = {
      ...currentSettings,
      ...(data.domain && { domain: data.domain.trim() }),
      ...(data.brandColor && { primaryColor: data.brandColor }),
      ...(data.defaultLocale && { defaultLocale: data.defaultLocale }),
    };

    const { error: globalsError } = await adminSupabase
      .from("globals")
      .upsert(
        {
          tenant_id: tenantId,
          key: "settings",
          value: updatedSettings,
          status: "published",
        },
        {
          onConflict: "tenant_id,key",
        }
      );

    if (globalsError) {
      return { error: globalsError.message };
    }

    revalidatePath("/tenants");
    revalidatePath(`/tenants/${tenantId}/edit`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Delete a tenant
 */
export async function deleteTenant(tenantId: string) {
  try {
    // Get current user to verify access
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Ignore cookie setting errors in server actions
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, "", { ...options, maxAge: 0 });
            } catch (error) {
              // Ignore cookie removal errors in server actions
            }
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Unauthorized. Please log in." };
    }

    // Verify user is owner or admin
    const adminSupabase = supabaseServer();
    const { data: tenantUser } = await adminSupabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .single();

    if (!tenantUser || !["owner", "admin"].includes(tenantUser.role)) {
      return { error: "Forbidden. Only owners and admins can delete tenants." };
    }

    // Delete tenant (cascade will handle related records)
    const { error: deleteError } = await adminSupabase
      .from("tenants")
      .delete()
      .eq("id", tenantId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    revalidatePath("/tenants");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Create a new tenant (simplified interface for frontend)
 */
export async function createTenant(data: {
  name: string;
  domain: string;
  brandColor?: string;
}) {
  try {
    // Get current user to link them as owner
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Ignore cookie setting errors in server actions
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, "", { ...options, maxAge: 0 });
            } catch (error) {
              // Ignore cookie removal errors in server actions
            }
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Unauthorized. Please log in." };
    }

    const adminSupabase = supabaseServer();
    
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if tenant slug already exists
    const { data: existingTenant } = await adminSupabase
      .from("tenants")
      .select("id, slug")
      .eq("slug", slug)
      .single();

    if (existingTenant) {
      return { error: `Tenant with name "${data.name}" already exists` };
    }

    // Create tenant
    const { data: newTenant, error: tenantError } = await adminSupabase
      .from("tenants")
      .insert({
        name: data.name.trim(),
        slug: slug,
      })
      .select()
      .single();

    if (tenantError) {
      return { error: tenantError.message };
    }

    // Link user as owner
    const { error: linkError } = await adminSupabase
      .from("tenant_users")
      .insert({
        tenant_id: newTenant.id,
        user_id: user.id,
        role: "owner",
      });

    if (linkError) {
      // If link fails, try to clean up the tenant
      await adminSupabase.from("tenants").delete().eq("id", newTenant.id);
      return { error: linkError.message };
    }

    // Create default settings in globals
    const { error: globalsError } = await adminSupabase
      .from("globals")
      .upsert(
        {
          tenant_id: newTenant.id,
          key: "settings",
          value: {
            domain: data.domain.trim(),
            primaryColor: data.brandColor || "#0d9488",
            defaultLocale: "el",
          },
          status: "published",
        },
        {
          onConflict: "tenant_id,key",
        }
      );

    if (globalsError) {
      console.error("Error creating default settings:", globalsError);
      // Don't fail the whole operation if globals fail
    }

    revalidatePath("/tenants");
    return { success: true, id: newTenant.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Link the current user to an existing tenant
 * Useful if a tenant exists but the user isn't linked to it
 */
export async function linkUserToTenant(tenantIdOrSlug: string, role: string = "owner") {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Ignore cookie setting errors in server actions
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            // Ignore cookie removal errors in server actions
          }
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Unauthorized. Please log in." };
    }

    const adminSupabase = supabaseServer();

    // Find tenant by slug or ID
    const { data: tenant, error: tenantError } = await adminSupabase
      .from("tenants")
      .select("id")
      .or(`slug.eq.${tenantIdOrSlug},id.eq.${tenantIdOrSlug}`)
      .single();

    if (tenantError || !tenant) {
      return { error: "Tenant not found" };
    }

    // Check if link already exists
    const { data: existingLink } = await adminSupabase
      .from("tenant_users")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingLink) {
      return { success: true, message: "User is already linked to this tenant" };
    }

    // Create the link
    const { error: linkError } = await adminSupabase
      .from("tenant_users")
      .insert({
        tenant_id: tenant.id,
        user_id: user.id,
        role,
      });

    if (linkError) {
      return { error: `Failed to link user to tenant: ${linkError.message}` };
    }

    revalidatePath("/tenants");
    return { success: true, message: "User linked to tenant successfully" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}