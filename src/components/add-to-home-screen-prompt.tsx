"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { X, Share, MoreVertical, Smartphone } from "lucide-react"

// ログインなしでアクセスできる公開パス（プレフィックス一致）
// useAutoLogout の PUBLIC_PATHS と同じ基準
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"]

const STORAGE_KEY = "a2hsPromptDismissed"

type Platform = "ios" | "android"

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    nav.standalone === true
  )
}

function detectPlatform(): Platform | null {
  const ua = window.navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return "ios"
  if (/Android/.test(ua)) return "android"
  return null
}

export default function AddToHomeScreenPrompt() {
  const pathname = usePathname()
  const [platform, setPlatform] = useState<Platform | null>(null)

  useEffect(() => {
    // setStateを直接同期呼び出ししない（react-hooks/set-state-in-effect対策）ため非同期関数でラップ
    ;(async () => {
      if (isPublicPath(pathname)) return
      if (isStandalone()) return

      try {
        if (localStorage.getItem(STORAGE_KEY) === "1") return
      } catch {
        // localStorage不可環境ではスキップ
        return
      }

      if (typeof Notification === "undefined" || Notification.permission !== "granted") return

      const detected = detectPlatform()
      if (!detected) return

      setPlatform(detected)
    })()
  }, [pathname])

  const close = () => {
    setPlatform(null)
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // 無視
    }
  }

  if (!platform) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 px-4 pb-6 sm:pb-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <Smartphone size={20} className="text-herb-primary" />
          </div>
          <button
            onClick={close}
            aria-label="閉じる"
            className="text-herb-text-secondary hover:text-herb-text p-1 -m-1"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <h2 className="text-base font-bold text-herb-text mb-1">
            ホーム画面に追加しませんか？
          </h2>
          <p className="text-sm text-herb-text-secondary leading-relaxed">
            ホーム画面に追加すると、アプリのようにすぐ開けて通知も受け取りやすくなります。
          </p>
        </div>

        {platform === "ios" ? (
          <ol className="space-y-2 text-sm text-herb-text bg-herb-bg rounded-xl px-3.5 py-3">
            <li className="flex items-center gap-1.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-herb-primary text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              画面下の共有ボタン
              <Share size={14} className="text-herb-primary flex-shrink-0" />
              をタップ
            </li>
            <li className="flex items-center gap-1.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-herb-primary text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              「ホーム画面に追加」を選択
            </li>
          </ol>
        ) : (
          <ol className="space-y-2 text-sm text-herb-text bg-herb-bg rounded-xl px-3.5 py-3">
            <li className="flex items-center gap-1.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-herb-primary text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              右上のメニュー
              <MoreVertical size={14} className="text-herb-primary flex-shrink-0" />
              をタップ
            </li>
            <li className="flex items-center gap-1.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-herb-primary text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              「ホーム画面に追加」または「アプリをインストール」を選択
            </li>
          </ol>
        )}

        <button
          onClick={close}
          className="w-full h-10 rounded-full bg-herb-primary text-white font-semibold text-sm"
        >
          わかりました
        </button>
      </div>
    </div>
  )
}
