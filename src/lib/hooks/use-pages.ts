"use client";

import { useState, useEffect } from "react";
import { useTenantId } from "./use-tenant-id";
import { supabaseBrowser } from "../supabase";
import { listPages } from "@/actions/pages";

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  updatedAt: string;
  updated_at: string;
  blocks?: Block[];
}

export interface Block {
  id: string;
  type: string;
  data: Record<string, unknown>;
  props?: Record<string, unknown>;
}

export function usePages() {
  const tenantId = useTenantId();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    async function fetchPages() {
      try {
        setIsLoading(true);
        const result = await listPages();
        
        if (result.error) {
          // Silently handle error - tenant might not be set up yet
          setPages([]);
          setIsLoading(false);
          return;
        }

        const formattedPages: Page[] = (result.data || []).map((page: any) => ({
          id: page.id,
          title: page.title,
          slug: page.slug,
          status: page.status,
          updatedAt: page.updated_at,
          updated_at: page.updated_at,
          blocks: [],
        }));

        setPages(formattedPages);
        setIsLoading(false);
      } catch (error) {
        // Handle unexpected errors gracefully
        setPages([]);
        setIsLoading(false);
      }
    }

    fetchPages();
  }, [tenantId]);

  const addPage = (page: Page) => {
    setPages((prev) => [page, ...prev]);
  };

  const updatePage = (id: string, updates: Partial<Page>) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  return { pages, setPages, addPage, updatePage, deletePage, isLoading };
}

export function usePage(pageId: string) {
  const tenantId = useTenantId();
  const [page, setPage] = useState<Page | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId || !pageId || pageId === "new") {
      setIsLoading(false);
      return;
    }

    async function fetchPage() {
      try {
        setIsLoading(true);
        const supabase = supabaseBrowser();
        
        // Get tenant first
        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .select("id")
          .eq("id", tenantId)
          .maybeSingle();

        if (tenantError || !tenant) {
          setIsLoading(false);
          return;
        }

        const { data: pageData, error } = await supabase
          .from("pages")
          .select("*")
          .eq("id", pageId)
          .eq("tenant_id", tenant.id)
          .maybeSingle();

        if (error || !pageData) {
          setIsLoading(false);
          return;
        }

        // Get latest version content
        const { data: version } = await supabase
          .from("page_versions")
          .select("content")
          .eq("page_id", pageId)
          .order("version_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        const formattedPage: Page = {
          id: pageData.id,
          title: pageData.title,
          slug: pageData.slug,
          status: pageData.status,
          updatedAt: pageData.updated_at,
          updated_at: pageData.updated_at,
          blocks: version?.content?.sections || [],
        };

        setPage(formattedPage);
        setIsLoading(false);
      } catch (error) {
        // Handle unexpected errors gracefully
        setIsLoading(false);
      }
    }

    fetchPage();
  }, [tenantId, pageId]);

  return { page, isLoading };
}

export function usePageBlocks(pageId: string) {
  const tenantId = useTenantId();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId || !pageId || pageId === "new") {
      setIsLoading(false);
      return;
    }

    async function fetchBlocks() {
      try {
        setIsLoading(true);
        const supabase = supabaseBrowser();
        
        const { data: version } = await supabase
          .from("page_versions")
          .select("content")
          .eq("page_id", pageId)
          .order("version_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        const sections = version?.content?.sections || [];
        
        // Convert sections to blocks format
        const formattedBlocks: Block[] = sections.map((section: any, index: number) => ({
          id: section.id || `block-${index}`,
          type: section.type,
          data: section.props || {},
          props: section.props || {},
        }));

        setBlocks(formattedBlocks);
        setIsLoading(false);
      } catch (error) {
        // Handle unexpected errors gracefully
        setBlocks([]);
        setIsLoading(false);
      }
    }

    fetchBlocks();
  }, [tenantId, pageId]);

  return { blocks, setBlocks, isLoading };
}

