---
title: "Clean Plate"
description: "クリーンプレート生成/キー補助。"
doc_type: node
term_id: "clean-plate"
term_short: "Clean Plateは、クリーンプレート生成/キー補助。"
verification: partial
aliases: ["Clean Plate"]
concepts: ["image-data", "alpha"]
nodes: ["Clean Plate"]
node_family: "matte-keying"
inputs: ["image"]
outputs: ["image"]
tasks: ["create-matte"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Clean Plate

Clean Plateは、green / blue screenの背景色だけを滑らかに再構成し、Delta Keyerへ渡すpre-key Nodeです。

screen照明のムラが大きいshotで、keyerへ「本来のscreen色」を提供する用途に使います。

## 入力
primary footage、Garbage Matte、Effect Maskを受けます。

Garbage Matteではscreenではない人物・object等をclean plate生成対象から除外します。

## 基本workflow
Viewerでscreen領域を選び、edgeを広げ、穴を埋めてsolidなgreen / blue plateを作ります。

    Footage ─────────────→ Delta Keyer
       └→ Clean Plate ───→ Clean Plate input

fine hairやsemi-transparent detailを残しながらscreen variationを補正する助けになります。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2511–2514で、pre-key用途、screen selection、Garbage Matte、Delta Keyerへの接続を確認しました。
