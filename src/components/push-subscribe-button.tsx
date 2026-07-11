'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<'checking' | 'idle' | 'loading' | 'subscribed' | 'denied' | 'error'>('checking');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (!cancelled) setStatus('error');
        return;
      }

      if (Notification.permission === 'denied') {
        if (!cancelled) setStatus('denied');
        return;
      }

      // permissionが'granted'でなければ購読は存在しえないはずだが、
      // 端末によっては古い/迷子のPushSubscriptionがgetSubscription()で
      // 返ってくることがあるため、未許可時に「完了」と誤表示しないよう
      // permissionの実際の値を確認してから購読状態を見る
      if (Notification.permission !== 'granted') {
        if (!cancelled) setStatus('idle');
        return;
      }

      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setStatus(sub ? 'subscribed' : 'idle');
      } catch (err) {
        console.error('プッシュ購読状態の確認に失敗しました:', err);
        if (!cancelled) setStatus('idle');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus('denied');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const json = sub.toJSON();
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      setStatus('subscribed');
    } catch (err) {
      console.error('プッシュ通知の購読に失敗しました:', err);
      setStatus('error');
    }
  };

  if (status === 'checking') {
    return null;
  }

  if (status === 'subscribed') {
    return <p className="text-sm text-green-700">通知を受け取る設定が完了しました ✓</p>;
  }

  if (status === 'denied') {
    return <p className="text-sm text-red-600">通知が許可されていません。ブラウザの設定から変更してください。</p>;
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm text-red-600">通知の設定に失敗しました。</p>
        <button onClick={subscribe} className="text-sm px-4 py-2 rounded-lg bg-green-600 text-white">
          もう一度試す
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={status === 'loading'}
      className="text-sm px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
    >
      {status === 'loading' ? '処理中...' : 'プッシュ通知を受け取る'}
    </button>
  );
}
