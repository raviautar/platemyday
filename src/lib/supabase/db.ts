import { createClient } from './client';
import { Recipe, WeekPlan, DayPlan, MealSlot, AppSettings, SuggestedRecipe } from '@/types';
import { DEFAULT_USER_PREFERENCES } from '@/lib/constants';

function getSupabase() {
  return createClient();
}

function ownerFilter(userId: string | null, anonymousId: string) {
  return userId ? { user_id: userId } : { anonymous_id: anonymousId };
}

// ─── Recipes ───────────────────────────────────────────────────

export async function getRecipes(userId: string | null, anonymousId: string): Promise<Recipe[]> {
  const { data, error } = await getSupabase()
    .from('recipes')
    .select('*')
    .or(`${userId ? `user_id.eq.${userId}` : `anonymous_id.eq.${anonymousId}`}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbRecipe);
}

export async function insertRecipe(
  recipe: Omit<Recipe, 'id' | 'createdAt'>,
  userId: string | null,
  anonymousId: string
): Promise<Recipe> {
  const { data, error } = await getSupabase()
    .from('recipes')
    .insert({
      ...ownerFilter(userId, anonymousId),
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      servings: recipe.servings,
      prep_time_minutes: recipe.prepTimeMinutes,
      cook_time_minutes: recipe.cookTimeMinutes,
      tags: recipe.tags,
      is_ai_generated: recipe.isAIGenerated,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbRecipe(data);
}

export async function updateRecipeDb(id: string, updates: Partial<Recipe>): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.ingredients !== undefined) dbUpdates.ingredients = updates.ingredients;
  if (updates.instructions !== undefined) dbUpdates.instructions = updates.instructions;
  if (updates.servings !== undefined) dbUpdates.servings = updates.servings;
  if (updates.prepTimeMinutes !== undefined) dbUpdates.prep_time_minutes = updates.prepTimeMinutes;
  if (updates.cookTimeMinutes !== undefined) dbUpdates.cook_time_minutes = updates.cookTimeMinutes;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.isAIGenerated !== undefined) dbUpdates.is_ai_generated = updates.isAIGenerated;

  const { error } = await getSupabase().from('recipes').update(dbUpdates).eq('id', id);
  if (error) throw error;
}

export async function deleteRecipeDb(id: string): Promise<void> {
  const { error } = await getSupabase().from('recipes').delete().eq('id', id);
  if (error) throw error;
}

function mapDbRecipe(row: any): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    ingredients: row.ingredients || [],
    instructions: row.instructions || [],
    servings: row.servings,
    prepTimeMinutes: row.prep_time_minutes,
    cookTimeMinutes: row.cook_time_minutes,
    tags: row.tags || [],
    createdAt: row.created_at,
    isAIGenerated: row.is_ai_generated,
  };
}

// ─── Meal Plans ────────────────────────────────────────────────

export async function getMealPlans(userId: string | null, anonymousId: string): Promise<WeekPlan[]> {
  const filter = userId ? `user_id.eq.${userId}` : `anonymous_id.eq.${anonymousId}`;
  const { data: plans, error } = await getSupabase()
    .from('meal_plans')
    .select(`
      *,
      meal_plan_days (
        *,
        meal_plan_meals (*)
      ),
      suggested_recipes (*)
    `)
    .or(filter)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (plans || []).map(mapDbMealPlan);
}

export async function getActiveMealPlan(userId: string | null, anonymousId: string): Promise<WeekPlan | null> {
  const filter = userId ? `user_id.eq.${userId}` : `anonymous_id.eq.${anonymousId}`;
  const { data: plans, error } = await getSupabase()
    .from('meal_plans')
    .select(`
      *,
      meal_plan_days (
        *,
        meal_plan_meals (*)
      ),
      suggested_recipes (*)
    `)
    .or(filter)
    .eq('is_active', true)
    .limit(1);

  if (error) throw error;
  if (!plans || plans.length === 0) return null;
  return mapDbMealPlan(plans[0]);
}

export async function getMealPlanById(id: string, userId: string | null, anonymousId: string): Promise<WeekPlan | null> {
  const filter = userId ? `user_id.eq.${userId}` : `anonymous_id.eq.${anonymousId}`;
  const { data: plans, error } = await getSupabase()
    .from('meal_plans')
    .select(`
      *,
      meal_plan_days (
        *,
        meal_plan_meals (*)
      ),
      suggested_recipes (*)
    `)
    .or(filter)
    .eq('id', id)
    .limit(1);

  if (error) throw error;
  if (!plans || plans.length === 0) return null;
  return mapDbMealPlan(plans[0]);
}

export async function saveMealPlan(
  weekPlan: WeekPlan,
  userId: string | null,
  anonymousId: string,
  suggestedRecipes?: Record<string, SuggestedRecipe>
): Promise<WeekPlan> {
  // Deactivate all existing active plans for this user
  const owner = ownerFilter(userId, anonymousId);
  await getSupabase()
    .from('meal_plans')
    .update({ is_active: false })
    .match(owner)
    .eq('is_active', true);

  // Insert the new meal plan
  const { data: plan, error: planError } = await getSupabase()
    .from('meal_plans')
    .insert({
      ...owner,
      week_start_date: weekPlan.weekStartDate,
      is_active: true,
    })
    .select()
    .single();

  if (planError) throw planError;

  // Insert days
  const daysToInsert = weekPlan.days.map((day, index) => ({
    meal_plan_id: plan.id,
    day_of_week: day.dayOfWeek,
    date: day.date,
    day_index: index,
  }));

  const { data: days, error: daysError } = await getSupabase()
    .from('meal_plan_days')
    .insert(daysToInsert)
    .select();

  if (daysError) throw daysError;

  // Sort days by index to match original order
  const sortedDays = [...days].sort((a, b) => a.day_index - b.day_index);

  // Insert meals
  const mealsToInsert = weekPlan.days.flatMap((day, dayIdx) =>
    day.meals.map((meal, mealIdx) => ({
      day_id: sortedDays[dayIdx].id,
      recipe_id: meal.recipeId || null,
      meal_type: meal.mealType,
      recipe_title_fallback: meal.recipeTitleFallback || null,
      meal_index: mealIdx,
    }))
  );

  if (mealsToInsert.length > 0) {
    const { error: mealsError } = await getSupabase()
      .from('meal_plan_meals')
      .insert(mealsToInsert);
    if (mealsError) throw mealsError;
  }

  // Insert suggested recipes if any
  if (suggestedRecipes && Object.keys(suggestedRecipes).length > 0) {
    const suggestedToInsert = Object.values(suggestedRecipes).map(sr => ({
      meal_plan_id: plan.id,
      title: sr.title,
      description: sr.description || '',
      ingredients: sr.ingredients,
      instructions: sr.instructions,
      servings: sr.servings || 4,
      prep_time_minutes: sr.prepTimeMinutes || 0,
      cook_time_minutes: sr.cookTimeMinutes || 0,
      tags: sr.tags,
    }));

    const { error: sugError } = await getSupabase()
      .from('suggested_recipes')
      .insert(suggestedToInsert);
    if (sugError) throw sugError;
  }

  // Return the full plan
  return { ...weekPlan, id: plan.id, createdAt: plan.created_at };
}

export async function restoreMealPlanDb(
  planId: string,
  userId: string | null,
  anonymousId: string
): Promise<void> {
  const owner = ownerFilter(userId, anonymousId);
  // Deactivate all
  await getSupabase()
    .from('meal_plans')
    .update({ is_active: false })
    .match(owner)
    .eq('is_active', true);

  // Activate the selected one
  await getSupabase()
    .from('meal_plans')
    .update({ is_active: true })
    .eq('id', planId);
}

export async function deleteMealPlanDb(planId: string): Promise<void> {
  const { error } = await getSupabase().from('meal_plans').delete().eq('id', planId);
  if (error) throw error;
}

function mapDbMealPlan(row: any): WeekPlan {
  const sortedDays = [...(row.meal_plan_days || [])].sort(
    (a: any, b: any) => a.day_index - b.day_index
  );

  const suggestedRecipes: Record<string, SuggestedRecipe> = {};
  (row.suggested_recipes || []).forEach((sr: any) => {
    suggestedRecipes[sr.title] = {
      title: sr.title,
      description: sr.description,
      ingredients: sr.ingredients || [],
      instructions: sr.instructions || [],
      servings: sr.servings,
      prepTimeMinutes: sr.prep_time_minutes,
      cookTimeMinutes: sr.cook_time_minutes,
      tags: sr.tags || [],
    };
  });

  const days: DayPlan[] = sortedDays.map((day: any) => {
    const sortedMeals = [...(day.meal_plan_meals || [])].sort(
      (a: any, b: any) => a.meal_index - b.meal_index
    );

    return {
      date: day.date,
      dayOfWeek: day.day_of_week,
      meals: sortedMeals.map((meal: any): MealSlot => ({
        id: meal.id,
        recipeId: meal.recipe_id || '',
        mealType: meal.meal_type,
        recipeTitleFallback: meal.recipe_title_fallback || undefined,
      })),
    };
  });

  return {
    id: row.id,
    weekStartDate: row.week_start_date,
    days,
    createdAt: row.created_at,
    suggestedRecipes: Object.keys(suggestedRecipes).length > 0 ? suggestedRecipes : undefined,
  };
}

// ─── Settings ──────────────────────────────────────────────────

export async function getSettings(userId: string | null, anonymousId: string): Promise<AppSettings | null> {
  const filter = userId ? `user_id.eq.${userId}` : `anonymous_id.eq.${anonymousId}`;
  const { data, error } = await getSupabase()
    .from('user_settings')
    .select('*')
    .or(filter)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    recipeSystemPrompt: data.recipe_system_prompt || '',
    mealPlanSystemPrompt: data.meal_plan_system_prompt || '',
    unitSystem: data.unit_system as 'metric' | 'imperial',
    weekStartDay: data.week_start_day as AppSettings['weekStartDay'],
    preferences: data.preferences || DEFAULT_USER_PREFERENCES,
  };
}

export async function upsertSettings(
  settings: AppSettings,
  userId: string | null,
  anonymousId: string
): Promise<void> {
  const filter = userId ? { user_id: userId } : { anonymous_id: anonymousId };

  const { data: existing, error: selectError } = await getSupabase()
    .from('user_settings')
    .select('id')
    .match(filter)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    const { error } = await getSupabase()
      .from('user_settings')
      .update({
        recipe_system_prompt: settings.recipeSystemPrompt,
        meal_plan_system_prompt: settings.mealPlanSystemPrompt,
        unit_system: settings.unitSystem,
        week_start_day: settings.weekStartDay,
        preferences: settings.preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) throw error;
  } else {
    const { error } = await getSupabase()
      .from('user_settings')
      .insert({
        ...filter,
        recipe_system_prompt: settings.recipeSystemPrompt,
        meal_plan_system_prompt: settings.mealPlanSystemPrompt,
        unit_system: settings.unitSystem,
        week_start_day: settings.weekStartDay,
        preferences: settings.preferences,
      });

    if (error) throw error;
  }
}

// ─── Anonymous → Authenticated Migration ───────────────────────

export async function migrateAnonymousData(anonymousId: string, userId: string): Promise<void> {
  const sb = getSupabase();

  // Migrate recipes
  await sb
    .from('recipes')
    .update({ user_id: userId, anonymous_id: null })
    .eq('anonymous_id', anonymousId);

  // Migrate meal plans
  await sb
    .from('meal_plans')
    .update({ user_id: userId, anonymous_id: null })
    .eq('anonymous_id', anonymousId);

  // Migrate settings (delete anonymous, keep authenticated if exists)
  const { data: existingSettings } = await sb
    .from('user_settings')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingSettings) {
    // User already has settings, just delete anonymous ones
    await sb
      .from('user_settings')
      .delete()
      .eq('anonymous_id', anonymousId);
  } else {
    // Transfer anonymous settings
    await sb
      .from('user_settings')
      .update({ user_id: userId, anonymous_id: null })
      .eq('anonymous_id', anonymousId);
  }

  // Migrate credits: merge anonymous credits into authenticated user's credits
  const { data: anonCredits } = await sb
    .from('user_credits')
    .select('credits_used, credits_limit')
    .eq('anonymous_id', anonymousId)
    .maybeSingle();

  if (anonCredits) {
    const { data: userCredits } = await sb
      .from('user_credits')
      .select('credits_used, credits_limit')
      .eq('user_id', userId)
      .maybeSingle();

    if (userCredits) {
      // Merge: sum credits_used, keep the higher limit
      await sb
        .from('user_credits')
        .update({
          credits_used: userCredits.credits_used + anonCredits.credits_used,
          credits_limit: Math.max(userCredits.credits_limit, anonCredits.credits_limit),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      // Remove the anonymous row
      await sb.from('user_credits').delete().eq('anonymous_id', anonymousId);
    } else {
      // Transfer anonymous credits to user
      await sb
        .from('user_credits')
        .update({ user_id: userId, anonymous_id: null, updated_at: new Date().toISOString() })
        .eq('anonymous_id', anonymousId);
    }
  }
}
