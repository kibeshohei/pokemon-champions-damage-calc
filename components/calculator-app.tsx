"use client";

import { useMemo, useState } from "react";

import { MovePanel } from "./calculator/movePanel";
import { PokemonPanel } from "./calculator/pokemonPanel";
import { ResultPanel } from "./calculator/resultPanel";
import { getCalculatedStats, getTotalStatPoints } from "./calculator/helpers";
import type { SideState } from "./calculator/types";
import { calcDamage } from "../src/calculator";
import {
  CHAMPIONS_MAX_SINGLE_SP,
  CHAMPIONS_MAX_TOTAL_SP,
  createEmptyStatPoints,
} from "../src/stats";
import {
  MOVE_CATEGORIES,
  type PokemonApiData,
  type PokemonType,
  type StatKey,
} from "../src/types";

const initialSideState = (): SideState => ({
  lookupName: "",
  loading: false,
  error: null,
  pokemon: null,
  natureName: "まじめ",
  statPoints: createEmptyStatPoints(),
});

async function fetchPokemon(name: string): Promise<PokemonApiData> {
  const response = await fetch(`/api/pokemon?name=${encodeURIComponent(name)}`);
  const payload = (await response.json()) as {
    pokemon?: PokemonApiData;
    error?: string;
  };

  if (!response.ok || !payload.pokemon) {
    throw new Error(payload.error ?? "ポケモンの取得に失敗しました。");
  }

  return payload.pokemon;
}

function isSpecialMoveCategory(category: (typeof MOVE_CATEGORIES)[number]): boolean {
  return category === "特殊";
}

function getManualDamageRangeError(value: string, label: string): string | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return `${label}は1以上の整数で入力してください。`;
  }

  return null;
}

export function CalculatorApp() {
  const [attacker, setAttacker] = useState<SideState>(initialSideState);
  const [defender, setDefender] = useState<SideState>(initialSideState);
  const [moveCategory, setMoveCategory] =
    useState<(typeof MOVE_CATEGORIES)[number]>("物理");
  const [movePower, setMovePower] = useState("100");
  const [moveType, setMoveType] = useState<PokemonType>("じめん");

  const attackStats = getCalculatedStats(
    attacker.pokemon,
    attacker.statPoints,
    attacker.natureName,
  );
  const defenseStats = getCalculatedStats(
    defender.pokemon,
    defender.statPoints,
    defender.natureName,
  );

  const calculation = useMemo(() => {
    if (!attacker.pokemon || !defender.pokemon || !attackStats || !defenseStats) {
      return null;
    }

    if (getTotalStatPoints(attacker.statPoints) > CHAMPIONS_MAX_TOTAL_SP) {
      return { error: `攻撃側のSP合計は ${CHAMPIONS_MAX_TOTAL_SP} 以下にしてください。` };
    }

    if (getTotalStatPoints(defender.statPoints) > CHAMPIONS_MAX_TOTAL_SP) {
      return { error: `防御側のSP合計は ${CHAMPIONS_MAX_TOTAL_SP} 以下にしてください。` };
    }

    const movePowerError = getManualDamageRangeError(movePower, "わざ威力");

    if (movePowerError) {
      return { error: movePowerError };
    }

    const attackValue = isSpecialMoveCategory(moveCategory)
      ? attackStats.specialAttack
      : attackStats.attack;
    const defenseValue = isSpecialMoveCategory(moveCategory)
      ? defenseStats.specialDefense
      : defenseStats.defense;
    const hasStab = attacker.pokemon.types.includes(moveType);
    const result = calcDamage(
      {
        level: 50,
        attack: attackValue,
        moveCategory,
        movePower: Number(movePower),
        moveType,
        hasStab,
      },
      {
        hp: defenseStats.hp,
        defense: defenseValue,
        types: defender.pokemon.types,
      },
    );

    return {
      result,
      attackValue,
      defenseValue,
      hasStab,
    };
  }, [attacker, attackStats, defenseStats, defender, moveCategory, movePower, moveType]);

  const handleFetch = async (
    side: "attacker" | "defender",
    state: SideState,
    setState: React.Dispatch<React.SetStateAction<SideState>>,
  ) => {
    const trimmed = state.lookupName.trim();

    if (!trimmed) {
      setState((current) => ({
        ...current,
        error: "ポケモン名を入力してください。",
      }));
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const pokemon = await fetchPokemon(trimmed);
      setState((current) => ({
        ...current,
        loading: false,
        error: null,
        pokemon,
      }));

      if (side === "attacker" && pokemon.types[0]) {
        setMoveType(pokemon.types[0]);
      }
    } catch (error: unknown) {
      setState((current) => ({
        ...current,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "ポケモンの取得に失敗しました。",
      }));
    }
  };

  const updateSideStatPoint = (
    setState: React.Dispatch<React.SetStateAction<SideState>>,
    key: StatKey,
    value: number,
  ) => {
    setState((current) => ({
      ...current,
      statPoints: {
        ...current.statPoints,
        [key]: Number.isFinite(value)
          ? Math.min(CHAMPIONS_MAX_SINGLE_SP, Math.max(0, value))
          : 0,
      },
    }));
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Pokemon Champions Damage Calc</p>
        <h1>Vercel 配備前提の Next.js ダメージ計算ツール</h1>
        <p className="hero-copy">
          PokeAPI の日本語名解決とローカルキャッシュを使いながら、チャンピオンズ仕様の
          SP 配分でレベル 50 の実数値を計算します。
        </p>
      </section>

      <section className="grid-layout">
        <PokemonPanel
          title="攻撃側"
          side={attacker}
          onLookupNameChange={(value) =>
            setAttacker((current) => ({ ...current, lookupName: value }))
          }
          onFetch={() => handleFetch("attacker", attacker, setAttacker)}
          onNatureChange={(value) =>
            setAttacker((current) => ({ ...current, natureName: value }))
          }
          onStatPointChange={(key, value) =>
            updateSideStatPoint(setAttacker, key, value)
          }
        />

        <PokemonPanel
          title="防御側"
          side={defender}
          onLookupNameChange={(value) =>
            setDefender((current) => ({ ...current, lookupName: value }))
          }
          onFetch={() => handleFetch("defender", defender, setDefender)}
          onNatureChange={(value) =>
            setDefender((current) => ({ ...current, natureName: value }))
          }
          onStatPointChange={(key, value) =>
            updateSideStatPoint(setDefender, key, value)
          }
        />
      </section>
      <MovePanel
        moveCategory={moveCategory}
        movePower={movePower}
        moveType={moveType}
        onMoveCategoryChange={setMoveCategory}
        onMovePowerChange={setMovePower}
        onMoveTypeChange={setMoveType}
      />
      <ResultPanel calculation={calculation} />
    </main>
  );
}
