---
title: ACES Transform
description: ACES Version、IDT、ODT、Gamut Compressionを指定し、ACES規定のInput / Output Device Transformを適用するColor Management Node。
doc_type: node
term_id: aces-transform
term_short: ACESのIDT / ODTを使ってsourceとoutputのtransformを行うNode。
verification: partial
aliases: [ACES Transform, ACESTransform, ATr]
concepts: [image-data, color-space]
nodes: [ACES Transform]
node_family: color
controls: [ACES Version, Input Transform, Output Transform, Gamut Compress Type]
inputs: [image, mask]
outputs: [image]
tasks: [aces, color-space, color-management]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# ACES Transform

ACES Transformは、ACES workflowで定義されたInput Device Transform（IDT）とOutput Device Transform（ODT）を使ってImageを変換するNodeです。

camera sourceをACESへ入れ、最終display / deliveryへ出すというACES固有のtransformを担当します。

## 入力

2D <Term id="image">Image</Term>と任意Effect Maskを受けます。

## ACES Version

使用するACES versionを選びます。versionによって利用できるtransformやgamut compressionの挙動が変わり得るため、project側のACES設定と合わせます。

## Input Transform

source camera / source encodingに対応するIDTを選びます。

「このcamera footageをACES内部へどう解釈するか」を決める入口です。

## Output Transform

最終出力先に対応するODTを選びます。

display / delivery targetに合わせてACES dataを変換します。

## Gamut Compress Type

高彩度のLED、neon、tail light等がgamut外へ出る場合に、ACES gamut compressionを選びます。

## Color Space Transformとの違い

Color Space TransformにもACES spaceはありますが、ManualはACES workflowそのものにはAcademy指定transformを使うACES Transformを使うよう区別しています。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2134–2135で、ACES Version、IDT、ODT、Gamut Compress Typeを確認しました。
