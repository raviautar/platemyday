'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Recipe } from '@/types';
import { useRecipes } from '@/contexts/RecipeContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useToast } from '@/components/ui/Toast';
import { RecipeList } from '@/components/recipes/RecipeList';
import { RecipeDetailView } from '@/components/recipes/RecipeDetailView';
import { AIRecipeGenerator } from '@/components/recipes/AIRecipeGenerator';
import { Input } from '@/components/ui/Input';
import { RecipeFilters } from '@/types';
import { Plus, Search, SlidersHorizontal, Calendar, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';

const UNSEEN_RECIPES_KEY = 'platemyday-unseen-recipes';
const MEAL_PLAN_HINT_DISMISSED_KEY = 'platemyday-meal-plan-hint-dismissed';

function getUnseenRecipeIds(): Set<string> {
  try {
    const stored = localStorage.getItem(UNSEEN_RECIPES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveUnseenRecipeIds(ids: Set<string>) {
  localStorage.setItem(UNSEEN_RECIPES_KEY, JSON.stringify([...ids]));
}

export default function RecipesPage() {
  const { settings } = useSettings();
  const { userId, anonymousId } = useUserIdentity();
  const { recipes, updateRecipe, deleteRecipe, isGeneratingRecipe, generateRecipe } = useRecipes();
  const { track } = useAnalytics();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAI, setShowAI] = useState(() => searchParams.get('create') === 'quick-meal');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<RecipeFilters>({ tags: [], maxPrepTimeMinutes: null });
  const [unseenRecipeIds, setUnseenRecipeIds] = useState<Set<string>>(new Set());
  const [mealPlanHintDismissed, setMealPlanHintDismissed] = useState(true);
  const filterRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUnseenRecipeIds(getUnseenRecipeIds());
    setMealPlanHintDismissed(localStorage.getItem(MEAL_PLAN_HINT_DISMISSED_KEY) === 'true');
  }, []);

  // Consume the ?create=quick-meal param so the modal doesn't reopen on refresh
  useEffect(() => {
    if (searchParams.get('create') === 'quick-meal') {
      router.replace('/recipes', { scroll: false });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allTags = Array.from(new Set(recipes.flatMap(r => r.tags))).sort();

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Debounced search tracking
  useEffect(() => {
    if (searchQuery.length < 3) return;
    const timer = setTimeout(() => {
      track(EVENTS.RECIPE_SEARCH_USED, { query_length: searchQuery.length });
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter tracking
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    if (filters.tags.length > 0 || filters.maxPrepTimeMinutes != null) {
      if (JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current)) {
        track(EVENTS.RECIPE_FILTERED, {
          tag_count: filters.tags.length,
          max_prep_time: filters.maxPrepTimeMinutes,
        });
      }
    }
    prevFiltersRef.current = filters;
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [filterOpen]);

  const markRecipeSeen = useCallback((recipeId: string) => {
    setUnseenRecipeIds(prev => {
      if (!prev.has(recipeId)) return prev;
      const next = new Set(prev);
      next.delete(recipeId);
      saveUnseenRecipeIds(next);
      return next;
    });
  }, []);

  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe);
    markRecipeSeen(recipe.id);
    track(EVENTS.RECIPE_VIEWED, { recipe_title: recipe.title, is_ai_generated: recipe.isAIGenerated });
  }, [track, markRecipeSeen]);

  const handleRecipeUpdated = useCallback((recipeId: string, updates: Partial<Recipe>) => {
    updateRecipe(recipeId, updates);
  }, [updateRecipe]);

  const handleDelete = (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    track(EVENTS.RECIPE_DELETED, { recipe_title: recipe?.title, is_ai_generated: recipe?.isAIGenerated });
    deleteRecipe(id);
    // Clean up unseen tracking
    markRecipeSeen(id);
    showToast('Recipe deleted');
  };

  const handleGenerateAI = async (prompt: string, strictIngredients?: boolean) => {
    const startTime = Date.now();

    const savedRecipe = await generateRecipe(prompt, {
      strictIngredients: strictIngredients || false,
      systemPrompt: settings.recipeSystemPrompt,
      userId,
      anonymousId,
    });

    if (savedRecipe) {
      track(EVENTS.RECIPE_GENERATION_COMPLETED, {
        recipe_title: savedRecipe.title,
        generation_time_ms: Date.now() - startTime,
      });
      track(EVENTS.RECIPE_CREATED, { recipe_title: savedRecipe.title, source: 'ai_generator', is_ai_generated: true });
      if (recipes.length === 0) track(EVENTS.FIRST_RECIPE_CREATED);
      track(EVENTS.AI_RECIPE_SAVED, { recipe_title: savedRecipe.title });

      setUnseenRecipeIds(prev => {
        const next = new Set(prev);
        next.add(savedRecipe.id);
        saveUnseenRecipeIds(next);
        return next;
      });
    } else {
      track(EVENTS.RECIPE_GENERATION_FAILED, { error_message: 'Generation failed' });
    }
  };

  const handleRegenerateRecipe = useCallback(async (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${recipe.title}${recipe.description ? ': ' + recipe.description : ''}`,
          systemPrompt: settings.recipeSystemPrompt,
          userId,
          anonymousId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to regenerate recipe');
      }

      const recipeData = await res.json();

      updateRecipe(recipeId, {
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        servings: recipeData.servings,
        prepTimeMinutes: recipeData.prepTimeMinutes,
        cookTimeMinutes: recipeData.cookTimeMinutes,
        tags: recipeData.tags,
        estimatedNutrition: recipeData.estimatedNutrition,
      });

      showToast(`Recipe regenerated: "${recipeData.title}"`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      showToast(`Failed to regenerate: ${message}`, 'error');
      throw err; // Re-throw so RecipeDetailView can handle loading state
    }
  }, [recipes, settings.recipeSystemPrompt, userId, anonymousId, updateRecipe, showToast]);

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const activeFilterCount = (filters.tags.length > 0 ? 1 : 0) + (filters.maxPrepTimeMinutes != null ? 1 : 0);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setSearchOpen(prev => !prev); if (!searchOpen) setSearchQuery(''); }}
              className="p-2 rounded-lg border border-border bg-white text-foreground hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search recipes"
            >
              <Search className="w-5 h-5" strokeWidth={2} />
            </button>
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen(prev => !prev)}
                className={`p-2 rounded-lg border bg-white text-foreground hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary flex items-center gap-1 ${activeFilterCount > 0 ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`}
                aria-label="Filter recipes"
              >
                <SlidersHorizontal className="w-5 h-5" strokeWidth={2} />
                {activeFilterCount > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-white text-xs flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-white shadow-xl z-50 p-4 flex flex-col gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {allTags.length === 0 ? (
                        <p className="text-sm text-muted">No tags in recipes yet.</p>
                      ) : (
                        allTags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-2.5 py-1 rounded-full text-sm ${filters.tags.includes(tag) ? 'bg-primary text-white' : 'bg-surface text-foreground hover:bg-surface-dark'}`}
                          >
                            {tag}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Max prep time</p>
                    <select
                      value={filters.maxPrepTimeMinutes ?? ''}
                      onChange={e => setFilters(prev => ({ ...prev, maxPrepTimeMinutes: e.target.value === '' ? null : Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Any</option>
                      <option value="15">15 min or less</option>
                      <option value="30">30 min or less</option>
                      <option value="45">45 min or less</option>
                      <option value="60">60 min or less</option>
                      <option value="90">90 min or less</option>
                    </select>
                  </div>
                  {(filters.tags.length > 0 || filters.maxPrepTimeMinutes != null) && (
                    <button
                      type="button"
                      onClick={() => setFilters({ tags: [], maxPrepTimeMinutes: null })}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {searchOpen && (
          <div className="flex flex-col gap-1">
            <Input
              ref={searchInputRef}
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Meal plan cross-promotion banner */}
      {recipes.length >= 1 && !mealPlanHintDismissed && (
        <div className="mb-4 flex items-center gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Calendar className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Ready for a full meal plan?</p>
            <p className="text-xs text-muted mt-0.5">Turn your recipes into a weekly plan with a shopping list.</p>
          </div>
          <Link
            href="/meal-plan"
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors"
          >
            Try it
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setMealPlanHintDismissed(true);
              localStorage.setItem(MEAL_PLAN_HINT_DISMISSED_KEY, 'true');
            }}
            className="shrink-0 p-1 text-muted hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div>
        <RecipeList
          recipes={recipes}
          searchQuery={searchQuery}
          filters={filters}
          onSelectRecipe={handleSelectRecipe}
          onCreateRecipe={() => setShowAI(true)}
          isGenerating={isGeneratingRecipe}
          unseenRecipeIds={unseenRecipeIds}
        />
      </div>

      <button
        onClick={() => setShowAI(true)}
        className="fixed bottom-28 md:bottom-8 right-4 md:right-8 w-16 h-16 bg-gradient-to-br from-primary to-primary-dark hover:from-primary-dark hover:to-[#1F4D28] text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 z-[90] flex items-center justify-center"
        aria-label="Create Recipe"
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </button>

      <RecipeDetailView
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onDelete={handleDelete}
        onRecipeUpdated={handleRecipeUpdated}
        onRegenerate={handleRegenerateRecipe}
      />

      <AIRecipeGenerator
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        onGenerate={handleGenerateAI}
      />

    </div>
  );
}
