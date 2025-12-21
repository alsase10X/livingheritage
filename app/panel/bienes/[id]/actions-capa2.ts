"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type BienUpdate = Database["public"]["Tables"]["bienes"]["Update"];

export async function actualizarBienCapa2(
  bienId: string,
  formData: FormData
) {
  const supabase = await createClient();

  // Narrativa central
  const tema_principal = formData.get("tema_principal") as string;
  const subtemas = formData.get("subtemas") as string;
  const relato_interpretativo = formData.get("relato_interpretativo") as string;

  // Preguntas provocadoras (textarea, una por línea)
  const preguntas_provocadoras_text = formData.get(
    "preguntas_provocadoras"
  ) as string;

  // Conexiones
  const conexiones_actuales = formData.get("conexiones_actuales") as string;

  // Control editorial
  const estado_capa_2 = formData.get("estado_capa_2") as
    | "borrador"
    | "revisada"
    | "publicada"
    | null;

  // Mensaje de bienvenida
  const generar_bienvenida_auto = formData.get("generar_bienvenida_auto") === "true";
  const mensaje_bienvenida = formData.get("mensaje_bienvenida") as string;

  // Mensajes clave (JSONB array)
  const mensajes_clave_text = formData.get("mensajes_clave") as string;
  let mensajes_clave = null;
  if (mensajes_clave_text && mensajes_clave_text.trim() !== "") {
    try {
      const parsed = JSON.parse(mensajes_clave_text) as Array<{
        mensaje: string;
        desarrollo?: string;
        fuente?: string;
      }>;
      // Filtrar mensajes vacíos
      const mensajesValidos = parsed.filter(
        (m) => m.mensaje && m.mensaje.trim() !== ""
      );
      mensajes_clave = mensajesValidos.length > 0 ? mensajesValidos : null;
    } catch {
      mensajes_clave = null;
    }
  }

  // Anécdotas (JSONB array)
  const anecdotas_text = formData.get("anecdotas") as string;
  let anecdotas = null;
  if (anecdotas_text && anecdotas_text.trim() !== "") {
    try {
      const parsed = JSON.parse(anecdotas_text) as Array<{
        titulo: string;
        contenido: string;
        verificada: boolean;
      }>;
      // Filtrar anécdotas vacías
      const anecdotasValidas = parsed.filter(
        (a) => a.titulo && a.titulo.trim() !== ""
      );
      anecdotas = anecdotasValidas.length > 0 ? anecdotasValidas : null;
    } catch {
      anecdotas = null;
    }
  }

  // Preparar datos para actualizar (sin campos de bienvenida primero)
  const datosActualizados: BienUpdate = {
    tema_principal: tema_principal ? tema_principal.trim() : null,
    subtemas: subtemas
      ? subtemas.split(",").map((s) => s.trim()).filter(Boolean)
      : null,
    relato_interpretativo: relato_interpretativo
      ? relato_interpretativo.trim()
      : null,
    preguntas_provocadoras: preguntas_provocadoras_text
      ? preguntas_provocadoras_text
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean)
      : null,
    conexiones_actuales: conexiones_actuales
      ? conexiones_actuales.trim()
      : null,
    mensajes_clave: mensajes_clave,
    anecdotas: anecdotas,
    estado_capa_2: estado_capa_2 || null,
    tiene_capa_2: true,
    fecha_capa_2: new Date().toISOString(),
  };

  // Actualizar primero los campos principales (sin bienvenida)
  const { error: errorPrincipal } = await supabase
    .from("bienes")
    .update(datosActualizados)
    .eq("id", bienId);

  if (errorPrincipal) {
    throw new Error(`Error al actualizar la Capa 2: ${errorPrincipal.message}`);
  }

  // Intentar actualizar los campos de bienvenida (puede fallar si las columnas no existen)
  const datosBienvenida: BienUpdate = {
    generar_bienvenida_auto: generar_bienvenida_auto,
    mensaje_bienvenida: mensaje_bienvenida && mensaje_bienvenida.trim() !== "" 
      ? mensaje_bienvenida.trim() 
      : null,
  };

  const { error: errorBienvenida } = await supabase
    .from("bienes")
    .update(datosBienvenida)
    .eq("id", bienId);

  if (errorBienvenida) {
    // Si las columnas no existen, informar al usuario pero no fallar
    if (errorBienvenida.message.includes("generar_bienvenida_auto") || 
        errorBienvenida.message.includes("schema cache")) {
      throw new Error(
        `⚠️ Las columnas de mensaje de bienvenida no existen aún en la base de datos.\n\n` +
        `Los demás campos se guardaron correctamente, pero para usar el mensaje de bienvenida, ` +
        `ejecuta esta migración SQL en Supabase:\n\n` +
        `ALTER TABLE bienes\n` +
        `ADD COLUMN IF NOT EXISTS generar_bienvenida_auto BOOLEAN DEFAULT true,\n` +
        `ADD COLUMN IF NOT EXISTS mensaje_bienvenida TEXT;`
      );
    }
    // Si es otro error, lanzarlo normalmente
    throw new Error(`Error al actualizar los campos de bienvenida: ${errorBienvenida.message}`);
  }

  redirect(`/panel/bienes/${bienId}`);
}
