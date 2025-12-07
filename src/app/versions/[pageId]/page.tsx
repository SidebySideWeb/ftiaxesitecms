import { listVersions, restoreVersion } from "@/actions/pages";
import { getPageById } from "@/actions/pages";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";

interface VersionsPageProps {
  params: Promise<{ pageId: string }>;
}

async function restoreVersionAction(pageId: string, versionId: string) {
  "use server";
  const result = await restoreVersion(pageId, versionId);
  if (result.error) {
    throw new Error(result.error);
  }
  redirect("/dashboard");
}

export default async function VersionsPage({ params }: VersionsPageProps) {
  const { pageId } = await params;

  // Get page info
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

  // Get versions
  const versionsResult = await listVersions(pageId);
  if (versionsResult.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">
            Error: {versionsResult.error}
          </p>
        </div>
      </div>
    );
  }

  const versions = versionsResult.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Page Versions
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {page.title} • /{page.slug}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            No versions found for this page.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Meta
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
              {versions.map((version) => (
                <tr
                  key={version.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      v{version.version_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format(
                        new Date(version.created_at),
                        "MMM d, yyyy HH:mm"
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {version.created_by
                        ? version.created_by.substring(0, 8) + "..."
                        : "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {version.meta && Object.keys(version.meta).length > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs dark:bg-blue-900/30 dark:text-blue-400">
                          {version.meta.restored_from ? "Restored" : "Original"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <form
                      action={restoreVersionAction.bind(null, pageId, version.id)}
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Restore
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

