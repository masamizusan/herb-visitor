const SESSION_KEY = "herb_visitor_session_id"

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getSessionId(): string {
  if (typeof window === "undefined") {
    return ""
  }
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = generateUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}
