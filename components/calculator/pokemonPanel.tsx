import {
  CHAMPIONS_MAX_SINGLE_SP,
  CHAMPIONS_MAX_TOTAL_SP,
  formatCalculatedStats,
  NATURES,
} from "../../src/stats";
import type { StatKey } from "../../src/types";
import { getCalculatedStats, getTotalStatPoints } from "./helpers";
import type { SideState } from "./types";

const statLabels: Record<StatKey, string> = {
  hp: "HP",
  attack: "こうげき",
  defense: "ぼうぎょ",
  specialAttack: "とくこう",
  specialDefense: "とくぼう",
  speed: "すばやさ",
};

export function PokemonPanel({
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
            {(Object.keys(side.statPoints) as StatKey[]).map((key) => (
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

          <p
            className={`sp-caption${totalSp > CHAMPIONS_MAX_TOTAL_SP ? " is-error" : ""}`}
          >
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
