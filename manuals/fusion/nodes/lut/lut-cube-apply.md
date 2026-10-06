---
title: "LUT Cube Apply"
description: "LUT cubeを適用。"
doc_type: node
term_id: "lut-cube-apply"
term_short: "LUT Cube Applyは、LUT cubeを適用。"
verification: partial
aliases: ["LUT Cube Apply", "LCP"]
concepts: ["image-data"]
nodes: ["LUT Cube Apply"]
node_family: "lut"
inputs: ["image"]
outputs: ["image"]
tasks: ["apply-lut"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# LUT Cube Apply

LUT Cube Applyは、LUT Cube Creator由来の**color cube Image自体をreferenceとして**、そのLUTを別の2D Imageへ適用するNodeです。

LUT fileへ書き出さず、Fusion comp内でcube ImageをそのままLUTとして使えます。

## 入力

- Input: LUTを適用する2D Image
- Reference Image: LUT Cube Creator由来で、必要なColor処理を施したcube Image
- Effect Mask: 適用範囲

## Control

21.1 Manualでは、LUT Cube Apply固有のControlsはありません。

green Reference Imageの内容がそのままLUTとしてorange Inputへ適用されます。

## 最小構成

    LUT Cube Creator → Color Corrector ─┐
                                       ├─ LUT Cube Apply → Output
    Target Image ───────────────────────┘

## Analyzerとの違い

- LUT Cube Apply: comp内でcube Imageを直接使う
- LUT Cube Analyzer: cube ImageからLUT fileを書き出す

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 107 pp.2457–2458で、3 inputs、Reference Image、固有Controlなしを確認しました。
