import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { createStaffSessionToken, setStaffSessionCookie, STAFF_USERNAME_PATTERN } from "@/lib/staff-auth"

export const dynamic = "force-dynamic"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  try {
    const { staffUsername, password } = await request.json()

    if (!STAFF_USERNAME_PATTERN.test(staffUsername || "") || !password) {
      return NextResponse.json({ error: "IDまたはパスワードが正しくありません" }, { status: 401 })
    }

    const { data: staff } = await supabase
      .from("staff_users")
      .select("id, staff_username, password_hash, is_active")
      .eq("staff_username", staffUsername)
      .maybeSingle()

    if (!staff || staff.is_active !== true) {
      return NextResponse.json({ error: "IDまたはパスワードが正しくありません" }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, staff.password_hash)
    if (!ok) {
      return NextResponse.json({ error: "IDまたはパスワードが正しくありません" }, { status: 401 })
    }

    const token = await createStaffSessionToken({ staffId: staff.id, staffUsername: staff.staff_username })
    await setStaffSessionCookie(token)

    return NextResponse.json({ success: true, staffUsername: staff.staff_username })
  } catch {
    return NextResponse.json({ error: "リクエストの処理に失敗しました" }, { status: 500 })
  }
}
