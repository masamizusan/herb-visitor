"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Bell } from "lucide-react"

export default function MyPageNotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [notifyNews, setNotifyNews] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user) {
          window.location.href = "/login"
          return
        }
        setNotifyNews(user.notifyNews)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleToggle = async () => {
    const next = !notifyNews
    setNotifyNews(next)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/account/notify-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyNews: next }),
      })
      if (!res.ok) {
        setNotifyNews(!next)
        setError("設定の更新に失敗しました")
      }
    } catch {
      setNotifyNews(!next)
      setError("通信エラーが発生しました")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh">
      <div className="hero-gradient px-5 pt-10 pb-6 rounded-b-3xl">
        <Link
          href="/my-page"
          className="inline-flex items-center gap-1 text-white/80 text-sm mb-3"
        >
          <ArrowLeft size={18} />
          マイページに戻る
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Bell size={20} className="text-white" />
          <h1 className="text-xl font-bold text-white">通知設定</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {loading ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm h-16 animate-pulse" />
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-herb-text">お知らせ更新通知</p>
                <p className="text-xs text-herb-text-secondary mt-0.5">
                  お知らせが更新された際に通知を受け取ります
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifyNews}
                onClick={handleToggle}
                disabled={saving}
                className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${
                  notifyNews ? "bg-herb-primary" : "bg-herb-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    notifyNews ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
