"use client";

import { useTransition, useState, useEffect } from "react";
import Link from "next/link";
import { Blocks, BlockRenderer, type BlockInstance } from "@/blocks/registry";
import { BlockEditors } from "@/blocks/editors/registry";
import { savePageSections, publishPage } from "@/actions/pages";
import { useTenant } from "@/lib/tenant-context";
import { useTenants } from "@/lib/hooks/use-tenants";
import { supabaseBrowser } from "@/lib/supabase";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  content: {
    sections?: BlockInstance[];
  } | null;
}

interface EditorViewProps {
  page: Page;
}

export function EditorView({ page }: EditorViewProps) {
  const [isPending, startTransition] = useTransition();
  const [sections, setSections] = useState<BlockInstance[]>(
    page.content?.sections || []
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const { tenantId, tenant } = useTenant();
  const { tenants } = useTenants();
  const [tenantDomain, setTenantDomain] = useState<string | null>(null);

  // Fetch tenant domain
  useEffect(() => {
    async function fetchTenantDomain() {
      // First try to get from tenant context or tenants list
      const currentTenant = tenant || tenants.find((t) => t.id === tenantId);
      if (currentTenant?.domain) {
        setTenantDomain(currentTenant.domain);
        return;
      }

      // If not in context, fetch from globals
      if (tenantId) {
        const supabase = supabaseBrowser();
        const { data: settings } = await supabase
          .from("globals")
          .select("value")
          .eq("tenant_id", tenantId)
          .eq("key", "settings")
          .single();

        if (settings?.value && typeof settings.value === "object" && "domain" in settings.value) {
          const domain = (settings.value as any).domain;
          if (domain) {
            setTenantDomain(domain);
          }
        }
      }
    }

    fetchTenantDomain();
  }, [tenantId, tenant, tenants]);

  const handleBlockUpdate = (index: number, updates: Record<string, any>) => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      props: {
        ...updatedSections[index].props,
        ...updates,
      },
    };
    setSections(updatedSections);

    // Auto-save with transition
    startTransition(async () => {
      setSaveStatus("saving");
      const result = await savePageSections(page.id, updatedSections);
      if (result.error) {
        setSaveStatus("error");
        console.error("Save error:", result.error);
      } else {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    });
  };

  const handlePublish = async () => {
    if (!tenantDomain) {
      alert("Tenant domain not found. Cannot publish page.");
      return;
    }

    startTransition(async () => {
      try {
        await publishPage(page.id, tenantDomain);
        alert("Page published successfully!");
      } catch (error) {
        alert(`Error publishing: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {page.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                /{page.slug} • {page.status}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "Saved"}
                {saveStatus === "error" && "Error saving"}
              </div>
              <Link
                href={`/pages/${page.id}/versions`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Versions
              </Link>
              <Link
                href={`/pages/${page.id}/clone`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clone
              </Link>
              <button
                onClick={handlePublish}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <main className="container mx-auto px-4 py-8">
        {sections.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400">
              No blocks yet. Add your first block to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((block, index) => {
              const BlockComponent = Blocks[block.type];
              const BlockEditorComponent = BlockEditors[block.type];

              if (!BlockComponent || !BlockEditorComponent) {
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
                  >
                    <p className="text-red-800 dark:text-red-200">
                      Unknown block type: {block.type}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className="group relative rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* Preview Mode - Rendered Block */}
                  <div className="p-6">
                    <BlockComponent {...block.props} />
                  </div>

                  {/* Editor Mode - Block Editor */}
                  <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-800">
                    <BlockEditorComponent
                      {...(block.props as any)}
                      onUpdate={(updates: Record<string, any>) => handleBlockUpdate(index, updates)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

