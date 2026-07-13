import { NextResponse } from "next/server"
import { getStaffSession } from "@/lib/staff-auth"

export async function GET() {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ staff: null })
  return NextResponse.json({ staff: { staffUsername: session.staffUsername } })
}
