"use client";

import Link from "next/link";

type Props = {
  href?: string;
};


export function GansekouWordmark({
  href = "/",
}: Props) {

return (

<Link
href={href}
className="
text-2xl
font-black
tracking-tight
text-[#0f5f3a]
"
style={{
  fontFamily: "'Georgia', 'Times New Roman', serif",
}}
>

Gansekou

</Link>

);

}
