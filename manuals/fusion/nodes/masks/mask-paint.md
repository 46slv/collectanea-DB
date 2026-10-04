---
title: Mask Paint
description: brush・stroke・primitive・polylineを直接描いてsingle-channel Maskを作り、frame単位のpaint cleanupやroto補修に使うNode。
doc_type: node
term_id: mask-paint
verification: partial
aliases: [Mask Paint, PNM]
concepts: [mask-data, paint, time]
nodes: [Mask Paint]
node_family: masks
inputs: [mask]
outputs: [mask]
tasks: [create-mask, paint-mask, cleanup, roto]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Mask Paint

Mask Paintは、Viewerへ直接paintして<Term id="mask">Mask</Term>を作るNodeです。

freehand strokeだけでなく、primitiveやpolyline styleのstrokeも使えます。既存matteの穴埋め、frame限定のcleanup、手描きrotoに向きます。

## 入力 / 出力

青色の任意Effect Mask inputへ別Maskを接続でき、Paint Modeで合成します。出力はsingle-channel Maskです。

```text
Bitmap Mask → Mask Paint → Effect Mask
                  ↑
               paint repair
```

## Paint Nodeとの違い

基本的なpaint操作はPaint Nodeとほぼ共通です。

ただしMask Paintはsingle-channel Maskを作るため:

- Channel Selectorはありません。
- color controlsはRGBAではなくAlpha値だけを扱います。

「色を描く」のではなく「Mask値を描く」と考えます。

## Strokeの時間

strokeごとにdurationを持てます。

- project全体
- 1 frame
- 任意のframe range

Keyframes Editorでdurationを変更できます。

一時的なgarbage matteや数frameだけのcleanupを、Mask Node内で完結できます。

## Multistroke

大量の簡単なpaint cleanupにはMultistrokeが高速です。

ただし通常Strokeのような後編集性は持たないため、後でpointやpathを細かく調整する必要があるstrokeには向きません。

## Polyline / primitive

Paint系toolbarからPolyline、Circle、Rectangle等を作れます。

Polyline strokeはtrackや既存polylineへ接続でき、durationも後から編集できます。

## 運用例

Bitmap Maskで作ったmatteに小さな穴が残る場合:

1. Bitmap MaskをMask PaintのEffect Maskへ接続します。
2. hole部分だけbrushで白くpaintします。
3. frame限定の問題ならstroke durationを該当frameだけにします。
4. matte全体を壊さず局所補修します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 108 pp.2475–2476、Paint Node Chapter 113、およびFusion Fundamentals Chapter 79で、single-channel paint、Effect Mask、stroke duration、Multistroke、Paint Nodeとの差を確認しました。
