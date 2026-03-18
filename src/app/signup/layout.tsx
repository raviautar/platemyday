import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a free PlateMyDay account to save your recipes, meal plans, and preferences across devices.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
