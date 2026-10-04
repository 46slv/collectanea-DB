---
title: OCIO Display
description: OCIO configのSource Space・Display・Viewを使い、特定monitor / viewing transform向けのdisplay変換をImageへ適用するNode。
doc_type: node
term_id: ocio-display
term_short: OCIOのDisplay / View transformを適用するNode。
verification: partial
aliases: [OCIO Display, OCD]
concepts: [image-data, color-space, ocio]
nodes: [OCIO Display]
node_family: color
controls: [OCIO Config, Source Space, Display, View]
inputs: [image, mask]
outputs: [image]
tasks: [ocio, display-transform]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# OCIO Display

OCIO Displayは、OpenColorIO configに定義されたDisplay / View transformをImageへ適用するNodeです。

working spaceそのものを別spaceへ変換するというより、「このsourceをどのdisplay / viewで見るか」をOCIO定義に沿って選びます。

## OCIO Config

使用する`.ocio` configを指定します。

利用できるDisplay / Viewの一覧はconfig内容に依存します。

## Source Space

入力Imageが現在どのcolor spaceにいるかを選びます。

## Display / View

Displayでmonitor / display targetを選び、Viewでそのdisplay向けのview transformを選びます。

## OCIO Color Spaceとの違い

- **OCIO Color Space** — source spaceから別output spaceへdataを変換
- **OCIO Display** — display / view transformを適用

Viewer previewやdisplay-referred outputを設計するときに役割を分けます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 p.2195で、Source Space、Display、View、OCIO configによるDisplay transformを確認しました。
