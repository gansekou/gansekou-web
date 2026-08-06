"use client";

import Link from "next/link";
import { Menu, UserCircle } from "lucide-react";

import { GansekouLogo } from "@/components/ui/GansekouLogo";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { GansekouWordmark } from "@/components/ui/GansekouWordmark";


type Props = {
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  userName?: string;
  profileUrl?: string;
};


export function PublicHeader({
  drawerOpen,
  onOpenDrawer,
  userName,
  profileUrl,
}: Props) {


const displayName = userName || "Gansekou";


return (

<header className="
sticky top-0 z-40
border-b border-slate-200
bg-white/90 backdrop-blur-xl
">


<div className="
flex h-16 items-center justify-between
px-4 lg:h-20 lg:px-8
">


{/* MOBILE MENU */}

<div className="flex items-center gap-3 lg:hidden">


<button
onClick={onOpenDrawer}
className="
rounded-xl p-2
transition
hover:bg-slate-100
active:scale-95
"
>

<Menu
size={24}
className={`
transition-transform duration-300
${drawerOpen ? "rotate-90" : ""}
`}
/>


</button>

<GansekouWordmark />

</div>



{/* DESKTOP LOGO */}

<div className="hidden lg:block">

<GansekouLogo
href="/"
variant="full"
size="medium"
/>

</div>




{/* DESKTOP NAVIGATION */}

<nav className="
hidden lg:flex
items-center gap-8
font-bold text-slate-700
">


<Link href="/">
Accueil
</Link>


<Link href="/courses">
Cours
</Link>


<Link href="/subjects">
Sujets
</Link>


<Link href="/quizzes">
Quiz
</Link>


<Link href="/premium">
Excellence+
</Link>


</nav>




{/* ACTIONS */}

<div className="flex items-center gap-3">


{userName ? (

<>


<Link
href="/dashboard"
className="
flex
rounded-full
bg-[#071d3a]
px-4 py-2
text-sm
font-black
text-white
whitespace-nowrap
"
>
Mon espace
</Link>


<Link href="/profile">

<UserAvatar
name={displayName}
src={profileUrl}
/>

</Link>


</>


) : (

<>


<Link
href="/login"
className="
hidden sm:flex
rounded-full
bg-slate-100
px-5 py-2
font-bold
"
>

Connexion

</Link>


<Link
href="/register"
className="
rounded-full
bg-[#0f5f3a]
px-4
py-2
text-sm
font-black
text-white
shadow-lg
shadow-green-900/20
whitespace-nowrap
"
>
Créer un compte
</Link>


</>

)}



</div>


</div>


</header>

);

}
