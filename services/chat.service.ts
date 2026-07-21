import { api } from "@/lib/api";

import type {
 ChatConversation,
 ChatMessage
} from "@/types/chat";



export const chatService = {


 async start(){

   return api.post<ChatConversation>(
     "/api/v1/chat/start"
   );

 },


 async getConversation(
   conversationId:string
 ){

   return api.get<ChatConversation>(
    `/api/v1/chat/${conversationId}`
   );

 },



 async sendMessage(
    conversationId:string,
    message:string
 ){

   return api.post<ChatMessage>(
     `/api/v1/chat/${conversationId}/message`,
     {
       message
     }
   );

 }

};
