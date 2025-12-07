"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "../supabase";
import { useSession } from "../session-context";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  created_at?: string;
  brandColor?: string;
}

export function useTenants() {
  const { user } = useSession();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchTenants() {
      setIsLoading(true);
      const supabase = supabaseBrowser();

      // Get tenants for current user via tenant_users junction table
      const { data: tenantUsers, error } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(id, name, slug, created_at)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching tenants:", error);
        setIsLoading(false);
        return;
      }

      // Fetch domains from globals for each tenant
      const tenantIds = (tenantUsers || [])
        .map((tu: any) => tu.tenants?.id)
        .filter((id: string) => id);

      const formattedTenants: Tenant[] = await Promise.all(
        (tenantUsers || []).map(async (tu: any) => {
          if (!tu.tenants) return null;

          // Get domain from globals settings
          let domain = "";
          try {
            const { data: settings } = await supabase
              .from("globals")
              .select("value")
              .eq("tenant_id", tu.tenants.id)
              .eq("key", "settings")
              .maybeSingle();

            if (settings?.value && typeof settings.value === "object" && "domain" in settings.value) {
              domain = (settings.value as any).domain || "";
            }
          } catch (err) {
            // Domain not found, leave empty
          }

          return {
            id: tu.tenants.id,
            name: tu.tenants.name,
            slug: tu.tenants.slug,
            domain,
            created_at: tu.tenants.created_at,
            brandColor: "#6366f1",
          };
        })
      );

      const validTenants = formattedTenants.filter((t: Tenant | null): t is Tenant => t !== null);

      setTenants(validTenants);
      
      // Set first tenant as active if available
      setActiveTenant((prev) => {
        if (prev && validTenants.some((t) => t.id === prev.id)) {
          return prev; // Keep current active tenant if it still exists
        }
        return validTenants.length > 0 ? validTenants[0] : null;
      });

      setIsLoading(false);
    }

    fetchTenants();
  }, [user]);

  return { tenants, activeTenant, setActiveTenant, isLoading };
}

