"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000    // 1時間無操作でログアウト
const INACTIVITY_CHECK_MS   = 60 * 1000          // 無操作チェック間隔: 60秒
const HEARTBEAT_INTERVAL_MS = 10 * 60 * 1000     // ハートビート間隔: 10分
const STORAGE_KEY = "lastActivityAt"

// sessionStorage に残すタブ生存フラグ。タブを閉じると消えるため
// 同じURLを再度開いた際にログアウトを検知できる。
const TAB_SESSION_KEY = "session_tab"

// ログインなしでアクセスできる公開パス（プレフィックス一致）
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"]

// 強制パスワード変更チェックをスキップするパス（未ログインで開ける画面、変更画面自身は対象外）
const SKIP_PASSWORD_CHECK_PATHS = [...PUBLIC_PATHS, "/change-password"]

// 職員用画面（別セッション・別認証）はビジター向けの自動ログアウト機構の対象外
const STAFF_PATH_PREFIX = "/staff"

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

function skipPasswordCheck(pathname: string): boolean {
  return SKIP_PASSWORD_CHECK_PATHS.some((p) => pathname.startsWith(p))
}

async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" })
  } catch {
    // 通信失敗時もリダイレクトは行う
  }
  sessionStorage.removeItem(TAB_SESSION_KEY)
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * セッション維持フック。以下の4つを担う:
 * 1. ハートビート: 10分ごとに /api/auth/refresh を呼んでJWT(30分有効)を更新。
 *    タブ/ブラウザを閉じると更新が止まり、最大30分でJWTが期限切れになる。
 * 2. 無操作ログアウト: 1時間操作がなければ強制ログアウト。
 * 3. タブ再オープン検知: sessionStorage フラグがなければログアウト。
 * 4. 強制パスワード変更誘導: 仮パスワードでのログイン後、新パスワードに
 *    変更するまで /change-password 以外のページに留まれないようにする。
 */
export function useAutoLogout(enabled: boolean = true) {
  const pathname = usePathname()

  useEffect(() => {
    if (!enabled) return
    if (typeof window === "undefined") return
    if (window.location.pathname.startsWith(STAFF_PATH_PREFIX)) return

    // --- タブ生存チェック ---
    const tabAlive = sessionStorage.getItem(TAB_SESSION_KEY)
    if (!tabAlive) {
      if (!isPublicPath(window.location.pathname)) {
        logout().finally(() => {
          window.location.href = "/login"
        })
        return
      }
    }
    sessionStorage.setItem(TAB_SESSION_KEY, "1")

    // --- 無操作タイマー ---
    const updateActivity = () => {
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()))
      } catch {
        // localStorage 不可環境ではスキップ
      }
    }

    const events: (keyof WindowEventMap)[] = ["click", "keydown", "scroll", "touchstart"]
    events.forEach((e) => window.addEventListener(e, updateActivity, { passive: true }))
    updateActivity()

    let timeoutFired = false

    const inactivityTimer = setInterval(async () => {
      if (timeoutFired) return
      try {
        const last = Number(localStorage.getItem(STORAGE_KEY) ?? 0)
        if (!last) return
        if (Date.now() - last > INACTIVITY_TIMEOUT_MS) {
          timeoutFired = true
          await logout()
          alert("セキュリティのため自動的にログアウトしました。")
          window.location.href = "/login"
        }
      } catch {
        // localStorage アクセス失敗時はスキップ
      }
    }, INACTIVITY_CHECK_MS)

    // --- ハートビート: JWTを定期更新 ---
    // タブ/ブラウザを閉じるとここで止まり、JWTが30分で自然失効する。
    const heartbeat = setInterval(async () => {
      if (timeoutFired) return
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" })
        if (res.status === 401) {
          // セッション失効 → ログインへ
          timeoutFired = true
          window.location.href = "/login"
        }
      } catch {
        // 通信失敗は次回ハートビートで再試行
      }
    }, HEARTBEAT_INTERVAL_MS)

    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActivity))
      clearInterval(inactivityTimer)
      clearInterval(heartbeat)
    }
  }, [enabled])

  // --- 強制パスワード変更誘導（ページ遷移のたびにチェック） ---
  useEffect(() => {
    if (!enabled) return
    if (typeof window === "undefined") return
    if (pathname.startsWith(STAFF_PATH_PREFIX)) return
    if (skipPasswordCheck(pathname)) return

    let cancelled = false
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (cancelled) return
        if (user?.mustChangePassword) {
          window.location.href = "/change-password"
        }
      })
      .catch(() => {
        // 通信失敗時はチェックをスキップ（次回遷移時に再試行）
      })

    return () => {
      cancelled = true
    }
  }, [enabled, pathname])
}
