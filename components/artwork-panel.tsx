"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NextImage from "next/image";

type ArtworkPanelProps = {
  imageUrl: string;
  title: string;
  onClose?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
};

export function ArtworkPanel({
  imageUrl,
  title,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: ArtworkPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative flex h-full w-full flex-col bg-background">
      {/* Top bar con título */}
      <div className="flex items-center justify-between px-6 md:px-8 py-2 md:py-3">
        <h2 className="text-4xl md:text-5xl tracking-tight text-center flex-1 break-words" style={{ fontFamily: 'var(--font-recoleta), serif' }}>
          {title}
        </h2>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Panel de imagen */}
      <div className="relative flex-1 overflow-hidden px-6 py-2">
        <div className="relative h-full w-full flex items-center justify-center">
          <div 
            className="relative w-full h-full max-w-[90%] max-h-[90%] rounded-2xl overflow-hidden border border-border/50 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${imageUrl})` }}
          >
            {/* Flechas de navegación */}
            {hasPrevious && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 hover:bg-background"
                onClick={onPrevious}
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            {hasNext && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 hover:bg-background"
                onClick={onNext}
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Botón Fuentes de Información */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-center relative"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span>Fuentes de Información</span>
          <ChevronUp
            className={cn(
              "h-4 w-4 transition-transform absolute right-4",
              showDetails && "rotate-180"
            )}
          />
        </Button>

        {showDetails && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
            {/* Aquí puedes agregar los detalles del objeto */}
            <p className="text-muted-foreground">
              Detalles del objeto aparecerán aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

