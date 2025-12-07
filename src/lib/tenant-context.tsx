"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getTenantIdClient } from "./tenant-client";
import { useSession } from "./session-context";

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
      // Try to get tenant from host
      const hostTenant = getTenantIdClient();
      
      if (hostTenant) {
        // Fetch tenant by slug
        const { data, error } = await supabase
          .from("tenants")
          .select("id, name, slug")
          .eq("slug", hostTenant)
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

      // Fallback to default tenant (kalitechnia)
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, slug")
        .eq("slug", "kalitechnia")
        .maybeSingle();

      if (data && !error) {
        setTenantId(data.id);
        setTenant({
          id: data.id,
          name: data.name,
          slug: data.slug,
          brandColor: "#6366f1",
        });
      }
      
      setLoading(false);
    }

    detectTenant();
  }, [supabase]);

  const setTenantId = (id: string | null) => {
    setTenantIdState(id);
    // Optionally fetch tenant details when manually set
    if (id && supabase) {
      supabase
        .from("tenants")
        .select("id, name, slug")
        .eq("id", id)
        .maybeSingle()
        .then(({ data, error }) => {
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

