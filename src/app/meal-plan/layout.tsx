import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meal Plan",
  description:
    "Plan your week with personalized meals built from your pantry ingredients. Drag and drop meals, regenerate dishes, and get consolidated shopping lists.",
};

export default function MealPlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
