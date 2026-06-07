import Image from "next/image";
import Link from "next/link";

type GansekouLogoProps = {
  variant?: "compact" | "full" | "icon" | "light" | "dark";
  size?: "small" | "medium" | "large" | "hero";
  href?: string | null;
  className?: string;
};

const sizeMap = {
  small: { box: "h-9 w-9", image: 30, text: "text-base", tagline: "text-[10px]" },
  medium: { box: "h-11 w-11", image: 36, text: "text-lg", tagline: "text-xs" },
  large: { box: "h-14 w-14", image: 46, text: "text-2xl", tagline: "text-sm" },
  hero: { box: "h-20 w-20", image: 66, text: "text-4xl", tagline: "text-base" },
} as const;

export function GansekouLogo({
  variant = "full",
  size = "medium",
  href,
  className = "",
}: GansekouLogoProps) {
  const sizes = sizeMap[size];
  const isIconOnly = variant === "icon";
  const isLight = variant === "light";
  const textColor = isLight ? "text-white" : "text-[#082f1f]";
  const taglineColor = isLight ? "text-white/65" : "text-slate-500";
  const logo = (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-[#082f1f]/10 ring-1 ring-[#f6c445]/30 ${sizes.box}`}
      >
        <Image
          src="/images/gansekou-logo.png"
          alt="Gansekou"
          width={sizes.image}
          height={sizes.image}
          className="h-auto w-auto object-contain"
          priority={size === "hero"}
        />
      </span>

      {!isIconOnly && (
        <span className={variant === "compact" ? "sr-only" : "leading-none"}>
          <span className={`block font-black tracking-tight ${textColor} ${sizes.text}`}>
            Gansekou
          </span>
          {variant === "full" || variant === "light" || variant === "dark" ? (
            <span className={`mt-1 block font-semibold ${taglineColor} ${sizes.tagline}`}>
              Apprendre, progresser, reussir
            </span>
          ) : null}
        </span>
      )}
    </div>
  );

  if (!href) return logo;

  return (
    <Link href={href} className="inline-flex">
      {logo}
    </Link>
  );
}
