import type { BaseStats, PokemonApiData, PokemonType } from "../types";
import { resolvePokemonApiName } from "./pokemonNameResolver";
import {
  loadCachedPokemonData,
  saveCachedPokemonData,
} from "./pokeapiCache";

type PokeApiPokemonResponse = {
  name: string;
  species: {
    name: string;
  };
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  types: Array<{
    slot: number;
    type: {
      name: string;
    };
  }>;
};

type PokeApiSpeciesResponse = {
  names: Array<{
    name: string;
    language: {
      name: string;
    };
  }>;
};

const typeNameMap: Record<string, PokemonType> = {
  normal: "ノーマル",
  fire: "ほのお",
  water: "みず",
  grass: "くさ",
  electric: "でんき",
  ice: "こおり",
  fighting: "かくとう",
  poison: "どく",
  ground: "じめん",
  flying: "ひこう",
  psychic: "エスパー",
  bug: "むし",
  rock: "いわ",
  ghost: "ゴースト",
  dragon: "ドラゴン",
  dark: "あく",
  steel: "はがね",
  fairy: "フェアリー",
};

function extractBaseStats(stats: PokeApiPokemonResponse["stats"]): BaseStats {
  const getStat = (statName: string): number => {
    const stat = stats.find((entry) => entry.stat.name === statName);

    if (!stat) {
      throw new Error(`PokeAPIレスポンスに ${statName} がありません。`);
    }

    return stat.base_stat;
  };

  return {
    hp: getStat("hp"),
    attack: getStat("attack"),
    defense: getStat("defense"),
    specialAttack: getStat("special-attack"),
    specialDefense: getStat("special-defense"),
    speed: getStat("speed"),
  };
}

function extractTypes(
  types: PokeApiPokemonResponse["types"],
): [PokemonType] | [PokemonType, PokemonType] {
  const mappedTypes = [...types]
    .sort((left, right) => left.slot - right.slot)
    .map((entry) => {
      const mappedType = typeNameMap[entry.type.name];

      if (!mappedType) {
        throw new Error(`未対応のタイプです: ${entry.type.name}`);
      }

      return mappedType;
    });

  if (mappedTypes.length === 1) {
    const [firstType] = mappedTypes;

    if (!firstType) {
      throw new Error("ポケモンのタイプ取得に失敗しました。");
    }

    return [firstType];
  }

  if (mappedTypes.length === 2) {
    const [firstType, secondType] = mappedTypes;

    if (!firstType || !secondType) {
      throw new Error("ポケモンのタイプ取得に失敗しました。");
    }

    return [firstType, secondType];
  }

  throw new Error("ポケモンのタイプ数が不正です。");
}

function getJapaneseSpeciesName(species: PokeApiSpeciesResponse): string | null {
  return (
    species.names.find((entry) => entry.language.name === "ja-Hrkt")?.name ??
    species.names.find((entry) => entry.language.name === "ja")?.name ??
    null
  );
}

function formatDisplayName(apiName: string, speciesName: string): string {
  if (apiName === speciesName) {
    return speciesName;
  }

  if (apiName.endsWith("-mega")) {
    return `メガ${speciesName}`;
  }

  return `${speciesName} (${apiName})`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API取得に失敗しました: ${response.status} ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchPokemonApiData(nameOrId: string): Promise<PokemonApiData> {
  const normalizedName = await resolvePokemonApiName(nameOrId);
  const cachedData = await loadCachedPokemonData(normalizedName);

  if (cachedData) {
    return cachedData;
  }

  const pokemon = await fetchJson<PokeApiPokemonResponse>(
    `https://pokeapi.co/api/v2/pokemon/${normalizedName}`,
  );
  const species = await fetchJson<PokeApiSpeciesResponse>(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemon.species.name}`,
  );

  const speciesName = getJapaneseSpeciesName(species) ?? pokemon.species.name;

  const data: PokemonApiData = {
    apiName: pokemon.name,
    displayName: formatDisplayName(pokemon.name, speciesName),
    speciesName,
    types: extractTypes(pokemon.types),
    baseStats: extractBaseStats(pokemon.stats),
  };

  await saveCachedPokemonData(normalizedName, data);
  return data;
}
