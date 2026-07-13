import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStaffSession } from '@/lib/staff-auth';
import { broadcastPush } from '@/lib/web-push';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const staffSession = await getStaffSession();
  if (!staffSession) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { title, body, url } = await req.json();

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    const result = await broadcastPush(supabase, { title, body: body ?? '', url: url ?? '/' });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}
