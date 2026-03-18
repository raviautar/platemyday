import { MetadataRoute } from "next";

const BASE_URL = "https://platemyday.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/upgrade", "/privacy", "/terms"],
        disallow: ["/meal-plan", "/recipes", "/customize", "/login", "/signup", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
