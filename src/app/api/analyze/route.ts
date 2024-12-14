import { NextResponse } from "next/server";
import { Hero, TeamHero } from "@/types/hero";
import { analysisTypes } from "@/config/analysis";
import { llmProviders } from "@/config/llm";
import { AIMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { myTeam, enemyTeam, analysisType, provider } =
      (await req.json()) as {
        myTeam: TeamHero[];
        enemyTeam: Hero[];
        analysisType: string;
        provider: string;
      };

    // Get the analysis type
    const analyzer = analysisTypes[analysisType];
    if (!analyzer) {
      throw new Error("Invalid analysis type");
    }

    // Get the LLM provider
    const llmProvider = llmProviders[provider];
    if (!llmProvider) {
      throw new Error("Invalid provider");
    }

    // Create LLM instance
    const llm = llmProvider.createModel();

    // Generate prompt
    const promptValue = await analyzer.generatePrompt(myTeam, enemyTeam);

    // Create a new ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const runnable = llm.pipe((message: AIMessage) => {
          // Extract content from AIMessage
          const text = message.content.toString();
          controller.enqueue(text);
        });

        try {
          await runnable.invoke(promptValue);
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze draft" },
      { status: 500 }
    );
  }
}
