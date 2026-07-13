"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"

export default function StaffLoginPage() {
  const [staffUsername, setStaffUsername] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffUsername, password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "ログインに失敗しました")
        setSubmitting(false)
        return
      }
      window.location.href = "/staff/dashboard"
    } catch {
      setError("通信エラーが発生しました")
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 bg-slate-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <ShieldCheck size={22} className="text-slate-700" />
            <h1 className="text-xl font-bold text-slate-800">職員用管理画面</h1>
          </div>
          <p className="text-slate-500 text-sm">Harbvisitor 職員ログイン</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-md space-y-4 border border-slate-200"
        >
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">職員ID</label>
            <input
              type="text"
              value={staffUsername}
              onChange={(e) => setStaffUsername(e.target.value.trim())}
              autoComplete="username"
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !staffUsername || !password}
            className="w-full h-11 rounded-lg bg-slate-800 text-white font-semibold text-sm disabled:opacity-50"
          >
            {submitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  )
}
