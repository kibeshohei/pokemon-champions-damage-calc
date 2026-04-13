# DESIGN.md

Pokemon Champions Damage Calc の UI 設計ルールです。  
このファイルは、AI と人間が最初に読む UI 設計の入口です。実装前にここを読み、厳密な値は `design/contracts/` を参照します。

## 設計原則

1. Content first
   主役はダメージ計算結果とポケモン情報です。装飾が情報より前に出ないようにします。
2. Warm technical surface
   研究ノートや対戦メモのような、暖色寄りで落ち着いた技術画面の雰囲気を維持します。
3. One accent family
   強調色はオレンジ系 1 系統に寄せます。補助色や別系統の主役色は増やしません。
4. Cards over chrome
   UI はカードと入力面で整理します。太い境界線、派手な装飾、強すぎる影は避けます。
5. Comfortable density
   情報量は多くても詰め込みすぎません。余白と行間で読みやすさを確保します。
6. Clear state communication
   エラー、上限超過、読み込み中などの状態は、色と文言で明確に伝えます。

## クイックリファレンス

### レイアウト

- ページ全体の横幅は `width: min(1180px, calc(100vw - 32px))` を基準にする
- メインの 2 カラムはデスクトップ前提。狭い画面では 1 カラムに落とす
- パネル内余白は `22px` を基準にする
- セクション間の余白は `20px` から `24px` を基準にする

### サーフェストークン

| Token | CSS Variable | Value | Usage |
|------|------|------|------|
| `color.bg` | `--bg` | `#f7f1e3` | ページ全体のベース色 |
| `color.panel` | `--panel` | `rgba(255, 252, 246, 0.88)` | カードやパネルの面 |
| `color.panelStrong` | `--panel-strong` | `#fffdf8` | 入力欄の面 |
| `color.text` | `--text` | `#1b140f` | 本文や主要な文字色 |
| `color.muted` | `--muted` | `#65584c` | 補助テキスト |
| `color.line` | `--line` | `rgba(91, 74, 57, 0.18)` | 枠線 |
| `color.accent` | `--accent` | `#ca5c2d` | 主要アクションの色 |
| `color.accentStrong` | `--accent-strong` | `#9c3f18` | アクセントの濃い側 |
| `color.accentSoft` | `--accent-soft` | `#f6d5bf` | チップや補助強調 |
| `color.danger` | `--danger` | `#a42828` | エラー状態 |
| `shadow.panel` | `--shadow` | `0 18px 45px rgba(72, 44, 20, 0.12)` | パネルの影 |
| `radius.panel` | `--radius` | `24px` | パネル角丸 |

### コンポーネントルール

- Hero: 見出しは短く、補足文は 1 段落に収める
- Panel: 暖色寄りの半透明面、やわらかい境界線、見出しブロックは 1 つにまとめる
- Primary button: アクセント系グラデーションを使い、文字は強めにする。基本はアウトライン単体にしない
- Inputs: 可読性を優先し、透明入力やダークテーマ寄りの入力面にしない
- Result summary: 先に指標カード、その後に詳細補足を置く

## 禁止パターン

| Rule ID | NG | Alternative | Why |
|------|------|------|------|
| `NO_BLUE_PRIMARY` | 青や紫を主役アクセントに使う | `color.accent` 系で統一する | プロダクトの雰囲気がずれる |
| `NO_HARD_BLACK` | UI 面の上で `#000` を多用する | `color.text` を使う | 暖色パレットに対して強すぎる |
| `NO_HEAVY_SHADOW` | `shadow-lg` 相当以上の強い影 | `shadow.panel` を再利用する | 奥行きがうるさくなる |
| `NO_NEON_GRADIENT` | 彩度の高い多色グラデーション | 今の暖色ニュートラル背景を保つ | 画面全体の統一感が壊れる |
| `NO_TIGHT_GRID` | モバイルで 3 列以上の密な入力配置 | 1 カラムに落とす | 読み取りと操作がしづらい |

## AI 向けの作業手順

1. まずこのファイルを読む
2. 次に `design/authority.md` を読んで source of truth を理解する
3. 厳密な値は `design/contracts/tokens.json` を参照する
4. 守るべき制約は `design/contracts/rules.json` を参照する
5. 計算機 UI を触る場合は `design/contracts/components/calculator-app.contract.json` を読む
6. デザイン関連ファイルを変更したら `npm run design:check` と `npm run design:drift` を実行する
