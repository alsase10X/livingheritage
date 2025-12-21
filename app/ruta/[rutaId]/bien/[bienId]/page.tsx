import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BienBottomSheet } from "@/components/lh/BienBottomSheet";

interface Punto {
  id: string;
  orden: number;
  nombre: string;
  descripcion: string;
  textoCompleto?: string;
  lat: number;
  lng: number;
  imagen: string;
  audio: string;
}

interface Ruta {
  id: string;
  nombre: string;
  puntos: Punto[];
}

function BienSkeleton() {
  return (
    <div className="flex h-dvh w-full">
      <div className="w-full animate-pulse bg-muted" />
    </div>
  );
}

async function CargarBien({
  params,
}: {
  params: Promise<{ rutaId: string; bienId: string }>;
}) {
  const { rutaId, bienId } = await params;

  // Cargar datos de la ruta desde el JSON
  let ruta: Ruta;
  try {
    // En el servidor, leer el archivo directamente
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "rutas",
      `${rutaId}.json`
    );
    const fileContents = await fs.readFile(filePath, "utf8");
    ruta = JSON.parse(fileContents) as Ruta;
  } catch (error) {
    console.error("Error cargando ruta:", error);
    return notFound();
  }

  // Buscar el punto con el bienId
  const punto = ruta.puntos.find((p) => p.id === bienId);
  if (!punto) {
    return notFound();
  }

  // Mapear el punto a la estructura esperada por BienBottomSheet
  const bien = {
    id: punto.id,
    denominacion: punto.nombre,
    imagen: punto.imagen,
    texto: punto.textoCompleto || punto.descripcion,
    audioDuracion: "1:30", // Por ahora fijo, luego se puede calcular desde el audio
    audioUrl: punto.audio, // URL del audio desde el JSON
  };

  // Buscar el siguiente punto (orden + 1)
  const siguientePunto = ruta.puntos.find(
    (p) => p.orden === punto.orden + 1
  );

  // Si hay siguiente punto, crear la estructura de siguienteParada
  // Si no, crear una estructura para "Volver al mapa"
  const siguienteParada = siguientePunto
    ? {
        id: siguientePunto.id,
        denominacion: siguientePunto.nombre,
        imagen: siguientePunto.imagen,
        tiempo: "5min", // Por ahora fijo, luego se puede calcular
        distancia: "660m", // Por ahora fijo, luego se puede calcular
      }
    : {
        id: "mapa",
        denominacion: "Volver al mapa",
        imagen: "/images/rutas/cadiz-1812/portada.jpg", // Imagen de la ruta
        tiempo: "",
        distancia: "",
      };

  // Datos del guía
  const guiaMock = {
    nombre: "María",
    avatar: "", // placeholder, se mostrará emoji
    rol: "Tu guía en esta ruta",
  };

  return (
    <BienBottomSheet
      bien={bien}
      bienId={bienId}
      guia={guiaMock}
      rutaId={rutaId}
      siguienteParada={siguienteParada}
    />
  );
}

export default function BienRutaPage({
  params,
}: {
  params: Promise<{ rutaId: string; bienId: string }>;
}) {
  return (
    <div className="flex h-dvh w-full justify-center bg-gray-900">
      <div className="relative h-dvh w-full max-w-[430px]">
        <Suspense fallback={<BienSkeleton />}>
          <CargarBien params={params} />
        </Suspense>
      </div>
    </div>
  );
}
