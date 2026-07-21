import type { ChatMessage as ChatMessageType } from "@/types/chat";


export function ChatMessage({
 message
}:{
 message:ChatMessageType
}){


const isUser =
 message.role==="USER";


return (

<div
className={
`flex mb-4 ${
isUser
?"justify-end"
:"justify-start"
}`
}
>


<div
className={
`
max-w-[80%]
rounded-3xl
px-5
py-4
font-medium
whitespace-pre-wrap
${
isUser
?
"bg-[#0f5f3a] text-white"
:
"bg-white shadow text-slate-700"
}
`
}
>


{message.content}


</div>


</div>

);


}
