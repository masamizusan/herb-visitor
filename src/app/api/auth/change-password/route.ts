import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { getSession, PW_PATTERN } from "@/lib/auth"

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

  const supabase = getSupabase()
  try {
    const { newPassword } = await request.json()

    if (!PW_PATTERN.test(newPassword || "")) {
      return NextResponse.json({ error: "パスワードは英数字8〜16文字で入力してください" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    const { error } = await supabase
      .from("users")
      .update({ password_hash: passwordHash, password_reset_required: false })
      .eq("id", session.userId)

    if (error) {
      return NextResponse.json({ error: "パスワードの更新に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "処理に失敗しました" }, { status: 500 })
  }
}
