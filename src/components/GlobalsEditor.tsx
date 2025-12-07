"use client";

import { useState, useTransition } from "react";
import { saveGlobals } from "@/actions/globals";

interface GlobalsEditorProps {
  header: any;
  navigation: any;
  footer: any;
  saveGlobals: typeof saveGlobals;
}

export function GlobalsEditor({
  header,
  navigation,
  footer,
  saveGlobals,
}: GlobalsEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [headerValue, setHeaderValue] = useState(JSON.stringify(header, null, 2));
  const [navigationValue, setNavigationValue] = useState(
    JSON.stringify(navigation, null, 2)
  );
  const [footerValue, setFooterValue] = useState(JSON.stringify(footer, null, 2));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleSave = () => {
    startTransition(async () => {
      setStatus("saving");
      try {
        const headerObj = JSON.parse(headerValue);
        const navigationObj = JSON.parse(navigationValue);
        const footerObj = JSON.parse(footerValue);

        const result = await saveGlobals([
          { key: "header", value: headerObj },
          { key: "navigation", value: navigationObj },
          { key: "footer", value: footerObj },
        ]);

        if (result.error) {
          setStatus("error");
          console.error("Save error:", result.error);
        } else {
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        }
      } catch (error) {
        setStatus("error");
        console.error("JSON parse error:", error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Header (JSON)
        </label>
        <textarea
          value={headerValue}
          onChange={(e) => setHeaderValue(e.target.value)}
          className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          spellCheck={false}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Navigation (JSON)
        </label>
        <textarea
          value={navigationValue}
          onChange={(e) => setNavigationValue(e.target.value)}
          className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          spellCheck={false}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Footer (JSON)
        </label>
        <textarea
          value={footerValue}
          onChange={(e) => setFooterValue(e.target.value)}
          className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          spellCheck={false}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {status === "saving" && "Saving..."}
          {status === "saved" && "Saved successfully!"}
          {status === "error" && "Error saving. Check console for details."}
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save Globals"}
        </button>
      </div>
    </div>
  );
}

