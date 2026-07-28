// services/chat.service.ts

import { api } from "@/lib/api";

// ============ TYPES ============

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
  // Pour notre UI
  last_message?: string;
  message_count?: number;
}

export interface ChatStartResponse {
  id: string;
  title: string;
  language: string;
  created_at: string;
  last_message_at: string;
}

export interface ChatMessageResponse {
  answer: string;
  conversation_id: string;
}

// ============ SERVICE ============

export const chatService = {
  /**
   * Démarrer une nouvelle conversation
   * POST /api/v1/chat/start
   */
  async start(): Promise<ChatStartResponse> {
    return api.post<ChatStartResponse>("/api/v1/chat/start");
  },

  /**
   * Récupérer la liste des conversations
   * GET /api/v1/chat/conversations
   */
  async listConversations(): Promise<ChatConversationSummary[]> {
    const data = await api.get<ChatConversationSummary[]>("/api/v1/chat/conversations");
    
    // Enrichir les données pour l'UI
    return data.map(conv => ({
      ...conv,
      last_message: "", // À enrichir si l'API le fournit
      message_count: 0, // À enrichir si l'API le fournit
    }));
  },

  /**
   * Récupérer l'historique d'une conversation
   * GET /api/v1/chat/{conversation_id}
   */
  async getConversation(conversationId: string): Promise<ChatConversation> {
    return api.get<ChatConversation>(`/api/v1/chat/${conversationId}`);
  },

  /**
   * Envoyer un message dans une conversation
   * POST /api/v1/chat/{conversation_id}/message
   */
  async sendMessage(
    conversationId: string,
    message: string
  ): Promise<ChatMessageResponse> {
    return api.post<ChatMessageResponse>(
      `/api/v1/chat/${conversationId}/message`,
      { message }
    );
  },

  /**
   * Supprimer une conversation (si l'API le supporte)
   * DELETE /api/v1/chat/{conversation_id}
   */
  async deleteConversation(conversationId: string): Promise<void> {
    return api.delete<void>(`/api/v1/chat/${conversationId}`);
  },

  /**
   * Renommer une conversation (si l'API le supporte)
   * PATCH /api/v1/chat/{conversation_id}
   */
  async renameConversation(conversationId: string, title: string): Promise<ChatConversationSummary> {
    return api.patch<ChatConversationSummary>(`/api/v1/chat/${conversationId}`, { title });
  },
};

// ============ EXPORT DES TYPES ============

export type { 
  ChatMessage,
  ChatConversation,
  ChatConversationSummary,
  ChatStartResponse,
  ChatMessageResponse,
};

// services/chat.service.ts

import { api } from "@/lib/api";

// ============ TYPES ============

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
  // Pour notre UI
  last_message?: string;
  message_count?: number;
}

export interface ChatStartResponse {
  id: string;
  title: string;
  language: string;
  created_at: string;
  last_message_at: string;
}

export interface ChatMessageResponse {
  answer: string;
  conversation_id: string;
}

// ============ SERVICE ============

export const chatService = {
  /**
   * Démarrer une nouvelle conversation
   * POST /api/v1/chat/start
   */
  async start(): Promise<ChatStartResponse> {
    return api.post<ChatStartResponse>("/api/v1/chat/start");
  },

  /**
   * Récupérer la liste des conversations
   * GET /api/v1/chat/conversations
   */
  async listConversations(): Promise<ChatConversationSummary[]> {
    const data = await api.get<ChatConversationSummary[]>("/api/v1/chat/conversations");
    
    // Enrichir les données pour l'UI
    return data.map(conv => ({
      ...conv,
      last_message: "", // À enrichir si l'API le fournit
      message_count: 0, // À enrichir si l'API le fournit
    }));
  },

  /**
   * Récupérer l'historique d'une conversation
   * GET /api/v1/chat/{conversation_id}
   */
  async getConversation(conversationId: string): Promise<ChatConversation> {
    return api.get<ChatConversation>(`/api/v1/chat/${conversationId}`);
  },

  /**
   * Envoyer un message dans une conversation
   * POST /api/v1/chat/{conversation_id}/message
   */
  async sendMessage(
    conversationId: string,
    message: string
  ): Promise<ChatMessageResponse> {
    return api.post<ChatMessageResponse>(
      `/api/v1/chat/${conversationId}/message`,
      { message }
    );
  },

  /**
   * Supprimer une conversation (si l'API le supporte)
   * DELETE /api/v1/chat/{conversation_id}
   */
  async deleteConversation(conversationId: string): Promise<void> {
    return api.delete<void>(`/api/v1/chat/${conversationId}`);
  },

  /**
   * Renommer une conversation (si l'API le supporte)
   * PATCH /api/v1/chat/{conversation_id}
   */
  async renameConversation(conversationId: string, title: string): Promise<ChatConversationSummary> {
    return api.patch<ChatConversationSummary>(`/api/v1/chat/${conversationId}`, { title });
  },
};

// ============ EXPORT DES TYPES ============

export type { 
  ChatMessage,
  ChatConversation,
  ChatConversationSummary,
  ChatStartResponse,
  ChatMessageResponse,
};

// ✅ AJOUTEZ CETTE LIGNE À LA FIN
export type ConversationItem = ChatConversationSummary;
