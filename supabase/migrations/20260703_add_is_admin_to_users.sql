-- 通知一斉送信APIなど管理者専用機能のためのフラグ
-- 追加後、管理者にしたいユーザーは以下のSQLをSupabaseのSQL Editorで実行してください
--   UPDATE users SET is_admin = true WHERE user_id = '対象のログインID';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
