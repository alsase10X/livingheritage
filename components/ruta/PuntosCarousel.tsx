"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  calcularDistancia,
  calcularTiempo,
  formatearDistancia,
} from "@/lib/geo";

export interface Punto {
  id: string;
  orden: number;
  nombre: string;
  lat: number;
  lng: number;
  descripcion?: string;
  imagen?: string;
  audio?: string;
}

interface PuntosCarouselProps {
  puntos: Punto[];
  puntoActivoId?: string;
  userLocation?: [number, number] | null;
  onPuntoSelect: (punto: Punto) => void;
  onIrAlPunto: (punto: Punto) => void;
}

export function PuntosCarousel({
  puntos,
  puntoActivoId,
  userLocation,
  onPuntoSelect,
  onIrAlPunto,
}: PuntosCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isScrollingProgrammaticallyRef = useRef(false);
  const initialScrollDoneRef = useRef(false);

  // Scroll inicial al punto activo cuando se carga el componente
  useEffect(() => {
    if (initialScrollDoneRef.current || !puntoActivoId) {
      return;
    }

    const card = cardRefs.current.get(puntoActivoId);
    if (card && carouselRef.current) {
      initialScrollDoneRef.current = true;
      isScrollingProgrammaticallyRef.current = true;
      // Usar scrollTo para el scroll inicial sin animación
      const carousel = carouselRef.current;
      const cardRect = card.getBoundingClientRect();
      const carouselRect = carousel.getBoundingClientRect();
      const scrollLeft =
        card.offsetLeft - (carouselRect.width - cardRect.width) / 2;

      carousel.scrollTo({
        left: scrollLeft,
        behavior: "auto",
      });

      setTimeout(() => {
        isScrollingProgrammaticallyRef.current = false;
      }, 100);
    }
  }, [puntoActivoId]);

  // Detectar card centrada usando scroll event + scrollLeft
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) {
      return;
    }

    const handleScroll = () => {
      // Ignorar si el scroll es programático
      if (isScrollingProgrammaticallyRef.current) {
        return;
      }

      // Usar IntersectionObserver para detectar la card más centrada
      // como fallback más preciso que scrollLeft
      const carouselRect = carousel.getBoundingClientRect();
      const carouselCenter = carouselRect.left + carouselRect.width / 2;

      let closestCard: {
        elemento: HTMLDivElement;
        distancia: number;
        puntoId: string;
      } | null = null;

      cardRefs.current.forEach((card, puntoId) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distancia = Math.abs(cardCenter - carouselCenter);

        if (!closestCard || distancia < closestCard.distancia) {
          closestCard = {
            elemento: card,
            distancia,
            puntoId,
          };
        }
      });

      if (closestCard && closestCard.puntoId !== puntoActivoId) {
        const nuevoPunto = puntos.find((p) => p.id === closestCard.puntoId);
        if (nuevoPunto) {
          onPuntoSelect(nuevoPunto);
        }
      }
    };

    carousel.addEventListener("scroll", handleScroll);
    return () => {
      carousel.removeEventListener("scroll", handleScroll);
    };
  }, [puntos, puntoActivoId, onPuntoSelect]);

  // Scroll a la card del punto activo cuando cambia desde el mapa
  useEffect(() => {
    if (!puntoActivoId || isScrollingProgrammaticallyRef.current) {
      return;
    }

    const card = cardRefs.current.get(puntoActivoId);
    if (card && carouselRef.current) {
      // Verificar si la card ya está visible y centrada
      const carouselRect = carouselRef.current.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const carouselCenter = carouselRect.left + carouselRect.width / 2;
      const isAlreadyCentered = Math.abs(cardCenter - carouselCenter) < 50;

      if (!isAlreadyCentered) {
        isScrollingProgrammaticallyRef.current = true;
        card.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });

        // Resetear el flag después de la animación
        setTimeout(() => {
          isScrollingProgrammaticallyRef.current = false;
        }, 800);
      }
    }
  }, [puntoActivoId]);

  const calcularDistanciaUsuario = (
    punto: Punto
  ): {
    metros: number;
    texto: string;
  } | null => {
    if (!userLocation) {
      return null;
    }

    const distancia = calcularDistancia(
      userLocation[1],
      userLocation[0],
      punto.lat,
      punto.lng
    );

    return {
      metros: distancia,
      texto: formatearDistancia(distancia),
    };
  };

  const calcularDistanciaDesdeAnterior = (
    punto: Punto,
    indice: number
  ): { metros: number; texto: string } | null => {
    if (indice === 0) {
      return null;
    }

    const puntoAnterior = puntos[indice - 1];
    const distancia = calcularDistancia(
      puntoAnterior.lat,
      puntoAnterior.lng,
      punto.lat,
      punto.lng
    );

    return {
      metros: distancia,
      texto: formatearDistancia(distancia),
    };
  };

  return (
    <div className="cards-carousel-container px-4 pt-4 pb-4">
      <div className="cards-carousel" ref={carouselRef}>
        {puntos.map((punto, indice) => {
          const distanciaUsuario = calcularDistanciaUsuario(punto);
          const distanciaAnterior = calcularDistanciaDesdeAnterior(
            punto,
            indice
          );
          const distancia = distanciaUsuario ?? distanciaAnterior;
          const isActive = punto.id === puntoActivoId;

          return (
            <div
              className={`punto-card ${isActive ? "active" : ""}`}
              data-punto-id={punto.id}
              key={punto.id}
              onClick={() => onIrAlPunto(punto)}
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(punto.id, el);
                } else {
                  cardRefs.current.delete(punto.id);
                }
              }}
            >
              <img
                alt={punto.nombre}
                className="punto-card-imagen"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.jpg";
                }}
                src={punto.imagen || "/images/placeholder.jpg"}
              />
              <div className="punto-card-info">
                <p className="punto-card-nombre">
                  {punto.orden}. {punto.nombre}
                </p>
                {distancia && (
                  <p className="punto-card-meta">
                    {calcularTiempo(distancia.metros)} ({distancia.texto})
                  </p>
                )}
              </div>
              <ArrowRight className="punto-card-flecha" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
