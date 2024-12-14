import { NextResponse } from "next/server";
import { Hero } from "@/types/hero";

// Hero aliases mapping for search
const heroAliases: { [key: string]: string[] } = {
  pa: ["phantom assassin"],
  am: ["anti-mage", "antimage"],
  sf: ["shadow fiend", "nevermore"],
  es: ["earth shaker", "earthshaker", "earth spirit", "ember spirit"],
  pl: ["phantom lancer"],
  tb: ["terrorblade"],
  mk: ["monkey king"],
  wk: ["wraith king"],
  cm: ["crystal maiden"],
  potm: ["priestess of the moon", "mirana"],
  ls: ["lifestealer"],
  ns: ["night stalker"],
  sk: ["sand king"],
  // Add more aliases as needed
};

let heroesCache: Hero[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchHeroes(): Promise<Hero[]> {
  const now = Date.now();

  // Return cached data if available and fresh
  if (heroesCache && now - lastFetchTime < CACHE_DURATION) {
    return heroesCache;
  }

  const response = await fetch("https://api.opendota.com/api/heroes");
  if (!response.ok) {
    throw new Error("Failed to fetch heroes");
  }

  const heroes: Hero[] = await response.json();

  // Update cache
  heroesCache = heroes;
  lastFetchTime = now;

  return heroes;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";

    const heroes = await fetchHeroes();

    if (!search) {
      return NextResponse.json(heroes);
    }

    // Search functionality
    const filteredHeroes = heroes.filter((hero) => {
      // Direct name match
      if (hero.localized_name.toLowerCase().includes(search)) {
        return true;
      }

      // Check aliases
      for (const [alias, names] of Object.entries(heroAliases)) {
        if (alias === search) {
          return names.some((name) =>
            hero.localized_name.toLowerCase().includes(name)
          );
        }
      }

      // Split search terms and check if all parts match
      const searchParts = search.split(" ");
      return searchParts.every(
        (part) =>
          hero.localized_name.toLowerCase().includes(part) ||
          Object.entries(heroAliases).some(
            ([alias, names]) =>
              alias === part &&
              names.some((name) =>
                hero.localized_name.toLowerCase().includes(name)
              )
          )
      );
    });

    return NextResponse.json(filteredHeroes);
  } catch (error) {
    console.error("Error fetching heroes:", error);
    return NextResponse.json(
      { error: "Failed to fetch heroes" },
      { status: 500 }
    );
  }
}
