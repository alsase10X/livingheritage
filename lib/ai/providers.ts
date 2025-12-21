import { gateway } from "@ai-sdk/gateway";
import { openai } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

// Detectar qué proveedor usar (OpenAI si tiene API key, sino xAI)
const useOpenAI = Boolean(process.env.OPENAI_API_KEY);

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : useOpenAI
    ? customProvider({
        languageModels: {
          "chat-model": openai("gpt-4o-mini"),
          "chat-model-reasoning": wrapLanguageModel({
            model: openai("o1-preview"),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
          }),
          "title-model": openai("gpt-4o-mini"),
          "artifact-model": openai("gpt-4o-mini"),
        },
      })
    : customProvider({
        languageModels: {
          "chat-model": gateway.languageModel("xai/grok-2-vision-1212"),
          "chat-model-reasoning": wrapLanguageModel({
            model: gateway.languageModel("xai/grok-3-mini"),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
          }),
          "title-model": gateway.languageModel("xai/grok-2-1212"),
          "artifact-model": gateway.languageModel("xai/grok-2-1212"),
        },
      });
