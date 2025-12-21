"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGreetingContext } from "@/components/greeting";
import { Button } from "@/components/ui/button";

type BienGreetingProps = {
  greetingText: string;
  preguntasProvocadoras?: string[];
  onPreguntaClick?: (pregunta: string) => void;
};

export function BienGreeting({
  greetingText,
  preguntasProvocadoras = [],
  onPreguntaClick,
}: BienGreetingProps) {
  const { setSuggestions } = useGreetingContext();

  useEffect(() => {
    // Siempre establecer las sugerencias, incluso si están vacías, para que no se usen las del chat genérico
    setSuggestions(preguntasProvocadoras);
  }, [preguntasProvocadoras, setSuggestions]);

  return (
    <div
      className="mx-auto mt-2 flex w-full max-w-3xl flex-col gap-4 px-4 md:mt-2 md:px-0 md:ml-0"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        {/* Texto de presentación */}
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-foreground md:text-base">
            {greetingText}
          </p>
        </div>
      </motion.div>

      {/* Chips de preguntas provocadoras */}
      {preguntasProvocadoras.length > 0 && onPreguntaClick && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.7 }}
        >
          {preguntasProvocadoras.map((pregunta, index) => (
            <motion.div
              key={pregunta}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.7 + 0.05 * index }}
            >
              <Button
                className="h-auto whitespace-normal rounded-full border-[0.5px] border-gray-200 bg-transparent px-4 py-2 text-left text-sm font-normal text-foreground transition-colors hover:bg-gray-200 hover:border-gray-300"
                onClick={() => onPreguntaClick(pregunta)}
                type="button"
                variant="outline"
              >
                {pregunta}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
