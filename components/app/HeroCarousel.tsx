"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";


const banners = [
  process.env.NEXT_PUBLIC_BANNER_1,
  process.env.NEXT_PUBLIC_BANNER_2,
  process.env.NEXT_PUBLIC_BANNER_3,
].filter(Boolean);



export function HeroCarousel({
  isAuthenticated,
}:{
  isAuthenticated:boolean;
}){


  const [active,setActive] = useState(0);



  useEffect(()=>{

    if(banners.length < 2) return;


    const timer=setInterval(()=>{

      setActive(
        value =>
        (value + 1) % banners.length
      );

    },5000);


    return ()=>clearInterval(timer);


  },[]);



  return (

    <section className="
      relative
      overflow-hidden
      bg-[#071d3a]
    ">


      <div className="
        relative
        mx-auto
        max-w-7xl
        px-5
        py-12
        md:py-20
      ">


        <div className="
          relative
          overflow-hidden
          rounded-[2rem]
          shadow-2xl
        ">


          {banners.length > 0 && (

            <img
              src={banners[active]}
              alt="Gansekou"
              className="
                h-[280px]
                w-full
                object-cover
                md:h-[480px]
              "
            />

          )}


          <div className="
            absolute
            inset-0
            flex
            items-center
            bg-gradient-to-r
            from-[#071d3a]/90
            via-[#071d3a]/40
            to-transparent
          ">


            <div className="
              max-w-xl
              px-6
              md:px-12
            ">


              <h1 className="
                text-3xl
                font-black
                text-white
                md:text-6xl
              ">
                Apprendre.
                <br/>
                Progresser.
                <br/>
                Réussir.
              </h1>


              <p className="
                mt-5
                text-white/80
                md:text-lg
              ">
                Cours, exercices, quiz et intelligence artificielle adaptés au programme camerounais.
              </p>


              <Link
                href={
                  isAuthenticated
                  ? "/dashboard"
                  : "/register"
                }
                className="
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#f6c445]
                  px-6
                  py-3
                  font-black
                  text-[#071d3a]
                "
              >

                Commencer maintenant

                <ArrowRight size={18}/>

              </Link>


            </div>


          </div>


        </div>



        <div className="
          mt-5
          flex
          justify-center
          gap-2
        ">

          {banners.map((_,index)=>(

            <button
              key={index}
              onClick={()=>setActive(index)}
              className={`
                h-2
                rounded-full
                transition-all
                ${
                  active===index
                  ?
                  "w-8 bg-[#f6c445]"
                  :
                  "w-2 bg-white/40"
                }
              `}
            />

          ))}

        </div>



      </div>


    </section>

  );

}
