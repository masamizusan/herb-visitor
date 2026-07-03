-- users.user_id が varchar(8) になっており、アプリのID_PATTERN(8〜16文字)より短いため
-- 9文字以上のIDで新規登録が500エラーになる不具合の修正。
ALTER TABLE users
  ALTER COLUMN user_id TYPE VARCHAR(16);
