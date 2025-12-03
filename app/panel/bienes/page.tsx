import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Bien = Database["public"]["Tables"]["bienes"]["Row"];

function getEstadoIconoCapa1(bien: Bien) {
  const tieneDatosBasicos =
    bien.descripcion_fisica ||
    bien.descripcion_artistica ||
    bien.datos_historicos;
  const tieneLocalizacion = bien.lat && bien.lon;
  const tieneAgentes =
    bien.agentes && JSON.parse(JSON.stringify(bien.agentes)).length > 0;

  if (tieneDatosBasicos && tieneLocalizacion && tieneAgentes) {
    return "🟢";
  }
  if (tieneDatosBasicos || tieneLocalizacion) {
    return "🟡";
  }
  return "🔴";
}

function getEstadoIcono(estado: string | null, tiene: boolean | null) {
  if (!tiene) return "⚪";
  if (estado === "publicada") return "🟢";
  if (estado === "revisada" || estado === "borrador") return "🟡";
  return "⚪";
}

function getCompletitudColor(completitud: string | null) {
  switch (completitud) {
    case "rica":
      return "text-green-600";
    case "media":
      return "text-yellow-600";
    case "pobre":
      return "text-red-600";
    default:
      return "text-gray-500";
  }
}

async function BienesList() {
  const supabase = await createClient();

  const { data: bienes, error } = await supabase
    .from("bienes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-600">
        Error al cargar los bienes: {error.message}
      </div>
    );
  }

  // Obtener imágenes principales para cada bien
  const bienesConImagenes = await Promise.all(
    (bienes || []).map(async (bien) => {
      const { data: imagenPrincipal } = await supabase
        .from("imagenes_bienes")
        .select("url")
        .eq("bien_id", bien.id)
        .eq("es_principal", true)
        .single();

      return {
        ...bien,
        imagenPrincipal: imagenPrincipal?.url || null,
      };
    })
  );

  if (bienesConImagenes && bienesConImagenes.length > 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-gray-50 rounded-lg overflow-hidden">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="text-left p-2 text-gray-900 font-semibold">Imagen</th>
              <th className="text-left p-2 text-gray-900 font-semibold">Denominación</th>
              <th className="text-left p-2 text-gray-900 font-semibold">Municipio</th>
              <th className="text-left p-2 text-gray-900 font-semibold">Tipología</th>
              <th className="text-left p-2 text-gray-900 font-semibold">Periodo</th>
              <th className="text-left p-2 text-gray-900 font-semibold">Estado de contenido</th>
              <th className="text-left p-2 text-gray-900 font-semibold">Completitud</th>
              <th className="text-left p-2 text-gray-900 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bienesConImagenes.map((bien) => (
              <tr key={bien.id} className="border-b hover:bg-gray-100 bg-white">
                <td className="p-2">
                  {bien.imagenPrincipal ? (
                    <div className="relative w-16 h-16">
                      <Image
                        alt={bien.denominacion}
                        className="object-cover rounded"
                        fill
                        sizes="64px"
                        src={bien.imagenPrincipal}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      Sin img
                    </div>
                  )}
                </td>
                <td className="p-2 font-medium text-gray-900">{bien.denominacion}</td>
                <td className="p-2 text-gray-700">{bien.municipio || "-"}</td>
                <td className="p-2">
                  {bien.tipologia && bien.tipologia.length > 0
                    ? bien.tipologia.join(", ")
                    : "-"}
                </td>
                <td className="p-2">
                  {bien.periodos && bien.periodos.length > 0
                    ? bien.periodos.join(", ")
                    : "-"}
                </td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <span title="Capa 1">{getEstadoIconoCapa1(bien)}</span>
                    <span title="Capa 2">
                      {getEstadoIcono(bien.estado_capa_2, bien.tiene_capa_2)}
                    </span>
                    <span title="Audioguía">
                      {getEstadoIcono(
                        bien.estado_audioguia,
                        bien.tiene_audioguia
                      )}
                    </span>
                  </div>
                </td>
                <td className="p-2">
                  <span
                    className={`font-medium ${getCompletitudColor(
                      bien.completitud_ficha
                    )}`}
                  >
                    {bien.completitud_ficha || "-"}
                  </span>
                </td>
                <td className="p-2">
                  <Link
                    href={`/panel/bienes/${bien.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="text-center py-12 text-gray-500">
      No hay bienes registrados aún.
    </div>
  );
}

function BienesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BienesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bienes</h1>
        <div className="flex gap-2">
          <Link
            href="/panel/importar"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Importar IAPH
          </Link>
          <Link
            href="/panel/bienes/nuevo"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Nuevo bien
          </Link>
        </div>
      </div>

      <Suspense fallback={<BienesListSkeleton />}>
        <BienesList />
      </Suspense>
    </div>
  );
}