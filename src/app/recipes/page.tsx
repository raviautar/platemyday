'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Recipe } from '@/types';
import { useRecipes } from '@/contexts/RecipeContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useToast } from '@/components/ui/Toast';
import { RecipeList } from '@/components/recipes/RecipeList';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { RecipeDetail } from '@/components/recipes/RecipeDetail';
import { AIRecipeGenerator } from '@/components/recipes/AIRecipeGenerator';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Input } from '@/components/ui/Input';
import { RecipeFilters } from '@/types';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';

export default function RecipesPage() {
  const { settings } = useSettings();
  const { userId, anonymousId } = useUserIdentity();
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { track } = useAnalytics();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<RecipeFilters>({ tags: [], maxPrepTimeMinutes: null });
  const filterRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe);
    track(EVENTS.RECIPE_VIEWED, { recipe_title: recipe.title, is_ai_generated: recipe.isAIGenerated });
  }, [track]);

  const handleSave = (data: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (editingRecipe) {
      updateRecipe(editingRecipe.id, data);
      showToast('Recipe updated!');
    } else {
      track(EVENTS.RECIPE_CREATED, { is_manual: true, title: data.title });
      if (recipes.length === 0) {
        track(EVENTS.FIRST_RECIPE_CREATED);
      }
      addRecipe(data);
      showToast('Recipe created!');
    }
    setEditingRecipe(null);
  };

  const handleEdit = (recipe: Recipe) => {
    setSelectedRecipe(null);
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteRecipe(id);
    showToast('Recipe deleted');
  };

  const handleGenerateAI = async (prompt: string) => {
    setIsGeneratingAI(true);
    const startTime = Date.now();

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt: settings.recipeSystemPrompt,
          userId,
          anonymousId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate recipe');
      }

      const recipeData = await res.json();
      track(EVENTS.RECIPE_GENERATION_COMPLETED, {
        recipe_title: recipeData.title,
        generation_time_ms: Date.now() - startTime,
      });

      const newRecipe = { ...recipeData, isAIGenerated: true };

      if (recipes.length === 0) {
        track(EVENTS.FIRST_RECIPE_CREATED);
      }
      addRecipe(newRecipe);
      showToast('Recipe generated and saved!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      track(EVENTS.RECIPE_GENERATION_FAILED, { error_message: message });
      showToast(`Failed to generate recipe: ${message}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

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

      <div data-tour="recipes-list">
        <RecipeList
          recipes={recipes}
          searchQuery={searchQuery}
          filters={filters}
          isGenerating={isGeneratingAI}
          onSelectRecipe={handleSelectRecipe}
          onCreateRecipe={() => setShowAI(true)}
        />
      </div>

      <button
        onClick={() => setShowAI(true)}
        data-tour="recipes-ai-fab"
        className="fixed bottom-28 md:bottom-8 right-4 md:right-8 w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 z-[90] flex items-center justify-center"
        aria-label="Create Recipe"
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </button>

      <RecipeForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingRecipe(null); }}
        onSave={handleSave}
        editingRecipe={editingRecipe}
      />

      <RecipeDetail
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AIRecipeGenerator
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        onGenerate={handleGenerateAI}
      />

      <OnboardingWizard isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}
