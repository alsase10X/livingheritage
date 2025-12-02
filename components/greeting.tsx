"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type GreetingProps = {
  artworkImageUrl?: string;
  onSuggestionsGenerated?: (suggestions: string[]) => void;
};

type GreetingContextType = {
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
};

const GreetingContext = createContext<GreetingContextType | null>(null);

export const useGreetingContext = () => {
  const context = useContext(GreetingContext);
  if (!context) {
    return { suggestions: [], setSuggestions: () => {} };
  }
  return context;
};

export const GreetingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  return (
    <GreetingContext.Provider value={{ suggestions, setSuggestions }}>
      {children}
    </GreetingContext.Provider>
  );
};

export const Greeting = ({
  artworkImageUrl,
  onSuggestionsGenerated,
}: GreetingProps) => {
  const [greetingText, setGreetingText] = useState<string | null>(null);
  const { setSuggestions } = useGreetingContext();

  useEffect(() => {
    // Por ahora usamos el texto estático, pero se puede generar con LLM después
    // Para generar con LLM, necesitarías crear un endpoint específico o usar el hook useChat
    const text =
      "Bienvenido!. Represento a las Cortes de Cádiz y a la Constitución de 1812, fruto de uno de los debates más intensos que vivió esta ciudad mientras resistía un asedio que parecía no tener fin. En mis relieves, figuras y espacios se mezclan decisiones políticas tomadas en medio de la guerra, ideas que querían abrir una nueva época y tensiones que aún hoy se discuten. Algunas partes de esa historia son claras; otras, todavía se interpretan de maneras distintas.";

    const defaultSuggestions = [
      "¿Qué buscaban realmente los diputados de 1812?",
      "¿Qué significan las figuras de este monumento?",
      "¿Qué significó esta Constitución?",
    ];

    setGreetingText(text);
    setSuggestions(defaultSuggestions);
    onSuggestionsGenerated?.(defaultSuggestions);
  }, [setSuggestions, onSuggestionsGenerated]);

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
            {greetingText ||
              "Bienvenido!. Represento a las Cortes de Cádiz y a la Constitución de 1812, fruto de uno de los debates más intensos que vivió esta ciudad mientras resistía un asedio que parecía no tener fin. En mis relieves, figuras y espacios se mezclan decisiones políticas tomadas en medio de la guerra, ideas que querían abrir una nueva época y tensiones que aún hoy se discuten. Algunas partes de esa historia son claras; otras, todavía se interpretan de maneras distintas."}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
