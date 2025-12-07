import { headers } from "next/headers";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseServer } from "./supabase";

/**
 * Gets the tenant ID for the current request.
 * Tries multiple strategies:
 * 1. From host subdomain (production)
 * 2. From user's session via tenant_users table (development/localhost)
 * 3. Default tenant "kalitechnia" as fallback
 */
export async function getTenantIdForServerAction(): Promise<string | null> {
  try {
    // Strategy 1: Try to get from host subdomain
    const headersList = await headers();
    const host = headersList.get("host") || headersList.get("x-forwarded-host");

    if (host) {
      const hostname = host.split(":")[0];
      const parts = hostname.split(".");

      // If we have a subdomain (more than 2 parts), use it
      if (parts.length > 2) {
        const tenantSlug = parts[0];
        const supabase = supabaseServer();
        const { data: tenant, error } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenantSlug)
          .maybeSingle();

        if (tenant && !error) {
          return tenant.id;
        }
      }
    }

    // Strategy 2: Get from user's session (for localhost/development)
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Get user's first tenant from tenant_users
      const { data: tenantUser, error: tenantUserError } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (tenantUser?.tenant_id && !tenantUserError) {
        return tenantUser.tenant_id;
      }
    }

    // Strategy 3: Fallback to default tenant "kalitechnia"
    const supabaseAdmin = supabaseServer();
    const { data: defaultTenant, error: defaultTenantError } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("slug", "kalitechnia")
      .maybeSingle();

    if (defaultTenant && !defaultTenantError) {
      return defaultTenant.id;
    }

    return null;
  } catch (error) {
    console.error("Error getting tenant ID:", error);
    return null;
  }
}

