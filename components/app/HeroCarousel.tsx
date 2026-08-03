"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  process.env.NEXT_PUBLIC_BANNER_1,
  process.env.NEXT_PUBLIC_BANNER_2,
  process.env.NEXT_PUBLIC_BANNER_3,
].filter(Boolean) as string[];

export function HeroCarousel({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((current) =>
        current === banners.length - 1 ? 0 : current + 1
      );
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  if (!banners.length) {
    return null;
  }

  const previous = () => {
    setIndex((current) =>
      current === 0 ? banners.length - 1 : current - 1
    );
  };

  const next = () => {
    setIndex((current) =>
      current === banners.length - 1 ? 0 : current + 1
    );
  };


  return (
    <section className="relative overflow-hidden bg-white">

      <div className="mx-auto max-w-7xl px-5 py-6">

        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            shadow-xl
            border
            border-slate-200
            h-[220px]
            sm:h-[300px]
            md:h-[380px]
            lg:h-[450px]
          "
        >
        
          <Image
            src={banners[index]}
            alt="Promotion Gansekou"
            fill
            priority
            sizes="100vw"
            className="
              object-cover
            "
          />


          {banners.length > 1 && (
            <>
              <button
                onClick={previous}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/80
                  shadow
                "
              >
                <ChevronLeft size={20}/>
              </button>


              <button
                onClick={next}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/80
                  shadow
                "
              >
                <ChevronRight size={20}/>
              </button>
            </>
          )}


          <div className="
            absolute
            bottom-4
            left-1/2
            flex
            -translate-x-1/2
            gap-2
          ">
            {banners.map((_, dot) => (
              <button
                key={dot}
                onClick={() => setIndex(dot)}
                className={`
                  h-2
                  rounded-full
                  transition-all
                  ${
                    dot === index
                    ? "w-8 bg-[#f6c445]"
                    : "w-2 bg-white/70"
                  }
                `}
              />
            ))}
          </div>


        </div>

      </div>

    </section>
  );
}
