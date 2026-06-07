import { designTokens } from "@/styles/design-tokens";

export const theme = designTokens;

export const surfaceClass =
  "rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(7,29,58,0.08)]";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-black transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c445]";

export const premiumButtonClass = `${buttonClass} bg-[#f6c445] text-[#071d3a] shadow-[0_16px_40px_rgba(246,196,69,0.28)] hover:-translate-y-0.5`;

export const primaryButtonClass = `${buttonClass} bg-[#071d3a] text-white shadow-[0_16px_40px_rgba(7,29,58,0.18)] hover:-translate-y-0.5`;
