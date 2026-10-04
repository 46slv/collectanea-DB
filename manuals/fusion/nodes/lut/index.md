---
title: LUTノード
description: LUT fileの適用・Cube LUTの生成・解析を行うNodeを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, lut, color-management]
updated: "2026-10-05"
---

# LUTノード

LUT系Nodeは、RGB値をlookup tableで別のRGB値へ変換します。

## 代表Node

- File LUT — 外部LUT fileを読み込んで適用
- LUT Cube Apply — Cube LUT dataをImageへ適用
- LUT Cube Creator — Image / transformからCube LUTを作る
- LUT Cube Analyzer — LUTのmappingを解析 / 可視化

## Color Space変換との違い

LUTは有限sampleのlookup tableです。Color Space Transform、Gamut、OCIO Color Space等のmath / config-based transformとは別の仕組みです。

creative lookのLUTかtechnical transformのLUTかを区別して使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference ManualのLUT / Color sectionと旧Fusion Tool Referenceを基に整理します。
