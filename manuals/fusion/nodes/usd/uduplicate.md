---
title: uDuplicate
description: USD assetを連続複製し、copyごとのTransform・Time Offset・Jitter・Region制限でarrayやscatterを作るNode。
doc_type: node
term_id: uduplicate
verification: partial
aliases: [uDuplicate, uDp]
concepts: [usd-scene, transform, procedural-layout]
nodes: [uDuplicate]
node_family: usd
controls: [USD Instancing, Copies, Time Offset, Transform Method, Transform Order, Translation, Rotation, Pivot, Scale, Random Seed, Jitter Probability, Translation Jitter, Rotation Jitter, Scale Jitter, Region Mode, Region]
inputs: [usd, usd]
outputs: [usd]
tasks: [usd, duplicate, array, scatter]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uDuplicate

uDuplicateは、<Term id="usd-scene">USD asset</Term>を複製し、copyごとにTransformを積み重ねてarrayを作るNodeです。

Jitterで位置・回転・scaleをばらつかせ、Regionでcopyを出す範囲を限定できます。

## 入力

必須Scene Inputへ複製するUSD scene / objectを接続します。

Region = Meshの場合は、copyを出す範囲として使うMesh inputが追加されます。

## Copies / Instancing

Copiesで生成範囲を決めます。

USD Instancingを有効にするとcopy間で同じUSD dataを共有し、効率を上げられる場合があります。copy差が大きい場合は逆に効率が落ちることもあるため、必要なら無効化します。

## Transform Method

- Linear — copy番号に応じてTransform量を計算
- Accumulated — 前copyの結果を次copyの基準にする

Translation / Rotation / Pivot / Scaleを組み合わせると、直線array、spiral、階段状配置等を作れます。

## Time Offset

source geometryにanimationがある場合、copyごとに参照frameをずらします。

## Jitter

Random Seed、Probability、Translation / Rotation / Pivot / Scale Jitterでcopyごとのばらつきを加えます。

## Region

Ignore / When inside / When not insideで、指定Regionの内外にcopyを出すかを制御します。

Cube、Sphere、Rectangle、Mesh、All等を使えます。

## 最小構成

```text
uShape / uLoader → uDuplicate → uMerge → uRenderer
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2895–2899で、Scene / Mesh inputs、USD Instancing、Copies、Transform、Time Offset、Jitter、Regionを確認しました。
