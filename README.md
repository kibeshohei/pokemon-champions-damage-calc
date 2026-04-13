# Pokemon Champions Damage Calc

Pokemon Champions 向けのダメージ計算ツールです。  
Next.js でフロントを実装し、PokeAPI からポケモン情報を取得しつつ、日本語名インデックスをローカルキャッシュして使います。

## Features

- Next.js App Router ベースのGUI
- PokeAPI を使ったポケモン取得
- 日本語名入力対応
  - 例: `ガブリアス`, `メガガブリアス`
- チャンピオンズ仕様の実数値計算
  - レベル50固定
  - IV 31固定
  - SP 0-32
  - SP合計 66
  - 性格補正あり
- ダメージ乱数16段階の計算

## Tech Stack

- Next.js
- React
- TypeScript
- PokeAPI

## Development

Node.js 18 以上を想定しています。

### Install

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### AI Design Checks

```bash
npm run design:check
npm run design:drift
```

### Refresh Local PokeAPI Cache

```bash
npm run refresh:pokeapi-cache
```

初回の日本語名検索では、`.cache/pokeapi/` に日本語名インデックスとポケモン詳細キャッシュを保存します。

## Project Structure

```text
app/
  api/pokemon/route.ts     # ポケモン取得API
  globals.css              # 全体スタイル
  layout.tsx               # ルートレイアウト
  page.tsx                 # メイン画面
components/
  calculator-app.tsx       # メインUI
src/
  calculator.ts            # ダメージ計算
  stats.ts                 # 実数値計算
  types.ts                 # 型定義
  data/typeChart.ts        # タイプ相性
  lib/pokeapi.ts           # PokeAPI取得
  lib/pokeapiCache.ts      # ローカルキャッシュ
  lib/pokemonNameResolver.ts
  scripts/refresh-pokeapi-cache.ts
design/
  authority.md             # デザインの source of truth
  contracts/
    tokens.json            # UIトークンの正本
    rules.json             # 禁止パターンの正本
    components/            # コンポーネント契約
scripts/design/
  check.mjs                # DESIGN.md / contracts / CSS の整合性検証
  drift.mjs                # DESIGN.md と contracts のドリフト検出
```

## Notes

- 現時点では技データの自動取得は未実装です。
- 本番での `.cache` 永続化は前提にしていません。
- Vercel への配備を想定しています。

## AI-Ready Design Workflow

- UI の原則は `DESIGN.md` を先に読む
- 厳密な値と制約は `design/contracts/` を参照する
- デザイン関連を変更したら `npm run design:check` と `npm run design:drift` を実行する
