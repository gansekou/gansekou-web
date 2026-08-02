"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { Menu, X } from "lucide-react";
import { chatService, ChatConversationSummary } from "@/services/chat.service";

import type {
  ChatMessage,
} from "@/types/chat";

import {
  ChatMessage as Message,
} from "./ChatMessage";

import {
  ChatInput,
} from "./ChatInput";

import {
  ConversationList,
} from "./ConversationList";

// Constantes
const MAX_CONVERSATIONS = 20;

export function KoumaChat() {
  // États
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);

  // Refs
  const bottomRef = useRef<HTMLDivElement>(null);

  // ============ Gestion des conversations ============

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.listConversations();
      setConversations(data.slice(0, MAX_CONVERSATIONS));
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
    }
  }, []);

  const openConversation = useCallback(async (id: string) => {

    try {
      setConversationId(id);
      setShowSidebar(false);
      setLoading(true);
  
      const history = await chatService.getConversation(id);
  
      setMessages(history.messages || []);
  
    } catch (error) {
  
      console.error("Erreur ouverture conversation:", error);
  
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "ASSISTANT",
          content:
            "Impossible de charger la conversation. Veuillez réessayer.",
          created_at: new Date().toISOString(),
        },
      ]);
  
    } finally {
      setLoading(false);
    }
  
  }, []);

  const createNewChat = useCallback(async () => {
    try {
  
      const conversation = await chatService.start();
  
      setConversationId(conversation.id);
      setMessages([]);
  
      // recharge la liste depuis le backend
      const data = await chatService.listConversations();
  
      setConversations(
        data.slice(0, MAX_CONVERSATIONS)
      );
  
    } catch (error) {
  
      console.error(
        "Erreur création discussion:",
        error
      );
  
    }
  
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
  
        // Suppression dans la base
        await chatService.deleteConversation(id);
  
        // Mise à jour locale
        const remaining = conversations.filter(
          (conv) => conv.id !== id
        );
  
        setConversations(remaining);
  
        // Si on supprimait la conversation ouverte
        if (conversationId === id) {
          if (remaining.length > 0) {
            await openConversation(remaining[0].id);
          } else {
              setConversationId(null);
              setMessages([]);
          }
        }
      } catch (error) {
        console.error("Erreur suppression :", error);
        alert("Impossible de supprimer cette discussion.");
      } finally {
        setLoading(false);
      }
    },
    [
      conversations,
      conversationId,
      openConversation,
      createNewChat,
    ]
  );
  // ============ Gestion des messages ============

  const sendMessage = useCallback(async (text: string) => {
    if (!conversationId || !text.trim()) return;

    // Message utilisateur
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "USER",
      content: text.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await chatService.sendMessage(conversationId, text.trim());

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "ASSISTANT",
        content: response.answer,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      await loadConversations();
    } catch (error) {
      console.error("Erreur envoi message:", error);

      // Message d'erreur
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "ASSISTANT",
        content: "Désolé, une erreur est survenue. Veuillez réessayer.",
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [conversationId, loadConversations]);

  // ============ Initialisation ============

  useEffect(() => {

    const init = async () => {
  
      try {
  
        const data = await chatService.listConversations();
  
        const list = data.slice(
          0,
          MAX_CONVERSATIONS
        );
  
        setConversations(list);
  
  
        // Il existe déjà des discussions
        if (list.length > 0) {
  
          await openConversation(
            list[0].id
          );
  
        }
  
        // Première utilisation
        else {
  
          await createNewChat();
  
        }
  
  
      } catch(error) {
  
        console.error(
          "Erreur initialisation Kouma:",
          error
        );
  
      }
      finally {
  
        setInitialized(true);
  
      }
  
    };
  
  
    init();
  
  }, []);
  // ============ Scroll automatique ============

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // ============ Rendu ============

  if (!initialized) {
    return (
      <div className="flex h-[700px] items-center justify-center bg-slate-50 rounded-3xl">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        flex
        h-[75vh]
        min-h-[550px]
        rounded-3xl
        overflow-hidden
        border
        border-slate-200
        bg-slate-50
    "
    >
      {/* Barre latérale des conversations */}
      <>
    {/* Fond noir */}
    {showSidebar && (
      <div
        className="fixed inset-0 z-30 bg-black/40 md:hidden"
        onClick={() => setShowSidebar(false)}
      />
    )}
  
    <div
      className={`
        fixed
        inset-y-0
        left-0
        z-40
        w-72
        bg-white
        transition-transform
        duration-300
  
        md:relative
        md:translate-x-0
  
        ${
          showSidebar
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
    >
      <ConversationList
        conversations={conversations}
        activeId={conversationId}
        onSelect={openConversation}
        onNewChat={createNewChat}
        onDelete={deleteConversation}
      />
    </div>
  </>

      {/* Zone de chat principale */}
    <div className="flex flex-col flex-1 min-w-0">
    
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between">
    
        <button
          className="md:hidden"
          onClick={() => setShowSidebar(true)}
        >
          <Menu size={22} />
        </button>
    
        <h2 className="font-semibold text-slate-700">
          Kouma IA
        </h2>
    
        {/* Pour centrer le titre */}
        <div className="w-6 md:hidden" />
    
      </div>
    
      {/* Messages */}
      <div
        className="
          flex-1
          overflow-y-auto
          px-4
          py-5
          md:px-6
        "
      >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
          
              <div className="text-6xl mb-4">
                🤖
              </div>
          
              <h3 className="text-xl font-semibold text-slate-700">
                Discutez avec Kouma IA
              </h3>
          
              <p className="text-sm text-slate-500 max-w-sm mt-2">
                Posez vos questions en mathématiques,
                sciences ou autres matières et Kouma vous accompagnera.
              </p>
          
          
              {/* Bouton seulement si aucune conversation */}
              {conversations.length === 0 && (
                <button
                  onClick={createNewChat}
                  className="
                    mt-6
                    rounded-xl
                    bg-emerald-600
                    px-6
                    py-3
                    text-white
                    font-medium
                    hover:bg-emerald-700
                    transition
                    shadow-sm
                  "
                >
                  Commencer une discussion avec Kouma IA
                </button>
              )}
          
            </div>
          
          ) : (
          
            <div className="mx-auto max-w-4xl space-y-2">
          
              {messages.map((msg) => (
                <Message
                  key={msg.id}
                  message={msg}
                />
              ))}
          
            </div>
          
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
              <div className="animate-pulse">●</div>
              <span className="font-medium">Kouma réfléchit...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <ChatInput
          loading={loading}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}
