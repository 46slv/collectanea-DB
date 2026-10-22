---
title: Primaries（カラーホイール）
description: Lift、Gamma、Gain、Offsetを使ってColorページの画像全体の明暗と色バランスを調整する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Lift, Gamma, Gain, Offset]
tasks: [primary-correction, balance-image, color-correct]
level: beginner
updated: "2026-10-21"
---

# Primaries（カラーホイール）

Primariesのカラーホイールは、画像全体の色バランスと明るさを調整する基本機能です。撮影した素材の色の偏りを整えたり、暗部と明部へ異なる色調を与えたりするときに使います。

## Lift / Gamma / Gain / Offset

| Control | 主に扱う範囲 | 使い方の例 |
| --- | --- | --- |
| **Lift** | 暗部を中心とした範囲 | 黒付近の色かぶりや暗さを調整する |
| **Gamma** | 中間調を中心とした範囲 | 顔や中間の明るさを調整する |
| **Gain** | 明部を中心とした範囲 | 光が当たる部分の強さや色を整える |
| **Offset** | 画像全体 | 全体の色方向や明るさをまとめて変える |

Lift・Gamma・Gainの対象範囲は、独立した3つの硬い帯に区切られているわけではなく、影響が重なります。「Gammaは肌だけ」「Gainは白だけ」という固定対応ではありません。

## カラー操作と明暗操作

カラーホイールを動かすと、選んだ範囲の色バランスを変えられます。同じPrimariesの中でも、画像の明暗を調整する操作と色方向を変える操作を区別して見ることが重要です。

例えば暗部が青く、人物の中間調はおおむね自然に見える素材では、最初にLiftで暗部の偏りを少し調整し、その後で必要なGamma調整を行います。全体をOffsetで反対色へ振ると、整っていた中間調まで変わることがあります。

## 最小の操作例

1. 補正するショットをColorページで開き、Primariesを表示します。
2. [Waveform／Parade](./scopes)で現在の明暗とRGBの分布を観察します。
3. まずLift、Gamma、Gain、Offsetのうち**1つだけ**を少量動かします。
4. ViewerとScopesを比較し、想定した範囲が変わったか確認します。
5. 補正の有効／無効を切り替え、何が改善し何が失われたか判断します。

必要なら基本補正を別Nodeへ分け、[Node Graph](../learn/color-node-graph)で順序を確認します。

## 似た機能との違い

- **Primaries**：画像全体の明暗と色バランスを調整する基本操作。
- **HDR Wheels**：より細かい明暗領域を指定して調整できる機能。
- **Curves**：入力値と出力値の関係や、特定の色範囲への変化を曲線で編集する機能。

同じ見た目に近づけられる場合も、調整の分離方法や処理範囲は異なります。

## 検証状況と出典

[Blackmagic Design：DaVinci Resolve Color](https://www.blackmagicdesign.com/products/davinciresolve/color)のPrimary Wheels説明に基づく概要です。21.1の細かなControl名、デフォルト、数値範囲、Color Managementモード依存の挙動やFree／Studio差は、[公式21.1 Reference Manual](https://www.blackmagicdesign.com/support)と実機による追補対象です。
