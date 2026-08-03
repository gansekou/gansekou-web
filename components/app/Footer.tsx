"use client";

import Link from "next/link";
import { GansekouLogo } from "@/components/ui/GansekouLogo";


export function Footer(){


  return (

    <footer className="
      border-t
      border-slate-200
      bg-white
      px-5
      py-10
    ">


      <div className="
        mx-auto
        flex
        max-w-7xl
        flex-col
        gap-6
        md:flex-row
        md:items-center
        md:justify-between
      ">


        <div>

          <GansekouLogo
            href="/"
            variant="full"
            size="medium"
          />

          <p className="
            mt-3
            text-sm
            font-bold
            text-slate-500
          ">
            Apprendre, progresser, réussir.
          </p>

        </div>



        <nav className="
          flex
          flex-wrap
          gap-5
          text-sm
          font-black
          text-slate-600
        ">


          <Link href="/">
            Accueil
          </Link>


          <Link href="/courses">
            Cours
          </Link>


          <Link href="/quizzes">
            Quiz
          </Link>


          <Link href="/premium">
            Premium
          </Link>


          <Link href="/login">
            Connexion
          </Link>


        </nav>


      </div>


    </footer>

  );

}
