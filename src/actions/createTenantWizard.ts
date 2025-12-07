"use server";

import { supabaseServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";

export async function createTenantWizard(data: {
  id: string;
  name: string;
  domain: string;
  primaryColor?: string;
  brandColor?: string;
  defaultLocale?: string;
}) {
  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Environment check:", {
        url: supabaseUrl ? "✓" : "✗",
        key: supabaseAnonKey ? "✓" : "✗",
        urlLength: supabaseUrl?.length || 0,
        keyLength: supabaseAnonKey?.length || 0,
      });
      return { 
        error: `Missing Supabase environment variables. URL: ${supabaseUrl ? '✓' : '✗'}, Key: ${supabaseAnonKey ? '✓' : '✗'}. Please check your .env.local file in the cms directory and restart the dev server.` 
      };
    }

    // Validate key format (should start with eyJ)
    if (!supabaseAnonKey.startsWith("eyJ")) {
      return {
        error: "Invalid API key format. The anon key should start with 'eyJ'. Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      };
    }

    // Get current user to link them as owner
    const cookieStore = await cookies();
    
    let supabase;
    try {
      supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
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
    } catch (clientError) {
      console.error("Error creating Supabase client:", clientError);
      return { 
        error: `Failed to initialize Supabase client: ${clientError instanceof Error ? clientError.message : "Unknown error"}` 
      };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("User auth error:", userError);
      console.error("Supabase URL:", supabaseUrl?.substring(0, 30) + "...");
      console.error("Anon Key length:", supabaseAnonKey?.length);
      console.error("Anon Key starts with:", supabaseAnonKey?.substring(0, 10));
      return { error: `Authentication error: ${userError.message}. Please check your Supabase credentials in .env.local and restart the dev server.` };
    }

    if (!user) {
      return { error: "Unauthorized. Please log in." };
    }

    // Validate service role key is available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE?.trim();
    if (!serviceRoleKey) {
      console.error("Service role key check:", {
        exists: !!serviceRoleKey,
        length: serviceRoleKey?.length || 0,
        startsWith: serviceRoleKey?.substring(0, 10) || "N/A",
      });
      return { error: "Server configuration error: SUPABASE_SERVICE_ROLE is not set. Please check your .env.local file in the cms directory (not cms-frontend-builder) and restart the dev server." };
    }

    // Validate service role key format
    if (!serviceRoleKey.startsWith("eyJ")) {
      console.error("Service role key format check:", {
        length: serviceRoleKey.length,
        startsWith: serviceRoleKey.substring(0, 20),
      });
      return { error: "Invalid service role key format. The service role key should start with 'eyJ'. Please check your SUPABASE_SERVICE_ROLE in .env.local" };
    }

    let adminSupabase;
    try {
      adminSupabase = supabaseServer();
      
      // Test the admin client with a simple query to verify it works
      const { error: testError } = await adminSupabase
        .from("tenants")
        .select("id")
        .limit(1);
      
      if (testError) {
        console.error("Admin client test query failed:", testError);
        return { 
          error: `Supabase admin client test failed: ${testError.message}. Please verify your SUPABASE_SERVICE_ROLE key is correct and has the right permissions.` 
        };
      }
    } catch (serverError) {
      console.error("Error creating admin Supabase client:", serverError);
      return { 
        error: `Failed to initialize admin Supabase client: ${serverError instanceof Error ? serverError.message : "Unknown error"}. Please check your SUPABASE_SERVICE_ROLE in .env.local` 
      };
    }

    const id = data.id.toLowerCase().trim();

    // Check if tenant slug already exists
    const { data: existingTenant, error: checkError } = await adminSupabase
      .from("tenants")
      .select("id, slug")
      .eq("slug", id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing tenant:", checkError);
      return { error: `Failed to check existing tenant: ${checkError.message}` };
    }

    if (existingTenant) {
      return { error: `Tenant with ID "${id}" already exists` };
    }

    // Create tenant
    const { data: newTenant, error: tenantError } = await adminSupabase
      .from("tenants")
      .insert({
        name: data.name.trim(),
        slug: id,
      })
      .select()
      .single();

    if (tenantError) {
      console.error("Tenant creation error:", tenantError);
      console.error("Error details:", {
        code: tenantError.code,
        message: tenantError.message,
        details: tenantError.details,
        hint: tenantError.hint,
      });
      return { error: `Failed to create tenant: ${tenantError.message}` };
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

    // Create default globals with empty header/footer/navigation
    const defaultGlobals = [
      {
        tenant_id: newTenant.id,
        key: "header",
        value: {},
        status: "draft" as const,
      },
      {
        tenant_id: newTenant.id,
        key: "footer",
        value: {},
        status: "draft" as const,
      },
      {
        tenant_id: newTenant.id,
        key: "navigation",
        value: {},
        status: "draft" as const,
      },
      {
        tenant_id: newTenant.id,
        key: "settings",
        value: {
          domain: data.domain.trim().startsWith("http") 
            ? data.domain.trim() 
            : `https://${data.domain.trim()}`,
          primaryColor: data.primaryColor || data.brandColor || "#00bfa6",
          defaultLocale: data.defaultLocale || "en",
        },
        status: "published" as const,
      },
    ];

    const { error: globalsError } = await adminSupabase
      .from("globals")
      .insert(defaultGlobals);

    if (globalsError) {
      console.error("Error creating default globals:", globalsError);
      // Don't fail the whole operation if globals fail
    }

    // Create draft "Home" page
    const { data: homePage, error: pageError } = await adminSupabase
      .from("pages")
      .insert({
        tenant_id: newTenant.id,
        title: "Home",
        slug: "/",
        status: "draft",
      })
      .select()
      .single();

    if (pageError) {
      console.error("Error creating home page:", pageError);
      // Don't fail the whole operation if page creation fails
    } else if (homePage) {
      // Create initial page version with default Hero + PostsFeed sections
      const defaultSections = [
        {
          type: "Hero",
          props: {
            title: `Welcome to ${data.name}`,
            subtitle: "This is your new website powered by Side by Side CMS",
            image: "/uploads/default-hero.jpg",
          },
        },
        {
          type: "PostsFeed",
          props: { limit: 3 },
        },
      ];

      const { error: versionError } = await adminSupabase
        .from("page_versions")
        .insert({
          page_id: homePage.id,
          tenant_id: newTenant.id,
          version_number: 1,
          content: { sections: defaultSections },
          created_by: user.id,
        });

      if (versionError) {
        console.error("Error creating page version:", versionError);
        // Don't fail the whole operation if version creation fails
      }
    }

    revalidatePath("/tenants");
    const normalizedDomain = data.domain.trim().startsWith("http") 
      ? data.domain.trim() 
      : `https://${data.domain.trim()}`;
    return { id: newTenant.slug, domain: normalizedDomain };
  } catch (error) {
    console.error("Unexpected error in createTenantWizard:", error);
    return { 
      error: error instanceof Error 
        ? `Unexpected error: ${error.message}` 
        : "Unknown error occurred while creating tenant" 
    };
  }
}

