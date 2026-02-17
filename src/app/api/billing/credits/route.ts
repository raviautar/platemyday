import { auth } from '@clerk/nextjs/server';
import { getBillingInfo } from '@/lib/supabase/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(req.url);
  const anonymousId = searchParams.get('anonymousId') || '';

  if (!userId && !anonymousId) {
    return Response.json({ plan: 'free', unlimited: false, creditsUsed: 0, creditsLimit: 10, creditsRemaining: 10 });
  }

  const info = await getBillingInfo(userId, anonymousId);
  return Response.json(info);
}
