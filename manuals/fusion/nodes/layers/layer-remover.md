---
title: Layer Remover
description: Multilayer Imageから指定Layerを削除し、必要なLayerだけを後段へ渡す整理用Node。
doc_type: node
term_id: layer-remover
verification: partial
aliases: [Layer Remover, LRm]
concepts: [image-data, multilayer]
nodes: [Layer Remover]
node_family: layers
inputs: [image]
outputs: [image]
tasks: [multilayer, remove-layers, exr]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Layer Remover

Layer Removerは、multilayer Imageから不要なLayerを外して後段へ渡すNodeです。

Layerのchannel内容を書き換えるのではなく、Layer単位でoutputから除外します。

## 入力 / 出力

1つのmultilayer Imageを受け、選択したLayerを削除したmultilayer Imageを出力します。

    Multilayer EXR → Layer Remover → Saver / downstream

## Layer Regexとの違い

- Layer Remover — Layer一覧から明示的に削除
- Layer Regex — 名前ruleで大量Layerを選別 / rename

Layer数が少なく対象が固定ならLayer Remover、命名規則でまとめて処理するならLayer Regexが向きます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 106 p.2444で、1 input、特定Layerをdisable / removeする役割を確認しました。
