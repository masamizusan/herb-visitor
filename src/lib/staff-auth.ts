import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = process.env.JWT_SECRET
if (!secret) {
  throw new Error("JWT_SECRET が設定されていません")
}
const JWT_SECRET = new TextEncoder().encode(secret)
const COOKIE_NAME = "staff_session"
const JWT_EXPIRY = "30m"

export interface StaffSessionPayload {
  staffId: string
  staffUsername: string
}

export async function createStaffSessionToken(payload: StaffSessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET)
}

export async function verifyStaffSessionToken(token: string): Promise<StaffSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (typeof payload.staffId === "string" && typeof payload.staffUsername === "string") {
      return { staffId: payload.staffId, staffUsername: payload.staffUsername }
    }
    return null
  } catch {
    return null
  }
}

export async function setStaffSessionCookie(token: string) {
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function clearStaffSessionCookie() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getStaffSession(): Promise<StaffSessionPayload | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyStaffSessionToken(token)
}

export const STAFF_USERNAME_PATTERN = /^[a-zA-Z0-9]{4,32}$/
