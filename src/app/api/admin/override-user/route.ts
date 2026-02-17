import { createClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const adminKey = req.headers.get('x-admin-key');
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId, unlimited, extraCredits, note } = await req.json() as {
    userId: string;
    unlimited?: boolean;
    extraCredits?: number;
    note?: string;
  };

  if (!userId) {
    return Response.json({ error: 'userId is required' }, { status: 400 });
  }

  const sb = createClient();
  const { error } = await sb.from('user_billing_overrides').upsert(
    {
      user_id: userId,
      unlimited: unlimited ?? false,
      extra_credits: extraCredits ?? 0,
      note: note ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('Override error:', error);
    return Response.json({ error: 'Failed to set override' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
