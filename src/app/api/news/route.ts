import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { NewsRow } from "@/data/news"

export const dynamic = "force-dynamic"

export async function GET() {
  const { data, error } = await supabase
    .from("news")
    .select("id, category, title, summary, body, image_path, published_at, is_published")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ news: (data ?? []) as NewsRow[] })
}
