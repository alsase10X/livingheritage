"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type BienSuggestionsChipsProps = {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
};

export function BienSuggestionsChips({
  suggestions,
  onSuggestionClick,
}: BienSuggestionsChipsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-4 flex w-full max-w-3xl flex-wrap gap-2 px-4 md:px-0"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.3 }}
    >
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={`${suggestion}-${index}`}
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.3 + 0.05 * index }}
        >
          <Button
            className="h-auto whitespace-normal rounded-full border-[0.5px] border-gray-200 bg-transparent px-4 py-2 text-left text-sm font-normal text-foreground transition-colors hover:bg-gray-200 hover:border-gray-300"
            onClick={() => onSuggestionClick(suggestion)}
            type="button"
            variant="outline"
          >
            {suggestion}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}

