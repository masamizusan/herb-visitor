-- 職員用「お知らせ管理」画面（/staff/news）用のスキーマ
-- 来園者側は公開済み（is_published = true）のレコードのみ閲覧可能にする

create table if not exists public.news (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (category in ('イベント', 'お知らせ', '更新情報')),
  title         text not null,
  summary       text not null default '',
  body          text not null default '',
  image_path    text,
  published_at  date not null default current_date,
  is_published  boolean not null default false,
  created_by    uuid references staff_users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.news enable row level security;

-- 来園者側：公開済みレコードのみ閲覧可能
create policy "anon can read published news"
  on public.news
  for select
  using (is_published = true);

-- 職員側の読み書きは service_role キー経由のAPIからのみ行う
-- （service_role は RLS を bypass するため、書き込み用ポリシーは不要）
