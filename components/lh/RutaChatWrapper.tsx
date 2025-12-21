"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GreetingProvider } from "@/components/greeting";
import { MultimodalInput } from "@/components/multimodal-input";
import { NavBar } from "@/components/ruta/NavBar";
import { Button } from "@/components/ui/button";
import { fetchWithErrorHandlers } from "@/lib/utils";
import { BienChatHeader } from "./BienChatHeader";
import { BienMessages } from "./BienMessages";

type BienMock = {
  id: string;
  denominacion: string;
  preguntas_provocadoras?: string[];
  generar_bienvenida_auto?: boolean;
  mensaje_bienvenida?: string | null;
};

type GuiaMock = {
  nombre: string;
  avatar: string;
  rol: string;
};

type RutaChatWrapperProps = {
  rutaId: string;
  bien: BienMock;
  guia: GuiaMock;
};

export function RutaChatWrapper({ rutaId, bien, guia }: RutaChatWrapperProps) {
  const router = useRouter();
  const chatId = `ruta-${rutaId}-bien-${bien.id}`;

  const [attachments, setAttachments] = useState<
    Array<{ url: string; name: string; contentType: string }>
  >([]);

  const [input, setInput] = useState<string>("");
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);

  const { messages, setMessages, sendMessage, status, stop, regenerate } =
    useChat({
      id: chatId,
      initialMessages: [],
      transport: new DefaultChatTransport({
        api: `/api/bien/${bien.id}/chat`,
        fetch: fetchWithErrorHandlers,
      }),
      onData: (dataPart) => {
        // Capturar sugerencias generadas por el LLM
        if (dataPart.type === "data-bien-suggestions") {
          console.log("🟢 Recibidas sugerencias del stream:", dataPart.data);
          try {
            const suggestions = JSON.parse(dataPart.data) as string[];
            console.log("🟢 Sugerencias parseadas:", suggestions);
            if (Array.isArray(suggestions) && suggestions.length > 0) {
              setCurrentSuggestions(suggestions);
              console.log(
                "🟢 Estado actualizado con sugerencias:",
                suggestions
              );
            }
          } catch (error) {
            console.error("❌ Error parsing bien suggestions:", error);
          }
        }
      },
    });

  const preguntasProvocadoras =
    (Array.isArray(bien.preguntas_provocadoras)
      ? bien.preguntas_provocadoras
      : []) || [];

  // Al inicio, mostrar 3 chips aleatorias de preguntas_provocadoras
  // Si hay chips generadas por el LLM, usar esas en su lugar
  const chipsToShow =
    currentSuggestions.length > 0
      ? currentSuggestions
      : (() => {
          // Seleccionar 3 aleatorias de preguntas_provocadoras
          if (preguntasProvocadoras.length === 0) return [];
          if (preguntasProvocadoras.length <= 3) return preguntasProvocadoras;

          // Shuffle y tomar 3
          const shuffled = [...preguntasProvocadoras].sort(
            () => Math.random() - 0.5
          );
          return shuffled.slice(0, 3);
        })();

  // Determinar el mensaje de bienvenida
  const generarBienvenidaAuto = bien.generar_bienvenida_auto ?? true;
  const mensajeBienvenidaPersonalizado =
    bien.mensaje_bienvenida?.trim() || null;

  let greetingText: string;

  if (!generarBienvenidaAuto && mensajeBienvenidaPersonalizado) {
    // Usar mensaje personalizado si está configurado
    greetingText = mensajeBienvenidaPersonalizado;
  } else {
    // Mensaje genérico con el nombre del guía
    greetingText = `Hola, soy ${guia.nombre}. Estoy aquí para contarte sobre ${bien.denominacion}. ¿Qué te gustaría saber?`;
  }

  return (
    <GreetingProvider>
      <div className="overscroll-behavior-contain relative flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
        {/* Header con botón de volver */}
        <div className="sticky top-0 z-10 border-border border-b bg-background">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              aria-label="Volver"
              className="h-9 w-9 shrink-0"
              onClick={() => router.back()}
              size="icon"
              variant="ghost"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1
              className="flex-1 truncate font-semibold text-xl"
              style={{ fontFamily: "var(--font-recoleta), serif" }}
            >
              {bien.denominacion}
            </h1>
          </div>
        </div>

        {/* Chat - Layout mobile de una sola columna */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <BienChatHeader
            artworkImageUrl={undefined}
            chatId={chatId}
            hasSidebarProvider={false}
            isReadonly={false}
            showSidebarToggle={false}
            title={bien.denominacion}
          />

          <BienMessages
            chatId={chatId}
            currentSuggestions={currentSuggestions}
            greetingText={greetingText}
            isReadonly={false}
            messages={messages}
            onPreguntaClick={(pregunta) => {
              // Limpiar chips al hacer clic (se generarán nuevas con la respuesta)
              setCurrentSuggestions([]);
              sendMessage({
                role: "user",
                parts: [{ type: "text", text: pregunta }],
              });
            }}
            preguntasProvocadoras={chipsToShow}
            regenerate={regenerate}
            setMessages={setMessages}
            status={status}
          />

          <div className="sticky bottom-0 z-10 mx-auto mb-[64px] flex w-full min-w-[40px] gap-2 border-border border-t bg-background px-2 pt-2 pb-3">
            <MultimodalInput
              attachments={attachments}
              chatId={chatId}
              input={input || ""}
              messages={messages}
              selectedModelId="chat-model"
              selectedVisibilityType="public"
              sendMessage={sendMessage}
              setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              stop={stop}
            />
          </div>
        </div>

        {/* Barra de navegación */}
        <NavBar rutaId={rutaId} />
      </div>
    </GreetingProvider>
  );
}
