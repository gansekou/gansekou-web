"use client";

import { useState, useMemo } from "react";
import type { ConversationItem } from "@/services/chat.service";
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  TrashIcon,
  EllipsisVerticalIcon 
} from "@heroicons/react/24/outline";

type Props = {
  conversations: ConversationItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
};

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  isLoading = false,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Trier les conversations par date (plus récente en premier)
  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (a, b) => 
        new Date(b.last_message_at).getTime() - 
        new Date(a.last_message_at).getTime()
    );
  }, [conversations]);

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Aujourd'hui à ${date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (days === 1) {
      return "Hier";
    } else if (days < 7) {
      return `Il y a ${days} jours`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  // Raccourcir le titre
  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (!title) return "Nouvelle discussion";
    return title.length > maxLength 
      ? `${title.substring(0, maxLength)}...` 
      : title;
  };

  return (
    <div
      className="
        w-72
        min-w-[288px]
        border-r
        bg-white
        flex
        flex-col
        h-full
        relative
      "
    >
      {/* En-tête avec le titre et le bouton */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-600">
          Discussions
          <span className="ml-2 text-xs text-slate-400 font-normal">
            ({conversations.length})
          </span>
        </h2>
        <button
          onClick={onNewChat}
          disabled={isLoading}
          className="
            p-2
            rounded-lg
            bg-emerald-600
            text-white
            hover:bg-emerald-700
            transition-colors
            disabled:opacity-50
            disabled:cursor-not-allowed
            flex
            items-center
            gap-1
            text-sm
          "
          title="Nouvelle discussion"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau</span>
        </button>
      </div>

      {/* Liste des conversations */}
      <div
        className="
          flex-1
          overflow-y-auto
          px-2
          py-2
          scrollbar-thin
          scrollbar-thumb-slate-300
          scrollbar-track-transparent
          hover:scrollbar-thumb-slate-400
        "
      >
        {isLoading ? (
          // État de chargement
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : sortedConversations.length === 0 ? (
          // État vide
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Aucune discussion</p>
            <p className="text-xs text-slate-400 mt-1">
              Commencez une nouvelle conversation
            </p>
          </div>
        ) : (
          sortedConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="relative group"
              onMouseEnter={() => setHoveredId(conversation.id)}
              onMouseLeave={() => {
                setHoveredId(null);
                setMenuOpenId(null);
              }}
            >
              <button
                onClick={() => onSelect(conversation.id)}
                className={`
                  w-full
                  text-left
                  rounded-xl
                  p-3
                  mb-1.5
                  transition-all
                  duration-200
                  ${
                    activeId === conversation.id
                      ? "bg-emerald-50 ring-1 ring-emerald-200 shadow-sm"
                      : "hover:bg-slate-50 hover:shadow-sm"
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div
                      className="
                        font-medium
                        text-sm
                        truncate
                        pr-4
                        ${
                          activeId === conversation.id
                            ? "text-emerald-700"
                            : "text-slate-700"
                        }
                      "
                    >
                      {truncateTitle(conversation.title)}
                    </div>

                    {/* Afficher un aperçu du dernier message si disponible */}
                    {conversation.last_message && (
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {conversation.last_message.length > 50
                          ? `${conversation.last_message.substring(0, 50)}...`
                          : conversation.last_message}
                      </div>
                    )}

                    <div
                      className="
                        text-xs
                        text-slate-400
                        mt-1.5
                        flex
                        items-center
                        gap-1
                      "
                    >
                      <span>{formatDate(conversation.last_message_at)}</span>
                      {conversation.message_count && conversation.message_count > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{conversation.message_count} messages</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Indicateur de conversation active */}
                  {activeId === conversation.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5"></div>
                  )}
                </div>
              </button>

              {/* Bouton de suppression (visible au survol) */}
              {onDelete && hoveredId === conversation.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Voulez-vous vraiment supprimer cette discussion ?")) {
                      onDelete(conversation.id);
                    }
                  }}
                  className="
                    absolute
                    right-2
                    top-1/2
                    -translate-y-1/2
                    p-1.5
                    rounded-lg
                    bg-white
                    border
                    border-slate-200
                    text-slate-400
                    hover:text-red-500
                    hover:border-red-200
                    hover:bg-red-50
                    transition-all
                    duration-200
                    shadow-sm
                    opacity-0
                    group-hover:opacity-100
                  "
                  title="Supprimer cette discussion"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pied de page avec statistiques */}
      {conversations.length > 0 && !isLoading && (
        <div className="border-t border-slate-100 p-3 text-xs text-slate-400 text-center">
          {conversations.length} discussion{conversations.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
