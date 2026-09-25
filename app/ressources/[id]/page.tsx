
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PublicSeoContent = {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  content_format: string;
  subject_name: string | null;
  level_names: string[];
  specialty_name: string | null;
  thumbnail_url: string | null;
  is_premium: boolean;
  published_at: string | null;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.gansekou.com/api/v1";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://gansekou.com";

async function getPublicContent(
  id: string
): Promise<PublicSeoContent | null> {
  const response = await fetch(
    `${API_URL}/public/seo/contents/${encodeURIComponent(id)}`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Erreur API SEO : ${response.status}`);
  }

  return response.json();
}

function getContentTypeLabel(contentType: string): string {
  const labels: Record<string, string> = {
    COURS: "Cours",
    EXERCICE: "Exercice",
    SUJET: "Sujet",
    QUIZ: "Quiz",
  };

  return labels[contentType] || contentType;
}

function getContentFormatLabel(contentFormat: string): string {
  const labels: Record<string, string> = {
    TEXT: "Texte",
    PDF: "PDF",
    AUDIO: "Audio",
    VIDEO: "Vidéo",
    IMAGE: "Image",
    EXTERNAL: "Ressource externe",
  };

  return labels[contentFormat] || contentFormat;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildSeoTitle(content: PublicSeoContent): string {
  const subject = content.subject_name
    ? ` – ${content.subject_name}`
    : "";

  const levels =
    content.level_names.length > 0
      ? ` – ${content.level_names.slice(0, 2).join(", ")}`
      : "";

  const title = `${cleanText(content.title)}${subject}${levels}`;

  return title.length > 60
    ? `${cleanText(content.title)} | Gansekou`
    : `${title} | Gansekou`;
}

function buildSeoDescription(content: PublicSeoContent): string {
  if (content.description) {
    return cleanText(content.description).slice(0, 160);
  }

  const typeLabel = getContentTypeLabel(content.content_type);

  const subject = content.subject_name
    ? ` de ${content.subject_name}`
    : "";

  const levels =
    content.level_names.length > 0
      ? ` pour ${content.level_names.slice(0, 2).join(" et ")}`
      : "";

  return `${typeLabel}${subject}${levels} au Cameroun. Consultez cette ressource pédagogique sur Gansekou pour apprendre, réviser et progresser.`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getPublicContent(id);

  if (!content) {
    return {
      title: "Ressource introuvable | Gansekou",
      description:
        "Cette ressource pédagogique n'est pas disponible sur Gansekou.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = buildSeoTitle(content);
  const description = buildSeoDescription(content);
  const canonicalUrl = `${SITE_URL}/ressources/${content.id}`;

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: "Gansekou",
      locale: "fr_CM",

      ...(content.published_at
        ? {
            publishedTime: content.published_at,
          }
        : {}),

      ...(content.thumbnail_url
        ? {
            images: [
              {
                url: content.thumbnail_url,
                alt: content.title,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: content.thumbnail_url
        ? "summary_large_image"
        : "summary",
      title,
      description,

      ...(content.thumbnail_url
        ? {
            images: [content.thumbnail_url],
          }
        : {}),
    },

    robots: {
      index: !content.is_premium,
      follow: true,
      googleBot: {
        index: !content.is_premium,
        follow: true,
      },
    },
  };
}

export default async function PublicResourcePage({
  params,
}: PageProps) {
  const { id } = await params;
  const content = await getPublicContent(id);

  if (!content) {
    notFound();
  }

  const contentTypeLabel = getContentTypeLabel(
    content.content_type
  );

  const contentFormatLabel = getContentFormatLabel(
    content.content_format
  );

  const seoTitle = buildSeoTitle(content);
  const seoDescription = buildSeoDescription(content);
  const canonicalUrl = `${SITE_URL}/ressources/${content.id}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",

    "@id": canonicalUrl,

    name: content.title,
    description: seoDescription,
    url: canonicalUrl,
    inLanguage: "fr",

    learningResourceType: contentTypeLabel,

    isAccessibleForFree: !content.is_premium,

    provider: {
      "@type": "Organization",
      name: "Gansekou",
      url: SITE_URL,
    },

    ...(content.subject_name
      ? {
          about: {
            "@type": "Thing",
            name: content.subject_name,
          },
        }
      : {}),

    ...(content.level_names.length > 0
      ? {
          educationalLevel: content.level_names,
        }
      : {}),

    ...(content.thumbnail_url
      ? {
          image: content.thumbnail_url,
        }
      : {}),

    ...(content.published_at
      ? {
          datePublished: content.published_at,
        }
      : {}),
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ressources",
        item: `${SITE_URL}/ressources`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: content.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <nav
          aria-label="Fil d'Ariane"
          className="mb-8 text-sm text-slate-500"
        >
          <Link
            href="/"
            className="transition hover:text-blue-600"
          >
            Accueil
          </Link>

          <span className="mx-2">/</span>

          <Link
            href="/ressources"
            className="transition hover:text-blue-600"
          >
            Ressources
          </Link>

          <span className="mx-2">/</span>

          <span className="text-slate-700">
            {contentTypeLabel}
          </span>
        </nav>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {content.thumbnail_url && (
            <div className="overflow-hidden border-b border-slate-200">
              <img
                src={content.thumbnail_url}
                alt={content.title}
                className="h-auto max-h-80 w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {contentTypeLabel}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {contentFormatLabel}
              </span>

              {content.is_premium && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Premium
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {content.title}
            </h1>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              {content.subject_name && (
                <span>
                  <strong>Matière :</strong>{" "}
                  {content.subject_name}
                </span>
              )}

              {content.specialty_name && (
                <span>
                  <strong>Spécialité :</strong>{" "}
                  {content.specialty_name}
                </span>
              )}
            </div>

            {content.level_names.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Niveaux concernés
                </p>

                <div className="flex flex-wrap gap-2">
                  {content.level_names.map((level) => (
                    <span
                      key={level}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {content.description && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">
                  Présentation de la ressource
                </h2>

                <p className="whitespace-pre-line text-base leading-7 text-slate-600">
                  {content.description}
                </p>
              </div>
            )}

            <div className="mt-8 rounded-xl bg-blue-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Consultez cette ressource sur Gansekou
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Accédez à la plateforme éducative Gansekou
                pour poursuivre votre apprentissage et
                découvrir les ressources disponibles.
              </p>

              <Link
                href="/login"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Accéder à Gansekou
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
