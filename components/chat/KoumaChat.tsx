"use client";


import {
useEffect,
useState,
useRef
} from "react";


import {
chatService
} from "@/services/chat.service";


import type {
ChatMessage
} from "@/types/chat";


import {
ChatMessage as Message
} from "./ChatMessage";


import {
ChatInput
} from "./ChatInput";




export function KoumaChat(){


const [conversationId,setConversationId]
=
useState<string|null>(null);



const [
messages,
setMessages
]
=
useState<ChatMessage[]>([]);



const [
loading,
setLoading
]
=
useState(false);



const bottomRef =
useRef<HTMLDivElement>(null);





useEffect(()=>{


async function init(){


let id =
localStorage.getItem(
"kouma_conversation_id"
);



if(!id){

const conv =
await chatService.start();


id=conv.id;


localStorage.setItem(
"kouma_conversation_id",
id
);

}



setConversationId(id);



const history =
await chatService.getConversation(id);


setMessages(
history.messages
);


}



init();


},[]);





useEffect(()=>{


bottomRef.current?.scrollIntoView({
behavior:"smooth"
});


},[messages,loading]);






async function send(
text:string
){


if(!conversationId)
return;



const temp:ChatMessage={

id:
crypto.randomUUID(),

role:"USER",

content:text,

created_at:
new Date().toISOString()

};



setMessages(
prev=>[
...prev,
temp
]
);



setLoading(true);



try{


const response =
await chatService.sendMessage(
conversationId,
text
);



setMessages(
prev=>[
...prev,
response
]
);



}

catch(error){


setMessages(
prev=>[
...prev,
{
id:
crypto.randomUUID(),

role:"ASSISTANT",

content:
"Une erreur est survenue. Réessaie dans quelques secondes.",

created_at:
new Date().toISOString()
}
]
);


}

finally{

setLoading(false);

}


}




return (

<div
className="
flex
h-full
flex-col
bg-slate-50
"
>


<div
className="
flex-1
overflow-y-auto
p-5
"
>


{
messages.map(
msg=>
<Message
key={msg.id}
message={msg}
/>
)
}


{
loading &&
<div
className="
text-sm
font-bold
text-slate-400
"
>
Kouma réfléchit...
</div>
}


<div ref={bottomRef}/>


</div>



<ChatInput

loading={loading}

onSend={send}

/>


</div>

);

}
