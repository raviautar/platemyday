// PostHog event constants — organized by the 5 high-level metrics
// Single source of truth for all event names across client and server

export const EVENTS = {
  // ── Metric 1: AI Generation Success Rate ──────────────────────────
  MEAL_PLAN_GENERATION_STARTED: 'meal_plan_generation_started',
  MEAL_PLAN_GENERATION_COMPLETED: 'meal_plan_generation_completed',
  MEAL_PLAN_GENERATION_FAILED: 'meal_plan_generation_failed',
  RECIPE_GENERATION_STARTED: 'recipe_generation_started',
  RECIPE_GENERATION_COMPLETED: 'recipe_generation_completed',
  RECIPE_GENERATION_FAILED: 'recipe_generation_failed',
  MEAL_REGENERATION_COMPLETED: 'meal_regeneration_completed',
  AI_RECIPE_SAVED: 'ai_recipe_saved',
  AI_RECIPE_DISCARDED: 'ai_recipe_discarded',
  SUGGESTED_RECIPE_SAVED: 'suggested_recipe_saved',

  // ── Metric 2: User Activation Rate ────────────────────────────────
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
  FIRST_MEAL_PLAN_GENERATED: 'first_meal_plan_generated',
  FIRST_RECIPE_CREATED: 'first_recipe_created',
  TOUR_STARTED: 'tour_started',
  TOUR_COMPLETED: 'tour_completed',
  TOUR_SKIPPED: 'tour_skipped',
  TOUR_STEP_VIEWED: 'tour_step_viewed',

  // ── Metric 3: Weekly Active Engagement ────────────────────────────
  // Pageviews handled automatically by PostHog
  RECIPE_CREATED: 'recipe_created',
  RECIPE_VIEWED: 'recipe_viewed',
  MEAL_PLAN_RESTORED: 'meal_plan_restored',

  // ── Metric 4: Feature Depth ───────────────────────────────────────
  SHOPPING_LIST_VIEWED: 'shopping_list_viewed',
  SHOPPING_LIST_CONSOLIDATED: 'shopping_list_consolidated',
  SHOPPING_LIST_AUTO_CONSOLIDATED: 'shopping_list_auto_consolidated',
  SHOPPING_LIST_COPIED: 'shopping_list_copied',
  NUTRITION_SUMMARY_VIEWED: 'nutrition_summary_viewed',
  MEAL_PLAN_HISTORY_VIEWED: 'meal_plan_history_viewed',
  MEAL_MOVED: 'meal_moved',
  MEAL_REPLACED_FROM_LIBRARY: 'meal_replaced_from_library',
  MEAL_REGENERATED: 'meal_regenerated',
  RECIPE_SEARCH_USED: 'recipe_search_used',
  RECIPE_FILTERED: 'recipe_filtered',

  // ── Metric 5: Conversion Funnel ───────────────────────────────────
  USER_SIGNED_UP: 'user_signed_up',
  PREFERENCES_COMPLETED: 'preferences_completed',
  ANONYMOUS_DATA_MIGRATED: 'anonymous_data_migrated',
  UPGRADE_PAGE_VIEWED: 'upgrade_page_viewed',
  UPGRADE_CTA_CLICKED: 'upgrade_cta_clicked',
  LANDING_CTA_CLICKED: 'landing_cta_clicked',
  PAYWALL_HIT: 'paywall_hit',
  CHECKOUT_STARTED: 'checkout_started',
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
} as const;
