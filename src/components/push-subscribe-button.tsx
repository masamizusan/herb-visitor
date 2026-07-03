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
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (!cancelled) {
          setStatus('error');
          setDebugInfo('serviceWorker/PushManager 非対応');
        }
        return;
      }

      if (Notification.permission === 'denied') {
        if (!cancelled) {
          setStatus('denied');
          setDebugInfo('permission=denied');
        }
        return;
      }

      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) {
          setStatus(sub ? 'subscribed' : 'idle');
          setDebugInfo(
            `[check] permission=${Notification.permission} scope=${reg.scope} endpoint=${sub ? '...' + sub.endpoint.slice(-16) : 'null'}`
          );
        }
      } catch (err) {
        console.error('プッシュ購読状態の確認に失敗しました:', err);
        if (!cancelled) {
          setStatus('idle');
          setDebugInfo(`[check] error: ${String(err)}`);
        }
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
      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      setDebugInfo(
        `[subscribe] endpoint=...${sub.endpoint.slice(-16)} postStatus=${res.status}`
      );
      setStatus('subscribed');
    } catch (err) {
      console.error('プッシュ通知の購読に失敗しました:', err);
      setDebugInfo(`[subscribe] error: ${String(err)}`);
      setStatus('error');
    }
  };

  const debugLine = debugInfo ? (
    <p className="text-[10px] text-gray-400 break-all max-w-xs text-center mt-1">{debugInfo}</p>
  ) : null;

  if (status === 'checking') {
    return null;
  }

  if (status === 'subscribed') {
    return (
      <div className="flex flex-col items-center">
        <p className="text-sm text-green-700">通知を受け取る設定が完了しました ✓</p>
        {debugLine}
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex flex-col items-center">
        <p className="text-sm text-red-600">通知が許可されていません。ブラウザの設定から変更してください。</p>
        {debugLine}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm text-red-600">通知の設定に失敗しました。</p>
        <button onClick={subscribe} className="text-sm px-4 py-2 rounded-lg bg-green-600 text-white">
          もう一度試す
        </button>
        {debugLine}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={subscribe}
        disabled={status === 'loading'}
        className="text-sm px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
      >
        {status === 'loading' ? '処理中...' : 'プッシュ通知を受け取る'}
      </button>
      {debugLine}
    </div>
  );
}
