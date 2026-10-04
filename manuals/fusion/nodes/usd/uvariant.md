---
title: uVariant
description: USD asset内にauthoring済みのVariant SetをScene Treeで選び、Variant optionを切り替えるNode。
doc_type: node
term_id: uvariant
term_short: uVariantは、USD primに定義されたVariant Setを切り替えるNode。
verification: partial
aliases: [uVariant, uVa]
concepts: [usd-scene, scene-tree, usd-variant]
nodes: [uVariant]
node_family: usd
controls: [Pick, Selected Prims, Invert Prim Selection, Variant Set, Variant]
inputs: [usd]
outputs: [usd]
tasks: [usd, variant, switch-asset]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uVariant

uVariantは、USD assetにあらかじめ定義されているVariant Setを切り替えるNodeです。

modelの別version、look、configuration等をUSD側のvariantとして持っているassetで使います。

## 入力 / 出力

1つのUSD scene / object inputを受け、variant変更後のUSD sceneを出力します。

## Prim Selection

PickからScene Treeを開き、Variantを切り替えるprimを選びます。

Selected Primsで対象を確認し、Invert Prim Selectionで対象を反転できます。

## Variant Set / Variant

Variant Setで対象のvariant groupを選びます。

そのSetに含まれるoptionがVariant menuへ表示されます。

asset側にVariant Setが存在しない場合はNo Selectionになります。

## uSwitchとの違い

- **uVariant** — 1 USD scene内のauthoring済みVariant
- **uSwitch** — 複数の別USD inputを切り替える

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2925–2926で、Scene Input、Scene Tree、Variant Set、Variant、Invert Prim Selectionを確認しました。
