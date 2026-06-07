import type { Metadata } from "next";
import { HomePage } from "@/components/app/HomePage";

export const metadata: Metadata = {
  title: "Gansekou — Apprendre, progresser, réussir",
  description:
    "Plateforme éducative pour cours, exercices, quiz, sujets et assistance IA destinée aux élèves camerounais.",
  openGraph: {
    title: "Gansekou — Apprendre, progresser, réussir",
    description:
      "Plateforme éducative pour cours, exercices, quiz, sujets et assistance IA destinée aux élèves camerounais.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Gansekou — Apprendre, progresser, réussir",
    description:
      "Plateforme éducative pour cours, exercices, quiz, sujets et assistance IA destinée aux élèves camerounais.",
  },
};

export default function Home() {
  return <HomePage />;
}
