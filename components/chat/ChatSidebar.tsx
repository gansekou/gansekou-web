"use client";

import { MessageSquarePlus } from "lucide-react";

import type { ChatConversationSummary } from "@/types/chat";

type Props = {
  conversations: ChatConversationSummary[];
  currentConversationId?: string;
  loading?: boolean;

  onNewChat: () => void;
  onSelectConversation: (conversationId: string) => void;
};

export function ChatSidebar({
  conversations,
  currentConversationId,
  loading = false,
  onNewChat,
  onSelectConversation,
}: Props) {
  return (
    <aside
      className="
        w-80
        border-r
        bg-white
        flex
        flex-col
      "
    >
      <div className="p-4 border-b">
        <button
          onClick={onNewChat}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-600
            text-white
            px-4
            py-3
            font-medium
            hover:bg-emerald-700
            transition
          "
        >
          <MessageSquarePlus size={18} />
          Nouvelle discussion
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {loading && (
          <div className="p-4 text-sm text-slate-500">
            Chargement...
          </div>
        )}

        {!loading &&
          conversations.map((conversation) => (

            <button
              key={conversation.id}
              onClick={() =>
                onSelectConversation(conversation.id)
              }
              className={`
                w-full
                text-left
                p-4
                border-b
                hover:bg-slate-50
                transition

                ${
                  currentConversationId === conversation.id
                    ? "bg-emerald-50"
                    : ""
                }
              `}
            >
              <div className="font-medium truncate">
                {conversation.title}
              </div>

              <div className="text-xs text-slate-500 mt-1">
                {new Date(
                  conversation.last_message_at
                ).toLocaleString("fr-FR")}
              </div>

            </button>

          ))}

      </div>
    </aside>
  );
}
