---
title: Layer Regex
description: Multilayer ImageのLayer名を正規表現でmatchし、Keep・Remove・TransformとName Templateで選別 / renameするNode。
doc_type: node
term_id: layer-regex
verification: partial
aliases: [Layer Regex, LRx]
concepts: [image-data, multilayer]
nodes: [Layer Regex]
node_family: layers
controls: [Expression, Mode, Name Template, Unmatched, Tester, Conflicts]
inputs: [image, image]
outputs: [image]
tasks: [multilayer, regex, rename-layers, filter-layers]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Layer Regex

Layer Regexは、multilayer ImageのLayer名をRegExでmatchし、該当Layerをrename・keep・removeするNodeです。

Layer数が多いEXRを名前ruleで整理する場合に向きます。

## Expression / Mode

ExpressionへRegExを書き、Modeで処理を選びます。

- Transform — layer名を書き換える
- Keep — matchしたLayerだけ残す
- Remove — matchしたLayerを削除

## Name Template

Transform modeでrename ruleを指定します。

たとえばExpression `(.*)`、Name Template `Right.$1` なら全Layerへ `Right.` prefixを付けます。

## Unmatched

RegExにmatchしなかったLayerを残す / 削除するか決めます。

## Tester

現在のExpressionがどのLayer名へmatchするかを確認できます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 106 pp.2441–2444で、Expression、Mode、Name Template、Unmatched、Tester、RegEx例を確認しました。
