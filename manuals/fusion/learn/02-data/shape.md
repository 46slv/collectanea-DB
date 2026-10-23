---
title: シェイプ（Shape）
description: FusionのShapeを、画像化する前に図形の輪郭や配置を保持して加工するベクターデータとして理解する。
doc_type: concept
term_id: shape-data
term_short: sEllipseやsRectangleなどが扱う、sRenderで画像化する前のベクター図形データ。
verification: partial
aliases: [Shape, Shape data, Shape domain, vector shape]
concepts: [shape-data, vector-shape, rasterization]
tasks: [build-shape, procedural-graphics, read-graph, debug]
prerequisites: [typed-connections]
level: foundation
product_scope: fusion
updated: "2026-10-23"
---

# シェイプ（Shape）

## このページで分かること

FusionのShapeが何なのか、通常の2D ImageやMaskと何が違うのか、Shape系Nodeをどの順番で使うのかを整理します。

## 基本の考え方

Shapeは、円や四角、文字、パスなどの**図形の情報を、まだ画像のピクセルにせず保持しているデータ**です。

たとえば小さな円を100個並べたい場合、最初から100枚の画像として扱うのではなく、円の形や位置をShapeとして持ったまま複製・変形し、最後に `sRender` で2D Imageへ変換できます。

~~~text
sEllipse → sGrid → sRender ───────────→ Merge［Foreground］→ MediaOut
MediaIn ──────────────────────────────→ Merge［Background］
~~~

sEllipseで作った円をsGridで並べた段階では、出力はまだShapeです。sRenderで初めて通常の2D Imageへ変わり、MediaInの映像とMergeで合成できます。複製・図形演算はsRenderより前、画像へのエフェクトや合成は後で行います。

この「画像化する前に図形として扱う」区間がShape系Nodeの仕事です。

## 何が入っていて、何が入っていないか

Shapeには、図形の輪郭や配置、Shape系処理に必要な情報が含まれます。

一方、Shapeは通常の2D Imageではありません。そのため、ShapeをそのままBlurや通常のMergeへ接続するのではなく、一般的な画像処理へ渡す地点で `sRender` を使います。

Maskとも別物です。Shapeは「図形を作って加工するためのデータ」で、Maskは主に「どこへ処理を効かせるか」を指定するためのデータです。

## Shape系Nodeの役割

Shape系Nodeは、大まかに次のように読めます。

- **作る**: `sEllipse`、`sRectangle`、`sText` などで元になる図形を作る。
- **変える**: `sTransform`、`sJitter` などで位置や形の扱いを変える。
- **増やす**: `sDuplicate`、`sGrid` などで同じShapeを複製する。
- **図形を重ねる**: `sMerge` は複数のShapeをレイヤーとして重ねる。後から接続した形が上になります。
- **領域を計算する**: `sBoolean` は2つのShapeのIntersection（共通部分）、Union（結合）、Subtract（差し引き）、Xor（重複を除外）を作る。
- **画像にする**: `sRender` でShapeを2D Imageへ変換する。

Node名を覚えるより、「今はShapeを作っているのか、増やしているのか、画像へ変換しているのか」でFlowを見ると役割を判断しやすくなります。

## 最小例：四角形を映像へ重ねる

~~~text
sRectangle → sRender ──────────→ Merge［Foreground］→ MediaOut
MediaIn ───────────────────────→ Merge［Background］
~~~

sRectangleが四角形のShapeを作り、sRenderがそれをImageへ描画します。MergeのForegroundへ渡すのは、sRender後のImageです。

## 実例：2つの円から穴の空いたリングを作る

~~~text
sEllipse（大きな円） ─→ sBoolean［Input1：オレンジ］
sEllipse（小さな円） ─→ sBoolean［Input2：緑］──→ sRender ──→ Merge［Foreground］
MediaIn ──────────────────────────────────────────→ Merge［Background］
~~~

1. 外側を大きく、内側を小さくしたsEllipseをそれぞれ作ります。
2. sBooleanの**OperationをSubtract**に設定します。Input1にある大きな円から、Input2の小さな円の重複部分を取り除くため、中央に穴ができます。
3. sRenderでRGBAのImageへ変換し、MergeのForegroundに入れると、映像の上にリングを重ねられます。

sBooleanのSubtractでは、**Input1が残す側、Input2が取り除く側**です。接続を入れ替えると結果が変わります。Intersectionは2つが重なる場所だけ、Unionはどちらかの形がある場所、Xorは重なりを除いた場所を残します。21.1のsBooleanは自身のStyleで入力Shapeの色・Alphaを置き換えるため、色が想定と違うときはsBooleanのStyleも確認してください。[sBoolean](../../nodes/shapes/sboolean)と[sMerge](../../nodes/shapes/smerge)は目的が異なります。

