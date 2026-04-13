import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PokemonApiData } from "../types";

type PokeApiListResponse = {
  next: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
};

type PokeApiSpeciesDetailResponse = {
  name: string;
  names: Array<{
    name: string;
    language: {
      name: string;
    };
  }>;
  varieties: Array<{
    is_default: boolean;
    pokemon: {
      name: string;
    };
  }>;
};

type PokemonNameIndex = Record<string, string>;

const currentFilePath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFilePath), "../..");
const pokeApiCacheDir = path.join(projectRoot, ".cache", "pokeapi");
const pokemonNameIndexPath = path.join(pokeApiCacheDir, "pokemon-name-index.json");
const pokemonDataCacheDir = path.join(pokeApiCacheDir, "pokemon-data");

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API取得に失敗しました: ${response.status} ${url}`);
  }

  return response.json() as Promise<T>;
}

async function ensureCacheDirectories(): Promise<void> {
  await mkdir(pokeApiCacheDir, { recursive: true });
  await mkdir(pokemonDataCacheDir, { recursive: true });
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const file = await readFile(filePath, "utf-8");
    return JSON.parse(file) as T;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureCacheDirectories();
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function getJapaneseSpeciesName(species: PokeApiSpeciesDetailResponse): string | null {
  return (
    species.names.find((entry) => entry.language.name === "ja-Hrkt")?.name ??
    species.names.find((entry) => entry.language.name === "ja")?.name ??
    null
  );
}

function getMegaDisplayNames(speciesName: string, apiName: string): string[] {
  if (apiName.endsWith("-mega")) {
    return [`メガ${speciesName}`];
  }

  if (apiName.endsWith("-mega-x")) {
    return [`メガ${speciesName}X`];
  }

  if (apiName.endsWith("-mega-y")) {
    return [`メガ${speciesName}Y`];
  }

  return [];
}

async function fetchAllSpeciesUrls(): Promise<string[]> {
  const urls: string[] = [];
  let nextUrl: string | null = "https://pokeapi.co/api/v2/pokemon-species?limit=500";

  while (nextUrl) {
    const page: PokeApiListResponse = await fetchJson<PokeApiListResponse>(nextUrl);
    urls.push(...page.results.map((result: PokeApiListResponse["results"][number]) => result.url));
    nextUrl = page.next;
  }

  return urls;
}

async function fetchSpeciesDetails(speciesUrls: string[]): Promise<PokeApiSpeciesDetailResponse[]> {
  const concurrency = 20;
  const results: PokeApiSpeciesDetailResponse[] = [];

  for (let index = 0; index < speciesUrls.length; index += concurrency) {
    const chunk = speciesUrls.slice(index, index + concurrency);
    const chunkResults = await Promise.all(
      chunk.map((speciesUrl) => fetchJson<PokeApiSpeciesDetailResponse>(speciesUrl)),
    );
    results.push(...chunkResults);
  }

  return results;
}

async function buildPokemonNameIndex(): Promise<PokemonNameIndex> {
  const speciesUrls = await fetchAllSpeciesUrls();
  const speciesDetails = await fetchSpeciesDetails(speciesUrls);
  const index: PokemonNameIndex = {};

  for (const species of speciesDetails) {
    const japaneseName = getJapaneseSpeciesName(species);

    if (!japaneseName) {
      continue;
    }

    const defaultVariety = species.varieties.find((variety) => variety.is_default);
    index[japaneseName] = defaultVariety?.pokemon.name ?? species.name;

    for (const variety of species.varieties) {
      for (const displayName of getMegaDisplayNames(
        japaneseName,
        variety.pokemon.name,
      )) {
        index[displayName] = variety.pokemon.name;
      }
    }
  }

  return index;
}

export async function loadPokemonNameIndex(): Promise<PokemonNameIndex> {
  const cached = await readJsonFile<PokemonNameIndex>(pokemonNameIndexPath);

  if (cached) {
    return cached;
  }

  const builtIndex = await buildPokemonNameIndex();
  await writeJsonFile(pokemonNameIndexPath, builtIndex);
  return builtIndex;
}

export async function refreshPokemonNameIndex(): Promise<PokemonNameIndex> {
  const builtIndex = await buildPokemonNameIndex();
  await writeJsonFile(pokemonNameIndexPath, builtIndex);
  return builtIndex;
}

function getPokemonDataCachePath(apiName: string): string {
  return path.join(pokemonDataCacheDir, `${apiName}.json`);
}

export async function loadCachedPokemonData(
  apiName: string,
): Promise<PokemonApiData | null> {
  return readJsonFile<PokemonApiData>(getPokemonDataCachePath(apiName));
}

export async function saveCachedPokemonData(
  apiName: string,
  data: PokemonApiData,
): Promise<void> {
  await writeJsonFile(getPokemonDataCachePath(apiName), data);
}
