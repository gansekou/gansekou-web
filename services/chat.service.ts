import { api } from "@/lib/api";

import type {
  ChatConversation,
  ChatConversationSummary,
} from "@/types/chat";

type KoumaResponse = {
  answer: string;
};

export const chatService = {
  async start() {
    return api.post<ChatConversation>(
      "/api/v1/chat/start"
    );
  },

  async listConversations() {
    return api.get<ChatConversationSummary[]>(
      "/api/v1/chat/conversations"
    );
  },

  async getConversation(
    conversationId: string
  ) {
    return api.get<ChatConversation>(
      `/api/v1/chat/${conversationId}`
    );
  },

  async sendMessage(
    conversationId: string,
    message: string
  ) {
    return api.post<KoumaResponse>(
      `/api/v1/chat/${conversationId}/message`,
      {
        message,
      }
    );
  },
};
