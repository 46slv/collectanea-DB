---
title: Maskノード
description: FusionのMask Nodeを、図形を描く・Imageから作る・複数Maskを組み合わせる・Paintする役割から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, create-mask, isolate-effect, roto]
updated: "2026-10-24"
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

### 実機の参考例

<!-- capture-reuse:R31 -->

テストチャートに同じBlurをかけ、右だけEllipse Maskで適用範囲を限定した例です。MaskはBlur1の青いEffect Mask入力へ接続しています。

[![S07の実機撮影例。Node Editorの接続](/img/fusion/captures/S07/graph.png)](/img/fusion/captures/S07/graph.png)

[![S07の実機撮影例。左右Viewerの比較](/img/fusion/captures/S07/compare.png)](/img/fusion/captures/S07/compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影済みのS07を再利用した参考例です。Primitive Maskの参考例です。複数MaskのSubtract、Mask Paintや人物追従は含めていません。 [元の撮影条件と確認範囲](/img/fusion/captures/S07/capture.json)

## Polygon / B-Spline / MultiPoly

不規則な形を囲う場合はSpline系を使います。

PolygonはViewerをクリックしてBézier polylineを作り、Shapeの変更をkeyframe化できます。MultiPolyは複数のPolygon / B-Splineを1 Node内のListで管理する用途です。

## 画像からMaskを作る：Bitmap / Ranges / Wand

[Bitmap Mask](./bitmap-mask)は、入力画像のAlphaやLuminanceなどを**マスク値へ変換**します。例えば、透明部分のある人物画像からAlphaを取り出すと、後段のBlurへ人物領域だけを渡せます。画像そのものをぼかすのはBitmap Maskではなく、マスクを受け取るBlurです。

[Ranges Mask](./ranges-mask)は明暗域や色の範囲、[Wand Mask](./wand-mask)はクリックした位置と近い色が連続する領域からマスクを作ります。画素の特徴だけで輪郭を選びきれない場合は、Polygon系で手動指定します。

### 実機の参考例：画像の明るさをMaskへ変換する

<!-- capture-reuse:R123 -->

左はBitmap Maskが出力したMask、右はそのMaskをEffect Maskとして受け取ったオレンジBackgroundです。元画像のRGBをオレンジに変換した画像ではありません。

[![左の白灰黒Maskに応じて、右のオレンジBackgroundに不透明と透明の模様が現れる](/img/fusion/captures/S77/compare.png)](/img/fusion/captures/S77/compare.png)

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%の固定例です。 Luminance、Threshold0.25／0.75、Invertオフ。[Bitmap Maskの接続と設定](./bitmap-mask)に確認条件を記録しています。Shapeからの変換や、全Mask操作を確認した例ではありません。

[再現用Graph](/img/fusion/captures/S77/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S77/capture.json)

### 実機の参考例：明るい範囲をMaskへ変換する

<!-- capture-reuse:R125 -->

左はRanges MaskでLuminanceのHighlightsを選んだMask、右はそれを適用したオレンジBackgroundです。明るいパネルや枠の形が残り、暗い背景は透明になっています。

[![左のHighlights Maskで白い部分に対応して右のオレンジBackgroundが残り暗部が透明になる](/img/fusion/captures/S78/compare.png)](/img/fusion/captures/S78/compare.png)

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%。[Ranges Maskの3領域比較](./ranges-mask)に同じカーブのShadows／Midtonesと確認条件を掲載しています。Spline編集や全Channelを確認した例ではありません。

[再現用Graph](/img/fusion/captures/S78/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S78/capture.json)

## Mask PaintとPaintを使い分ける

[Mask Paint](./mask-paint)は画像入力なしでもマスクを手描きできます。Bitmap Maskの人物領域に小さな穴があるときは、その出力をMask Paintの青いEffect Mask入力につなぎ、穴を白く描いて埋めます。出力は単一チャンネルのマスクです。

一方、[Paint](../paint/paint.md)は入力された2D画像に色やクローン画素を描き、加工後の2D画像を出力します。**効果の適用範囲を補修するならMask Paint、映像自体を修復・描画するならPaint**を選びます。ペイント用描画要素の比較は[Paintカテゴリ概要](../paint/index.md)を参照してください。

## 複数Maskを組み合わせる

青いEffect Mask入力に別のマスクをつなぐと、Inspectorの**Paint Mode**で入力マスクと新しいマスクの合成方法を選べます。Merge、Add、Subtract、Minimum、Maximum、Average、Multiply、Replace、Invert、Copy、Ignoreがあります。

例えば、楕円で決めたぼかし範囲から、画面右上の四角い領域だけを除きます。

```text
MediaIn ────────────────────→ Blur ─→ MediaOut
                              ↑ Effect Mask
Ellipse Mask → Rectangle Mask ┘
               Paint Mode: Subtract
```

Ellipse MaskをRectangle Maskの青い入力に接続し、矩形を除外したい位置へ合わせます。**Subtractでは、入力した楕円のマスク値からRectangle Maskが作る矩形の値を引きます**。その結果をBlurのEffect Maskへ渡すので、楕円の内側でも矩形と重なる部分はぼけません。

Paint Modeの**Invert**は入力マスクと新しいマスクの重なり部分を反転する演算です。**Invertチェックボックス**はマスク全体を反転するため、混同しないでください。最終結果はMaskノードをViewerに表示して確認します。

## 白・黒・グレーの意味

Maskでは、白に近いほど処理を強く適用し、黒に近いほど適用しません。中間のグレーは部分的な適用になります。

これはRGBA Imageの「白い絵」「黒い絵」という意味ではなく、単一channelのMask値として読みます。

## Mask共通Controls（Image / Settings）

マスクの形や選択条件とは別に、各Maskノードには解像度と画像領域を決める**Output Size / Clipping Mode**、動くマスクの**Motion Blur**、描画環境の**Use GPU**などの共通設定があります。画面端でSoft Edgeが不自然な場合や、画像とマスクの解像度が異なる場合は[Mask共通Controls](./common-controls)でImage / Settingsタブを確認してください。

## 関連する考え方

- [マスク（Mask）](../../learn/02-data/mask)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 108、pp.2462–2502（Paint Modeはp.2465、Mask Paintはpp.2475–2476）、およびFusion Fundamentals Chapter 79のMask / Polyline説明を基に整理しています。

このFamily OverviewはMaskの選び分けを担当します。個々のSpline editingとPaint操作は各Node Referenceを参照してください。Image / Settingsタブの共通項目は[Mask共通Controls](./common-controls)にまとめています。
