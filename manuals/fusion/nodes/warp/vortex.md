---
title: "Vortex"
description: "指定領域のImageを中心の周囲へ巻き込み、渦状のwarpを作るNode。"
doc_type: node
term_id: "vortex"
term_short: "Vortexは、指定領域を中心の周囲へ渦状に巻き込むNode。"
verification: partial
aliases: ["Vortex", "Vtx"]
concepts: ["image-data"]
nodes: ["Vortex"]
node_family: "warp"
controls: ["Center", "Size", "Angle", "Power"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["warp-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Vortex

Vortexは、指定した中心の周囲へImageを巻き込み、whirlpoolのような渦状のwarpを作るNodeです。Center、Size、Angle、Powerをanimationすると、渦を移動・拡大・回転させられます。

## 入力と出力

オレンジ色のInputへ、渦状に変形したい2D Imageを接続します。青色のEffect MaskへMaskを接続すると、Vortexの効果を必要な領域だけに限定できます。出力は指定領域が渦状に変形された2D Imageです。

## 主な設定項目

### Center X / Y

Vortexの中心位置を決めます。Viewer上で渦の中心を対象へ合わせます。

### Size

Vortexが影響する範囲を調整します。Viewer上の円周をdragして変更することもできます。

### Angle

Vortexの回転量を調整します。値を大きくするほど巻き込みが強くなります。

### Power

Vortexの集中度を調整します。21.1 Manualでは、Powerを上げるとVortexが小さく、よりtightになると説明されています。

## 主な用途

- logoやTextの一部を渦状に巻き込む
- 画面の一部分だけをtwistしてdistortionを作る
- Center / Size / Angleをanimationし、移動・成長する渦を作る
- 背景patternへ局所的な回転distortionを加える

## 最小構成

    MediaIn → Vortex → MediaOut

Centerを歪ませたい位置へ合わせ、Sizeで範囲を決めます。Angleを少しずつ上げて回転量を確認し、Powerで渦の締まり方を調整します。

## Text+で使う場合

Textを渦状に変形する場合、文字の元のImage domainが小さいと、Vortexで外側へ動いたpixelが境界で切れることがあります。

21.1 ManualのBasic Node Setupでは、Text+の後段へSet Domainを置いてImage boundaryを広げ、その後にVortexを適用しています。

    Text+ → Set Domain → Vortex → MediaOut

これにより、渦で文字が元の境界外へ動いてもcropされにくくなります。

## Dent / Dripとの違い

- **Vortex** — 中心の周囲へImageを回転させ、渦状に巻き込む
- **Dent** — 中心の周囲を膨らませたり凹ませたりする
- **Drip** — ripple patternを周期的に並べ、波紋状に歪ませる

## 挙動と注意点

Powerを上げると影響範囲が単純に広がるのではなく、渦がより小さくtightになります。範囲の大きさはSize、巻き込み量はAngle、集中度はPowerとして分けて調整します。

Text+などImage domainが内容に合わせて小さい素材では、必要に応じてSet Domainで余白を確保してからVortexを適用します。

## 関連Node

- [Dent](./dent)
- [Drip](./drip)
- [Coordinate Space](./coordinate-space)
- [Set Domain](../transform/set-domain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2986–2987で、Input / Effect Mask、Center、Size、Angle、Power、Text+ + Set Domainを使うBasic Node Setupを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
