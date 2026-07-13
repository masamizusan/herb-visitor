import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';
import { sendPushToSubscription } from '@/lib/web-push';

const WELCOME_SENDER_NAME = '見沼氷川公園管理スタッフ';
const WELCOME_MESSAGE = 'アプリ会員登録ありがとうございます';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { endpoint, keys } = await req.json();

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: 'endpoint' }
    );

  if (error) {
    console.error('push_subscriptions upsert error:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }

  await sendWelcomeNotificationIfNeeded(supabase, { endpoint, p256dh: keys.p256dh, auth: keys.auth });

  return NextResponse.json({ ok: true });
}

// ログイン中ユーザーに対して初回購読時のみウェルカム通知を送る（ユーザー単位で重複送信を防止）
async function sendWelcomeNotificationIfNeeded(
  supabase: ReturnType<typeof getSupabase>,
  sub: { endpoint: string; p256dh: string; auth: string }
) {
  const session = await getSession();
  if (!session) return;

  const { data: user } = await supabase
    .from('users')
    .select('welcome_notified_at')
    .eq('id', session.userId)
    .maybeSingle();

  if (!user || user.welcome_notified_at) return;

  await sendPushToSubscription(sub, {
    title: WELCOME_SENDER_NAME,
    body: WELCOME_MESSAGE,
    url: '/',
  });

  await supabase
    .from('users')
    .update({ welcome_notified_at: new Date().toISOString() })
    .eq('id', session.userId);
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();

  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint required' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
