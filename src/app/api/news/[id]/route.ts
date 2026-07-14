import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { NewsRow } from "@/data/news"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from("news")
    .select("id, category, title, summary, body, image_path, published_at, is_published")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  return NextResponse.json({ news: data as NewsRow })
}
