-- Create guide_contents table
CREATE TABLE IF NOT EXISTS guide_contents (
  id SERIAL PRIMARY KEY,
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert guide data
INSERT INTO guide_contents (section_key, title, content, status)
VALUES 
  ('membership_registration', '会員登録の方法', 
   '以下の手順で会員登録を行ってください：
   1. ホームページの「マイページ」をタップ
   2. 「新規登録」ボタンをクリック
   3. メールアドレスとパスワードを入力
   4. 確認メールのリンクをクリック
   5. 登録完了です',
   'published'),
  
  ('mynote_usage', 'マイノートの使い方',
   '自分の植物観察記録を管理できます：
   1. マイページの「マイノート」タブを選択
   2. 「+」ボタンで新しいノートを作成
   3. 植物名、観察日時、メモを入力
   4. 写真を添付（オプション）
   5. 保存して管理',
   'published'),
  
  ('photo_upload', '写真の投稿方法',
   '植物の写真をシェアしましょう：
   1. マップ画面で投稿したい場所をタップ
   2. 「写真を投稿」ボタンをクリック
   3. カメラまたはギャラリーから画像を選択
   4. タイトルと説明を入力
   5. 「投稿」ボタンで完了',
   'published')
ON CONFLICT (section_key) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;
