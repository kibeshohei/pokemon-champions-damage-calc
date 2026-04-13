export const POKEMON_TYPES = [
  "ノーマル",
  "ほのお",
  "みず",
  "くさ",
  "でんき",
  "こおり",
  "かくとう",
  "どく",
  "じめん",
  "ひこう",
  "エスパー",
  "むし",
  "いわ",
  "ゴースト",
  "ドラゴン",
  "あく",
  "はがね",
  "フェアリー",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export const MOVE_CATEGORIES = ["物理", "特殊"] as const;

export type MoveCategory = (typeof MOVE_CATEGORIES)[number];

export type Attacker = {
  level: number;
  attack: number;
  moveCategory: MoveCategory;
  movePower: number;
  moveType: PokemonType;
  hasStab: boolean;
};

export type Defender = {
  hp: number;
  defense: number;
  types: [PokemonType] | [PokemonType, PokemonType];
};

export type DamageResult = {
  min: number;
  max: number;
  minPercent: string;
  maxPercent: string;
  ohko: boolean;
  effectiveness: number;
  rolls: number[];
};

export type BaseStats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

export type PokemonApiData = {
  apiName: string;
  displayName: string;
  speciesName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  baseStats: BaseStats;
};

export const STAT_KEYS = [
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export type StatPoints = Record<StatKey, number>;

export type CalculatedStats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

export type Nature = {
  name: string;
  increasedStat?: Exclude<StatKey, "hp">;
  decreasedStat?: Exclude<StatKey, "hp">;
};
