import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken } from "@/lib/auth"

const PROTECTED_PATHS = [
  "/output-records/new",
  "/my-notes/new",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get("session")?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/output-records/:path*", "/my-notes/:path*"],
}
