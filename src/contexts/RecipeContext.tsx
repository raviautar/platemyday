'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { Recipe } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/lib/constants';

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => Recipe;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  getRecipe: (id: string) => Recipe | undefined;
}

const RecipeContext = createContext<RecipeContextType | null>(null);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>(STORAGE_KEYS.RECIPES, []);

  const addRecipe = useCallback((recipe: Omit<Recipe, 'id' | 'createdAt'>): Recipe => {
    const newRecipe: Recipe = {
      ...recipe,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setRecipes(prev => [...prev, newRecipe]);
    return newRecipe;
  }, [setRecipes]);

  const updateRecipe = useCallback((id: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [setRecipes]);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  }, [setRecipes]);

  const getRecipe = useCallback((id: string) => {
    return recipes.find(r => r.id === id);
  }, [recipes]);

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipes must be used within RecipeProvider');
  return context;
}
