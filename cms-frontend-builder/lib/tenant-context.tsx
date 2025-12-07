"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "@/lib/session-context";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  brandColor?: string;
}

interface TenantContextType {
  tenantId: string | null;
  tenant: Tenant | null;
  setTenantId: (id: string | null) => void;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { supabase } = useSession();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function detectTenant() {
      // Try to get tenant from localStorage (set by useTenants when activeTenant changes)
      const storedTenantId = typeof window !== "undefined" ? localStorage.getItem("activeTenantId") : null;
      
      if (storedTenantId) {
        // Fetch tenant by ID
        const { data, error } = await supabase
          .from("tenants")
          .select("id, name, slug")
          .eq("id", storedTenantId)
          .maybeSingle();

        if (data && !error) {
          setTenantId(data.id);
          setTenant({
            id: data.id,
            name: data.name,
            slug: data.slug,
            brandColor: "#6366f1", // Default brand color
          });
          setLoading(false);
          return;
        }
      }

      // Fallback: try to get first tenant from tenant_users
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: tenantUsers } = await supabase
          .from("tenant_users")
          .select("tenant_id, tenants(id, name, slug)")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (tenantUsers?.tenants) {
          const t = tenantUsers.tenants as any;
          setTenantId(t.id);
          setTenant({
            id: t.id,
            name: t.name,
            slug: t.slug,
            brandColor: "#6366f1",
          });
        }
      }
      
      setLoading(false);
    }

    detectTenant();
  }, [supabase]);

  const setTenantId = (id: string | null) => {
    setTenantIdState(id);
    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("activeTenantId", id);
      } else {
        localStorage.removeItem("activeTenantId");
      }
    }
    
    // Optionally fetch tenant details when manually set
    if (id && supabase) {
      supabase
        .from("tenants")
        .select("id, name, slug")
        .eq("id", id)
        .maybeSingle()
        .then(({ data, error }: { data: { id: string; name: string; slug: string } | null; error: any }) => {
          if (data && !error) {
            setTenant({
              id: data.id,
              name: data.name,
              slug: data.slug,
              brandColor: "#6366f1",
            });
          }
        });
    }
  };

  return (
    <TenantContext.Provider value={{ tenantId, tenant, setTenantId, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

