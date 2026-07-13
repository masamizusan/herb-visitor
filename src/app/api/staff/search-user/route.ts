import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getStaffSession } from "@/lib/staff-auth"

export const dynamic = "force-dynamic"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  const session = await getStaffSession()
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const query = request.nextUrl.searchParams.get("query")?.trim() || ""
  if (!query) {
    return NextResponse.json({ users: [] })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("users")
    .select("id, user_id, created_at, last_login_at, password_reset_required")
    .ilike("user_id", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: "検索に失敗しました" }, { status: 500 })
  }

  return NextResponse.json({ users: data || [] })
}
