import type { Metadata, Viewport } from "next";
import { PWARegistrar } from "@/components/premium/PWARegistrar";
import { RouteProgress } from "@/components/ui/RouteProgress";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Gansekou | Plateforme educative premium",
    template: "%s | Gansekou",
  },
  description: "Plateforme educative intelligente pour le Cameroun: cours, quiz, IA pedagogique, progression et premium.",
  applicationName: "Gansekou",
  appleWebApp: {
    capable: true,
    title: "Gansekou",
    statusBarStyle: "black-translucent",
  },
  // Browser tab favicon display size is controlled by the browser UI; these high-resolution sources maximize clarity.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    title: "Gansekou | Plateforme educative premium",
    description: "Cours, quiz, IA pedagogique, progression et premium pour les apprenants africains.",
    siteName: "Gansekou",
    locale: "fr_CM",
    type: "website",
    images: [
      {
        url: "/images/gansekou-logo.png",
        width: 512,
        height: 512,
        alt: "Gansekou",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Gansekou | Plateforme educative premium",
    description: "Cours, quiz, IA pedagogique, progression et premium pour les apprenants africains.",
    images: ["/images/gansekou-logo.png"],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#071d3a",
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
