
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
    throw new Error(
      `Erreur API SEO : ${response.status}`
    );
  }

  return response.json();
}

function getContentTypeLabel(
  contentType: string
): string {
  const labels: Record<string, string> = {
    COURS: "Cours",
    EXERCICE: "Exercice",
    SUJET: "Sujet",
    QUIZ: "Quiz",
  };

  return labels[contentType] || contentType;
}

function getContentFormatLabel(
  contentFormat: string
): string {
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getPublicContent(id);

  if (!content) {
    return {
      title: "Ressource introuvable | Gansekou",
      description:
        "Cette ressource pédagogique n'est pas disponible.",
    };
  }

  const title = `${content.title} | Gansekou`;

  const description =
    content.description ||
    `Découvrez cette ressource pédagogique de ${content.subject_name || "Gansekou"}.`;

  return {
    title,
    description,

    alternates: {
      canonical: `/ressources/${content.id}`,
    },

    openGraph: {
      title,
      description,
      type: "article",
      url: `/ressources/${content.id}`,
      siteName: "Gansekou",
      locale: "fr_CM",
      images: content.thumbnail_url
        ? [
            {
              url: content.thumbnail_url,
              alt: content.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: content.thumbnail_url
        ? "summary_large_image"
        : "summary",
      title,
      description,
      images: content.thumbnail_url
        ? [content.thumbnail_url]
        : undefined,
    },

    robots: {
      index: !content.is_premium,
      follow: true,
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

  return (
    <main className="min-h-screen bg-slate-50">
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
                href="/connexion"
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
