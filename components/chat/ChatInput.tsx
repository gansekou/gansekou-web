"use client";


import {
Send
} from "lucide-react";


import {
useState
} from "react";



export function ChatInput({

loading,

onSend

}:{

loading:boolean;

onSend:(message:string)=>void;

}){


const [value,setValue]=useState("");



function submit(){

 if(!value.trim()) return;

 onSend(value);

 setValue("");

}



return (

<div
className="
flex
gap-3
border-t
p-4
bg-white
"
>


<textarea

value={value}

onChange={
e=>setValue(e.target.value)
}

onKeyDown={
e=>{

 if(
 e.key==="Enter"
 &&
 !e.shiftKey
 ){

 e.preventDefault();

 submit();

 }

}

}

placeholder="Pose ta question à Kouma..."

className="
flex-1
rounded-2xl
border
p-3
resize-none
outline-none
"


/>


<button

disabled={loading}

onClick={submit}

className="
rounded-2xl
bg-[#0f5f3a]
px-5
text-white
disabled:opacity-50
"

>

<Send size={20}/>

</button>


</div>

);

}
