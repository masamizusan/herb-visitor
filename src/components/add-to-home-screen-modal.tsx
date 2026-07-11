"use client"

import { X, Share, MoreVertical, Smartphone } from "lucide-react"
import type { MobilePlatform } from "@/lib/platform"

export default function AddToHomeScreenModal({
  platform,
  title,
  description,
  onClose,
}: {
  platform: MobilePlatform
  title?: string
  description?: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 px-4 pb-6 sm:pb-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <Smartphone size={20} className="text-herb-primary" />
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="text-herb-text-secondary hover:text-herb-text p-1 -m-1"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <h2 className="text-base font-bold text-herb-text mb-1">
            {title ?? "ホーム画面に追加しませんか？"}
          </h2>
          <p className="text-sm text-herb-text-secondary leading-relaxed">
            {description ?? "ホーム画面に追加すると、アプリのようにすぐ開けて通知も受け取りやすくなります。"}
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
          onClick={onClose}
          className="w-full h-10 rounded-full bg-herb-primary text-white font-semibold text-sm"
        >
          わかりました
        </button>
      </div>
    </div>
  )
}
