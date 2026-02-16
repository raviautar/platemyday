import { PostHog } from 'posthog-node';

let serverPostHog: PostHog | null = null;

function getServerPostHog(): PostHog | null {
  if (serverPostHog) return serverPostHog;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!key) return null;

  serverPostHog = new PostHog(key, { host, flushAt: 1, flushInterval: 0 });
  return serverPostHog;
}

export async function trackServerEvent(
  eventName: string,
  userId: string | null,
  anonymousId: string,
  properties?: Record<string, unknown>
) {
  const ph = getServerPostHog();
  if (!ph) return;

  const distinctId = userId || anonymousId;
  if (!distinctId) return;

  ph.capture({
    distinctId,
    event: eventName,
    properties: {
      ...properties,
      is_authenticated: !!userId,
      source: 'server',
    },
  });

  await ph.flush();
}
