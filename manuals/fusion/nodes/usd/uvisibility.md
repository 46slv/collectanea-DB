---
title: uVisibility
description: USD scene内のselected primまたはbranchをScene Treeで選び、Visibleをanimation可能な形で表示・非表示にするNode。
doc_type: node
term_id: uvisibility
term_short: uVisibilityは、USD prim / branchの表示状態を切り替えるNode。
verification: partial
aliases: [uVisibility, uVis]
concepts: [usd-scene, scene-tree]
nodes: [uVisibility]
node_family: usd
controls: [Pick, Selected Prims, Invert Prim Selection, Visible]
inputs: [usd]
outputs: [usd]
tasks: [usd, visibility, isolate-object]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uVisibility

uVisibilityは、<Term id="usd-scene">USD scene</Term>内の特定object / branchを表示・非表示にするNodeです。

## 入力 / 出力

1つのUSD scene / object inputを受け、visibilityを変更したsceneを出力します。

## Pick / Selected Prims

PickからScene Treeを開き、表示状態を変えるprimを選びます。

branchを選ぶと、そのhierarchy配下をまとめて扱えます。

Invert Prim Selectionを有効にすると選択対象を反転できます。

## Visible

selected primを表示するかを切り替えます。

Visibleはkeyframe animationできるため、Timeline途中でobjectを出す / 消す用途にも使えます。

## uSwitchとの違い

uVisibilityは同じscene内objectのvisibility propertyを変更します。

別scene sourceそのものを切り替える場合はuSwitchを使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2927–2928で、Scene Input、Pick、Selected Prims、Invert Prim Selection、Visible animationを確認しました。
