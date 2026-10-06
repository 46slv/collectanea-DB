---
title: "Hot Spot"
description: "ホットスポット/レンズ風の発光。"
doc_type: node
term_id: "hot-spot"
term_short: "Hot Spotは、ホットスポット/レンズ風の発光。"
verification: partial
aliases: ["Hot Spot", "HOT"]
concepts: ["image-data"]
nodes: ["Hot Spot"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Hot Spot

Hot Spotは、lens flare、spotlight、burn / dodge風の円形light effectを2D Imageへ追加するNodeです。

## 入力
Input、Effect Mask、Occlusionの3 inputを持ちます。Occlusionの白い部分はHot Spotを隠し、objectの後ろへlightが隠れる表現を作れます。

## 主な設定
Primary Center / Strength / Size / Aspect / Angleで主光源、Secondary Strength / Sizeで反射spotを調整します。

Apply ModeはAdd (Burn)、Subtract (Dodge)、Multiply (Spotlight)です。

Lens Aberrationでflare shapeを変え、Color / Radial splineで円周方向の色・長さ・densityを設計できます。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 97 pp.2281–2287で、3 inputs、Primary / Secondary、Apply Mode、Occlusion、Aberration、Color / Radial splineを確認しました。
