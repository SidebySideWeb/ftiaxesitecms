import { headers } from "next/headers";

/**
 * Extracts the tenant ID from the host subdomain.
 * SERVER-ONLY: Use this in Server Components, Server Actions, and API routes.
 * 
 * Example: kalitechnia.ftiaxesite.gr → "kalitechnia"
 * Example: localhost:3000 → null (no subdomain in development)
 * 
 * @returns The tenant ID (subdomain) or null if no subdomain found
 */
export async function getTenantId(): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get("host") || headersList.get("x-forwarded-host");

  if (!host) {
    return null;
  }

  // Remove port if present (e.g., "localhost:3000" → "localhost")
  const hostname = host.split(":")[0];

  // Split by dots and get the first part (subdomain)
  const parts = hostname.split(".");

  // If we have more than 2 parts, the first is the subdomain
  // e.g., "kalitechnia.ftiaxesite.gr" → ["kalitechnia", "ftiaxesite", "gr"]
  if (parts.length > 2) {
    return parts[0];
  }

  // For localhost or single domain, return null
  // You might want to handle localhost differently for development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  // If only 2 parts (e.g., "ftiaxesite.gr"), no subdomain
  return null;
}

