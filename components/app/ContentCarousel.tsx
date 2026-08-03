"use client";

import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";


export function ContentCarousel({
  title,
  href,
  icon,
  items,
}:{
  title:string;
  href:string;
  icon:React.ReactNode;
  items:string[];
}){


  return (

    <section className="mb-12">


      <div className="
        mb-5
        flex
        items-center
        justify-between
      ">


        <div className="
          flex
          items-center
          gap-3
        ">

          <span className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-[#fff7df]
            text-[#b88a00]
          ">
            {icon}
          </span>


          <h2 className="
            text-2xl
            font-black
            md:text-3xl
          ">
            {title}
          </h2>

        </div>



        <Link
          href={href}
          className="
            hidden
            items-center
            gap-2
            text-sm
            font-black
            text-[#0f5f3a]
            sm:flex
          "
        >

          Voir tout

          <ArrowRight size={16}/>

        </Link>


      </div>



      <div className="
        flex
        snap-x
        gap-5
        overflow-x-auto
        pb-4
        scrollbar-hide
      ">


        {items.map((item,index)=>(


          <article
            key={item}
            className="
              min-w-[240px]
              snap-start
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-lg
              shadow-[#071d3a]/5
              transition
              hover:-translate-y-1
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
              font-black
              text-[#f6c445]
            ">
              {index+1}
            </div>


            <h3 className="
              mt-5
              text-lg
              font-black
            ">
              {item}
            </h3>


            <p className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            ">
              Découvre des contenus adaptés à ton niveau.
            </p>


            <Link
              href={href}
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                text-sm
                font-black
                text-[#0f5f3a]
              "
            >

              Explorer

              <ArrowRight size={15}/>

            </Link>


          </article>


        ))}


      </div>


    </section>

  );

}
