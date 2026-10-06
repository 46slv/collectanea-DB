---
title: Custom Poly
description: Polygon / Pathの各pointへexpressionを評価し、既存pointを移動または独自point setへ置換するShape Modifier。
doc_type: node
term_id: custom-poly
verification: partial
aliases: [Custom Poly]
concepts: [shape-data, expressions, modifiers]
nodes: [Custom Poly]
node_family: modifiers
outputs: [shape]
tasks: [shape-expression, procedural-path, modifier]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Custom Poly

Custom Polyは、Polygon maskやPathの各pointに対してexpressionを評価し、point位置をproceduralに変更するModifierです。

Custom Tool / pCustomのpolyline版に近く、shapeを数式で変形したい場合に使います。

## Inputs

初期状態ではpoint input 1つとnumber variable 4つを持ち、Config tabから最大9まで増やせます。

expression側からこれらを参照して各output pointを計算します。

## 使う場面

- path pointをnoiseや数式で変形
- 外部point controlへshapeを追従
- 規則的なwave / deformationをpolylineへ適用

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 124 pp.3001–3002で、Polygon / Pathへの適用、point / number variables、expression evaluationを確認しました。
