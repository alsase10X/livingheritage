"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type BienInsert = Database["public"]["Tables"]["bienes"]["Insert"];

export async function crearBien(formData: FormData) {
  const supabase = await createClient();

  // Obtener valores del formulario
  const denominacion = formData.get("denominacion") as string;
  const tipo_contenido = formData.get("tipo_contenido") as
    | "inmueble"
    | "mueble"
    | "inmaterial"
    | null;
  const tipologia = formData.get("tipologia") as string;
  const periodo = formData.get("periodo") as string;
  const municipio = formData.get("municipio") as string;
  const provincia = formData.get("provincia") as string;
  const region = formData.get("region") as string;
  const pais = formData.get("pais") as string;
  const descripcion_fisica = formData.get("descripcion_fisica") as string;

  // Validar campo requerido
  if (!denominacion || denominacion.trim() === "") {
    throw new Error("La denominación es requerida");
  }

  // Preparar datos para insertar
  const nuevoBien: BienInsert = {
    denominacion: denominacion.trim(),
    tipo_contenido: tipo_contenido || null,
    tipologia: tipologia ? [tipologia.trim()] : null,
    periodos: periodo ? [periodo.trim()] : null,
    municipio: municipio ? municipio.trim() : null,
    provincia: provincia ? provincia.trim() : null,
    region: region ? region.trim() : null,
    pais: pais ? pais.trim() : null,
    descripcion_fisica: descripcion_fisica ? descripcion_fisica.trim() : null,
    source_system: "Manual",
    source_record_id: null,
    completitud_ficha: "pobre",
  };

  // Insertar en la base de datos
  const { data, error } = await supabase
    .from("bienes")
    .insert(nuevoBien)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear el bien: ${error.message}`);
  }

  // Redirigir a la lista de bienes
  redirect("/panel/bienes");
}
