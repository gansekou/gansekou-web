
import type { Metadata, Viewport } from "next";
import { PWARegistrar } from "@/components/premium/PWARegistrar";
import { RouteProgress } from "@/components/ui/RouteProgress";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.gansekou.com";

const SITE_NAME = "Gansekou";

const DEFAULT_TITLE =
  "Gansekou | Plateforme éducative au Cameroun";

const DEFAULT_DESCRIPTION =
  "Gansekou est une plateforme éducative dédiée aux apprenants au Cameroun. Accédez à des cours, exercices, quiz et outils d'apprentissage pour progresser et réussir.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: DEFAULT_TITLE,
    template: "%s | Gansekou",
  },

  description: DEFAULT_DESCRIPTION,

  applicationName: SITE_NAME,

  generator: "Next.js",

  keywords: [
    "Gansekou",
    "éducation au Cameroun",
    "cours en ligne Cameroun",
    "exercices scolaires",
    "quiz éducatifs",
    "BEPC",
    "Probatoire",
    "Baccalauréat",
    "Terminale C",
    "mathématiques Cameroun",
  ],

  authors: [
    {
      name: "Gansekou",
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,

  publisher: SITE_NAME,

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],

    shortcut: "/favicon.ico",

    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    title: DEFAULT_TITLE,

    description: DEFAULT_DESCRIPTION,

    url: SITE_URL,

    siteName: SITE_NAME,

    locale: "fr_CM",

    type: "website",

    images: [
      {
        url: "/images/gansekou-logo.png",
        width: 512,
        height: 512,
        alt: "Logo de Gansekou",
      },
    ],
  },

  twitter: {
    card: "summary",

    title: DEFAULT_TITLE,

    description: DEFAULT_DESCRIPTION,

    images: ["/images/gansekou-logo.png"],
  },

  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#071d3a",

  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <RouteProgress />

        {children}

        <PWARegistrar />

        <ToastProvider />
      </body>
    </html>
  );
}
