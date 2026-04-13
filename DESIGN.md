# DESIGN.md

Pokemon Champions Damage Calc の UI 設計ルールです。
このファイルは AI と人間が最初に読む UI の入口です。実装前にここを読み、厳密な値は `design/contracts/` を参照します。

## Design Principles

1. Content first
   ダメージ計算とポケモン情報が主役です。過剰な装飾や演出は避けます。
2. Warm technical surface
   研究ノートや対戦メモのような、暖色寄りで落ち着いたトーンを維持します。
3. One accent family
   強調色はオレンジ系アクセント 1 系統に寄せます。補助色を増やしません。
4. Cards over chrome
   UI はカードと入力面で整理し、強い境界線や派手な影を増やしません。
5. Comfortable density
   情報量は多くても詰め込みすぎません。余白と行間で読ませます。
6. Clear state communication
   エラー、上限超過、読み込みなどの状態は色と文言で明確に伝えます。

## Quick Reference

### Layout

- Page shell: `width: min(1180px, calc(100vw - 32px))`
- Main grid: 2 columns on desktop, 1 column on narrow screens
- Panel spacing: `22px`
- Section gap: `20px` to `24px`

### Surface Tokens

| Token | CSS Variable | Value | Usage |
|------|------|------|------|
| `color.bg` | `--bg` | `#f7f1e3` | base page tone |
| `color.panel` | `--panel` | `rgba(255, 252, 246, 0.88)` | card surface |
| `color.panelStrong` | `--panel-strong` | `#fffdf8` | input surface |
| `color.text` | `--text` | `#1b140f` | primary text |
| `color.muted` | `--muted` | `#65584c` | helper text |
| `color.line` | `--line` | `rgba(91, 74, 57, 0.18)` | border |
| `color.accent` | `--accent` | `#ca5c2d` | primary action |
| `color.accentStrong` | `--accent-strong` | `#9c3f18` | accent depth |
| `color.accentSoft` | `--accent-soft` | `#f6d5bf` | chips |
| `color.danger` | `--danger` | `#a42828` | error state |
| `shadow.panel` | `--shadow` | `0 18px 45px rgba(72, 44, 20, 0.12)` | panels |
| `radius.panel` | `--radius` | `24px` | panels |

### Component Rules

- Hero: one concise headline, one supporting paragraph
- Panel: translucent warm surface, soft border, one heading block
- Primary button: accent gradient, strong text weight, no outline-only variant by default
- Inputs: strong readability, no transparent inputs, no dark theme controls
- Result summary: compact metric cards first, detailed note second

## Forbidden Patterns

| Rule ID | NG | Alternative | Why |
|------|------|------|------|
| `NO_BLUE_PRIMARY` | blue or purple primary accents | use `color.accent` family | visual language drifts from product tone |
| `NO_HARD_BLACK` | pure `#000` text on surfaces | use `color.text` | too harsh for the warm palette |
| `NO_HEAVY_SHADOW` | `shadow-lg` equivalent or stronger | use `shadow.panel` | depth becomes noisy |
| `NO_NEON_GRADIENT` | saturated multi-color gradients | keep the existing warm neutral background | breaks product identity |
| `NO_TIGHT_GRID` | 3+ dense control rows on mobile | collapse to single column | hurts scanability |

## AI Workflow

1. Read this file first.
2. Read `design/authority.md` to understand the source of truth.
3. Read `design/contracts/tokens.json` for exact values.
4. Read `design/contracts/rules.json` for non-negotiable constraints.
5. If updating the calculator UI, read `design/contracts/components/calculator-app.contract.json`.
6. After changing design-related files, run `npm run design:check` and `npm run design:drift`.
