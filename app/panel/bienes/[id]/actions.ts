"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type BienUpdate = Database["public"]["Tables"]["bienes"]["Update"];

export async function actualizarBienCapa1(
  bienId: string,
  formData: FormData
) {
  const supabase = await createClient();

  // Obtener valores del formulario
  const denominacion = formData.get("denominacion") as string;
  const tipo_contenido = formData.get("tipo_contenido") as
    | "inmueble"
    | "mueble"
    | "inmaterial"
    | "ruta"
    | "paisaje"
    | null;
  const caracterizacion = formData.get("caracterizacion") as string;
  const tipologia = formData.get("tipologia") as string;
  const periodos = formData.get("periodos") as string;
  const cronologia_inicio = formData.get("cronologia_inicio") as string;
  const cronologia_fin = formData.get("cronologia_fin") as string;
  const estilos = formData.get("estilos") as string;
  const proteccion = formData.get("proteccion") as string;
  const direccion = formData.get("direccion") as string;
  const municipio = formData.get("municipio") as string;
  const provincia = formData.get("provincia") as string;
  const region = formData.get("region") as string;
  const pais = formData.get("pais") as string;
  const lat = formData.get("lat") as string;
  const lon = formData.get("lon") as string;
  const direccion_humana = formData.get("direccion_humana") as string;
  const indicaciones_llegada = formData.get("indicaciones_llegada") as string;
  const descripcion_fisica = formData.get("descripcion_fisica") as string;
  const descripcion_artistica = formData.get("descripcion_artistica") as string;
  const datos_historicos = formData.get("datos_historicos") as string;
  const completitud_ficha = formData.get("completitud_ficha") as
    | "rica"
    | "media"
    | "pobre"
    | null;

  // Validar campo requerido
  if (!denominacion || denominacion.trim() === "") {
    throw new Error("La denominación es requerida");
  }

  // Preparar datos para actualizar
  const datosActualizados: BienUpdate = {
    denominacion: denominacion.trim(),
    tipo_contenido: tipo_contenido || null,
    caracterizacion: caracterizacion ? caracterizacion.trim() : null,
    tipologia: tipologia
      ? tipologia.split(",").map((t) => t.trim()).filter(Boolean)
      : null,
    periodos: periodos
      ? periodos.split(",").map((p) => p.trim()).filter(Boolean)
      : null,
    cronologia_inicio: cronologia_inicio
      ? Number.parseInt(cronologia_inicio, 10)
      : null,
    cronologia_fin: cronologia_fin
      ? Number.parseInt(cronologia_fin, 10)
      : null,
    estilos: estilos
      ? estilos.split(",").map((e) => e.trim()).filter(Boolean)
      : null,
    proteccion: proteccion ? proteccion.trim() : null,
    direccion: direccion ? direccion.trim() : null,
    municipio: municipio ? municipio.trim() : null,
    provincia: provincia ? provincia.trim() : null,
    region: region ? region.trim() : null,
    pais: pais ? pais.trim() : null,
    lat: lat ? Number.parseFloat(lat) : null,
    lon: lon ? Number.parseFloat(lon) : null,
    direccion_humana: direccion_humana ? direccion_humana.trim() : null,
    indicaciones_llegada: indicaciones_llegada
      ? indicaciones_llegada.trim()
      : null,
    descripcion_fisica: descripcion_fisica ? descripcion_fisica.trim() : null,
    descripcion_artistica: descripcion_artistica
      ? descripcion_artistica.trim()
      : null,
    datos_historicos: datos_historicos ? datos_historicos.trim() : null,
    completitud_ficha: completitud_ficha || null,
  };

  // Actualizar en la base de datos
  const { error } = await supabase
    .from("bienes")
    .update(datosActualizados)
    .eq("id", bienId);

  if (error) {
    throw new Error(`Error al actualizar el bien: ${error.message}`);
  }

  // No redirigir, solo recargar la página
  redirect(`/panel/bienes/${bienId}`);
}
