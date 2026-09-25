import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://gansekou.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/profil/",
          "/parametres/",
          "/teacher/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
