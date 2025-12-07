"use client";

import { useSearchParams } from "next/navigation";
import { useTenant } from "../tenant-context";

/**
 * Hook to get tenantId from TenantContext, with fallback to ?tenant= query param
 */
export function useTenantId(): string | null {
  const { tenantId } = useTenant();
  const searchParams = useSearchParams();
  const queryTenant = searchParams.get("tenant");

  // Priority: 1. Context, 2. Query param
  return tenantId || queryTenant || null;
}

