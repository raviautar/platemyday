'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Recipe } from '@/types';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useSupabase } from '@/hooks/useSupabase';
import {
  getRecipes as fetchRecipes,
  insertRecipe,
  updateRecipeDb,
  deleteRecipeDb,
} from '@/lib/supabase/db';
import { useToast } from '@/components/ui/Toast';

export interface GenerateRecipeOptions {
  strictIngredients?: boolean;
  systemPrompt?: string;
  userId?: string | null;
  anonymousId?: string | null;
}

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => Promise<Recipe>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  getRecipe: (id: string) => Recipe | undefined;
  loading: boolean;
  isGeneratingRecipe: boolean;
  generateRecipe: (prompt: string, options?: GenerateRecipeOptions) => Promise<Recipe | null>;
}

const RecipeContext = createContext<RecipeContextType | null>(null);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const { userId, anonymousId, isLoaded } = useUserIdentity();
  const supabase = useSupabase();
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);

  useEffect(() => {
    if (!isLoaded || !anonymousId) return;

    let cancelled = false;
    setLoading(true);

    fetchRecipes(supabase, userId, anonymousId)
      .then((data) => {
        if (!cancelled) setRecipes(data);
      })
      .catch((err) => {
        console.error('Failed to load recipes:', err);
        showToast('Failed to load recipes', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId, anonymousId, isLoaded, supabase]);

  const addRecipe = useCallback(async (recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> => {
    const newRecipe = await insertRecipe(supabase, recipe, userId, anonymousId);
    setRecipes(prev => [newRecipe, ...prev]);
    return newRecipe;
  }, [userId, anonymousId, supabase]);

  const updateRecipe = useCallback((id: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    updateRecipeDb(supabase, id, updates).catch(err => {
      console.error('Failed to update recipe:', err);
      showToast('Failed to save recipe changes', 'error');
    });
  }, [supabase, showToast]);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    deleteRecipeDb(supabase, id).catch(err => {
      console.error('Failed to delete recipe:', err);
      showToast('Failed to delete recipe', 'error');
    });
  }, [supabase, showToast]);

  const getRecipe = useCallback((id: string) => {
    return recipes.find(r => r.id === id);
  }, [recipes]);

  const generateRecipe = useCallback(async (prompt: string, options: GenerateRecipeOptions = {}): Promise<Recipe | null> => {
    const { strictIngredients = false, systemPrompt, userId: optUserId, anonymousId: optAnonymousId } = options;
    setIsGeneratingRecipe(true);
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          strictIngredients,
          systemPrompt,
          userId: optUserId ?? userId,
          anonymousId: optAnonymousId ?? anonymousId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate recipe');
      }

      const recipeData = await res.json();
      const savedRecipe = await insertRecipe(supabase, { ...recipeData, isAIGenerated: true }, optUserId ?? userId, optAnonymousId ?? anonymousId);
      setRecipes(prev => [savedRecipe, ...prev]);
      showToast(`"${savedRecipe.title}" saved to library!`);
      return savedRecipe;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      showToast(`Failed to generate recipe: ${message}`, 'error');
      return null;
    } finally {
      setIsGeneratingRecipe(false);
    }
  }, [userId, anonymousId, supabase, showToast]);

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe, loading, isGeneratingRecipe, generateRecipe }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipes must be used within RecipeProvider');
  return context;
}
