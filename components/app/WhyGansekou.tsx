"use client";

import {
  CheckCircle2,
  Brain,
  BookOpen,
  Trophy,
  Wifi,
} from "lucide-react";


const items = [
  {
    icon: BookOpen,
    title: "Programme camerounais",
    text: "Cours et exercices adaptés aux niveaux scolaires du Cameroun.",
  },
  {
    icon: Brain,
    title: "Intelligence artificielle",
    text: "Kouma IA accompagne les élèves dans leurs apprentissages.",
  },
  {
    icon: Trophy,
    title: "Progression intelligente",
    text: "Quiz, exercices et suivi pour améliorer les résultats.",
  },
  {
    icon: Wifi,
    title: "Accessible partout",
    text: "Une plateforme pensée pour fonctionner même avec une connexion limitée.",
  },
];


export function WhyGansekou(){


  return (

    <section className="
      bg-white
      px-5
      py-14
    ">


      <div className="
        mx-auto
        max-w-7xl
      ">


        <div className="
          mb-8
          max-w-2xl
        ">


          <p className="
            text-sm
            font-black
            uppercase
            tracking-[0.2em]
            text-[#b88a00]
          ">
            Pourquoi Gansekou ?
          </p>


          <h2 className="
            mt-3
            text-3xl
            font-black
            md:text-5xl
          ">
            Une nouvelle façon d'apprendre
          </h2>


          <p className="
            mt-4
            text-slate-600
          ">
            Une plateforme éducative complète pour aider les élèves à apprendre plus facilement.
          </p>


        </div>



        <div className="
          grid
          gap-5
          md:grid-cols-2
          lg:grid-cols-4
        ">


          {items.map((item)=>{


            const Icon=item.icon;


            return (

              <article
                key={item.title}
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-[#f8fafc]
                  p-6
                "
              >

                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#071d3a]
                  text-[#f6c445]
                ">
                  <Icon size={24}/>
                </div>


                <h3 className="
                  mt-5
                  font-black
                ">
                  {item.title}
                </h3>


                <p className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-600
                ">
                  {item.text}
                </p>


              </article>

            );


          })}


        </div>


      </div>


    </section>

  );

}
