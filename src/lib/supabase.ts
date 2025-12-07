import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file:\n" +
    `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✓" : "✗"}\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✓" : "✗"}\n` +
    "Make sure to restart your dev server after updating .env.local"
  );
}

// Singleton instance for browser client
let browserClient: SupabaseClient | null = null;

export function supabaseBrowser() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase client not initialized. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  
  // Return existing instance if available
  if (browserClient) {
    return browserClient;
  }
  
  // Create new instance only if it doesn't exist
  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

export function supabaseServer() {
  if (!supabaseServiceRole) {
    console.error("supabaseServer: Service role key missing", {
      exists: !!supabaseServiceRole,
      url: !!supabaseUrl,
    });
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE environment variable. Please check your .env.local file and restart the dev server."
    );
  }
  if (!supabaseUrl) {
    console.error("supabaseServer: Supabase URL missing", {
      url: !!supabaseUrl,
      serviceRole: !!supabaseServiceRole,
    });
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file and restart the dev server."
    );
  }

  // Validate service role key format
  if (!supabaseServiceRole.startsWith("eyJ")) {
    console.error("supabaseServer: Invalid service role key format", {
      length: supabaseServiceRole.length,
      startsWith: supabaseServiceRole.substring(0, 20),
    });
    throw new Error(
      "Invalid SUPABASE_SERVICE_ROLE format. The key should start with 'eyJ'. Please check your .env.local file."
    );
  }

  try {
    const client = createClient(supabaseUrl, supabaseServiceRole, {
      auth: { persistSession: false },
    });
    return client;
  } catch (error) {
    console.error("supabaseServer: Error creating client", {
      error: error instanceof Error ? error.message : String(error),
      urlLength: supabaseUrl.length,
      keyLength: supabaseServiceRole.length,
      keyPrefix: supabaseServiceRole.substring(0, 20),
    });
    throw error;
  }
}

