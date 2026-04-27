"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { LogIn, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <LoginPageInner />
    </Suspense>
  )
}

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "ログインに失敗しました")
        setSubmitting(false)
        return
      }
      router.push(redirect)
      router.refresh()
    } catch {
      setError("通信エラーが発生しました")
      setSubmitting(false)
    }
  }

  const idValid = /^[a-zA-Z0-9]{8}$/.test(userId)
  const pwValid = /^[a-zA-Z0-9]{8}$/.test(password)

  return (
    <div className="min-h-dvh">
      <div className="hero-gradient px-5 pt-10 pb-6 rounded-b-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-white/80 text-sm mb-3"
        >
          <ArrowLeft size={18} />
          戻る
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <LogIn size={20} className="text-white" />
          <h1 className="text-xl font-bold text-white">ログイン</h1>
        </div>
        <p className="text-white/80 text-sm">
          IDとパスワードでログインします
        </p>
      </div>

      <div className="px-4 py-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-herb-text-secondary mb-1">
              ID（英数字8桁）
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value.trim())}
              autoComplete="username"
              maxLength={8}
              className="w-full h-10 rounded-lg border border-herb-border bg-white px-3 text-sm outline-none focus:border-herb-primary"
              placeholder="例: user1234"
            />
            {userId && !idValid && (
              <p className="text-xs text-red-500 mt-1">IDは英数字8桁で入力してください</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-herb-text-secondary mb-1">
              パスワード（英数字8桁）
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              maxLength={8}
              className="w-full h-10 rounded-lg border border-herb-border bg-white px-3 text-sm outline-none focus:border-herb-primary"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !idValid || !pwValid}
            className="w-full h-11 rounded-full bg-herb-primary text-white font-semibold text-sm disabled:opacity-50"
          >
            {submitting ? "ログイン中..." : "ログイン"}
          </button>

          <p className="text-center text-xs text-herb-text-secondary">
            アカウントをお持ちでない方は{" "}
            <Link href={`/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="text-herb-primary font-medium">
              新規登録
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
