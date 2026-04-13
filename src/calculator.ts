import { getTypeEffectiveness } from "./data/typeChart";
import type { Attacker, DamageResult, Defender } from "./types";

export function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5);
}

export function calcDamage(
  attacker: Attacker,
  defender: Defender,
): DamageResult {
  const base =
    Math.floor(
      (Math.floor((attacker.level * 2) / 5 + 2) *
        attacker.movePower *
        attacker.attack) /
        defender.defense /
        50,
    ) + 2;

  const effectiveness = getTypeEffectiveness(attacker.moveType, defender.types);

  const rolls = Array.from({ length: 16 }, (_, index) => {
    const randomMultiplier = (85 + index) / 100;
    let damage = Math.floor(base * randomMultiplier);

    if (attacker.hasStab) {
      damage = roundHalfUp(damage * 1.5);
    }

    damage = Math.floor(damage * effectiveness);
    return damage;
  });

  const min = Math.min(...rolls);
  const max = Math.max(...rolls);

  return {
    min,
    max,
    minPercent: `${((min / defender.hp) * 100).toFixed(1)}%`,
    maxPercent: `${((max / defender.hp) * 100).toFixed(1)}%`,
    ohko: min >= defender.hp,
    effectiveness,
    rolls,
  };
}
