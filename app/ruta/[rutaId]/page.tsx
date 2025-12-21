"use client";

import { ArrowLeft, List } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavBar } from "@/components/ruta/NavBar";
import {
  type Punto as PuntoCarousel,
  PuntosCarousel,
} from "@/components/ruta/PuntosCarousel";
import { type Punto as PuntoMap, RutaMap } from "@/components/ruta/RutaMap";
import { Button } from "@/components/ui/button";

type Punto = PuntoMap &
  PuntoCarousel & {
    descripcion: string;
    imagen: string;
    audio: string;
  };

type Ruta = {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  distancia: string;
  puntos: Punto[];
  polyline: [number, number][];
};

export default function RutaMapPage() {
  const params = useParams();
  const router = useRouter();
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [puntoActivo, setPuntoActivo] = useState<Punto | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rutaId = params.rutaId as string;

    // Cargar datos mock
    fetch(`/data/rutas/${rutaId}.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ruta no encontrada");
        }
        return res.json();
      })
      .then((data: Ruta) => {
        setRuta(data);
        // Establecer el primer punto como activo por defecto
        setPuntoActivo(data.puntos[0] || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando ruta:", error);
        setLoading(false);
      });
  }, [params.rutaId]);

  // Obtener geolocalización del usuario
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        },
        () => {
          // GPS no disponible o denegado - no hacer nada
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handlePuntoSelect = (puntoMap: PuntoMap | PuntoCarousel) => {
    // Encontrar el punto completo en la ruta
    const puntoCompleto = ruta?.puntos.find((p) => p.id === puntoMap.id);
    if (puntoCompleto) {
      setPuntoActivo(puntoCompleto);
    }
  };

  const irAlPunto = (punto: PuntoCarousel) => {
    if (params.rutaId) {
      router.push(`/ruta/${params.rutaId}/bien/${punto.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!ruta) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-white">Ruta no encontrada</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-black">
      {/* Header */}
      <header className="flex items-center justify-between bg-zinc-900 px-4 py-3">
        <Button
          className="h-8 w-8 shrink-0 p-0"
          onClick={() => router.back()}
          size="icon"
          variant="ghost"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="flex-1 text-center font-medium text-white">
          {ruta.nombre}
        </h1>
        <Button
          className="h-8 shrink-0 px-3 text-sm"
          onClick={() => {
            // TODO: Implementar vista de lista
          }}
          variant="ghost"
        >
          <List className="mr-2 h-4 w-4" />
          Lista
        </Button>
      </header>

      {/* Mapa */}
      <div className="relative flex-1">
        <RutaMap
          onPuntoSelect={handlePuntoSelect}
          polyline={ruta.polyline}
          puntoActivoId={puntoActivo?.id}
          puntos={ruta.puntos.map((p, index) => ({
            id: p.id,
            orden: p.orden,
            nombre: p.nombre,
            lat: p.lat,
            lng: p.lng,
            imagen: p.imagen,
            // Por ahora, mostrar imagen en algunos puntos aleatorios para prueba
            // Más adelante esto se marcará de alguna forma en los datos
            mostrarImagen: index % 3 === 0 && p.imagen, // Cada tercer punto que tenga imagen
          }))}
        />

        {/* Carrusel de puntos - sobre el mapa */}
        <PuntosCarousel
          onIrAlPunto={irAlPunto}
          onPuntoSelect={handlePuntoSelect}
          puntoActivoId={puntoActivo?.id}
          puntos={ruta.puntos.map((p) => ({
            id: p.id,
            orden: p.orden,
            nombre: p.nombre,
            lat: p.lat,
            lng: p.lng,
            descripcion: p.descripcion,
            imagen: p.imagen,
            audio: p.audio,
          }))}
          userLocation={userLocation}
        />
      </div>

      {/* Barra de navegación */}
      <NavBar rutaId={params.rutaId as string} />
    </div>
  );
}
