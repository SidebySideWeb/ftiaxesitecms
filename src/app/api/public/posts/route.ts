import { supabaseServer } from "@/lib/supabase";

export const revalidate = 60;

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenant = searchParams.get("tenant");
  const limit = parseInt(searchParams.get("limit") || "10");

  const { data, error } = await supabaseServer()
    .from("posts")
    .select("*")
    .eq("tenant_id", tenant)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return Response.json({ error }, { status: 404 });

  return Response.json({ posts: data });
}

