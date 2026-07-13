import webpush from 'web-push';
import type { SupabaseClient } from '@supabase/supabase-js';

let configured = false;

export function getWebPush() {
  if (!configured) {
    webpush.setVapidDetails(
      'mailto:info-saitama@farm-group.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    configured = true;
  }
  return webpush;
}

export interface PushSubscriptionKeys {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

// 送信結果: 410/404 が返ってきた場合は購読が失効しているため呼び出し元で削除する
export async function sendPushToSubscription(
  sub: PushSubscriptionKeys,
  payload: PushPayload
): Promise<{ ok: boolean; stale: boolean }> {
  try {
    await getWebPush().sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload)
    );
    return { ok: true, stale: false };
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    return { ok: false, stale: status === 410 || status === 404 };
  }
}

export async function broadcastPush(
  supabase: SupabaseClient,
  payload: PushPayload
): Promise<{ sent: number; removed: number }> {
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth');

  if (error) {
    throw new Error('Failed to fetch subscriptions');
  }

  const staleEndpoints: string[] = [];

  await Promise.allSettled(
    (subscriptions ?? []).map(async (sub) => {
      const result = await sendPushToSubscription(sub, payload);
      if (result.stale) {
        staleEndpoints.push(sub.endpoint);
      }
    })
  );

  if (staleEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', staleEndpoints);
  }

  return {
    sent: (subscriptions?.length ?? 0) - staleEndpoints.length,
    removed: staleEndpoints.length,
  };
}
