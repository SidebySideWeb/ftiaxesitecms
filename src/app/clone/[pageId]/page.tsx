import { getPageById, clonePage } from "@/actions/pages";
import { redirect } from "next/navigation";

interface ClonePageProps {
  params: Promise<{ pageId: string }>;
}

async function clonePageAction(formData: FormData) {
  "use server";
  const pageId = formData.get("pageId") as string;
  const newSlug = formData.get("newSlug") as string;
  const newTitle = formData.get("newTitle") as string;

  if (!pageId || !newSlug) {
    throw new Error("Page ID and slug are required");
  }

  const result = await clonePage(pageId, newSlug, newTitle);
  if (result.error) {
    throw new Error(result.error);
  }

  redirect("/dashboard");
}

export default async function ClonePage({ params }: ClonePageProps) {
  const { pageId } = await params;

  const pageResult = await getPageById(pageId);
  if (pageResult.error || !pageResult.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">
            Error: {pageResult.error || "Page not found"}
          </p>
        </div>
      </div>
    );
  }

  const page = pageResult.data;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Clone Page
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a copy of "{page.title}"
        </p>
      </div>

      <form
        action={clonePageAction}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <input type="hidden" name="pageId" value={pageId} />

        <div className="mb-4">
          <label
            htmlFor="newTitle"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            New Title
          </label>
          <input
            type="text"
            id="newTitle"
            name="newTitle"
            defaultValue={`${page.title} (Copy)`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="newSlug"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            New Slug
          </label>
          <input
            type="text"
            id="newSlug"
            name="newSlug"
            defaultValue={`${page.slug}-copy`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
            pattern="[a-z0-9-]+"
            title="Slug must contain only lowercase letters, numbers, and hyphens"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Only lowercase letters, numbers, and hyphens allowed
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clone Page
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}

