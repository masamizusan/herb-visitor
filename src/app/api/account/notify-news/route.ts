import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { notifyNews } = await request.json()
  if (typeof notifyNews !== "boolean") {
    return NextResponse.json({ error: "notifyNews must be a boolean" }, { status: 400 })
  }

  const supabase = getSupabase()
  const { error } = await supabase
    .from("users")
    .update({ notify_news: notifyNews })
    .eq("id", session.userId)

  if (error) {
    return NextResponse.json({ error: "設定の更新に失敗しました" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
