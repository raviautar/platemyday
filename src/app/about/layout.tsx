import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how PlateMyDay helps you reduce food waste by building personalized weekly meal plans from the ingredients already in your kitchen.",
  alternates: {
    canonical: "https://platemyday.com/about",
  },
  openGraph: {
    title: "About PlateMyDay — Ingredient-Based Meal Planning",
    description:
      "Learn how PlateMyDay helps you reduce food waste by building personalized weekly meal plans from the ingredients already in your kitchen.",
    url: "https://platemyday.com/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
