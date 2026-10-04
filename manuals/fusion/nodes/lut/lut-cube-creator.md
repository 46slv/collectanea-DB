---
title: "LUT Cube Creator"
description: "LUT cubeを生成。"
doc_type: node
term_id: "lut-cube-creator"
term_short: "LUT Cube Creatorは、LUT cubeを生成。"
verification: partial
aliases: ["LUT Cube Creator", "LCC"]
concepts: ["image-data"]
nodes: ["LUT Cube Creator"]
node_family: "lut"
inputs: ["image"]
outputs: ["image"]
tasks: ["apply-lut"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# LUT Cube Creator

LUT Cube Creatorは、3D LUTを作るための**既知のcolor sample pattern**をImageとして生成するNodeです。

このImageへColor処理をかけ、その結果をLUT Cube Analyzerで解析すると、処理内容を3D LUTへ変換できます。

## 入力 / 出力

inputはありません。color cube pattern Imageを生成します。

## Type

- Horizontal
- Vertical
- Rect

からcube sampleをImageへ並べる形式を選びます。

## Size

cubeの1辺あたりのsample数です。

Manualでは33や65を代表例として挙げています。Sizeを上げるほどLUTのsample密度は増えますが、memory / calculation costも増えます。

## 最小構成

    LUT Cube Creator
      → Color / Curves / Matrix
      → LUT Cube Analyzer

## 注意点

外部appでcube Imageを処理する場合、Manualはcolor accuracy維持のため32-bit floating pointを使うよう注意しています。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 107 pp.2458–2460で、inputなし、Type、Size、典型Size 33 / 65、32-bit float注意を確認しました。
