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
    throw new Error("La URL o el archivo es requerido");
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

  // Primero obtener la URL de la imagen para eliminarla de Vercel Blob si es necesario
  const { data: imagen, error: errorGet } = await supabase
    .from("imagenes_bienes")
    .select("url")
    .eq("id", imagenId)
    .single();

  if (errorGet) {
    throw new Error(`Error al obtener la imagen: ${errorGet.message}`);
  }

  // Eliminar de la base de datos
  const { error } = await supabase
    .from("imagenes_bienes")
    .delete()
    .eq("id", imagenId);

  if (error) {
    throw new Error(`Error al eliminar la imagen: ${error.message}`);
  }

  // Si la URL es de Supabase Storage, eliminar el archivo también
  if (imagen?.url && imagen.url.includes("supabase.co/storage")) {
    try {
      // Extraer el path del archivo de la URL
      // Formato: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const urlParts = imagen.url.split("/storage/v1/object/public/");
      if (urlParts.length === 2) {
        const pathWithBucket = urlParts[1];
        const firstSlash = pathWithBucket.indexOf("/");
        
        if (firstSlash > 0) {
          const bucket = pathWithBucket.substring(0, firstSlash);
          const filePath = pathWithBucket.substring(firstSlash + 1);

          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

          if (deleteError) {
            console.warn("No se pudo eliminar la imagen de Supabase Storage:", deleteError);
          }
        }
      }
    } catch (storageError) {
      // No fallar si no se puede eliminar de Storage, solo loguear
      console.warn("Error al eliminar imagen de Supabase Storage:", storageError);
    }
  }

  redirect(`/panel/bienes/${bienId}`);
}

export async function marcarImagenPrincipal(
  imagenId: string,
  bienId: string
) {
  const supabase = await createClient();

  // Primero, desmarcar todas las imágenes como principales
  const { error: errorDesmarcar } = await supabase
    .from("imagenes_bienes")
    .update({ es_principal: false })
    .eq("bien_id", bienId);

  if (errorDesmarcar) {
    throw new Error(
      `Error al desmarcar imágenes principales: ${errorDesmarcar.message}`
    );
  }

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

  // No hacer redirect aquí, el componente cliente lo manejará
  return { success: true };
}
