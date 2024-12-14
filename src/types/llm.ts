import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";

export interface LLMProvider {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  createModel: () => BaseChatModel;
}

export class GroqProvider implements LLMProvider {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  model: string;

  constructor(model: string) {
    this.id = model;
    this.name = "Groq";
    this.description = `${model} from Groq`;
    this.isAvailable = !!process.env.GROQ_API_KEY;
    this.model = model;
  }

  createModel(): BaseChatModel {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set");
    }
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: this.model,
      temperature: 0.7,
    });
  }
}

export class OpenAIProvider implements LLMProvider {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  model: string;

  constructor(model: string) {
    this.id = model;
    this.name = "OpenAI";
    this.description = `${model} from OpenAI`;
    this.isAvailable = !!process.env.OPENAI_API_KEY;
    this.model = model;
  }

  createModel(): BaseChatModel {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    return new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: this.model,
      temperature: 0.7,
    });
  }
}

// You can add more providers here like OpenAI, Anthropic, etc.
