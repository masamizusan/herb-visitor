/**
 * プッシュ通知の送信テスト用スクリプト（管理者アカウントでログインしてから送信する）
 *
 * 使い方:
 *   node scripts/send-notification.mjs --user 管理者ID --password パスワード --title "タイトル" --body "本文" [--url /path] [--base https://herb-visitor-seven.vercel.app]
 *
 * --base を省略した場合は本番URL (https://herb-visitor-seven.vercel.app) に送信します。
 * 送信先の管理者アカウントは users.is_admin = true になっている必要があります。
 */

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2)
      args[key] = argv[i + 1]
      i++
    }
  }
  return args
}

const args = parseArgs(process.argv.slice(2))
const BASE_URL = args.base || "https://herb-visitor-seven.vercel.app"

if (!args.user || !args.password || !args.title) {
  console.error("必須パラメータが不足しています: --user --password --title")
  console.error(
    '例: node scripts/send-notification.mjs --user myadmin01 --password mypassword --title "お知らせ" --body "本文です"'
  )
  process.exit(1)
}

const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId: args.user, password: args.password }),
})

if (!loginRes.ok) {
  console.error("ログイン失敗:", loginRes.status, await loginRes.text())
  process.exit(1)
}

const setCookie = loginRes.headers.get("set-cookie")
const sessionCookie = setCookie?.split(";")[0]

if (!sessionCookie) {
  console.error("セッションCookieを取得できませんでした")
  process.exit(1)
}

const sendRes = await fetch(`${BASE_URL}/api/send-notification`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: sessionCookie,
  },
  body: JSON.stringify({
    title: args.title,
    body: args.body || "",
    url: args.url || "/",
  }),
})

const result = await sendRes.json()

if (!sendRes.ok) {
  console.error("送信失敗:", sendRes.status, result)
  process.exit(1)
}

console.log(`送信完了: ${result.sent}件に送信、${result.removed}件の無効な購読を削除しました`)
