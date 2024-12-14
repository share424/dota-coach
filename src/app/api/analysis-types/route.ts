import { NextResponse } from "next/server";
import { analysisTypes } from "@/config/analysis";

export async function GET() {
  return NextResponse.json(Object.values(analysisTypes));
}
