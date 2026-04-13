import type { DamageResult } from "../../src/types";
import { StatSummary } from "./statSummary";

type CalculationState =
  | {
      error: string;
      result?: never;
      attackValue?: never;
      defenseValue?: never;
      hasStab?: never;
    }
  | {
      error?: never;
      result: DamageResult;
      attackValue: number;
      defenseValue: number;
      hasStab: boolean;
    }
  | null;

export function ResultPanel({
  calculation,
}: {
  calculation: CalculationState;
}) {
  return (
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
  );
}
