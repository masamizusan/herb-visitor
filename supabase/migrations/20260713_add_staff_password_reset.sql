-- パスワード再発行機能（仮パスワード窓口伝達方式）用スキーマ
-- メールアドレスを使わず、見沼氷川公園管理棟の職員が仮パスワードを発行する運用に対応する

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS staff_users (
  id uuid primary key default gen_random_uuid(),
  staff_username text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS password_reset_logs (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid references users(id) not null,
  staff_id uuid references staff_users(id) not null,
  reset_at timestamptz default now()
);

-- 初期職員アカウントは Supabase SQL Editor で個別に手動INSERT済み（このファイルには含めない）。
-- 追加の職員アカウントが必要な場合は、パスワードを bcryptjs 等で事前にハッシュ化したうえで
-- 以下の形式のSQLを Supabase SQL Editor で直接実行してください（リポジトリにはコミットしないこと）。
--
-- INSERT INTO staff_users (staff_username, password_hash)
-- VALUES ('職員ID', 'bcryptハッシュ')
-- ON CONFLICT (staff_username) DO NOTHING;
