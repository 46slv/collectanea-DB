---
title: "Ultra Keyer"
description: "キーイングTool。"
doc_type: node
term_id: "ultra-keyer"
term_short: "Ultra Keyerは、キーイングTool。"
verification: partial
aliases: ["Ultra Keyer", "UKY"]
concepts: ["image-data", "alpha"]
nodes: ["Ultra Keyer"]
node_family: "matte-keying"
inputs: ["image"]
outputs: ["image"]
tasks: ["create-matte"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Ultra Keyer

Ultra Keyerは、pre-matte keyerとcolor-difference keyerを組み合わせたgreen / blue screen keyerです。

最初に明確なforeground / backgroundを分け、その後でedgeやsemi-transparent detailをcolor differenceから詰めます。

## 入力

primary Image、Garbage Matte、Solid Matte、Effect Maskを使う4-input構成です。

## Pre-Matte

screenとして明確な領域とforegroundとして明確な領域を先に分けます。

これによりfine keyerがhairやedge等の難しい領域へ集中できます。

## Fine detail / spill

edge transparencyを残しつつscreen colorを分離し、spill suppressionでforeground edgeのgreen / blue tintを抑えます。

## 選び分け

ManualではまずDelta Keyer、Fusion StudioではPrimatteも候補とし、shotに応じてUltra Keyerを比較する位置づけです。

Ultra Keyerが常に上位互換という意味ではありません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2561–2568で、4 inputs、pre-matte + color-difference structure、Delta / Primatteとの選択位置を確認しました。
