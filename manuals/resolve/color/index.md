---
title: Colorページ
description: DaVinci Resolve Colorページの学習、操作ツール、実践手順、トラブルシューティングの入口。
doc_type: index
verification: partial
product_scope: color
suite_surfaces: [color]
tasks: [grade, color-correct, color-management, match-shots]
updated: "2026-10-22"
---

# Colorページ

Colorページは、素材の明るさや色の偏りを整え、複数ショットの見え方をそろえ、必要な部分だけを調整して作品全体の色を仕上げる場所です。ノードで補正を分けながら、ViewerとScopesで結果を確かめます。

ここでは**理解する（Learn）／機能を引く（Reference）／作り方から探す（Recipes）／症状から調べる（Troubleshooting）**を分けて増やします。未作成のページへのリンクは置きません。

## 初めて開く場合

1. [最初のグレーディング：補正前に何を確認するか](./learn/first-grade)
2. [ColorページのNode Graph](./learn/color-node-graph)
3. [Primariesのカラーホイール](./reference/primaries-color-wheels)
4. [Scopesで明暗と色の偏りを読む](./reference/scopes)

## 学ぶ（Learn）

- [最初のグレーディング](./learn/first-grade) — 撮影素材の条件、補正順、比較の基礎
- [ColorページのNode Graph](./learn/color-node-graph) — シリアルノードと処理順の基本

## 機能を引く（Reference）

- [Primariesのカラーホイール](./reference/primaries-color-wheels) — Lift / Gamma / Gain / Offsetを目的別に使い分ける
- [Scopes](./reference/scopes) — Waveform / Parade / Vectorscopeを補正判断に使う
- [Log Wheels](./reference/log-wheels) — LogホイールのShadows／Midtones／Highlightsとレンジ設定
- [HDRパレット](./reference/hdr-palette) — Global、6つの明暗ゾーン、Range／Falloff

## 次に整備する領域

機能固有の操作、使い分け、実践的な手順を、公式21.1マニュアルと実機確認を基に段階的に追加します。候補はCustom Curves、Hue系Curves、Qualifier、Power Window、Tracker、Key、Gallery／Stills、Color Management、Shot Matching、Noise Reductionなどです。

## Fusionとの差

- Colorページの補正はショットの色と階調の調整が中心です。
- Fusionの色処理は合成フローの内部でも行えますが、Colorページと同じNode一覧ではありません。
- 色空間変換や効果が複数ページで行える場合は、その位置と前後の処理条件を確認します。

## 出典と検証状況

- [Blackmagic Design：Colorページの機能紹介](https://www.blackmagicdesign.com/products/davinciresolve/color)
- [DaVinci Resolve 21.1 Reference Manual（公式サポート）](https://www.blackmagicdesign.com/support)

現段階は公式機能紹介に基づく基礎記事です。全Control、初期値、Free／Studio差、21.1実機画面の網羅は未検証であり、**全記事完成や実機受入を意味しません**。
