---
title: "Difference Keyer"
description: "差分ベースのキー。"
doc_type: node
term_id: "difference-keyer"
term_short: "Difference Keyerは、差分ベースのキー。"
verification: partial
aliases: ["Difference Keyer", "DKY"]
concepts: ["image-data", "alpha"]
nodes: ["Difference Keyer"]
node_family: "matte-keying"
inputs: ["image"]
outputs: ["image"]
tasks: ["create-matte"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Difference Keyer

Difference Keyerは、foreground footageと「背景だけのreference image」の差を比較し、変化した部分をforeground matteとして抽出するNodeです。

green / blue screenを使わず、固定cameraで背景plateが用意できるshotに向きます。

## 基本構成

    Background Plate ─┐
                      ├─ Difference Keyer → foreground + alpha
    Shot with Subject ─┘

背景と同じpixelはtransparent側へ、差が大きいpixelはforeground側へ寄せます。

## 使う条件

camera movement、lighting change、moving shadow、noiseが大きいと、それ自体がbackgroundとの差として検出されmatteが汚れやすくなります。

## Chroma Keyとの違い

Chroma Keyは色を基準に抜きます。Difference Keyerはreference frameとの差を基準に抜きます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2527–2530で、background referenceとの差分keyingとInspector controlsを確認しました。
