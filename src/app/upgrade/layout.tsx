import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Unlock unlimited personalized meal planning with PlateMyDay Pro. Get a full week of recipes from your pantry ingredients — no food waste, no stress.",
  alternates: {
    canonical: "/upgrade",
  },
  openGraph: {
    title: "PlateMyDay Pricing — Unlimited Meal Planning",
    description:
      "Unlock unlimited personalized meal planning with PlateMyDay Pro. Get a full week of recipes from your pantry ingredients — no food waste, no stress.",
    url: "/upgrade",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlateMyDay Pricing — Unlimited Meal Planning",
    description:
      "Unlock unlimited personalized meal planning with PlateMyDay Pro. Get a full week of recipes from your pantry ingredients — no food waste, no stress.",
    images: ["/opengraph-image"],
  },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
