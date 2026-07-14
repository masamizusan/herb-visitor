import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getStaffSession } from "@/lib/staff-auth"
import type { NewsCategory, NewsRow } from "@/data/news"

export const dynamic = "force-dynamic"

const NEWS_CATEGORIES: NewsCategory[] = ["イベント", "お知らせ", "更新情報"]
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const staffSession = await getStaffSession()
  if (!staffSession) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("news")
    .select("id, category, title, summary, body, image_path, published_at, is_published")
    .order("published_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ news: (data ?? []) as NewsRow[] })
}

export async function POST(request: NextRequest) {
  const staffSession = await getStaffSession()
  if (!staffSession) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { category, title, summary, body, publishedAt, isPublished } = await request.json()

  if (!NEWS_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "カテゴリが不正です" }, { status: 400 })
  }
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 })
  }
  if (typeof publishedAt !== "string" || !DATE_PATTERN.test(publishedAt)) {
    return NextResponse.json({ error: "日付が不正です" }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("news")
    .insert({
      category,
      title: title.trim(),
      summary: typeof summary === "string" ? summary.trim() : "",
      body: typeof body === "string" ? body.trim() : "",
      published_at: publishedAt,
      is_published: Boolean(isPublished),
      created_by: staffSession.staffId,
    })
    .select("id, category, title, summary, body, image_path, published_at, is_published")
    .single()

  if (error) {
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 })
  }

  return NextResponse.json({ news: data as NewsRow })
}
