"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import { useWindowSize } from "usehooks-ts";
import Image from "next/image";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon, VercelIcon } from "./icons";
import { useSidebar } from "./ui/sidebar";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";
import { cn } from "@/lib/utils";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
  artworkImageUrl,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  artworkImageUrl?: string;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const [activeTab, setActiveTab] = useState<"chat" | "description" | "map">("chat");
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 z-10 flex flex-col bg-background">
      {/* Header principal con menú, icono y título - Solo visible en móvil */}
      <div className="flex md:hidden flex-col px-4 py-3">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          
          <div className="flex-1" />
          
          {(!open || windowWidth < 768) && (
            <Button
              className="h-8 px-2 shrink-0"
              onClick={() => {
                router.push("/");
                router.refresh();
              }}
              variant="outline"
              size="sm"
            >
              <PlusIcon />
              <span className="sr-only">New Chat</span>
            </Button>
          )}
        </div>
        
        {/* Imagen circular del monumento - Encima del título */}
        <div className="flex justify-center mt-2 mb-4">
          <div className="relative size-20 shrink-0 rounded-full bg-muted overflow-hidden border border-border">
            {artworkImageUrl ? (
              <Image
                src={artworkImageUrl}
                alt="Monumento"
                width={80}
                height={80}
                className="object-cover object-center rounded-full"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="flex size-20 items-center justify-center text-4xl">🏛️</div>
            )}
          </div>
        </div>
        
        {/* Título - Solo visible en móvil */}
        <div className="flex flex-col min-w-0 flex-1 text-center">
          <h1 className="text-2xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-recoleta), serif' }}>
            Monumento a las Cortes de Cadiz 1812
          </h1>
        </div>
      </div>

      {/* Header simplificado para desktop - Sin botones (se muestran en los bordes de la columna) */}
      <div className="hidden md:flex items-center gap-2 px-4 py-3">
        {/* Los botones se muestran en los bordes de la columna en chat.tsx */}
      </div>

      {/* Tabs Conversar/Descripción/Localización */}
      <div className="flex gap-2 px-4 pb-2">
        <Button
          className={cn(
            "flex-1 text-sm md:rounded-lg rounded-xl",
            activeTab === "chat"
              ? "bg-muted text-foreground"
              : "bg-transparent text-muted-foreground hover:bg-muted/50"
          )}
          onClick={() => setActiveTab("chat")}
          variant="ghost"
          size="sm"
        >
          Conversar
        </Button>
        <Button
          className={cn(
            "flex-1 text-sm md:rounded-lg rounded-xl",
            activeTab === "description"
              ? "bg-muted text-foreground"
              : "bg-transparent text-muted-foreground hover:bg-muted/50"
          )}
          onClick={() => setActiveTab("description")}
          variant="ghost"
          size="sm"
        >
          Descripción
        </Button>
        <Button
          className={cn(
            "flex-1 text-sm md:rounded-lg rounded-xl",
            activeTab === "map"
              ? "bg-muted text-foreground"
              : "bg-transparent text-muted-foreground hover:bg-muted/50"
          )}
          onClick={() => setActiveTab("map")}
          variant="ghost"
          size="sm"
        >
          Localización
        </Button>
      </div>

    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly &&
    prevProps.artworkImageUrl === nextProps.artworkImageUrl
  );
});
