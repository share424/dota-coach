import {
  CounterPickAnalysis,
  LaneAnalysis,
  BaseAnalysis,
  RecommendationAnalysis,
} from "@/types/analysis";

export const analysisTypes: Record<string, BaseAnalysis> = {
  "counter-picks": new CounterPickAnalysis(),
  lanes: new LaneAnalysis(),
  recommendations: new RecommendationAnalysis(),
} as const;

export type AnalysisTypeId = keyof typeof analysisTypes;
