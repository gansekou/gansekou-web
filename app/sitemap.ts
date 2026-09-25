import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.gansekou.com";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.gansekou.com/api/v1";

type SitemapContent = {
  id: string;
  updated_at?: string | null;
  published_at?: string | null;
  is_premium?: boolean;
};

async function getPublicContents(): Promise<SitemapContent[]> {
  try {
    const response = await fetch(
      `${API_URL}/public/seo/contents`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return Array.isArray(data)
      ? data
      : data.items || data.contents || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contents = await getPublicContents();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/register`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const resourcePages: MetadataRoute.Sitemap = contents
    .filter((content) => !content.is_premium)
    .map((content) => ({
      url: `${SITE_URL}/ressources/${content.id}`,
      lastModified:
        content.updated_at || content.published_at
          ? new Date(
              content.updated_at ||
                content.published_at ||
                new Date().toISOString()
            )
          : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [...staticPages, ...resourcePages];
}
