import { supabaseServer } from "@/lib/supabase";

export const revalidate = 60;

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenant = searchParams.get("tenant");

  const { data, error } = await supabaseServer()
    .from("globals")
    .select("key, value")
    .eq("tenant_id", tenant)
    .eq("status", "published");

  if (error) return Response.json({ error }, { status: 404 });

  // Transform to object
  const result: Record<string, any> = {};
  (data || []).forEach((global) => {
    result[global.key] = global.value;
  });

  return Response.json(result);
}

