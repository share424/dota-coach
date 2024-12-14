import { NextResponse } from "next/server";
import { llmProviders } from "@/config/llm";

export async function GET() {
  return NextResponse.json(
    Object.values(llmProviders).filter((provider) => provider.isAvailable)
  );
}
