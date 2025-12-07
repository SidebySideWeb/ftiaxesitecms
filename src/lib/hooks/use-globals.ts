"use client";

import { useState, useEffect } from "react";
import { useTenantId } from "./use-tenant-id";
import { getAllGlobals } from "@/actions/globals";

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface GlobalSettings {
  navigation: NavItem[];
  header: {
    logo: string;
    showSearch: boolean;
  };
  footer: {
    copyright: string;
    links: NavItem[];
  };
  seo: {
    titleTemplate: string;
    defaultDescription: string;
    ogImage: string;
  };
}

const defaultGlobals: GlobalSettings = {
  navigation: [],
  header: {
    logo: "/logo.png",
    showSearch: true,
  },
  footer: {
    copyright: "© 2025",
    links: [],
  },
  seo: {
    titleTemplate: "%s | Site",
    defaultDescription: "",
    ogImage: "/og-image.png",
  },
};

export function useGlobals() {
  const tenantId = useTenantId();
  const [globals, setGlobals] = useState<GlobalSettings>(defaultGlobals);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    async function fetchGlobals() {
      setIsLoading(true);
      const result = await getAllGlobals();
      
      if (result.error) {
        console.error("Error fetching globals:", result.error);
        setIsLoading(false);
        return;
      }

      // Parse globals from database
      const globalsData = result.data || [];
      const parsedGlobals: GlobalSettings = { ...defaultGlobals };

      globalsData.forEach((item: any) => {
        if (item.key === "navigation" && item.value) {
          parsedGlobals.navigation = item.value;
        } else if (item.key === "header" && item.value) {
          parsedGlobals.header = { ...parsedGlobals.header, ...item.value };
        } else if (item.key === "footer" && item.value) {
          parsedGlobals.footer = { ...parsedGlobals.footer, ...item.value };
        } else if (item.key === "seo" && item.value) {
          parsedGlobals.seo = { ...parsedGlobals.seo, ...item.value };
        }
      });

      setGlobals(parsedGlobals);
      setIsLoading(false);
    }

    fetchGlobals();
  }, [tenantId]);

  return { globals, setGlobals, isLoading };
}

