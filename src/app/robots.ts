import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/dashboard", "/client", "/success", "/payment-failed"],
    },
    sitemap: "https://lab.djandykofficial.com/sitemap.xml",
  };
}
