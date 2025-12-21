"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArtworkPanel } from "@/components/artwork-panel";
import { GreetingProvider } from "@/components/greeting";
import { PlusIcon } from "@/components/icons";
import { MultimodalInput } from "@/components/multimodal-input";
import { NavBar } from "@/components/ruta/NavBar";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { fetchWithErrorHandlers } from "@/lib/utils";
import type { Database } from "@/types/database";
import { BienChatHeader } from "./BienChatHeader";
import { BienMessages } from "./BienMessages";

type Bien = Database["public"]["Tables"]["bienes"]["Row"];
type Imagen = Database["public"]["Tables"]["imagenes_bienes"]["Row"];

export function BienChatWrapper({
  bien,
  imagenPrincipal,
}: {
  bien: Bien;
  imagenPrincipal: Imagen | null;
}) {
  const router = useRouter();
  const chatId = bien.id;
  // Usar la imagen del bien si existe, de lo contrario un placeholder genérico
  const imagenUrl =
    imagenPrincipal?.url && imagenPrincipal.url.trim() !== ""
      ? imagenPrincipal.url
      : "/images/placeholder-bien.png"; // Placeholder específico para bienes sin imagen

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
    // Mensaje genérico (por ahora; en el futuro se podría generar con IA si generarBienvenidaAuto es true)
    greetingText = `Hola, soy ${bien.denominacion}. ¿Qué te gustaría saber de mí?`;
  }

  return (
    <GreetingProvider>
      <div className="overscroll-behavior-contain relative flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
        {/* Toggle sidebar - Izquierda de toda la pantalla en desktop */}
        <div className="absolute top-0 left-0 z-20 hidden p-2 md:block">
          <SidebarToggle />
        </div>

        {/* Contenedor de columnas */}
        <div className="flex min-h-0 flex-1 flex-row px-6 pt-6 md:px-12 lg:px-16">
          {/* Panel izquierdo - Imagen del bien */}
          <div className="hidden shrink-0 md:flex md:w-1/2">
            <ArtworkPanel
              hasNext={false}
              hasPrevious={false}
              imageUrl={imagenUrl}
              title={bien.denominacion}
            />
          </div>

          {/* Panel derecho - Chat */}
          <div className="relative flex min-w-0 flex-1 flex-col md:w-1/2">
            {/* Botón + - Derecha en desktop */}
            <div className="absolute top-0 right-0 z-20 hidden p-2 md:block">
              <Button
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => {
                  router.push("/");
                  router.refresh();
                }}
                size="icon"
                variant="outline"
              >
                <PlusIcon />
                <span className="sr-only">New Chat</span>
              </Button>
            </div>

            <BienChatHeader
              artworkImageUrl={imagenUrl}
              chatId={chatId}
              isReadonly={false}
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

            <div className="sticky bottom-0 z-1 mx-auto mb-[64px] flex w-full min-w-[40px] max-w-2xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
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
        </div>

        {/* Barra de navegación */}
        <NavBar />
      </div>
    </GreetingProvider>
  );
}
