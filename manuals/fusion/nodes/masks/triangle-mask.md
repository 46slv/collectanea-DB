---
title: Triangle Mask
description: 3つの独立pointで三角形Maskを作り、各頂点を個別にTracker・Path・Expressionへ接続できるPrimitive Mask。
doc_type: node
term_id: triangle-mask
verification: partial
aliases: [Triangle Mask, Tri]
concepts: [mask-data, tracking]
nodes: [Triangle Mask]
node_family: masks
controls: [Level, Filter, Soft Edge, Border Width, Paint Mode, Invert, Solid, Point 1, Point 2, Point 3]
inputs: [mask]
outputs: [mask]
tasks: [create-mask, triangle, tracked-corners]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Triangle Mask

Triangle Maskは、3つの頂点から三角形の<Term id="mask">Mask</Term>を作るPrimitive Maskです。

他のprimitive maskと違い、**Center・Size・Angleを持たず、3頂点を直接動かす**のが特徴です。

## 入力 / 出力

任意Effect Mask inputを持ち、別MaskとPaint Modeで組み合わせられます。

## Point 1 / 2 / 3

3つのcorner positionを個別に設定します。

各Pointはanimation、Path、published control、Tracker、他Controlへのconnectionへ個別に接続できます。

そのため3点を別trackへ追従させ、三角形自体を変形させる構成が可能です。

## 共通Mask Control

Level、Filter、Soft Edge、Border Width、Paint Mode、Invert、Solidを持ちます。

Solidを無効にするとBorder Widthに従うoutlineになります。

## Rectangle / Polygonとの違い

- **Triangle Mask** — 3頂点固定。各cornerを独立接続しやすい
- **Rectangle Mask** — Center / Width / Height / Angle / Corner Radiusで矩形として操作
- **Polygon Mask** — 任意数pointで自由shapeを作る

3点だけで十分ならTriangleはparameter構造が単純です。

## 最小構成

```text
Triangle Mask → Target Effect Mask
```

trackingする場合:

```text
Tracker outputs → Point 1 / Point 2 / Point 3
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 108 pp.2493–2496で、Center / Size / Angleを持たないこと、Point 1–3、tracking / path connection、共通Mask controlsを確認しました。
