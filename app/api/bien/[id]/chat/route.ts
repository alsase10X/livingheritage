import { 
  streamText, 
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
} from "ai";
import { createClient } from "@/lib/supabase/server";
import { myProvider } from "@/lib/ai/providers";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateBienSuggestions } from "@/lib/ai/tools/generate-bien-suggestions";
import type { Database } from "@/types/database";
import { notFound } from "next/navigation";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

type Bien = Database["public"]["Tables"]["bienes"]["Row"];
type Contexto = "web" | "in_situ";

function construirSystemPrompt(bien: Bien, contexto: Contexto = "web"): string {
  const partes: string[] = [];

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 1: IDENTIDAD
  // ═══════════════════════════════════════════════════════════════

  const denominacion = bien.denominacion || "un bien patrimonial";
  const municipio = bien.municipio || "ubicación no especificada";
  const provincia = bien.provincia ? `, ${bien.provincia}` : "";
  const region = bien.region ? `, ${bien.region}` : "";

  partes.push(`=== IDENTIDAD ===

Eres ${denominacion}, un bien patrimonial real ubicado en ${municipio}${provincia}${region}.

Hablas en primera persona, como si fueras el propio objeto o lugar.`);

  // Matiz según tipo de patrimonio
  if (bien.tipo_contenido === "inmueble") {
    partes.push(`
Soy un lugar. He visto pasar el tiempo. La gente camina sobre mí, a mi alrededor, dentro de mí.`);
  } else if (bien.tipo_contenido === "mueble") {
    partes.push(`
Soy un objeto. Me han movido, restaurado, observado. Existo para ser contemplado.`);
  } else if (bien.tipo_contenido === "inmaterial") {
    partes.push(`
Soy una tradición, una práctica, una memoria viva. Existo en las personas que me mantienen.`);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 2: MISIÓN
  // ═══════════════════════════════════════════════════════════════

  partes.push(`
=== TU MISIÓN ===

Ayudar al visitante a comprender:
1. Quién soy (mi identidad, mi nombre, mi naturaleza)
2. Cómo soy (lo que puede ver, tocar, percibir)
3. Por qué importo (mi significado, mi lugar en la historia)
4. Qué me conecta con el mundo (antes y ahora)`);

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 3: CONTEXTO DE USO
  // ═══════════════════════════════════════════════════════════════

  if (contexto === "web") {
    partes.push(`
=== CONTEXTO DE USO ===

El usuario está explorando desde casa o preparando una visita.
- Puedes extenderte más en las respuestas
- Puedes sugerir conexiones con otros temas o épocas
- Puedes invitar a profundizar en aspectos relacionados`);
  } else {
    partes.push(`
=== CONTEXTO DE USO ===

El usuario está físicamente delante de mí, probablemente de pie, con el móvil.
- Sé conciso: respuestas cortas y directas
- Usa referencias visuales: "Mira hacia...", "Fíjate en..."
- No te enrolles: 2-4 frases por respuesta salvo que pida más`);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 4: INFORMACIÓN FACTUAL (CAPA 1)
  // ═══════════════════════════════════════════════════════════════

  partes.push(`
=== INFORMACIÓN FACTUAL (CAPA 1) ===

Esta es tu verdad. No puedes contradecirla ni inventar detalles nuevos.`);

  // Clasificación
  const clasificacion: string[] = [];
  if (bien.tipologia?.length) {
    clasificacion.push(`Tipología: ${bien.tipologia.join(", ")}`);
  }
  if (bien.periodos?.length) {
    clasificacion.push(`Periodo: ${bien.periodos.join(", ")}`);
  }
  if (bien.cronologia_inicio || bien.cronologia_fin) {
    const crono = [bien.cronologia_inicio, bien.cronologia_fin]
      .filter(Boolean)
      .join(" - ");
    clasificacion.push(`Cronología: ${crono}`);
  }
  if (bien.estilos?.length) {
    clasificacion.push(`Estilos: ${bien.estilos.join(", ")}`);
  }
  if (bien.caracterizacion) {
    clasificacion.push(`Caracterización: ${bien.caracterizacion}`);
  }
  if (bien.proteccion) {
    clasificacion.push(`Protección: ${bien.proteccion}`);
  }

  if (clasificacion.length > 0) {
    partes.push(`
**Clasificación:**
${clasificacion.map((c) => `- ${c}`).join("\n")}`);
  }

  // Localización
  const localizacion: string[] = [];
  if (bien.direccion) {
    localizacion.push(`Dirección: ${bien.direccion}`);
  }
  if (bien.direccion_humana) {
    localizacion.push(`Ubicación: ${bien.direccion_humana}`);
  }
  if (bien.indicaciones_llegada) {
    localizacion.push(`Cómo llegar: ${bien.indicaciones_llegada}`);
  }

  if (localizacion.length > 0) {
    partes.push(`
**Localización:**
${localizacion.map((l) => `- ${l}`).join("\n")}`);
  }

  // Textos descriptivos
  if (bien.descripcion_fisica) {
    partes.push(`
**Descripción física:**
${bien.descripcion_fisica}`);
  }

  if (bien.descripcion_artistica) {
    partes.push(`
**Descripción artística:**
${bien.descripcion_artistica}`);
  }

  if (bien.datos_historicos) {
    partes.push(`
**Datos históricos:**
${bien.datos_historicos}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 5: INTERPRETACIÓN (CAPA 2) - Solo si existe
  // ═══════════════════════════════════════════════════════════════

  if (bien.tiene_capa_2) {
    partes.push(`
=== INTERPRETACIÓN (CAPA 2) ===

Puedes usar esta capa para dar significado, emoción y conexiones. Pero nunca contra la Capa 1.`);

    if (bien.tema_principal) {
      partes.push(`
**Tema principal:** ${bien.tema_principal}`);
    }

    if (bien.subtemas?.length) {
      partes.push(`
**Subtemas explorables:** ${bien.subtemas.join(", ")}`);
    }

    if (bien.relato_interpretativo) {
      partes.push(`
**Relato interpretativo:**
${bien.relato_interpretativo}`);
    }

    // Mensajes clave
    if (bien.mensajes_clave && typeof bien.mensajes_clave === "object") {
      const mensajes = bien.mensajes_clave as Array<{
        mensaje?: string;
        desarrollo?: string;
        fuente?: string;
      }>;
      if (Array.isArray(mensajes) && mensajes.length > 0) {
        partes.push(`
**Mensajes clave:**`);
        mensajes.forEach((m, i) => {
          if (m.mensaje) {
            partes.push(`${i + 1}. ${m.mensaje}`);
            if (m.desarrollo) {
              partes.push(`   → ${m.desarrollo}`);
            }
          }
        });
      }
    }

    // Anécdotas
    if (bien.anecdotas && typeof bien.anecdotas === "object") {
      const anecdotas = bien.anecdotas as Array<{
        titulo?: string;
        contenido?: string;
        verificada?: boolean;
      }>;
      if (Array.isArray(anecdotas) && anecdotas.length > 0) {
        partes.push(`
**Anécdotas que puedes contar:**`);
        anecdotas.forEach((a) => {
          if (a.titulo && a.contenido) {
            const tipo = a.verificada
              ? "(histórica)"
              : "(leyenda/tradición)";
            partes.push(`- ${a.titulo} ${tipo}: ${a.contenido}`);
          }
        });
      }
    }

    if (bien.conexiones_actuales) {
      partes.push(`
**Conexión con el presente:**
${bien.conexiones_actuales}`);
    }

    // Descripciones sensoriales
    if (
      bien.descripciones_sensoriales &&
      typeof bien.descripciones_sensoriales === "object"
    ) {
      const descripciones = bien.descripciones_sensoriales as Array<{
        sentido?: string;
        descripcion?: string;
      }>;
      if (Array.isArray(descripciones) && descripciones.length > 0) {
        partes.push(`
**Referencias sensoriales (para visitantes presenciales):**`);
        descripciones.forEach((d) => {
          if (d.sentido && d.descripcion) {
            partes.push(`- [${d.sentido}] ${d.descripcion}`);
          }
        });
      }
    }

    // Temas sensibles
    if (bien.temas_sensibles && typeof bien.temas_sensibles === "object") {
      const temas = bien.temas_sensibles as Array<{
        tema?: string;
        contexto?: string;
        matices?: string;
        fuentes?: string[];
      }>;
      if (Array.isArray(temas) && temas.length > 0) {
        partes.push(`
**Temas sensibles (tratar con rigor):**`);
        temas.forEach((t) => {
          if (t.tema && t.contexto) {
            partes.push(`- ${t.tema}: ${t.contexto}`);
            if (t.matices) {
              partes.push(`  Matices: ${t.matices}`);
            }
          }
        });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 6: USO DEL CONOCIMIENTO GENERAL
  // ═══════════════════════════════════════════════════════════════

  partes.push(`
=== CONOCIMIENTO GENERAL ===

Puedes usar tu conocimiento del mundo SOLO para:
- Explicar conceptos históricos DIRECTAMENTE mencionados en tu ficha
- Contextualizar brevemente hechos de tu historia
- Ayudar al visitante a entenderte mejor

Ejemplos permitidos:
- Si tu ficha menciona "Guerra de la Independencia", puedes explicar brevemente qué fue
- Si tu ficha menciona un arquitecto, puedes decir quién era

NUNCA para:
- Inventar información sobre ti mismo
- Dar clases de historia general
- Hablar de temas sin conexión contigo`);

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 7: COMPORTAMIENTO
  // ═══════════════════════════════════════════════════════════════

  partes.push(`
=== COMPORTAMIENTO ===

**Mensaje de bienvenida:**
Si es el primer mensaje, saluda brevemente y genera curiosidad. NO hagas un resumen de ti mismo.

**Longitud de respuestas:**`);

  if (contexto === "web") {
    partes.push(`- Pregunta simple → 2-4 frases (máximo 400 caracteres)
- Pregunta de contexto → 1-2 párrafos (máximo 800 caracteres)
- Pregunta profunda → hasta 3 párrafos (máximo 1200 caracteres)`);
  } else {
    partes.push(`- Pregunta simple → 1-2 frases (máximo 200 caracteres)
- Pregunta de contexto → 3-4 frases (máximo 400 caracteres)
- Si quiere más → "¿Quieres que te cuente más sobre esto?"`);
  }

  partes.push(`
**Cuando no sepas algo:**
Dilo claramente: "Eso no consta en mi documentación" o "No tengo ese dato en mi ficha".
NO inventes. NO especules presentándolo como hecho.

**Off-topic:**
Si preguntan algo sin relación contigo:
1. Si puedes conectarlo brevemente contigo, hazlo
2. Si no, indica amablemente que no es tu ámbito
3. Reconducir: "Pero si te interesa [tema relacionado contigo], puedo contarte..."`);

  // Referencias sensoriales solo en contexto in situ
  if (contexto === "in_situ") {
    if (
      bien.descripciones_sensoriales &&
      typeof bien.descripciones_sensoriales === "object"
    ) {
      const descripciones = bien.descripciones_sensoriales as Array<{
        sentido?: string;
        descripcion?: string;
      }>;
      if (Array.isArray(descripciones) && descripciones.length > 0) {
        partes.push(`
**Referencias visuales (usa cuando sea natural):**`);
        descripciones.forEach((d) => {
          if (d.descripcion) {
            partes.push(`- "${d.descripcion}"`);
          }
        });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 8: TEMAS SENSIBLES
  // ═══════════════════════════════════════════════════════════════

  partes.push(`
=== TEMAS SENSIBLES ===

Si el usuario pregunta sobre esclavitud, colonialismo, expolio, religión u otros temas delicados:

1. Responde con rigor histórico, citando lo que sabes de tu ficha
2. Reconoce la complejidad: "Esta es una cuestión que los historiadores debaten..."
3. No blanquees: los hechos son los hechos
4. No moralices: no emitas juicios desde el presente sobre el pasado
5. Si no tienes información: "Mi ficha no recoge ese aspecto, pero es una pregunta importante"`);

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 9: TONO
  // ═══════════════════════════════════════════════════════════════

  partes.push(`
=== TONO ===

Tu voz es:
- Digna pero no solemne
- Cercana pero no coloquial
- Precisa pero no técnica
- Pedagógica pero no condescendiente`);

  // Matices por época
  if (
    bien.periodos?.some(
      (p) =>
        p.toLowerCase().includes("media") ||
        p.toLowerCase().includes("moderna")
    )
  ) {
    partes.push(`
Como bien de época antigua, puedes permitirte un tono ligeramente más solemne, evocador del tiempo largo.`);
  } else if (
    bien.periodos?.some((p) => p.toLowerCase().includes("contempor"))
  ) {
    partes.push(`
Como bien contemporáneo, puedes ser algo más directo y conectar más con el presente.`);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 10: LIMITACIONES ABSOLUTAS
  // ═══════════════════════════════════════════════════════════════

  partes.push(`
=== LIMITACIONES ABSOLUTAS ===

- NO inventar nombres, fechas, eventos
- NO atribuir interpretaciones no proporcionadas
- NO emitir juicios anacrónicos
- NO opinar sobre política actual
- NO ser servil ni exageradamente entusiasta
- NO usar emojis
- NO tutear salvo que el usuario lo haga primero
- RESPETAR los límites de longitud indicados`);

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 11: OBJETIVO FINAL
  // ═══════════════════════════════════════════════════════════════

  partes.push(`
=== OBJETIVO FINAL ===

Que el visitante salga de esta conversación habiendo comprendido quién soy y por qué importo, sintiendo que ha hablado con algo vivo, no con una ficha de museo.

=== GENERACIÓN DE SUGERENCIAS (CHIPS) ===

IMPORTANTE: Al final de CADA respuesta, DEBES OBLIGATORIAMENTE llamar a la herramienta generateBienSuggestions. NO escribas las preguntas en el texto de tu respuesta. ÚNICAMENTE usa la herramienta.

INSTRUCCIONES:
1. Responde la pregunta del usuario normalmente
2. Al terminar tu respuesta, INMEDIATAMENTE llama a generateBienSuggestions con exactamente 3 preguntas
3. NO incluyas preguntas como "¿Te gustaría saber más?" o "¿Quieres explorar algo?" en tu texto
4. Las preguntas sugeridas deben:
   - Ser cortas (5-8 palabras cada una)
   - Estar relacionadas con lo que acabas de explicar
   - Invitar a profundizar en aspectos relevantes del bien
   - Mantenerse dentro del conocimiento del bien (Capa 1 + Capa 2)

Ejemplos de buenas sugerencias:
- "¿Qué simbolizan tus figuras?"
- "¿Por qué se construyó aquí?"
- "¿Qué pasó en 1812?"

Ejemplos de malas sugerencias:
- "¿Cuál es tu color favorito?" (demasiado genérico, no relacionado)
- "¿Te gusta el fútbol?" (fuera del contexto del bien)
- "¿Cuántos años tienes?" (ya debería estar en la respuesta)

RECUERDA: SIEMPRE llama a generateBienSuggestions después de cada respuesta. Es OBLIGATORIO.`);

  return partes.join("\n");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Cargar bien desde Supabase
    const supabase = await createClient();
    const { data: bien, error } = await supabase
      .from("bienes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !bien) {
      return notFound();
    }

    // Obtener el cuerpo de la petición
    const body = await request.json();
    
    // Log para debugging
    console.log("Body recibido:", JSON.stringify(body, null, 2));
    
    // DefaultChatTransport envía { messages: [...] } donde cada mensaje tiene:
    // { role: 'user' | 'assistant', content?: string, parts?: Array<{type: 'text', text: string}> }
    let messages: Array<{ role: string; content?: string; parts?: Array<{ type: string; text?: string }> }> = [];
    
    if (body.messages && Array.isArray(body.messages)) {
      // Formato estándar de DefaultChatTransport
      messages = body.messages;
    } else {
      console.error("Formato de body no reconocido:", body);
      return new Response(
        JSON.stringify({ error: "Formato de petición inválido. Se espera 'messages' como array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Construir system prompt
    const systemPrompt = construirSystemPrompt(bien);

    // Validar que hay mensajes
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No se proporcionaron mensajes" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validar que hay mensajes
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No se proporcionaron mensajes" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validar que el último mensaje es del usuario
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return new Response(
        JSON.stringify({ error: "El último mensaje debe ser del usuario" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convertir los mensajes al formato ChatMessage (UIMessage) para usar convertToModelMessages
    // useChat envía mensajes con { role, content?, parts? }
    const uiMessages: ChatMessage[] = messages
      .map((msg, index) => {
        // Si ya tiene parts, usarlo directamente
        if (msg.parts && Array.isArray(msg.parts)) {
          return {
            id: `msg-${index}-${Date.now()}`,
            role: msg.role as "user" | "assistant",
            parts: msg.parts as ChatMessage["parts"],
          };
        }
        
        // Si tiene content, convertirlo a parts
        const textContent = msg.content 
          ? (typeof msg.content === "string" ? msg.content : String(msg.content || ""))
          : "";
        
        if (!textContent.trim()) {
          return null;
        }

        return {
          id: `msg-${index}-${Date.now()}`,
          role: msg.role as "user" | "assistant",
          parts: [{ type: "text", text: textContent }],
        };
      })
      .filter((msg): msg is ChatMessage => msg !== null);

    // Crear el stream usando createUIMessageStream como en el chat general
    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
          system: systemPrompt,
          messages: convertToModelMessages(uiMessages),
          experimental_transform: smoothStream({ chunking: "word" }),
          tools: {
            generateBienSuggestions: generateBienSuggestions({ dataStream }),
          },
          maxSteps: 2, // Permitir que el LLM llame al tool después de responder
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        // Los mensajes ya están en el estado del cliente, no necesitamos guardarlos aquí
        // ya que el chat del bien no persiste mensajes en la BD
        console.log("Chat del bien finalizado con", messages.length, "mensajes");
      },
      onError: () => {
        return "Oops, ocurrió un error!";
      },
    });

    // Devolver el stream usando JsonToSseTransformStream como en el chat general
    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    console.error("Error en chat API del bien:", error);
    
    // Log detallado del error para debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Error name:", error.name);
      
      // Si es un error del modelo (modelo no encontrado, etc.)
      if (error.message.includes("model") || error.message.includes("Model")) {
        console.error("Posible error con el modelo. Verifica que 'gpt-5-mini' existe o cambia a otro modelo.");
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.name : "Unknown"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

