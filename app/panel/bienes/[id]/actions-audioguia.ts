"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type BienUpdate = Database["public"]["Tables"]["bienes"]["Update"];

export async function actualizarBienAudioguia(
  bienId: string,
  formData: FormData
) {
  const supabase = await createClient();

  // Configuración
  const tiene_audioguia = formData.get("tiene_audioguia") === "true";
  const duracion_objetivo = formData.get("duracion_objetivo") as string;
  const nivel_importancia = formData.get("nivel_importancia") as
    | "destacado"
    | "importante"
    | "menor"
    | null;

  // Notas de locución
  const tono_audioguia = formData.get("tono_audioguia") as string;

  // Control editorial
  const estado_audioguia = formData.get("estado_audioguia") as
    | "borrador"
    | "revisada"
    | "publicada"
    | null;

  // Guion audio (JSONB)
  const guion_audio_text = formData.get("guion_audio") as string;
  let guion_audio = null;

  if (guion_audio_text && guion_audio_text.trim() !== "") {
    try {
      const parsed = JSON.parse(guion_audio_text) as {
        gancho?: { tipo?: string; texto?: string };
        desarrollo?: { tema_elegido?: string; puntos?: Array<{ texto?: string; referencia_visual?: string }> };
        remate?: { tipo?: string; texto?: string };
      };

      // Validar y construir el objeto guion_audio
      guion_audio = {
        gancho: parsed.gancho || null,
        desarrollo: parsed.desarrollo || null,
        remate: parsed.remate || null,
      };

      // Si está vacío, poner null
      if (
        !guion_audio.gancho &&
        !guion_audio.desarrollo &&
        !guion_audio.remate
      ) {
        guion_audio = null;
      }
    } catch {
      guion_audio = null;
    }
  }

  // Preparar datos para actualizar
  const datosActualizados: BienUpdate = {
    tiene_audioguia: tiene_audioguia,
    duracion_objetivo: duracion_objetivo
      ? Number.parseInt(duracion_objetivo, 10)
      : null,
    nivel_importancia: nivel_importancia || null,
    tono_audioguia: tono_audioguia ? tono_audioguia.trim() : null,
    estado_audioguia: estado_audioguia || null,
    guion_audio: guion_audio,
    fecha_audioguia: tiene_audioguia ? new Date().toISOString() : null,
  };

  // Actualizar en la base de datos
  const { error } = await supabase
    .from("bienes")
    .update(datosActualizados)
    .eq("id", bienId);

  if (error) {
    throw new Error(`Error al actualizar la audioguía: ${error.message}`);
  }

  redirect(`/panel/bienes/${bienId}`);
}
