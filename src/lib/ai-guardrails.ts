import { z } from 'zod';
import { DAYS_OF_WEEK, MEAL_TYPES, formatPreferencesPrompt } from '@/lib/constants';
import { getSettings } from '@/lib/supabase/db';

const optionalActorIdSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().max(128).optional()
);

const optionalSystemPromptSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().max(8000).optional()
);

const recipeRefSchema = z.object({
  id: z.string().trim().min(1).max(256),
  title: z.string().trim().min(1).max(300),
  tags: z
    .array(z.string().trim().max(120))
    .max(40)
    .default([])
    .transform((tags) => tags.filter(Boolean)),
});

const currentMealSchema = z.object({
  title: z.string().trim().min(1).max(300),
  mealType: z.enum(MEAL_TYPES),
});

export const generateRecipeRequestSchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
  systemPrompt: optionalSystemPromptSchema,
  userId: optionalActorIdSchema,
  anonymousId: optionalActorIdSchema,
});

export const generateMealPlanRequestSchema = z.object({
  recipes: z.array(recipeRefSchema).max(500).default([]),
  systemPrompt: optionalSystemPromptSchema,
  preferences: z.string().trim().max(4000).optional(),
  weekStartDay: z.enum(DAYS_OF_WEEK).optional().default('Monday'),
  userId: optionalActorIdSchema,
  anonymousId: optionalActorIdSchema,
});

export const regenerateMealRequestSchema = z.object({
  mealType: z.enum(MEAL_TYPES),
  dayOfWeek: z.enum(DAYS_OF_WEEK),
  currentMeals: z.array(currentMealSchema).max(12).optional().default([]),
  systemPrompt: optionalSystemPromptSchema,
  userId: optionalActorIdSchema,
  anonymousId: optionalActorIdSchema,
});

type RateLimitBucket = {
  timestamps: number[];
  lastSeenAt: number;
};

type RateLimitArgs = {
  request: Request;
  key: string;
  limit: number;
  windowMs: number;
  userId?: string;
  anonymousId?: string;
};

type RateLimitAllowed = {
  allowed: true;
  remaining: number;
  resetAt: number;
};

type RateLimitBlocked = {
  allowed: false;
  retryAfterSeconds: number;
  resetAt: number;
};

export type RateLimitResult = RateLimitAllowed | RateLimitBlocked;

const buckets = new Map<string, RateLimitBucket>();
const MAX_BUCKETS = 5000;
const STALE_BUCKET_MS = 60 * 60 * 1000;
let lastPruneAt = 0;

function getRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  return null;
}

function resolveActorKey(request: Request, userId?: string, anonymousId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  if (anonymousId) {
    return `anon:${anonymousId}`;
  }

  const ip = getRequestIp(request);
  return ip ? `ip:${ip}` : 'ip:unknown';
}

function pruneBuckets(now: number) {
  if (now - lastPruneAt < 60_000 && buckets.size <= MAX_BUCKETS) {
    return;
  }

  for (const [bucketKey, bucket] of buckets.entries()) {
    if (now - bucket.lastSeenAt > STALE_BUCKET_MS) {
      buckets.delete(bucketKey);
    }
  }

  if (buckets.size > MAX_BUCKETS) {
    const oldestBuckets = [...buckets.entries()]
      .sort((a, b) => a[1].lastSeenAt - b[1].lastSeenAt)
      .slice(0, buckets.size - MAX_BUCKETS);

    for (const [bucketKey] of oldestBuckets) {
      buckets.delete(bucketKey);
    }
  }

  lastPruneAt = now;
}

export function consumeRateLimit({
  request,
  key,
  limit,
  windowMs,
  userId,
  anonymousId,
}: RateLimitArgs): RateLimitResult {
  const now = Date.now();
  pruneBuckets(now);

  const actorKey = resolveActorKey(request, userId, anonymousId);
  const bucketKey = `${key}:${actorKey}`;
  const existing = buckets.get(bucketKey);
  const timestamps = (existing?.timestamps ?? []).filter((timestamp) => now - timestamp < windowMs);

  if (timestamps.length >= limit) {
    const retryAfterMs = windowMs - (now - timestamps[0]);
    const resetAt = now + retryAfterMs;

    buckets.set(bucketKey, { timestamps, lastSeenAt: now });

    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      resetAt,
    };
  }

  timestamps.push(now);
  buckets.set(bucketKey, { timestamps, lastSeenAt: now });

  return {
    allowed: true,
    remaining: Math.max(0, limit - timestamps.length),
    resetAt: now + windowMs,
  };
}

export function rateLimitResponse(action: string, retryAfterSeconds: number): Response {
  return Response.json(
    {
      error: `Too many ${action} requests. Please wait ${retryAfterSeconds}s and try again.`,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    }
  );
}

export function validationErrorResponse(error: z.ZodError): Response {
  const firstIssue = error.issues[0];
  const fieldPath = firstIssue?.path?.join('.');
  const detail = fieldPath ? `${fieldPath}: ${firstIssue.message}` : 'Request payload is invalid.';

  return Response.json({ error: detail }, { status: 400 });
}

export async function parseJsonBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export const consolidateShoppingListRequestSchema = z.object({
  mealPlanId: z.string().trim().min(1),
  userId: optionalActorIdSchema,
  anonymousId: optionalActorIdSchema,
});

/**
 * Combines JSON parsing, Zod validation, and rate limiting into a single call.
 * Returns either the validated data or an error Response to return early.
 */
export async function validateAndRateLimit<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  rateLimitConfig: { key: string; limit: number; windowMs: number }
): Promise<{ data: T } | Response> {
  const body = await parseJsonBody(req);
  if (body === null) {
    return Response.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const data = parsed.data as T & { userId?: string; anonymousId?: string };
  const rateLimit = consumeRateLimit({
    request: req,
    key: rateLimitConfig.key,
    limit: rateLimitConfig.limit,
    windowMs: rateLimitConfig.windowMs,
    userId: data.userId,
    anonymousId: data.anonymousId,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimitConfig.key.replace(/-/g, ' '), rateLimit.retryAfterSeconds);
  }

  return { data: parsed.data };
}

/**
 * Fetches user preferences and formats them as a prompt string.
 */
export async function getUserPreferencesPrompt(
  userId?: string,
  anonymousId?: string
): Promise<string> {
  if (!userId && !anonymousId) return '';
  const settings = await getSettings(userId ?? null, anonymousId ?? '');
  return settings ? formatPreferencesPrompt(settings.preferences) : '';
}
