import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to PlateMyDay to save your recipes, meal plans, and preferences across devices.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
