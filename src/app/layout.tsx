import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { UserbackProvider } from "@/components/providers/UserbackProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#10b981",
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://platemyday.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PlateMyDay — Stop Wasting Food, Start Eating Better",
    template: "%s | PlateMyDay",
  },
  description:
    "Turn what's already in your kitchen into a week of delicious meals. PlateMyDay builds personalized meal plans from your pantry ingredients to reduce food waste and save money.",
  keywords: [
    "meal planning",
    "food waste reduction",
    "pantry meals",
    "ingredient-based cooking",
    "weekly meal plan",
    "recipe generator",
    "meal prep",
    "reduce food waste",
    "cook from pantry",
    "meal planner app",
  ],
  authors: [{ name: "Ravilution", url: "https://ravilution.ai" }],
  creator: "Ravilution",
  manifest: "/manifest.json",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "PlateMyDay",
    title: "PlateMyDay — Stop Wasting Food, Start Eating Better",
    description:
      "Turn what's already in your kitchen into a week of delicious meals. Build personalized meal plans from your pantry ingredients.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlateMyDay — Stop Wasting Food, Start Eating Better",
    description:
      "Turn what's already in your kitchen into a week of delicious meals. Build personalized meal plans from your pantry ingredients.",
    creator: "@ravilutionx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PlateMyDay",
  },
  icons: {
    icon: "/assets/icon.png",
    apple: "/assets/icon-180.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PlateMyDay",
  url: BASE_URL,
  description:
    "Turn what's already in your kitchen into a week of delicious meals. PlateMyDay builds personalized meal plans from your pantry ingredients to reduce food waste and save money.",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Ravilution",
    url: "https://ravilution.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PostHogProvider>
          <UserbackProvider>
            <AppShell>{children}</AppShell>
          </UserbackProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
