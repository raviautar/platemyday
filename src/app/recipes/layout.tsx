import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Browse and manage your recipe library. Generate new recipes from ingredients you have on hand, or add your own favorites.",
};

export default function RecipesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
