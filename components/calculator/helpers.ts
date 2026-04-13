import {
  calculateChampionStats,
  CHAMPIONS_MAX_TOTAL_SP,
  NATURES,
} from "../../src/stats";
import type {
  CalculatedStats,
  Nature,
  PokemonApiData,
  StatPoints,
} from "../../src/types";

const DEFAULT_NATURE: Nature = { name: "まじめ" };

function findNature(name: string): Nature {
  return NATURES.find((nature) => nature.name === name) ?? DEFAULT_NATURE;
}

export function getTotalStatPoints(statPoints: StatPoints): number {
  return Object.values(statPoints).reduce((sum, value) => sum + value, 0);
}

export function getCalculatedStats(
  pokemon: PokemonApiData | null,
  statPoints: StatPoints,
  natureName: string,
): CalculatedStats | null {
  if (!pokemon) {
    return null;
  }

  if (getTotalStatPoints(statPoints) > CHAMPIONS_MAX_TOTAL_SP) {
    return null;
  }

  return calculateChampionStats(
    pokemon.baseStats,
    statPoints,
    findNature(natureName),
  );
}