## ShapeをMaskとして使う

図形を合成するのではなく、図形の形を使って別の映像の一部だけをぼかす場合は、次のように変換します。

~~~text
MediaIn（ぼかす映像） ─────────────────→ Blur ─→ MediaOut
                                        ↑ Effect Mask
sEllipse → sRender → Bitmap Mask ───────┘
                        Channel: Alpha
~~~

sRenderがShapeを2D Imageへ変え、Bitmap Maskがその**Alphaチャンネル**から単一チャンネルのMaskを作ります。MediaInはBlurのImage入力、Bitmap MaskはBlurのEffect Mask入力に接続します。結果は「円を映像の上に描く」のではなく「円形の部分だけぼかす」処理です。sRenderのAlphaに求める形があることをViewerで確認してください。

円形の範囲指定だけなら[Ellipse Mask](../../nodes/masks/ellipse-mask)をBlurへ直接つなぐ方が簡単です。sGridで複製した模様やsBooleanで加工した形状をMaskとして再利用したいときに、この変換経路が役立ちます。[Maskの基本](./mask)と[接続互換性](./connection-compatibility)も参照してください。

## 1つだけ変えて確認する

次の構成を作ります。

```text
sEllipse → sGrid → sRender
```

`sEllipse` では小さな円を1つ作り、`sGrid` 側で横・縦の複製数や間隔を変えます。

円そのものを作り直しているのではなく、入力されたShapeを並べる段階と、それを画像化する段階が分かれていることを確認できます。

<!-- capture-reuse:R01 -->
### 実機の参考例：Shapeを画像へ変換する

sEllipseのShapeをsGridで5列3行に複製し、sRenderで15個の白い円として画像化した例です。

[![S01の実機撮影：Shapeを画像へ変換するの接続](/img/fusion/captures/S01/graph.png)](/img/fusion/captures/S01/graph.png)

[![S01の実機撮影：Shapeを画像へ変換するの表示結果](/img/fusion/captures/S01/result.png)](/img/fusion/captures/S01/result.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS01の固定例を再掲しています。[撮影条件と確認範囲](/img/fusion/captures/S01/capture.json)で元の設定を確認できます。

## 初見のShape Nodeを読む

初めて見るShape Nodeでは、まず入力と出力を見ます。

- **Shape → Shape**: Shapeのまま生成・変形・複製・結合するNode。
- **Shape → Image**: Shapeを画像へ変換する境界。代表例は `sRender`。
- **ImageやMaskが混ざる**: 別のデータ領域との変換や参照が入るので、そのNode固有の説明を確認する。

この区別だけでも、「なぜ通常のMergeへ繋がらないのか」「どこにsRenderが必要なのか」を判断しやすくなります。

## よくある誤解

### ShapeはMaskの別名ではない

どちらも輪郭を扱うため見た目が似ることがありますが、Flow上の役割とデータ領域は別です。

### Viewerに普通の画像として出ないから壊れている、とは限らない

Shapeのまま処理している途中なら、通常の2D Imageとして扱う前に `sRender` が必要です。

### 早い段階で画像化する必要はない

後段でもShape系の複製や変形を続けるなら、必要になるまでShapeのまま保持した方が構成を読みやすくできます。

## Nodeを探す

Shape系Nodeを役割から選ぶ場合は、[Shapeノード](../../nodes/shapes/)を参照してください。標準Shape系と、KrokodoveのShape Toolsは同一カテゴリとして混ぜず、必要に応じて相互リンクします。

## 関連Node

- [sEllipse](../../nodes/shapes/s-ellipse) — 円・楕円のShapeを作る
- [sRectangle](../../nodes/shapes/srectangle) — 四角形のShapeを作る
- [sDuplicate](../../nodes/shapes/sduplicate) — Shapeを複製する
- [sGrid](../../nodes/shapes/sgrid) — Shapeを横・縦へ規則的に並べる
- [sMerge](../../nodes/shapes/smerge) — 複数のShapeをまとめる
- [sRender](../../nodes/shapes/s-render) — Shapeを2D Imageへ変換する

## 次に読む

Shapeを通常の画像処理へ渡す境界を確認するなら、[sRender](../../nodes/shapes/s-render)を参照してください。一度Imageになった出力を、ShapeのままsBooleanへ戻すことはできません。

## バージョンと検証状況

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117 pp.2729–2731（sBooleanの入力・演算・Style）、p.2743（sGridの複製）、p.2746（sMergeの重なり順）、pp.2759–2761（sRenderのShape入力とImage出力）、Chapter 108 p.2463（Bitmap Mask）を参照しました。実例はこれらの仕様を組み合わせたものです。

Fusion 21.1の内部REGID、全Shape Nodeの実機端子・Inspector初期値・Edition差は、このConceptページでは確定していません。
