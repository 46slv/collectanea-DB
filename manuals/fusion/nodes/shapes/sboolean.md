---
title: "sBoolean"
description: "Shape同士のBoolean演算。"
doc_type: node
term_id: "sboolean"
term_short: "sBooleanは、Shape同士のBoolean演算。"
verification: partial
aliases: ["sBoolean"]
concepts: ["shape-data"]
nodes: ["sBoolean"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
tasks: ["build-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# sBoolean

sBooleanは、2つの<Term id="shape-data">Shape</Term>の重なり方をIntersection / Union / Subtract / Xorで組み合わせるNodeです。

通常のsMergeがshapeをlayerとして重ねるのに対し、sBooleanは**重なった領域そのものを計算して新しいshapeを作る**ために使います。

## 入力

- **Input1** — required。Subtractでは基準shapeになります。
- **Input2** — optional。SubtractではInput1から切り抜くshapeになります。

Subtract以外では、どちらへ接続するかで結果は基本的に変わりません。

## Operation

- **Intersection** — 2 shapeが重なった部分だけ残す
- **Union** — どちらか一方にshapeがある領域を残す
- **Subtract** — Input1からInput2が重なる部分を除く
- **Xor** — 片方だけにshapeがある領域を残し、重なりを消す

## Style

sBooleanではupstreamの個別Styleをそのまま使うのではなく、Style tabのColorでoutput shape全体の色とAlphaを上書きできます。

Allow Combiningは、後段でDuplicate / Grid等によってself-overlapしたときにAlphaを重ね合わせるか保持するかを決めます。

## 最小構成

    sStar ───┐
             ├─ sBoolean → sRender → Image
    sEllipse ┘

Subtractで円形の穴を開ける、Intersectionで重なりだけを残す、といった形状生成に使えます。

## sMergeとの違い

- **sMerge** — 複数shapeをlayerとして1 treeにまとめる
- **sBoolean** — overlap領域を計算してshape geometryを作り替える

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 117 pp.2729–2732で、2 inputs、4 Operation、Style、Allow Combiningを確認しました。
