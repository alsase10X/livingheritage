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
      <div className="flex items-center justify-between px-4 py-4 md:py-6">
        <h2 className="text-2xl md:text-3xl tracking-tight text-center flex-1 truncate" style={{ fontFamily: 'var(--font-recoleta), serif' }}>
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
      <div className="relative flex-1 overflow-hidden px-4 py-6">
        <div className="relative h-full w-full rounded-lg overflow-hidden">
          <NextImage
            src={imageUrl}
            alt={title}
            fill
            className="object-contain rounded-lg"
            priority
            unoptimized
          />

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

      {/* Botón Fuentes de Información */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span>Fuentes de Información</span>
          <ChevronUp
            className={cn(
              "h-4 w-4 transition-transform",
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

