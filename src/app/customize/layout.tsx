import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Customize your PlateMyDay experience — set dietary preferences, pantry ingredients, unit system, and generation prompts.",
};

export default function CustomizeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
