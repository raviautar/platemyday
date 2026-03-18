import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Unlock unlimited personalized meal planning with PlateMyDay Pro. Get a full week of recipes from your pantry ingredients — no food waste, no stress.",
  alternates: {
    canonical: "https://platemyday.com/upgrade",
  },
  openGraph: {
    title: "PlateMyDay Pricing — Unlimited Meal Planning",
    description:
      "Unlock unlimited personalized meal planning with PlateMyDay Pro. Get a full week of recipes from your pantry ingredients — no food waste, no stress.",
    url: "https://platemyday.com/upgrade",
  },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
