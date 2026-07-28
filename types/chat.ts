// types/chat.ts

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
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

export interface ChatConversationSummary {
  id: string;
  title: string;
  language: string;
  created_at: string;
  last_message_at: string;
  last_message?: string;
  message_count?: number;
}
