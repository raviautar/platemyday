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

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => Promise<Recipe>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  getRecipe: (id: string) => Recipe | undefined;
  loading: boolean;
}

const RecipeContext = createContext<RecipeContextType | null>(null);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const { userId, anonymousId, isLoaded } = useUserIdentity();
  const supabase = useSupabase();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !anonymousId) return;

    let cancelled = false;
    setLoading(true);

    fetchRecipes(supabase, userId, anonymousId)
      .then((data) => {
        if (!cancelled) setRecipes(data);
      })
      .catch((err) => console.error('Failed to load recipes:', err))
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
    updateRecipeDb(supabase, id, updates).catch(err => console.error('Failed to update recipe:', err));
  }, [supabase]);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    deleteRecipeDb(supabase, id).catch(err => console.error('Failed to delete recipe:', err));
  }, [supabase]);

  const getRecipe = useCallback((id: string) => {
    return recipes.find(r => r.id === id);
  }, [recipes]);

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe, loading }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipes must be used within RecipeProvider');
  return context;
}
