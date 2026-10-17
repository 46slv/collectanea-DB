---
title: Shapeノード
description: Shape系Nodeを、作る・変える・増やす・まとめる・見た目を変える・画像化する役割から探す入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, build-shape]
updated: "2026-10-17"
---

# Shapeノード

Shape系Nodeは、円・四角・文字・パスなどを<Term id="shape-data">Shape</Term>のまま生成・加工し、必要な地点で `sRender` を使って2D Imageへ変換するためのNode群です。

Shapeそのものの意味から確認する場合は、先に[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。このページは個々のNodeを選ぶための案内です。

## 基本の流れ

```text
Shapeを作る
   ↓
Shapeのまま変形・複製・結合する
   ↓
sRender
   ↓
2D Imageとして合成・エフェクト処理する
```

Shape系の処理を続けている間は、毎回画像へ変換する必要はありません。通常のMerge、Blur、Color Nodeなどへ移る地点が `sRender` の主な境界です。

## 接続前に区別する：ShapeとMask

Shape系ノードが受け渡すのは、図形の形・位置・塗りなどを扱う**Shapeデータ**です。通常の画像を加工する[Transform](../transform/transform)やMergeへ渡す場合は、先に[sRender](./s-render)で**2D Image**へ変換します。最初から画像へ変換すると、その後のsGridやsBooleanでShapeのまま加工することはできません。

一方、[Mask](../../learn/02-data/mask)はエフェクトを適用する範囲を指定するためのデータです。たとえばsRenderにはオレンジ色のShape入力（Input1）と、青色の**Effect Mask**入力があります。前者は「何を描くか」、後者は「描画した結果をどこに表示するか」に使います。**sBooleanの2つのShape入力とは役割が異なります。**

## 作る

- [sEllipse](./s-ellipse) — 円・楕円
- [sRectangle](./srectangle) — 四角形
- [sPolygon](./spolygon) — ポリゴン
- [sBSpline](./sbspline) — B-SplineのShape
- [sNGon](./sngon) — 多角形
- [sStar](./sstar) — 星形
- [sText](./stext) — 文字

## 変える

- [sTransform](./stransform) — 位置・大きさ・回転などの追加Transform
- [sExpand](./sexpand) — Shapeを膨張・収縮する
- [sOutline](./soutline) — 複合Shapeの輪郭を調整する
- [sChangeStyle](./schangestyle) — 色とAllow Combiningを後段で上書きする

KrokodoveにもShapeを加工するツールがあります。[Krokodoveの案内](../krokodove/)では `sOffset`、`sRound`、`sSmooth`、`sResample` などを別系統として整理しています。

## 増やす・並べる

- [sDuplicate](./sduplicate) — コピーごとに位置・大きさ・回転などの変化を積み重ねる
- [sGrid](./sgrid) — X・Y方向の規則的な行列へ並べる
- [sJitter](./sjitter) — 配列やShapeへランダムな差を加える

「行と列で並べたい」ならsGrid、「コピーごとの変化を積み重ねたい」ならsDuplicateから確認すると選びやすくなります。

## まとめる

- [sMerge](./smerge) — 複数のShapeをまとめる
- [sBoolean](./sboolean) — 重なりをIntersection / Union / Subtract / Xorで処理する

### 重ねるか、くり抜くか

円と四角を**別の図形として重ね、前後関係を決めたい**場合は[sMerge](./smerge)を使います。最初の入力が下側、次の入力が上側に重なります。

2つの図形の領域から**共通部分や差分を計算したい**場合は[sBoolean](./sboolean)です。`Intersection`は重なりだけ、`Union`は両方の領域、`Subtract`はInput1からInput2を除いた領域、`Xor`は重なった部分を除く領域を残します。Subtractでは入力順が重要です。また、sBooleanは入力元の色・Alphaを保持せず、自分のStyleで置き換えます。色の異なる図形をそのまま重ねる用途ならsMergeを選びます。

### 例：大小の円から中抜きリングを作る

```text
sEllipse（大、Input1）─┐
                      ├→ sBoolean（Subtract）→ sRender ─→ Merge（Foreground）→ MediaOut
sEllipse（小、Input2）─┘                                  ↑
MediaIn ───────────────────────────────────────────────→ Merge（Background）
```

大きい円をsBooleanの**Input1**、同じ中心にある小さい円を**Input2**へ接続します。Subtractを選ぶと小さい円の領域が除かれ、穴の開いたShapeになります。リングの外径・内径をそれぞれのsEllipseで変え、sRenderで画像化してからMergeで撮影映像へ重ねます。**図形をくり抜くのはsBoolean、画像として描くのはsRender、映像へ重ねるのは通常のMerge**です。

## 画像へ変換する

- [sRender](./s-render) — Shapeのベクター情報を2D Imageへ変換する

```text
sEllipse → sGrid → sRender → Merge
```

この最小構成を一度作ると、Shape系Nodeが通常のImage系Nodeとどこで分かれているか確認できます。

## 形を変える操作の選び分け

輪郭から外側・内側へ領域を増減させたいときは[sExpand](./sexpand)のAmountを調整します。輪郭を**線として描き**、太さや線端、描画される長さを動かしたいときは[sOutline](./soutline)のThicknessやLengthを使います。どちらもShapeのまま出力するため、通常の映像用エフェクトへつなぐ前にsRenderが必要です。

色やAlphaを後段でまとめて変更するのは[sChangeStyle](./schangestyle)です。形そのものを作り変えるsBooleanやsExpandとは操作対象が異なります。

## 読む順序

Shapeを初めて使う場合は、次の順で読むと各Nodeの役割を追いやすくなります。

1. [シェイプ（Shape）](../../learn/02-data/shape)
2. [sEllipse](./s-ellipse)
3. [sGrid](./sgrid) または [sDuplicate](./sduplicate)
4. [sRender](./s-render)

個々のNodeページでは、21.1 Manualで確認できる入力・Control・構成と、実機未確認の部分を分けて記述します。

## 参照資料と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」を参照。sBooleanのInput1/Input2・Operation・Style Mode（pp.2729–2732）、sMergeの入力順とShape合成（pp.2746–2747）、sRenderのShape入力・Effect Mask・画像出力（pp.2759–2760）を確認しました。

上記のリング構成はマニュアル上の接続と処理内容を組み合わせた制作例です。21.1実機の描画結果、内部REGID、全Controlの既定値・数値範囲、Edition差は検証していないため、`verification: partial`を維持しています。
