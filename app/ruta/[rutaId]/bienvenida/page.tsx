"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Ruta {
  id: string;
  nombre: string;
  subtitulo: string;
  fraseGuia: string;
  imagenPortada: string;
  duracion: string;
  distancia: string;
  numPuntos: number;
  puntos: unknown[];
}

export default function BienvenidaPage() {
  const params = useParams();
  const router = useRouter();
  const [ruta, setRuta] = useState<Ruta | null>(null);
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
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando ruta:", error);
        setLoading(false);
      });
  }, [params.rutaId]);

  const empezarRuta = () => {
    const rutaId = params.rutaId as string;
    router.push(`/ruta/${rutaId}`);
  };

  const verMapa = () => {
    const rutaId = params.rutaId as string;
    router.push(`/ruta/${rutaId}`);
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
    <div className="pantalla-bienvenida">
      {/* Imagen hero */}
      <div className="hero-image">
        {ruta.imagenPortada ? (
          <Image
            src={ruta.imagenPortada}
            alt={ruta.nombre}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800">
            <span className="text-zinc-500">Imagen de portada</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="contenido">
        <h1>{ruta.nombre}</h1>
        <p className="subtitulo">{ruta.subtitulo}</p>
        <p className="voz-guia">&quot;{ruta.fraseGuia}&quot;</p>

        <button type="button" className="cta-empezar" onClick={empezarRuta}>
          ▶ Empezar ruta
        </button>

        <p className="microcopy-sonido">
          🔊 Activa el sonido para la mejor experiencia
        </p>

        <button type="button" className="link-mapa" onClick={verMapa}>
          Ver mapa
        </button>
      </div>
    </div>
  );
}
