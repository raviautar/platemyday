import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how PlateMyDay helps you reduce food waste by building personalized weekly meal plans from the ingredients already in your kitchen.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About PlateMyDay — Ingredient-Based Meal Planning",
    description:
      "Learn how PlateMyDay helps you reduce food waste by building personalized weekly meal plans from the ingredients already in your kitchen.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About PlateMyDay — Ingredient-Based Meal Planning",
    description:
      "Learn how PlateMyDay helps you reduce food waste by building personalized weekly meal plans from the ingredients already in your kitchen.",
    images: ["/opengraph-image"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
