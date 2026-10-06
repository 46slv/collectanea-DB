---
title: "Shadow"
description: "入力のAlpha/形状から影を生成。"
doc_type: node
term_id: "shadow"
term_short: "Shadowは、入力のAlpha/形状から影を生成。"
verification: partial
aliases: ["Shadow", "SH"]
concepts: ["image-data"]
nodes: ["Shadow"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Shadow

Shadowは、入力ImageのAlphaから2D drop shadowを作るNodeです。任意Depth Mapを使うと、背景depthに応じてshadowの見え方を変えられます。

## 入力
- Input: shadow sourceとなるAlpha付き2D Image
- Depth: shadow distortion用の2D depth map
- Effect Mask: shadowの適用範囲

## 主な設定
Shadow Offset、Softness、Shadow Color、Light Position / Distance、Depth Map contribution、Z Map Channel、Outputを持ちます。

## 最小構成

    Graphic → Shadow → Merge foreground
    Background ──────→ Merge background

## 3D shadowとの違い
Shadowは2D drop shadowです。3D geometry同士のshadow castingにはSpot Light + Image Plane 3D等を使います。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 97 pp.2295–2297で、3 inputs、Offset、Softness、Color、Light controls、Depth Map、Outputを確認しました。
