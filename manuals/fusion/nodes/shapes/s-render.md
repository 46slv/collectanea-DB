---
title: sRender
description: Shapeのベクター情報を通常の2D Imageへ変換し、解像度・色深度・Pixel Aspectなどを決めるShape Renderer。
doc_type: node
term_id: s-render
verification: partial
aliases: [sRender, Shape Render]
concepts: [shape-data, rasterization, image-data]
nodes: [sRender]
node_family: shapes
inputs: [shape, mask]
outputs: [image]
controls: [Process Mode, Width, Height, Pixel Aspect, Auto Resolution, Depth, Source Color Space, Source Gamma Space]
tasks: [shape, render, convert-domain]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-03"
---

# sRender

sRenderは、<Term id="shape-data">Shape</Term>のベクター情報を通常の2D Imageへ変換するRendererです。Shape系Nodeで作った図形を、MergeやGlowなど一般的なImage系Nodeへ渡す境界になります。

## 役割

Shapeの処理列の最後に置き、ベクターShapeからビットマップ画像を作ります。

```text
Shape Generator → Shape加工 → sRender → 2D Image処理
```

## 入力

### Input1

オレンジ色の必須入力です。最終的なShape Nodeの出力を受け取ります。

### Effect Mask

青色の任意入力です。Maskを接続すると、sRenderで表示する範囲を限定できます。

## 出力

2D Imageを出力します。出力後はSoft GlowやMergeなど、通常のImage系Nodeへ接続できます。

## 主な設定項目

### Process Mode

Fields Processingの方法を選びます。Manualではprogressive素材なら既定のFull Framesが適切と説明されています。

### Width / Height

作成する画像の解像度を指定します。

### Pixel Aspect

生成画像のPixel Aspect Ratioを指定します。1:1なら正方形ピクセルです。

### Auto Resolution

有効にすると、Width・Height・Pixel AspectをCompositionのFrame Format設定へ連動させます。無効にすると、最終出力とは別の解像度でShapeの画像化を行えます。

### Depth

生成する画像の色深度を指定します。高いDepthは色の精度やHDR値を扱える一方、使用メモリも増えます。

### Source Color Space / Source Gamma Space

生成画像へColor SpaceやGammaの情報を設定します。Source Color SpaceはGamut変換そのものではなく、下流で使うmetadataの設定として説明されています。

## 最小構成

```text
sEllipse → sRender → Merge
```

円をShapeとして生成し、sRenderで画像化してから通常の合成へ渡します。

## 運用例

複数のShape処理を続けたい間はsRenderを挟まず、画像処理へ移る地点でまとめて変換します。

```text
sEllipse → sGrid → sJitter → sRender → Soft Glow → Merge
          └──── Shape ────┘   └──── 2D Image ─────┘
```

このように見ると、どの地点でデータ領域が変わるかを追いやすくなります。

## 挙動と注意点

- sRenderはShapeを「表示するだけ」のViewer Nodeではなく、ShapeからImageへデータ領域を変換するNodeです。
- Shape系処理をまだ続けたい場合は、必要になるまでsRenderを後ろへ置きます。
- Effect MaskはShape入力とは役割が異なり、画像化された結果の表示範囲を制限します。
- 解像度や色深度を独自に設定できるため、Frame Formatとの関係を意識します。

## 関連する考え方

- [シェイプ（Shape）](../../learn/02-data/shape)
- [画像（Image）](../../learn/02-data/image)
- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 似たNode・関連Node

- pRender — Particle setを2D Imageへ変換
- Renderer 3D — Classic 3D sceneを2D Imageへ描画
- uRenderer — USD sceneを描画

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 117、pp.2759–2761で、Input1、Effect Mask、ShapeからImageへの変換、Process Mode、Width/Height、Pixel Aspect、Auto Resolution、Depth、Source Color Space、Source Gamma Spaceを確認しました。

Manual本文には一部古いNode名を参照しているように見える文もありますが、このページでは図・説明全体と一致するShape入力として整理しています。内部REGID、Edition差、実機結果は未確認のため `verification: partial` を維持します。
