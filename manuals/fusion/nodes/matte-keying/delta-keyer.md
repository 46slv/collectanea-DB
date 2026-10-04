---
title: Delta Keyer
description: green/blue screen等のキーイングでforeground matteを作る主要キーイング Node。
doc_type: node
term_id: delta-keyer
verification: unverified
aliases: [Delta Keyer]
concepts: [alpha, matte, keying]
nodes: [Delta Keyer]
node_family: matte-keying
inputs: [image]
outputs: [image]
tasks: [key, matte, green-screen, composite]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---
# Delta Keyer

Delta Keyerは、green / blue screenからforeground matteを作るFusionの主要keyerです。

screen colorをsampleし、pre-matte、core matte、fringe、despillを段階的に整えます。

## 入力
primary Imageに加え、Garbage Matte、Solid Matte、Clean Plate、Effect Mask等を使える構成です。

## 基本workflow
1. screen colorをsample
2. pre-matteで明確なforeground / backgroundを分離
3. matte controlsでhair / transparencyを整える
4. fringe / despillでedge colorを修正
5. 必要ならClean Plateでscreen variationを補助

## Keyerの選び分け
- Delta Keyer: green / blue screenの第一候補
- Chroma Keyer: 任意色のgeneral key
- Primatte: Fusion Studio専用の別algorithm

shotによって結果が変わるため、1つのkeyerだけを絶対視しません。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2516–2524で、Delta Keyerのmulti-stage keying、Clean Plate、matte / fringe処理を確認しました。
