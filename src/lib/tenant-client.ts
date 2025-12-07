/**
 * Client-side version that extracts tenant ID from window.location.
 * Use this in client components.
 * 
 * @returns The tenant ID (subdomain) or null if no subdomain found
 */
export function getTenantIdClient(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  // If we have more than 2 parts, the first is the subdomain
  if (parts.length > 2) {
    return parts[0];
  }

  // For localhost, return null
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  return null;
}

