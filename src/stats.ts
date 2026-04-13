import type {
  BaseStats,
  CalculatedStats,
  Nature,
  StatKey,
  StatPoints,
} from "./types";

export const CHAMPIONS_LEVEL = 50;
export const CHAMPIONS_IV = 31;
export const CHAMPIONS_MAX_TOTAL_SP = 66;
export const CHAMPIONS_MAX_SINGLE_SP = 32;

export const NATURES: Nature[] = [
  { name: "がんばりや" },
  { name: "さみしがり", increasedStat: "attack", decreasedStat: "defense" },
  { name: "いじっぱり", increasedStat: "attack", decreasedStat: "specialAttack" },
  { name: "やんちゃ", increasedStat: "attack", decreasedStat: "specialDefense" },
  { name: "ゆうかん", increasedStat: "attack", decreasedStat: "speed" },
  { name: "ずぶとい", increasedStat: "defense", decreasedStat: "attack" },
  { name: "すなお" },
  { name: "わんぱく", increasedStat: "defense", decreasedStat: "specialAttack" },
  { name: "のうてんき", increasedStat: "defense", decreasedStat: "specialDefense" },
  { name: "のんき", increasedStat: "defense", decreasedStat: "speed" },
  { name: "ひかえめ", increasedStat: "specialAttack", decreasedStat: "attack" },
  { name: "おっとり", increasedStat: "specialAttack", decreasedStat: "defense" },
  { name: "てれや" },
  { name: "うっかりや", increasedStat: "specialAttack", decreasedStat: "specialDefense" },
  { name: "れいせい", increasedStat: "specialAttack", decreasedStat: "speed" },
  { name: "おだやか", increasedStat: "specialDefense", decreasedStat: "attack" },
  { name: "おとなしい", increasedStat: "specialDefense", decreasedStat: "defense" },
  { name: "しんちょう", increasedStat: "specialDefense", decreasedStat: "specialAttack" },
  { name: "きまぐれ" },
  { name: "なまいき", increasedStat: "specialDefense", decreasedStat: "speed" },
  { name: "おくびょう", increasedStat: "speed", decreasedStat: "attack" },
  { name: "せっかち", increasedStat: "speed", decreasedStat: "defense" },
  { name: "ようき", increasedStat: "speed", decreasedStat: "specialAttack" },
  { name: "むじゃき", increasedStat: "speed", decreasedStat: "specialDefense" },
  { name: "まじめ" },
] as const;

export function createEmptyStatPoints(): StatPoints {
  return {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };
}

function getNatureMultiplier(
  nature: Nature,
  statKey: Exclude<StatKey, "hp">,
): number {
  if (nature.increasedStat === statKey) {
    return 1.1;
  }

  if (nature.decreasedStat === statKey) {
    return 0.9;
  }

  return 1;
}

export function validateStatPoints(statPoints: StatPoints): void {
  const total = Object.values(statPoints).reduce((sum, value) => sum + value, 0);

  if (total > CHAMPIONS_MAX_TOTAL_SP) {
    throw new Error(`SP合計は ${CHAMPIONS_MAX_TOTAL_SP} 以下にしてください。`);
  }

  for (const [key, value] of Object.entries(statPoints)) {
    if (!Number.isInteger(value) || value < 0 || value > CHAMPIONS_MAX_SINGLE_SP) {
      throw new Error(`${key} のSPは 0〜${CHAMPIONS_MAX_SINGLE_SP} で入力してください。`);
    }
  }
}

function toChampionEffortValue(statPoint: number): number {
  return statPoint * 8;
}

function calcHp(baseStat: number, statPoint: number): number {
  const effortValue = toChampionEffortValue(statPoint);
  return (
    Math.floor(
      ((2 * baseStat + CHAMPIONS_IV + Math.floor(effortValue / 4)) * CHAMPIONS_LEVEL) /
        100,
    ) +
    CHAMPIONS_LEVEL +
    10
  );
}

function calcOtherStat(
  baseStat: number,
  statPoint: number,
  natureMultiplier: number,
): number {
  const effortValue = toChampionEffortValue(statPoint);
  const rawStat =
    Math.floor(
      ((2 * baseStat + CHAMPIONS_IV + Math.floor(effortValue / 4)) * CHAMPIONS_LEVEL) /
        100,
    ) + 5;

  return Math.floor(rawStat * natureMultiplier);
}

export function calculateChampionStats(
  baseStats: BaseStats,
  statPoints: StatPoints,
  nature: Nature,
): CalculatedStats {
  validateStatPoints(statPoints);

  return {
    hp: calcHp(baseStats.hp, statPoints.hp),
    attack: calcOtherStat(
      baseStats.attack,
      statPoints.attack,
      getNatureMultiplier(nature, "attack"),
    ),
    defense: calcOtherStat(
      baseStats.defense,
      statPoints.defense,
      getNatureMultiplier(nature, "defense"),
    ),
    specialAttack: calcOtherStat(
      baseStats.specialAttack,
      statPoints.specialAttack,
      getNatureMultiplier(nature, "specialAttack"),
    ),
    specialDefense: calcOtherStat(
      baseStats.specialDefense,
      statPoints.specialDefense,
      getNatureMultiplier(nature, "specialDefense"),
    ),
    speed: calcOtherStat(
      baseStats.speed,
      statPoints.speed,
      getNatureMultiplier(nature, "speed"),
    ),
  };
}

export function formatCalculatedStats(stats: CalculatedStats): string {
  return [
    `HP ${stats.hp}`,
    `A ${stats.attack}`,
    `B ${stats.defense}`,
    `C ${stats.specialAttack}`,
    `D ${stats.specialDefense}`,
    `S ${stats.speed}`,
  ].join(" / ");
}
