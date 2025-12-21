import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { ChatMessage } from "@/lib/types";

type GenerateBienSuggestionsProps = {
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const generateBienSuggestions = ({
  dataStream,
}: GenerateBienSuggestionsProps) =>
  tool({
    description:
      "Genera 3 preguntas sugeridas (chips) basadas en tu respuesta anterior. Estas preguntas deben ser cortas (5-8 palabras), relacionadas con lo que acabas de explicar, y mantenerse dentro del conocimiento del bien (Capa 1 + Capa 2). DEBES llamar a esta herramienta al final de CADA respuesta.",
    inputSchema: z.object({
      suggestions: z
        .array(z.string())
        .length(3)
        .describe(
          "Array de exactamente 3 preguntas cortas (5-8 palabras cada una) relacionadas con tu respuesta"
        ),
    }),
    execute: async ({ suggestions }) => {
      console.log("🔵 generateBienSuggestions ejecutado con:", suggestions);
      
      const validSuggestions = suggestions.filter(
        (s) => s && s.trim().length > 0
      );

      console.log("🔵 Sugerencias válidas:", validSuggestions);

      if (validSuggestions.length > 0) {
        // Enviar las sugerencias como un evento personalizado en el stream
        dataStream.write({
          type: "data-bien-suggestions",
          data: JSON.stringify(validSuggestions),
          transient: true,
        });
        console.log("🔵 Sugerencias enviadas al stream:", validSuggestions);
      }

      return {
        success: true,
        suggestions: validSuggestions,
      };
    },
  });

