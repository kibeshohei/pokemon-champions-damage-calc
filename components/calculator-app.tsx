"use client";

import { useMemo, useState } from "react";

import { calcDamage } from "../src/calculator";
import {
  calculateChampionStats,
  CHAMPIONS_MAX_SINGLE_SP,
  CHAMPIONS_MAX_TOTAL_SP,
  createEmptyStatPoints,
  formatCalculatedStats,
  NATURES,
} from "../src/stats";
import {
  MOVE_CATEGORIES,
  POKEMON_TYPES,
  type Nature,
  type PokemonApiData,
  type PokemonType,
  type StatKey,
  type StatPoints,
} from "../src/types";

type SideState = {
  lookupName: string;
  loading: boolean;
  error: string | null;
  pokemon: PokemonApiData | null;
  natureName: string;
  statPoints: StatPoints;
};

const statLabels: Record<StatKey, string> = {
  hp: "HP",
  attack: "こうげき",
  defense: "ぼうぎょ",
  specialAttack: "とくこう",
  specialDefense: "とくぼう",
  speed: "すばやさ",
};

const initialSideState = (): SideState => ({
  lookupName: "",
  loading: false,
  error: null,
  pokemon: null,
  natureName: "まじめ",
  statPoints: createEmptyStatPoints(),
});

const DEFAULT_NATURE: Nature = { name: "まじめ" };

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

function findNature(name: string): Nature {
  return NATURES.find((nature) => nature.name === name) ?? DEFAULT_NATURE;
}

function getTotalStatPoints(statPoints: StatPoints): number {
  return Object.values(statPoints).reduce((sum, value) => sum + value, 0);
}

function getCalculatedStats(
  pokemon: PokemonApiData | null,
  statPoints: StatPoints,
  natureName: string,
) {
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

function StatSummary({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="summary-card">
      <span className="summary-label">{title}</span>
      <strong className="summary-value">{value}</strong>
    </div>
  );
}

function PokemonPanel({
  title,
  side,
  onLookupNameChange,
  onFetch,
  onNatureChange,
  onStatPointChange,
}: {
  title: string;
  side: SideState;
  onLookupNameChange: (value: string) => void;
  onFetch: () => void;
  onNatureChange: (value: string) => void;
  onStatPointChange: (key: StatKey, value: number) => void;
}) {
  const totalSp = getTotalStatPoints(side.statPoints);
  const calculatedStats = getCalculatedStats(
    side.pokemon,
    side.statPoints,
    side.natureName,
  );

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>Pokemon</h2>
        </div>
        <span className="level-chip">Lv.50 fixed</span>
      </div>

      <div className="lookup-row">
        <input
          className="text-input"
          value={side.lookupName}
          onChange={(event) => onLookupNameChange(event.target.value)}
          placeholder="ガブリアス / メガガブリアス / garchomp"
        />
        <button
          className="primary-button"
          type="button"
          onClick={onFetch}
          disabled={side.loading}
        >
          {side.loading ? "取得中..." : "取得"}
        </button>
      </div>

      {side.error ? <p className="error-text">{side.error}</p> : null}

      {side.pokemon ? (
        <>
          <div className="pokemon-card">
            <div>
              <p className="pokemon-name">{side.pokemon.displayName}</p>
              <p className="pokemon-subtle">{side.pokemon.types.join(" / ")}</p>
            </div>
            <p className="pokemon-subtle">
              種族値 {formatCalculatedStats(side.pokemon.baseStats)}
            </p>
          </div>

          <div className="nature-row">
            <label className="field-label" htmlFor={`${title}-nature`}>
              性格
            </label>
            <select
              id={`${title}-nature`}
              className="select-input"
              value={side.natureName}
              onChange={(event) => onNatureChange(event.target.value)}
            >
              {NATURES.map((nature) => (
                <option key={nature.name} value={nature.name}>
                  {nature.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sp-grid">
            {(
              Object.keys(side.statPoints) as StatKey[]
            ).map((key) => (
              <label className="field" key={key}>
                <span className="field-label">{statLabels[key]} SP</span>
                <input
                  className="number-input"
                  type="number"
                  min={0}
                  max={CHAMPIONS_MAX_SINGLE_SP}
                  value={side.statPoints[key]}
                  onChange={(event) =>
                    onStatPointChange(key, Number(event.target.value))
                  }
                />
              </label>
            ))}
          </div>

          <p className={`sp-caption${totalSp > CHAMPIONS_MAX_TOTAL_SP ? " is-error" : ""}`}>
            SP合計: {totalSp} / {CHAMPIONS_MAX_TOTAL_SP}
          </p>

          {calculatedStats ? (
            <div className="result-box">
              <span className="result-label">実数値</span>
              <strong>{formatCalculatedStats(calculatedStats)}</strong>
            </div>
          ) : null}
        </>
      ) : (
        <p className="helper-text">
          ポケモンを取得すると、タイプ、種族値、チャンピオンズ仕様の実数値を表示します。
        </p>
      )}
    </section>
  );
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

      <section className="panel move-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">技設定</p>
            <h2>Move</h2>
          </div>
        </div>

        <div className="move-grid">
          <label className="field">
            <span className="field-label">分類</span>
            <select
              className="select-input"
              value={moveCategory}
              onChange={(event) =>
                setMoveCategory(event.target.value as (typeof MOVE_CATEGORIES)[number])
              }
            >
              {MOVE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">威力</span>
            <input
              className="number-input"
              type="number"
              min={1}
              value={movePower}
              onChange={(event) => setMovePower(event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">タイプ</span>
            <select
              className="select-input"
              value={moveType}
              onChange={(event) => setMoveType(event.target.value as PokemonType)}
            >
              {POKEMON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="result-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">結果</p>
            <h2>Damage</h2>
          </div>
        </div>

        {calculation?.error ? (
          <p className="error-text">{calculation.error}</p>
        ) : calculation?.result ? (
          <>
            <div className="summary-grid">
              <StatSummary
                title="ダメージ"
                value={`${calculation.result.min} - ${calculation.result.max}`}
              />
              <StatSummary
                title="割合"
                value={`${calculation.result.minPercent} - ${calculation.result.maxPercent}`}
              />
              <StatSummary
                title="タイプ相性"
                value={`x${calculation.result.effectiveness}`}
              />
              <StatSummary
                title="STAB"
                value={calculation.hasStab ? "あり" : "なし"}
              />
            </div>

            <div className="result-box">
              <span className="result-label">詳細</span>
              <strong>
                攻撃実数値 {calculation.attackValue} / 防御実数値 {calculation.defenseValue}
              </strong>
              <p className="helper-text">
                {calculation.result.ohko
                  ? "確定一発です。"
                  : "確定一発ではありません。"}
              </p>
            </div>
          </>
        ) : (
          <p className="helper-text">
            攻撃側と防御側のポケモンを取得すると、ここにダメージ結果を表示します。
          </p>
        )}
      </section>
    </main>
  );
}
