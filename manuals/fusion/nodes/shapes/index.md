---
title: Shapeノード
description: Shape系Nodeを、作る・変える・増やす・まとめる・見た目を変える・画像化する役割から探す入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, build-shape]
updated: "2026-10-03"
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

## 画像へ変換する

- [sRender](./s-render) — Shapeのベクター情報を2D Imageへ変換する

```text
sEllipse → sGrid → sRender → Merge
```

この最小構成を一度作ると、Shape系Nodeが通常のImage系Nodeとどこで分かれているか確認できます。

## 読む順序

Shapeを初めて使う場合は、次の順で読むと各Nodeの役割を追いやすくなります。

1. [シェイプ（Shape）](../../learn/02-data/shape)
2. [sEllipse](./s-ellipse)
3. [sGrid](./sgrid) または [sDuplicate](./sduplicate)
4. [sRender](./s-render)

個々のNodeページでは、21.1 Manualで確認できる入力・Control・構成と、実機未確認の部分を分けて記述します。
