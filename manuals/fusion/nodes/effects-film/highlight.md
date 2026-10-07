---
title: "Highlight"
description: "ハイライト/フレア系処理。"
doc_type: node
term_id: "highlight"
term_short: "Highlightは、ハイライト/フレア系処理。"
verification: partial
aliases: ["Highlight", "HIL"]
concepts: ["image-data"]
nodes: ["Highlight"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Highlight

Highlightは、Imageの明るい部分へstar-shaped glint / lens-star風のflareを作るNodeです。

## 入力
Input、Effect Mask、Highlight Maskの3 inputを持ちます。Highlight Maskは処理前のpre-maskなので、Mask内のsourceから生まれたflareがMask外へ伸びられます。

## 主な設定
Low / Highでhighlightを作るluminance range、Curveでfalloff、Lengthで長さ、Number of Pointsでray本数、Angleで回転を決めます。Merge Overを外すとhighlightだけを出力できます。

Color ScaleではRGB / Alphaのfalloff colorを調整します。

## 最小構成

    Bright Graphic → Highlight → Merge

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 97 pp.2278–2280で、3 inputs、pre-mask、Low/High、Curve、Length、Points、Angle、Merge Over、Color Scaleを確認しました。
