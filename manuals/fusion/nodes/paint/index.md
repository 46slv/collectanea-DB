---
title: Paintノード
description: Paint Node本体とStroke / Multistroke / Clone / Fill等の内部Paint elementを、描画とcleanupの役割から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, paint, cleanup]
updated: "2026-10-05"
---

# Paintノード

Paintは、1つのPaint Node内に複数のStroke / Shape / Clone elementを保持してImageへ描画するsystemです。

## 基本構成

```text
Image → Paint → Image
```

Paint内部では複数elementをstackとして管理します。

## 代表要素

- Stroke — 後編集可能なbrush stroke
- Multistroke — 大量の軽量stroke
- Clone Multistroke — source pixelをclone
- Polyline Stroke / Circle Stroke — path / primitiveに沿うstroke
- Fill — 囲まれた領域をfill
- Copy Ellipse / Rectangle / Polyline — copy / clone範囲用shape
- Paint Group — elementをgroup管理

## Mask Paintとの違い

PaintはRGBA Imageへ描画します。Mask Paintはsingle-channel Maskを描きます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 113とFusion FundamentalsのPaint sectionを基に整理します。内部Paint elementは通常のFlow Nodeと同じ意味ではありません。
