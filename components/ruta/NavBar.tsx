"use client";

import { Headphones, Map as MapIcon, MessageSquare } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type NavBarProps = {
  rutaId?: string;
};

export function NavBar({ rutaId }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determinar página activa
  const isMapActive = rutaId ? pathname === `/ruta/${rutaId}` : false;
  const isChatActive =
    pathname.includes("/chat") || pathname.includes("/bien/");
  const isAudioActive = false; // Por ahora no hay página de audio

  const handleAudioClick = () => {
    // Por ahora solo console.log, se implementará después
    console.log("Audio - TODO: Implementar funcionalidad de audio");
  };

  const handleMapClick = () => {
    if (rutaId) {
      router.push(`/ruta/${rutaId}`);
    }
    // Si no hay rutaId, no hacer nada (el botón estará visible pero no funcional)
  };

  const handleChatClick = () => {
    if (rutaId) {
      router.push(`/ruta/${rutaId}/chat`);
    }
    // Si no hay rutaId, estamos ya en la página de chat del bien, no hacer nada
  };

  return (
    <nav className="nav-bar-fixed">
      <button
        aria-label="Audio"
        className={`nav-button ${isAudioActive ? "nav-button-active" : ""}`}
        onClick={handleAudioClick}
        type="button"
      >
        <Headphones className="nav-icon" />
      </button>

      <button
        aria-label="Mapa"
        className={`nav-button ${isMapActive ? "nav-button-active" : ""} ${rutaId ? "" : "nav-button-disabled"}`}
        disabled={rutaId === undefined}
        onClick={handleMapClick}
        type="button"
      >
        <MapIcon className="nav-icon" />
      </button>

      <button
        aria-label="Chat"
        className={`nav-button ${isChatActive ? "nav-button-active" : ""}`}
        onClick={handleChatClick}
        type="button"
      >
        <MessageSquare className="nav-icon" />
      </button>
    </nav>
  );
}
