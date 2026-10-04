---
title: uTransform
description: USD scene内のselected primへ追加のTranslation・Rotation・Pivot・Scaleを適用し、Scene Treeで対象を限定するNode。
doc_type: node
term_id: utransform
verification: partial
aliases: [uTransform, uXF]
concepts: [usd-scene, transform, scene-tree]
nodes: [uTransform]
node_family: usd
controls: [Pick, Selected Prims, Translation, Rotation Order, Rotation, Pivot, Scale, Use Target]
inputs: [usd]
outputs: [usd]
tasks: [usd, transform, prim-selection, hierarchy]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uTransform

uTransformは、<Term id="usd-scene">USD scene</Term>またはUSD objectへ追加Transformを適用するNodeです。

scene全体ではなく、Scene Treeから特定primだけを選んで動かせます。

## 入力 / 出力

1つのUSD Scene inputを受け、Transform後のUSD sceneを出力します。

```text
uLoader → uTransform → uMerge → uRenderer
```

## Prim Selection

PickからUSD Scene Treeを開き、対象object / material groupを選択します。

大きなUSD scene内の1 objectだけを動かす場合に、sceneを分解せず選択できます。

## Transform

- Translation
- Rotation Order
- Rotation
- Pivot
- Scale
- Use Target

を持ちます。

Use Targetを有効にすると、指定XYZ targetを向くようrotationを計算します。

## Hierarchy

複数uTransformを直列にし、local movementとgroup / parent movementを分けられます。

```text
USD Scene → uTransform A → uTransform B → uMerge
```

## uMerge Transformとの違い

uMerge Transformは接続したscene全体、uTransformはPrim Selectionでscene内の対象を限定できます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2923–2924で、Scene Input、Pick、Scene Tree、Translation、Rotation、Pivot、Scale、Use Target、hierarchy用途を確認しました。
