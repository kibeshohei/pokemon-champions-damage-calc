import { MOVE_CATEGORIES, POKEMON_TYPES, type PokemonType } from "../../src/types";

export function MovePanel({
  moveCategory,
  movePower,
  moveType,
  onMoveCategoryChange,
  onMovePowerChange,
  onMoveTypeChange,
}: {
  moveCategory: (typeof MOVE_CATEGORIES)[number];
  movePower: string;
  moveType: PokemonType;
  onMoveCategoryChange: (value: (typeof MOVE_CATEGORIES)[number]) => void;
  onMovePowerChange: (value: string) => void;
  onMoveTypeChange: (value: PokemonType) => void;
}) {
  return (
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
              onMoveCategoryChange(event.target.value as (typeof MOVE_CATEGORIES)[number])
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
            onChange={(event) => onMovePowerChange(event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">タイプ</span>
          <select
            className="select-input"
            value={moveType}
            onChange={(event) => onMoveTypeChange(event.target.value as PokemonType)}
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
  );
}
