# Design Authority

このプロジェクトにおける UI 設計の正本は次の通りです。

1. `design/contracts/tokens.json`
   色、半径、影などの設計値の正本です。
2. `design/contracts/rules.json`
   禁止パターンと設計制約の正本です。
3. `design/contracts/components/calculator-app.contract.json`
   主要 UI の構造と、どのトークンやルールに従うかの正本です。
4. `DESIGN.md`
   AI と人間向けの読みやすい設計ガイドです。説明用の入口であり、厳密値は contracts を優先します。
5. `app/globals.css`
   実装です。値は contracts と一致している必要があります。

判断が衝突した場合の優先順位は `contracts` > `DESIGN.md` > 実装中の提案です。
