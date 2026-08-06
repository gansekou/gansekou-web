"use client";

import Link from "next/link";
import { X } from "lucide-react";
import {
  Home,
  BookOpen,
  Brain,
  Trophy,
  Sparkles,
  CreditCard,
  LogIn,
  UserPlus,
} from "lucide-react";

import { GansekouLogo } from "@/components/ui/GansekouLogo";

type Props = {
  open: boolean;
  onClose: () => void;
};


const items = [
  {
    label: "Accueil",
    href: "/",
    icon: Home,
  },
  {
    label: "Cours",
    href: "/courses",
    icon: BookOpen,
  },
  {
    label: "Kouma IA",
    href: "/kouma",
    icon: Brain,
  },
  {
    label: "Quiz",
    href: "/quizzes",
    icon: Trophy,
  },
  {
    label: "Gansekou Excellence+",
    href: "/premium",
    icon: Sparkles,
  },
  {
    label: "Abonnement",
    href: "/subscription",
    icon: CreditCard,
  },
];


export function PublicMobileDrawer({
  open,
  onClose,
}: Props) {


return (
<>
<div
onClick={onClose}
className={`
fixed inset-0 z-40 bg-black/50 transition-opacity
${open
? "opacity-100"
: "opacity-0 pointer-events-none"
}
`}
/>


<aside
className={`
fixed left-0 top-0 bottom-0 z-50
w-[86%] max-w-sm
bg-white shadow-2xl
transition-transform duration-300

${open
? "translate-x-0"
: "-translate-x-full"
}
`}
>


<div className="flex h-full flex-col">


{/* HEADER */}

<div className="border-b p-5">

<div className="flex items-center justify-between">

<GansekouLogo
href="/"
variant="full"
size="medium"
/>


<button
onClick={onClose}
className="rounded-xl p-2 hover:bg-slate-100"
>
<X size={22}/>
</button>


</div>


<div className="mt-4 text-sm text-slate-500">
Apprenez plus vite avec Gansekou 🚀
</div>


</div>



{/* MENU */}

<div className="flex-1 overflow-y-auto p-4">


{items.map((item)=>{

const Icon=item.icon;


return (

<Link
key={item.href}
href={item.href}
onClick={onClose}
className="
flex items-center gap-4
rounded-2xl
px-4 py-4
hover:bg-slate-100
transition
"
>

<Icon size={22}/>

<span className="font-medium">
{item.label}
</span>


</Link>

)

})}



<div className="my-5 border-t"/>



<Link
href="/login"
onClick={onClose}
className="
flex items-center gap-4
rounded-2xl
px-4 py-4
bg-slate-100
"
>

<LogIn size={22}/>

Connexion

</Link>



<Link
href="/register"
onClick={onClose}
className="
mt-3 flex items-center gap-4
rounded-2xl
px-4 py-4
bg-[#0f5f3a]
text-white
"
>

<UserPlus size={22}/>

Créer un compte

</Link>



</div>


</div>


</aside>


</>
);

}
