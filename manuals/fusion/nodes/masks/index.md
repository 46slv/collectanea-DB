---
title: Maskノード
description: FusionのMask Nodeを、図形を描く・Imageから作る・複数Maskを組み合わせる・Paintする役割から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, create-mask, isolate-effect, roto]
updated: "2026-10-04"
---

# Maskノード

Maskは、主に「Nodeの処理をどこへ効かせるか」を表す単一channelのデータです。通常のRGBA Imageとは役割が異なります。

```text
Image → Effect → Output
          ↑
        Mask
```

Maskそのものの考え方は[マスク（Mask）](../../learn/02-data/mask)で説明しています。このページでは、目的に合うMask Nodeを選びます。

## まず選ぶ

| 作り方 | Node | 向いている用途 |
| --- | --- | --- |
| 円・楕円で囲う | [Ellipse Mask](./ellipse-mask) | 顔、光、円形領域など |
| 四角で囲う | [Rectangle Mask](./rectangle-mask) | 矩形領域、画面の一部 |
| 三角形で囲う | [Triangle Mask](./triangle-mask) | 3点で決める単純な形 |
| 自由な輪郭を描く | [Polygon Mask](./polygon-mask) | ロト、人物や物体の任意形状 |
| 滑らかな自由曲線を描く | [B-Spline Mask](./b-spline-mask) | 少ない点で滑らかな輪郭 |
| 複数のSplineを1 Nodeで管理 | [MultiPoly](./multipoly) | 複雑なロト、複数部位 |
| ImageのchannelからMaskを作る | [Bitmap Mask](./bitmap-mask) | Alpha / Luma / Color / ID由来のMask |
| 色域・明暗域から作る | [Ranges Mask](./ranges-mask) | Shadows / Midtones / Highlights等 |
| 連続した色領域を選ぶ | [Wand Mask](./wand-mask) | Magic Wand型の色選択 |
| 直接描く | [Mask Paint](./mask-paint) | matte修正、穴埋め、手描きMask |

## Primitive Mask

Ellipse / Rectangle / Triangleは、形を数値とViewer controlで作る基本Maskです。

EllipseならCenter、Width、Height、Angleを調整し、Soft Edgeで境界をぼかせます。まず単純な範囲指定をしたい場合は、この系統から選ぶと構成を読みやすくできます。

## Polygon / B-Spline / MultiPoly

不規則な形を囲う場合はSpline系を使います。

PolygonはViewerをクリックしてBézier polylineを作り、Shapeの変更をkeyframe化できます。MultiPolyは複数のPolygon / B-Splineを1 Node内のListで管理する用途です。

## Bitmap / Ranges / Wand

Imageの画素情報をMaskへ変換したい場合の系統です。

Bitmap MaskではRed / Green / Blue / Alpha、Hue、Luminance、Saturation、Coverage、Object ID、Material IDなどを元にMaskを作れます。RangesとWandは、明暗域や連続する色領域から選択する用途です。

## 複数Maskを組み合わせる

多くのMask Nodeには青色のEffect Mask入力があります。

別のMaskを接続するとPaint Modeが表示され、Merge、Add、Subtract、Minimum、Maximum、Average、Multiply、Replace、Invert、Copy、Ignoreなどの方法で組み合わせられます。

```text
Mask A ───────┐
              ↓
          Mask B
              ↓
        Effect Mask input
```

単に「線をつなぐと足し算になる」と決めず、Paint Modeを確認します。

## 白・黒・グレーの意味

Maskでは、白に近いほど処理を強く適用し、黒に近いほど適用しません。中間のグレーは部分的な適用になります。

これはRGBA Imageの「白い絵」「黒い絵」という意味ではなく、単一channelのMask値として読みます。

## 関連する考え方

- [マスク（Mask）](../../learn/02-data/mask)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 108、pp.2462–2500、およびFusion Fundamentals Chapter 79のMask / Polyline説明を基に整理しています。

このFamily OverviewはMaskの選び分けを担当します。個々のSpline editing、Paint操作、全Common Controlsは各Node Referenceと専用Conceptへ分けます。
