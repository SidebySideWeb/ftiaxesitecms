import { supabaseServer } from "@/lib/supabase";

export const revalidate = 60;

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenant = searchParams.get("tenant");
  const slug = searchParams.get("slug") || "/";

  const { data, error } = await supabaseServer()
    .from("pages")
    .select("*")
    .eq("tenant_id", tenant)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return Response.json({ error }, { status: 404 });

  return Response.json({ page: data });
}

