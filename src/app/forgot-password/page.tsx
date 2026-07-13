import Link from "next/link"
import { ArrowLeft, KeyRound, MapPin, Clock, ShieldCheck } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-dvh">
      <div className="hero-gradient px-5 pt-10 pb-6 rounded-b-3xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-white/80 text-sm mb-3"
        >
          <ArrowLeft size={18} />
          ログインに戻る
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={20} className="text-white" />
          <h1 className="text-xl font-bold text-white">IDまたはパスワードをお忘れの方</h1>
        </div>
        <p className="text-white/80 text-sm">
          個人情報保護のため、オンラインでのパスワード再設定は行っておりません。
        </p>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-sm text-herb-text leading-relaxed">
            パスワードを忘れた場合は、<strong>見沼氷川公園管理棟</strong>に来所のうえ、職員にお申し出ください。職員が本人確認のうえ、その場で仮パスワードをお渡しします。
          </p>
          <p className="text-sm text-herb-text-secondary leading-relaxed">
            受け取った仮パスワードでログイン後、必ず新しいパスワードへの変更をお願いします（変更が完了するまで他の画面はご利用いただけません）。
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-2">
            <MapPin size={18} className="text-herb-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-herb-text-secondary">場所</p>
              <p className="text-sm text-herb-text">見沼氷川公園 管理棟（受付窓口）</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock size={18} className="text-herb-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-herb-text-secondary">受付時間</p>
              <p className="text-sm text-herb-text">9:00〜17:00（詳細は現地掲示をご確認ください）</p>
            </div>
          </div>
        </div>

        <div className="bg-herb-primary/5 rounded-2xl p-4 flex items-start gap-2">
          <ShieldCheck size={18} className="text-herb-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-herb-text-secondary leading-relaxed">
            メールアドレスや電話番号による再設定、秘密の質問、会員証・QRコードによる再設定は行っておりません。必ず管理棟の窓口にお越しください。
          </p>
        </div>

        <Link
          href="/login"
          className="block w-full h-11 rounded-full bg-herb-primary text-white font-semibold text-sm text-center leading-[44px]"
        >
          ログイン画面に戻る
        </Link>
      </div>
    </div>
  )
}
