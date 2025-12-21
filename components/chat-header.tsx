"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon, VercelIcon } from "./icons";
import { useSidebar } from "./ui/sidebar";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

function PureChatHeader({
  activeTab,
  chatId,
  selectedVisibilityType,
  isReadonly,
  setActiveTab,
  artworkImageUrl,
}: {
  activeTab: "chat" | "description" | "map";
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  setActiveTab: (tab: "chat" | "description" | "map") => void;
  artworkImageUrl?: string;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 z-10 flex flex-col bg-background">
      {/* Header principal con menú, icono y título - Solo visible en móvil */}
      <div className="flex flex-col px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <SidebarToggle />

          <div className="flex-1" />

          {(!open || windowWidth < 768) && (
            <Button
              className="h-8 shrink-0 px-2"
              onClick={() => {
                router.push("/");
                router.refresh();
              }}
              size="sm"
              variant="outline"
            >
              <PlusIcon />
              <span className="sr-only">New Chat</span>
            </Button>
          )}
        </div>

        {/* Imagen circular del monumento - Encima del título */}
        <div className="mt-2 mb-4 flex justify-center">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {artworkImageUrl ? (
              <Image
                alt="Monumento"
                className="rounded-full object-cover object-center"
                height={80}
                src={artworkImageUrl}
                style={{ width: "100%", height: "100%" }}
                width={80}
              />
            ) : (
              <div className="flex size-20 items-center justify-center text-4xl">
                🏛️
              </div>
            )}
          </div>
        </div>

        {/* Título - Solo visible en móvil */}
        <div className="flex min-w-0 flex-1 flex-col text-center">
          <h1
            className="text-4xl leading-tight"
            style={{
              fontFamily: "var(--font-recoleta), serif",
              fontWeight: 400,
            }}
          >
            Monumento a las Cortes de Cadiz 1812
          </h1>
        </div>
      </div>

      {/* Header simplificado para desktop - Sin botones (se muestran en los bordes de la columna) */}
      <div className="hidden items-center gap-2 px-4 py-3 md:flex">
        {/* Los botones se muestran en los bordes de la columna en chat.tsx */}
      </div>

      {/* Tabs Conversar/Escuchar/Localización */}
      <div className="flex gap-2 px-4 pb-2">
        <Button
          className={cn(
            "flex-1 rounded-xl text-sm md:rounded-lg",
            activeTab === "chat"
              ? "bg-muted text-foreground"
              : "bg-transparent text-muted-foreground hover:bg-muted/50"
          )}
          onClick={() => setActiveTab("chat")}
          size="sm"
          variant="ghost"
        >
          Conversar
        </Button>
        <Button
          className={cn(
            "flex-1 rounded-xl text-sm md:rounded-lg",
            activeTab === "description"
              ? "bg-muted text-foreground"
              : "bg-transparent text-muted-foreground hover:bg-muted/50"
          )}
          onClick={() => setActiveTab("description")}
          size="sm"
          variant="ghost"
        >
          Escuchar
        </Button>
        <Button
          className={cn(
            "flex-1 rounded-xl text-sm md:rounded-lg",
            activeTab === "map"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50"
          )}
          onClick={() => setActiveTab("map")}
          size="sm"
          style={
            activeTab !== "map" ? { backgroundColor: "#1F2125" } : undefined
          }
          variant="ghost"
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
    prevProps.artworkImageUrl === nextProps.artworkImageUrl &&
    prevProps.activeTab === nextProps.activeTab
  );
});
