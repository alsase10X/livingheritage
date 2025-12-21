export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

// Detectar qué proveedor está activo
const useOpenAI = Boolean(process.env.OPENAI_API_KEY);

export const chatModels: ChatModel[] = useOpenAI
  ? [
      {
        id: "chat-model",
        name: "GPT-4o Mini",
        description: "OpenAI's GPT-4o Mini model with efficient performance",
      },
      {
        id: "chat-model-reasoning",
        name: "O1 Preview",
        description:
          "OpenAI's O1 Preview model with advanced reasoning capabilities",
      },
    ]
  : [
      {
        id: "chat-model",
        name: "Grok Vision",
        description: "Advanced multimodal model with vision and text capabilities",
      },
      {
        id: "chat-model-reasoning",
        name: "Grok Reasoning",
        description:
          "Uses advanced chain-of-thought reasoning for complex problems",
      },
    ];
