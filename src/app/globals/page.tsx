import { getAllGlobals, saveGlobals } from "@/actions/globals";
import { GlobalsEditor } from "@/components/GlobalsEditor";

export default async function GlobalsPage() {
  const result = await getAllGlobals();

  if (result.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">Error: {result.error}</p>
        </div>
      </div>
    );
  }

  const globals = result.data || [];

  // Find or create default globals
  const header = globals.find((g) => g.key === "header")?.value || {};
  const navigation = globals.find((g) => g.key === "navigation")?.value || {};
  const footer = globals.find((g) => g.key === "footer")?.value || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Global Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage header, navigation, and footer content
        </p>
      </div>

      <GlobalsEditor
        header={header}
        navigation={navigation}
        footer={footer}
        saveGlobals={saveGlobals}
      />
    </div>
  );
}

