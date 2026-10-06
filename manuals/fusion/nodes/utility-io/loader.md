---
title: "Loader"
description: "Fusion Studioでファイル/連番を読み込む。Resolve内ではMediaInが主入口。"
doc_type: node
term_id: "loader"
term_short: "Loaderは、Fusion Studioでファイル/連番を読み込む。Resolve内ではMediaInが主入口。"
verification: partial
aliases: ["Loader", "LD"]
concepts: ["image-data"]
nodes: ["Loader"]
node_family: "utility-io"
inputs: ["image"]
outputs: ["image"]
tasks: ["route-data"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Loader

Loaderは、fileからfootage / still / sequenceをFusionへ読み込むI/O Nodeです。

Fusion Studioでは一般的なsource importの中心です。DaVinci ResolveではLoaderはEXR読み込みに限定され、通常のtimeline / Media Pool sourceはMediaInを使います。

## 入力

青色Effect Maskだけを持ちます。読み込んだImageをMask範囲へ限定できます。

## File / timing

Global In / Outでcomposition上の有効rangeを決め、Trim In / Outでsource clipの使用範囲を決めます。

Hold First / Last Frameで端frameを延長し、Reverse / Loopで再生方向と繰り返しを設定します。

## Missing Frames

sequence fileのframeが欠けたときの動作を選びます。

- Fail
- Hold Previous Output
- Output Black
- Wait

simultaneous 3D render等、後からframeが生成されるworkflowではWaitが使えます。

## Fusion StudioとResolveの違い

Fusion Studioでは多くのsupported formatをLoaderで直接読み込みます。

Resolve Fusion pageでは一般sourceはMediaInが正規入口で、LoaderはEXR用途に限られます。

## 最小構成

    Loader → Color / Transform / Merge → Saver

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 104 pp.2407以降で、Resolve / Fusion Studio差、Effect Mask、Global In / Out、Trim、Hold、Reverse、Loop、Missing Framesを確認しました。
