"use client";
import { useState, useEffect } from "react";
import { LLMProvider } from "@/types/llm";
import { AnalysisType } from "@/types/analysis";
import { Hero, TeamHero } from "@/types/hero";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function Home() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");
  const [myTeam, setMyTeam] = useState<TeamHero[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<Hero[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [analysisTypes, setAnalysisTypes] = useState<AnalysisType[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<string>("counter-picks");
  const [selectedProvider, setSelectedProvider] = useState("gpt4");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");

  const searchHeroes = async (
    search: string,
    setResults: (heroes: Hero[]) => void
  ) => {
    try {
      const response = await fetch(
        `/api/heroes?search=${encodeURIComponent(search)}`
      );
      if (!response.ok) throw new Error("Failed to fetch heroes");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error searching heroes:", error);
    }
  };

  // Debounced search for left pane
  useEffect(() => {
    if (searchLeft === "") {
      setHeroes([]);
      return;
    }

    const handler = setTimeout(() => {
      searchHeroes(searchLeft, setHeroes);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchLeft]);

  // Debounced search for right pane
  useEffect(() => {
    if (searchRight === "") {
      setHeroes([]);
      return;
    }

    const handler = setTimeout(() => {
      searchHeroes(searchRight, setHeroes);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchRight]);

  useEffect(() => {
    fetch("/api/llm-providers")
      .then((response) => response.json())
      .then((data) => {
        setProviders(data);
        if (data.length > 0) {
          setSelectedProvider(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    fetch("/api/analysis-types")
      .then((response) => response.json())
      .then((data) => {
        setAnalysisTypes(data);
        if (data.length > 0) {
          setSelectedAnalysis(data[0].id);
        }
      });
  }, []);

  const handleAddToMyTeam = (hero: Hero) => {
    if (myTeam.length >= 5) return;
    if (myTeam.some((h) => h.id === hero.id)) return;
    setMyTeam([...myTeam, hero]);
  };

  const switchMyHero = (heroId: number) => {
    setMyTeam(
      myTeam.map((hero) => ({
        ...hero,
        isMyHero: hero.id === heroId,
      }))
    );
  };

  const handleAddToEnemyTeam = (hero: Hero) => {
    if (enemyTeam.length >= 5) return;
    if (enemyTeam.some((h) => h.id === hero.id)) return;
    setEnemyTeam([...enemyTeam, hero]);
  };

  const removeFromMyTeam = (heroId: number) => {
    setMyTeam(myTeam.filter((hero) => hero.id !== heroId));
  };

  const removeFromEnemyTeam = (heroId: number) => {
    setEnemyTeam(enemyTeam.filter((hero) => hero.id !== heroId));
  };

  const analyzeDraft = async () => {
    setIsLoading(true);
    setIsStreaming(true);
    setStreamedResponse("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          myTeam,
          enemyTeam,
          analysisType: selectedAnalysis,
          provider: selectedProvider,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const text = decoder.decode(value);
        setStreamedResponse((prev) => prev + text);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setStreamedResponse("Failed to analyze draft. Please try again.");
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 pb-20">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Dota Coach</h1>
        <p className="text-gray-400">AI-Powered Draft Analysis</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
        {/* Left Section - My Team */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">
            My Team ({myTeam.length}/5)
          </h2>
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {myTeam.map((hero) => (
                <div
                  key={hero.id}
                  className={`p-2 border rounded flex items-center gap-2 ${
                    hero.isMyHero ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  <button
                    onClick={() => switchMyHero(hero.id)}
                    className="mr-2 hover:underline text-sm sm:text-base"
                  >
                    {hero.localized_name}
                  </button>
                  <button
                    onClick={() => removeFromMyTeam(hero.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search heroes..."
              className="w-full p-2 border rounded text-black"
              value={searchLeft}
              onChange={(e) => setSearchLeft(e.target.value)}
            />
            {searchLeft && (
              <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border rounded shadow-lg">
                {heroes.map((hero) => (
                  <div
                    key={hero.id}
                    onClick={() => {
                      handleAddToMyTeam(hero);
                      setSearchLeft(""); // Clear search after adding
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-bold text-sm sm:text-base text-black">
                      {hero.localized_name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {hero.attack_type} - {hero.roles.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Enemy Team */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">
            Enemy Team ({enemyTeam.length}/5)
          </h2>
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {enemyTeam.map((hero) => (
                <div
                  key={hero.id}
                  className="p-2 border rounded flex items-center gap-2"
                >
                  <span className="text-sm sm:text-base">
                    {hero.localized_name}
                  </span>
                  <button
                    onClick={() => removeFromEnemyTeam(hero.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search heroes..."
              className="w-full p-2 border rounded text-black"
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
            />
            {searchRight && (
              <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border rounded shadow-lg">
                {heroes.map((hero) => (
                  <div
                    key={hero.id}
                    onClick={() => {
                      handleAddToEnemyTeam(hero);
                      setSearchRight(""); // Clear search after adding
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-bold text-sm sm:text-base text-black">
                      {hero.localized_name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {hero.attack_type} - {hero.roles.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LLM Control Section */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="text-xl font-bold mb-4">AI Analysis</h2>

        {/* LLM Provider Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select LLM Provider
          </label>
          <select
            className="w-full p-2 border rounded text-black"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name} - {provider.description}
              </option>
            ))}
          </select>
        </div>

        {/* Analysis Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Analysis Type
          </label>
          <select
            className="w-full p-2 border rounded text-black"
            value={selectedAnalysis}
            onChange={(e) => setSelectedAnalysis(e.target.value)}
          >
            {analysisTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} - {type.description}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={analyzeDraft}
          className={`w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze"
          )}
        </button>
      </div>

      {/* LLM Response Section */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Analysis Result</h2>
          {streamedResponse && !isStreaming && (
            <button
              className="text-sm text-blue-500 hover:text-blue-600"
              onClick={() => navigator.clipboard.writeText(streamedResponse)}
            >
              Copy to clipboard
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="mb-2">Analyzing your draft...</div>
              <div className="text-sm">This might take a few seconds</div>
            </div>
          </div>
        ) : streamedResponse ? (
          <div className="rounded bg-gray-800 p-4">
            <ReactMarkdown
              className="prose prose-invert max-w-none
                prose-headings:text-white"
              remarkPlugins={[remarkGfm, remarkBreaks]}
            >
              {streamedResponse}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-gray-100 animate-pulse" />
            )}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="mb-2">No analysis yet</div>
              <div className="text-sm">
                Select your options and click Analyze to get started
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
