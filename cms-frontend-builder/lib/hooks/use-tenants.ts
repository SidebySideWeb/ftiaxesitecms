"use client"

import { useState, useEffect } from "react"
import { supabaseBrowser } from "@/lib/supabase"
import { useSession } from "@/lib/session-context"
import { useTenant } from "@/lib/tenant-context"

export interface Tenant {
  id: string
  name: string
  slug: string
  domain?: string
  created_at?: string
  createdAt?: string
  brandColor?: string
}

export function useTenants() {
  const { user } = useSession()
  const { setTenantId } = useTenant()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      console.log("[useTenants] No user found, skipping fetch")
      setIsLoading(false)
      return
    }

    // Store user in const to ensure TypeScript knows it's not null
    const currentUser = user

    async function fetchTenants() {
      setIsLoading(true)
      const supabase = supabaseBrowser()

      console.log("[useTenants] Fetching tenants for user:", currentUser.id)

      // Get tenants for current user via tenant_users junction table
      const { data: tenantUsers, error } = await supabase
        .from("tenant_users")
        .select("tenant_id, tenants(id, name, slug, created_at)")
        .eq("user_id", currentUser.id)

      if (error) {
        console.error("[useTenants] Error fetching tenant_users:", error)
        setIsLoading(false)
        return
      }

      console.log("[useTenants] Found tenant_users:", tenantUsers?.length || 0, tenantUsers)

      // Fetch domains and brand colors from globals for each tenant
      const formattedTenants = await Promise.all(
        (tenantUsers || []).map(async (tu: any): Promise<Tenant | null> => {
          if (!tu.tenants) return null

          // Get domain and brand color from globals settings
          let domain: string | undefined = undefined
          let brandColor: string | undefined = "#6366f1"
          try {
            const { data: settings } = await supabase
              .from("globals")
              .select("value")
              .eq("tenant_id", tu.tenants.id)
              .eq("key", "settings")
              .maybeSingle()

            if (settings?.value && typeof settings.value === "object") {
              const settingsValue = settings.value as any
              domain = settingsValue.domain || undefined
              brandColor = settingsValue.primaryColor || "#6366f1"
            }
          } catch (err) {
            // Settings not found, use defaults
          }

          return {
            id: tu.tenants.id,
            name: tu.tenants.name,
            slug: tu.tenants.slug,
            domain,
            created_at: tu.tenants.created_at,
            createdAt: tu.tenants.created_at, // For compatibility
            brandColor,
          }
        })
      )

      const validTenants: Tenant[] = formattedTenants.filter((t): t is Tenant => t !== null)

      console.log("[useTenants] Formatted tenants:", validTenants.length, validTenants)

      setTenants(validTenants)
      
      // Set first tenant as active if available
      setActiveTenant((prev) => {
        if (prev && validTenants.some((t) => t.id === prev.id)) {
          return prev // Keep current active tenant if it still exists
        }
        const newActive = validTenants.length > 0 ? validTenants[0] : null
        
        // Sync with TenantContext when active tenant changes
        if (newActive) {
          setTenantId(newActive.id)
          if (typeof window !== "undefined") {
            localStorage.setItem("activeTenantId", newActive.id)
          }
        }
        
        return newActive
      })

      setIsLoading(false)
    }

    fetchTenants()
  }, [user])

  return { tenants, setTenants, activeTenant, setActiveTenant, isLoading }
}
