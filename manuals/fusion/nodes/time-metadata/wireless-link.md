---
title: Wireless Link
description: Node graph上でpipeを長く引かずに、別Nodeのoutputを名前で参照して同じdata streamを受け取るrouting Node。
doc_type: node
term_id: wireless-link
term_short: 離れたNode outputを名前で参照する配線整理用Node。
verification: partial
aliases: [Wireless Link, Wire]
concepts: [graph-flow, connection]
nodes: [Wireless Link]
node_family: time-metadata
outputs: [data]
tasks: [route-graph, organize-flow]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Wireless Link

Wireless Linkは、Node Editorで長いpipeを引かず、別Nodeのoutputを参照して同じdataを受け取るためのrouting Nodeです。

処理内容を変えるNodeではなく、複雑なGraphの配線を整理します。

## 基本構成

    Source Node  …参照…  Wireless Link → Target Node

画面上ではSourceからWireless Linkまで長いpipeを引かずに済みます。

## 注意点

見た目の配線が減る一方、sourceとの関係が画面だけでは見えにくくなります。長距離routingなど明確な用途に絞る方がGraphを追いやすくできます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 111 p.2613で、Wireless Linkの独立Node sectionを確認しました。source選択UIのexact labelはruntime verification対象です。
