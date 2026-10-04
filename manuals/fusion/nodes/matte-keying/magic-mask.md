---
title: "Magic Mask"
description: "Magic Mask v2をFusionで利用。Input/Garbage Matte/Solid Matte/Effect Mask。Faster/Better。Studio/AI条件。"
doc_type: node
term_id: "magic-mask"
term_short: "Magic Maskは、Magic Mask v2をFusionで利用。Input/Garbage Matte/Solid Matte/Effect Mask。Faster/Better。Studio/AI条件。"
verification: partial
aliases: ["Magic Mask"]
concepts: ["image-data", "alpha"]
nodes: ["Magic Mask"]
node_family: "matte-keying"
inputs: ["image"]
outputs: ["image"]
tasks: ["create-matte"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Magic Mask

Magic Maskは、Viewer上で人物やobjectを指定し、DaVinci Neural Engineでsubject shapeを推定・追跡してMaskを作るStudio限定Nodeです。

21.1ではMagic Mask v2系workflowとして扱われます。

## 入力

primary Imageに加え、Garbage Matte、Solid Matte、Effect Maskを使えます。

## subjectを指定する

Viewerで含めたいsubjectへpoint / strokeを置き、必要なら除外側も指定します。単純な色差ではなくsubject shapeを推定してmatteを作ります。

## Faster / Better

analysis qualityをFaster / Betterで切り替えます。

作業中はFaster、最終確認ではBetterを使うなど、速度と精度を分けられます。

## Matte Finesse

生成matteのedgeが完全でない場合、softnessやclean-up controlsで補正します。必要ならPaintや別Maskも併用します。

## Delta Keyerとの違い

- Magic Mask: subject recognition
- Delta Keyer: green / blue screen color separation

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2534–2539で、Neural Engine、point-based selection、Faster / Better、Matte Finesse、追加Maskを確認しました。Studio限定です。
