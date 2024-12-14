import { GroqProvider, OpenAIProvider, LLMProvider } from "@/types/llm";

export const llmProviders: Record<string, LLMProvider> = {
  "gpt-4o": new OpenAIProvider("gpt-4o"),
  "llama-3.3-70b-versatile": new GroqProvider("llama-3.3-70b-versatile"),
  "llama3-70b-8192": new GroqProvider("llama3-70b-8192"),
} as const;

export type LLMProviderId = keyof typeof llmProviders;
