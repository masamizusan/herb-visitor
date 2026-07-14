-- マイページ「通知設定」用: お知らせ更新通知を受け取るかどうかのユーザー設定
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_news BOOLEAN NOT NULL DEFAULT true;
