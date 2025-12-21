"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NavBar } from "@/components/ruta/NavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Bien = {
  id: string;
  denominacion: string;
  imagen: string;
  texto: string;
  audioDuracion: string;
  audioUrl?: string; // URL del audio desde el JSON
};

type SiguienteParada = {
  id: string;
  denominacion: string;
  imagen: string;
  tiempo: string;
  distancia: string;
};

type Guia = {
  nombre: string;
  avatar: string;
  rol: string;
};

type BienBottomSheetProps = {
  bien: Bien;
  siguienteParada: SiguienteParada;
  rutaId: string;
  bienId: string;
  guia?: Guia;
};

// Altura del NavBar (64px)
const NAV_BAR_HEIGHT = 64;

export function BienBottomSheet({
  bien,
  siguienteParada,
  rutaId,
  bienId,
  guia,
}: BienBottomSheetProps) {
  const router = useRouter();
  const guiaData = guia || {
    nombre: "María",
    avatar: "",
    rol: "Tu guía en esta ruta",
  };

  const [windowHeight, setWindowHeight] = useState(800);
  const [imageError, setImageError] = useState(false);
  const [siguienteImageError, setSiguienteImageError] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Estado del reproductor de audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Detectar scroll para saber si el header debe ser compacto
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      setScrollY(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Calcular si está expandido (cuando el scroll ha pasado el spacer)
  const isExpanded = scrollY > windowHeight * 0.3;

  // URL del archivo de audio - usar la del JSON si está disponible, sino construirla
  const audioUrl = bien.audioUrl || `/audio/rutas/${rutaId}/${bien.id}.mp3`;

  // Handlers del reproductor de audio
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        // Manejar error de reproducción
        setIsPlaying(false);
      });
    }
  };

  // Handler para hacer clic en la barra de progreso
  const handleProgressClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(duration) || duration <= 0) {
      return;
    }

    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percent * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Actualizar tiempo actual y duración
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      updateDuration();
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      updateDuration();
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    // Registrar todos los eventos
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Intentar cargar la duración si ya está disponible
    if (
      audio.readyState >= 1 &&
      audio.duration &&
      Number.isFinite(audio.duration)
    ) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // Formatear tiempo en formato mm:ss
  const formatTime = (seconds: number) => {
    if (Number.isNaN(seconds) || !Number.isFinite(seconds)) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calcular porcentaje de progreso
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* CAPA 1: Imagen FIJA en el fondo (position: fixed) */}
      <div className="fixed inset-0 z-0">
        <div className="relative h-full w-full bg-muted">
          {imageError ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
              <div className="p-8 text-center">
                <div className="mb-4 text-6xl">🏛️</div>
                <p className="font-medium text-sm">Imagen no disponible</p>
              </div>
            </div>
          ) : (
            <>
              {/* biome-ignore lint: onError is a valid React handler for img elements */}
              <img
                alt={bien.denominacion}
                className="absolute inset-0 h-full w-full object-cover"
                height={800}
                onError={() => {
                  setImageError(true);
                }}
                src={bien.imagen}
                width={600}
              />
              {/* Overlay oscuro */}
              <div
                className="absolute inset-0 bg-black/30"
                role="presentation"
              />
            </>
          )}
        </div>

        {/* Botón Mapa flotante */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            className="gap-2 rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
            onClick={() => {
              router.push(`/ruta/${rutaId}`);
            }}
            size="sm"
            variant="secondary"
          >
            <MapPin className="h-4 w-4" />
            Mapa
          </Button>
        </div>
      </div>

      {/* CAPA 2: Container scrollable con spacer y sheet */}
      <div
        className="scroll-snap-y-mandatory relative z-10 h-dvh overflow-y-auto"
        ref={containerRef}
        style={{ scrollSnapType: "y mandatory" }}
      >
        {/* Spacer transparente: empuja el contenido abajo y deja ver la imagen */}
        <div
          style={{
            height: "50vh",
            scrollSnapAlign: "start",
          }}
        />

        {/* Sheet con fondo oscuro */}
        <div
          className={cn(
            "min-h-[50vh] rounded-t-[24px] bg-background",
            !isExpanded && "overflow-hidden"
          )}
          style={{ scrollSnapAlign: "start" }}
        >
          {/* Header - Sticky y compacto cuando está expandido */}
          <div
            className={cn(
              "border-border/50 border-b bg-background transition-all",
              isExpanded
                ? "sticky top-0 z-50 px-4 py-2.5 shadow-sm"
                : "rounded-t-[24px] px-4 pt-6 pb-3"
            )}
          >
            <h1
              className={cn(
                "font-normal",
                isExpanded
                  ? "truncate text-xl"
                  : "mb-3 text-[36px] leading-[36px]"
              )}
              style={{ fontFamily: "var(--font-recoleta), serif" }}
            >
              {bien.denominacion}
            </h1>

            {/* Player de audio */}
            <div
              className={cn("flex items-center gap-3", isExpanded && "mt-2")}
            >
              {/* Elemento audio oculto */}
              {/* biome-ignore lint: Audio is for audioguide, captions not needed */}
              <audio preload="metadata" ref={audioRef} src={audioUrl} />

              <button
                aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
                  isExpanded ? "h-8 w-8" : "h-10 w-10"
                )}
                disabled={isLoading}
                onClick={handlePlayPause}
                type="button"
              >
                {isLoading ? (
                  <svg
                    className={cn(
                      "animate-spin",
                      isExpanded ? "h-4 w-4" : "h-5 w-5"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                ) : isPlaying ? (
                  <svg
                    className={cn(
                      "fill-currentColor",
                      isExpanded ? "h-4 w-4" : "h-5 w-5"
                    )}
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className={cn(
                      "fill-currentColor",
                      isExpanded ? "ml-0.5 h-4 w-4" : "ml-0.5 h-5 w-5"
                    )}
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <div className="py-1.5">
                  <button
                    aria-label="Cambiar posición del audio"
                    className="group relative h-1 w-full overflow-hidden rounded-full bg-muted transition-colors hover:bg-muted/80"
                    onClick={handleProgressClick}
                    type="button"
                  >
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </button>
                </div>
                {!isExpanded && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    {duration > 0
                      ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                      : bien.audioDuracion}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Body con contenido scrolleable */}
          <div
            className="bg-background px-4 py-6"
            style={{ paddingBottom: `${NAV_BAR_HEIGHT + 24}px` }}
          >
            <div className="prose prose-base dark:prose-invert max-w-none">
              <p className="whitespace-pre-line text-base text-gray-600 leading-relaxed dark:text-gray-400">
                {bien.texto}
              </p>
            </div>

            {/* Separador */}
            <div className="my-8 h-px bg-border" />

            {/* Card de Siguiente Parada o Volver al mapa */}
            <div className="mb-6">
              <h2
                className="mb-4 font-normal text-xl"
                style={{ fontFamily: "var(--font-recoleta), serif" }}
              >
                {siguienteParada.id === "mapa"
                  ? "Finalizar ruta"
                  : "Siguiente Parada"}
              </h2>
              <button
                className="w-full text-left"
                onClick={() => {
                  if (siguienteParada.id === "mapa") {
                    window.location.href = `/ruta/${rutaId}`;
                  } else {
                    window.location.href = `/ruta/${rutaId}/bien/${siguienteParada.id}`;
                  }
                }}
                type="button"
              >
                <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {siguienteImageError ? (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-2xl text-muted-foreground">
                        🖼️
                      </div>
                    ) : (
                      <>
                        {/* biome-ignore lint: onError is a valid React handler for img elements */}
                        <img
                          alt={siguienteParada.denominacion}
                          className="absolute inset-0 h-full w-full object-cover"
                          height={64}
                          onError={() => {
                            setSiguienteImageError(true);
                          }}
                          src={siguienteParada.imagen}
                          width={64}
                        />
                        <div className="absolute inset-0 bg-black/30" />
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="truncate font-medium text-foreground"
                      style={{ fontFamily: "var(--font-recoleta), serif" }}
                    >
                      {siguienteParada.denominacion}
                    </h3>
                    {siguienteParada.tiempo && siguienteParada.distancia && (
                      <p className="mt-1 text-muted-foreground text-sm">
                        {siguienteParada.tiempo} ({siguienteParada.distancia})
                      </p>
                    )}
                  </div>
                  <svg
                    className="h-5 w-5 shrink-0 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de navegación */}
      <NavBar rutaId={rutaId} />
    </div>
  );
}
