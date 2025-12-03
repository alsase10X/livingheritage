"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ImagenInsert = Database["public"]["Tables"]["imagenes_bienes"]["Insert"];

export async function agregarImagen(
  bienId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const url = formData.get("url") as string;
  const titulo = formData.get("titulo") as string;
  const autor = formData.get("autor") as string;

  if (!url || url.trim() === "") {
    throw new Error("La URL es requerida");
  }

  // Contar cuántas imágenes ya tiene el bien para determinar el orden
  const { count } = await supabase
    .from("imagenes_bienes")
    .select("id", { count: "exact", head: true })
    .eq("bien_id", bienId);

  const nuevaImagen: ImagenInsert = {
    bien_id: bienId,
    url: url.trim(),
    titulo: titulo ? titulo.trim() : null,
    autor: autor ? autor.trim() : null,
    es_principal: false,
    orden: (count || 0) + 1,
  };

  const { error } = await supabase
    .from("imagenes_bienes")
    .insert(nuevaImagen);

  if (error) {
    throw new Error(`Error al agregar la imagen: ${error.message}`);
  }

  redirect(`/panel/bienes/${bienId}`);
}

export async function eliminarImagen(imagenId: string, bienId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("imagenes_bienes")
    .delete()
    .eq("id", imagenId);

  if (error) {
    throw new Error(`Error al eliminar la imagen: ${error.message}`);
  }

  redirect(`/panel/bienes/${bienId}`);
}

export async function marcarImagenPrincipal(
  imagenId: string,
  bienId: string
) {
  const supabase = await createClient();

  // Primero, desmarcar todas las imágenes como principales
  await supabase
    .from("imagenes_bienes")
    .update({ es_principal: false })
    .eq("bien_id", bienId);

  // Luego, marcar la seleccionada como principal
  const { error } = await supabase
    .from("imagenes_bienes")
    .update({ es_principal: true })
    .eq("id", imagenId);

  if (error) {
    throw new Error(
      `Error al marcar la imagen como principal: ${error.message}`
    );
  }

  redirect(`/panel/bienes/${bienId}`);
}
