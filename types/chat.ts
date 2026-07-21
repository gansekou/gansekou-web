export type ChatRole = "USER" | "ASSISTANT";


export interface ChatMessage {

  id: string;

  role: ChatRole;

  content: string;

  image_url?: string | null;

  model?: string | null;

  created_at: string;

}


export interface ChatConversation {

  id: string;

  title: string;

  language: string;

  messages: ChatMessage[];

  created_at: string;

  last_message_at: string;

}
