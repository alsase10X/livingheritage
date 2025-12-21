"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { ArrowDownIcon } from "lucide-react";
import { memo } from "react";
import { useMessages } from "@/hooks/use-messages";
import type { ChatMessage } from "@/lib/types";
import { useDataStream } from "@/components/data-stream-provider";
import { BienGreeting } from "./BienGreeting";
import { BienSuggestionsChips } from "./BienSuggestionsChips";
import { ThinkingMessage } from "@/components/message";
import { BienMessage } from "./BienMessage";

type BienMessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  greetingText: string;
  preguntasProvocadoras?: string[];
  currentSuggestions?: string[];
  onPreguntaClick?: (pregunta: string) => void;
};

function PureBienMessages({
  chatId,
  status,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  greetingText,
  preguntasProvocadoras = [],
  currentSuggestions = [],
  onPreguntaClick,
}: BienMessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  } = useMessages({
    status,
  });

  useDataStream();

  return (
    <div className="relative flex-1">
      <div
        className="absolute inset-0 touch-pan-y overflow-y-auto"
        ref={messagesContainerRef}
      >
        <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
          {/* Mensaje de bienvenida siempre visible */}
          <BienGreeting
            greetingText={greetingText}
            preguntasProvocadoras={messages.length === 0 ? preguntasProvocadoras : []}
            onPreguntaClick={messages.length === 0 ? onPreguntaClick : undefined}
          />

          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const isAssistantMessage = message.role === "assistant";
            const isStreamingComplete = status !== "streaming" && status !== "submitted";
            
            return (
              <div key={message.id}>
                <BienMessage
                  isLoading={
                    status === "streaming" && isLastMessage
                  }
                  message={message}
                />
                {/* Mostrar chips después de cada respuesta del asistente cuando termine el streaming */}
                {isAssistantMessage && 
                 isLastMessage && 
                 isStreamingComplete && 
                 onPreguntaClick && (
                  <BienSuggestionsChips
                    suggestions={currentSuggestions.length > 0 ? currentSuggestions : preguntasProvocadoras}
                    onSuggestionClick={onPreguntaClick}
                  />
                )}
              </div>
            );
          })}

          {status === "submitted" && <ThinkingMessage />}

          <div
            className="min-h-[24px] min-w-[24px] shrink-0"
            ref={messagesEndRef}
          />
        </div>
      </div>

      <button
        aria-label="Scroll to bottom"
        className={`-translate-x-1/2 absolute bottom-4 left-1/2 z-10 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted ${
          isAtBottom
            ? "pointer-events-none scale-0 opacity-0"
            : "pointer-events-auto scale-100 opacity-100"
        }`}
        onClick={() => scrollToBottom("smooth")}
        type="button"
      >
        <ArrowDownIcon className="size-4" />
      </button>
    </div>
  );
}

export const BienMessages = memo(
  PureBienMessages,
  (prevProps, nextProps) => {
    if (prevProps.status !== nextProps.status) {
      return false;
    }
    if (prevProps.messages.length !== nextProps.messages.length) {
      return false;
    }
    if (!equal(prevProps.messages, nextProps.messages)) {
      return false;
    }

    return false;
  }
);
