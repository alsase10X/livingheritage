"use client";

import { Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import { cn } from "@/lib/utils";

type Guia = {
  nombre: string;
  avatar: string;
  rol: string;
};

type ChatBarProps = {
  guia: Guia;
  bienId?: string;
  rutaId?: string;
  onChatClick?: () => void;
};

export function ChatBar({ guia, bienId, rutaId, onChatClick }: ChatBarProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onChatClick) {
      onChatClick();
    } else if (rutaId) {
      // Prioridad: navegar a la pantalla de chat de la ruta
      console.log("Navegando a chat de la ruta:", rutaId);
      router.push(`/ruta/${rutaId}/chat`);
    } else if (bienId) {
      // Fallback: navegar a la pantalla de chat del bien (si no hay rutaId)
      console.log("Navegando a chat del bien:", bienId);
      router.push(`/bien/${bienId}`);
    } else {
      // Por ahora solo muestra un toast
      toast({
        type: "success",
        description: "Chat próximamente",
      });
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 bg-background",
        "shadow-[0_-4px_12px_rgba(0,0,0,0.3)]",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Avatar del guía */}
        <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-muted border border-border">
          {guia.avatar ? (
            // biome-ignore lint/performance/noImgElement: "Using img for better compatibility"
            <img
              src={guia.avatar}
              alt={guia.nombre}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : null}
          {/* Fallback con emoji si no hay imagen */}
          {!guia.avatar && (
            <div className="flex items-center justify-center h-full w-full text-xl">
              👩
            </div>
          )}
        </div>

        {/* Input placeholder */}
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "flex-1 text-left px-4 py-2.5 rounded-full bg-muted border border-border",
            "text-sm text-muted-foreground",
            "hover:bg-muted/80 active:bg-muted/60",
            "transition-colors cursor-text"
          )}
        >
          Pregunta lo que quieras...
        </button>

        {/* Icono de micrófono */}
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center",
            "rounded-full bg-muted border border-border",
            "hover:bg-muted/80 active:bg-muted/60",
            "transition-colors"
          )}
          aria-label="Micrófono"
        >
          <Mic className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

