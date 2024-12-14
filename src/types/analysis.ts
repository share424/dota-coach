import { Hero, TeamHero } from "@/types/hero";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ChatPromptValue } from "@langchain/core/prompt_values";

export interface AnalysisType {
  id: string;
  name: string;
  description: string;
  generatePrompt: (
    myTeam: TeamHero[],
    enemyTeam: Hero[]
  ) => Promise<ChatPromptValue>;
}

export abstract class BaseAnalysis implements AnalysisType {
  constructor(
    public id: string,
    public name: string,
    public description: string
  ) {}

  abstract generatePrompt(
    myTeam: TeamHero[],
    enemyTeam: Hero[]
  ): Promise<ChatPromptValue>;
}

export class CounterPickAnalysis extends BaseAnalysis {
  constructor() {
    super(
      "counter-picks",
      "Counter Picks",
      "Analyze potential counter picks against the enemy team"
    );
  }

  async generatePrompt(
    myTeam: TeamHero[],
    enemyTeam: Hero[]
  ): Promise<ChatPromptValue> {
    const systemTemplate = `You are a Dota 2 expert analyst specializing in draft analysis and counter-picking strategies.`;

    const humanTemplate = `Analyze the enemy team composition and suggest strong counter picks. Consider the following:

Enemy Team: {enemyTeam}
Current Team: {currentTeam}
My Hero: {myHero}

Please provide:
1. Strong counter picks against their lineup
2. Why these counters are effective
3. How these heroes synergize with our current team`;

    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate(humanTemplate),
    ]);

    const myHero = myTeam.find((hero) => hero.isMyHero);
    return await chatPrompt.invoke({
      currentTeam: myTeam.map((h) => h.localized_name).join(", "),
      enemyTeam: enemyTeam.map((h) => h.localized_name).join(", "),
      myHero: myHero?.localized_name || "Not selected",
    });
  }
}

export class RecommendationAnalysis extends BaseAnalysis {
  constructor() {
    super(
      "recommendations",
      "Recommendations",
      "Suggest recommendations for items, build, and strategy"
    );
  }

  async generatePrompt(
    myTeam: TeamHero[],
    enemyTeam: Hero[]
  ): Promise<ChatPromptValue> {
    const systemTemplate = `You are a Dota 2 expert analyst specializing in items, builds, and strategy recommendations.`;

    const humanTemplate = `Suggest the optimal items, builds, and strategy for my hero:
  
  Our Team: {currentTeam}
  Enemy Team: {enemyTeam}
  My Hero: {myHero}
  
  Please provide:
  1. Recommended items
    a. Early game
    b. Mid game
    c. Late game
  2. Recommended Skill Build
    a. Early game
    b. Mid game
    c. Late game
  3. Recommended strategy
    a. Early game
    b. Mid game
    c. Late game
  `;

    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate(humanTemplate),
    ]);

    const myHero = myTeam.find((hero) => hero.isMyHero);
    return await chatPrompt.invoke({
      currentTeam: myTeam.map((h) => h.localized_name).join(", "),
      enemyTeam: enemyTeam.map((h) => h.localized_name).join(", "),
      myHero: myHero?.localized_name || "Not selected",
    });
  }
}

export class LaneAnalysis extends BaseAnalysis {
  constructor() {
    super("lanes", "Lane Setup", "Suggest optimal lane configurations");
  }

  async generatePrompt(
    myTeam: TeamHero[],
    enemyTeam: Hero[]
  ): Promise<ChatPromptValue> {
    const systemTemplate = `You are a Dota 2 expert analyst specializing in lane strategy and early game optimization.`;

    const humanTemplate = `Suggest the optimal lane setup for our team:

Our Team: {currentTeam}
Enemy Team: {enemyTeam}
My Hero: {myHero}

Please provide:
1. Recommended lane assignments
2. Lane matchup analysis
3. Early game priorities for each lane
4. Potential lane swaps if needed`;

    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate(humanTemplate),
    ]);

    const myHero = myTeam.find((hero) => hero.isMyHero);
    return await chatPrompt.invoke({
      currentTeam: myTeam.map((h) => h.localized_name).join(", "),
      enemyTeam: enemyTeam.map((h) => h.localized_name).join(", "),
      myHero: myHero?.localized_name || "Not selected",
    });
  }
}
