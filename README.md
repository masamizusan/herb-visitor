This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## プッシュ通知の送信方法

### 前提

- 送信は `/api/send-notification` (`POST`) で行う。ログイン済み、かつ `users.is_admin = true` のアカウントのみ実行可能（それ以外は403）。
- 管理者に昇格させたいアカウントがある場合は、Supabaseの SQL Editor で以下を実行する。

  ```sql
  UPDATE users SET is_admin = true WHERE user_id = '対象のログインID';
  ```

- 利用者側は、トップページに表示される「プッシュ通知を受け取る」ボタンから通知を許可すると `push_subscriptions` テーブルに購読情報が保存される。

### コマンド一発で送信する

```bash
npm run send-notification -- --user 管理者ID --password パスワード --title "お知らせ" --body "本文です" --url /
```

- `--url` は通知タップ時に開くパス（省略時は `/`）
- `--base` で送信先を切り替え可能（省略時は本番URL `https://herb-visitor-seven.vercel.app`）
- 内部で `/api/auth/login` にログインしてセッションCookieを取得し、そのCookieで `/api/send-notification` を呼び出す

### curlで直接叩く場合

```bash
# 1. ログインしてセッションCookieを保存
curl -c cookie.txt -X POST https://herb-visitor-seven.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"管理者ID","password":"パスワード"}'

# 2. 保存したCookieで通知を送信
curl -b cookie.txt -X POST https://herb-visitor-seven.vercel.app/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{"title":"お知らせ","body":"本文です","url":"/"}'
```

### 送信対象

現状は全購読者への一斉送信のみに対応（特定ユーザーへの絞り込みは未実装）。送信に失敗した購読（410/404など、ブラウザ側で無効になったもの）は自動的に `push_subscriptions` から削除される。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
