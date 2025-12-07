import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { secret, tenantDomain } = await req.json();

    // Verify secret
    if (secret !== process.env.VERCEL_REVALIDATE_SECRET) {
      return Response.json({ error: "Invalid secret" }, { status: 401 });
    }

    // Revalidate public API routes
    revalidatePath("/api/public/page");
    revalidatePath("/api/public/posts");
    revalidatePath("/api/public/globals");

    return Response.json({ revalidated: true, tenantDomain });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

