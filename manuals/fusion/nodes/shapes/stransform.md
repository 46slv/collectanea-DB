---
title: "sTransform"
description: "Shapeの位置・大きさ・回転を追加で制御するNode。図形自体の回転と、別の中心を使った周回を分けられる。"
doc_type: node
term_id: "stransform"
term_short: "sTransformは、Shapeに位置・大きさ・回転の調整を追加するNode。"
verification: partial
aliases: ["sTransform"]
concepts: ["shape-data", "transform"]
nodes: ["sTransform"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["X Offset", "Y Offset", "X Size", "Y Size", "Rotation", "X Pivot", "Y Pivot", "Transform Axis"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---
# sTransform

sTransformは、すでに作った<Term id="shape-data">Shape</Term>の**位置・大きさ・回転を後段で調整する**Nodeです。たとえば星をその場で回しながら、別の点を中心に周回させるときに使います。

Shapeは、円や星などの輪郭・配置を持つ、まだピクセル画像になっていない図形データです。sTransformの出力もShapeなので、通常の映像へ重ねる前には[sRender](./s-render)で2D Imageへ変換します。

## 何をするNodeか

[sStar](./sstar)のようなShape Generatorにも、位置や回転の設定があります。sTransformを後ろに追加すると、**図形そのものの変化**と、**図形全体を動かす変化**を別々に調整できます。

たとえば星の角度を変える操作と、星の位置を画面内で移動させる操作を別Nodeに分けられます。さらに回転の中心点を変えると、星をその場で回すだけでなく、中心点の周りを移動させる動きを作れます。こうした親子関係に近い変形の重ね方が、Manualでいう「階層的なアニメーション」です。

## 入力と出力

- **Input1（オレンジ・必須）**：sStarやsEllipseなど、ほかのShape Nodeの出力を受け取ります。
- **出力（Shape）**：位置・大きさ・回転の設定を適用したShapeを渡します。通常の2D Imageではありません。

```text
sStar → sTransform → sRender → Merge
          Shape       Image
```

sRenderの後に置く通常のImage系Transformとは、受け取るデータが異なります。Shapeの輪郭を保ったまま配置を調整したいときは、sRenderより前でsTransformを使います。

## 主なInspector項目

DaVinci Resolve 21.1 Reference ManualのsTransform「Controls」タブで説明される項目です。

| 項目 | 何が変わるか |
| --- | --- |
| **X and Y Offset** | 図形の位置。左右・上下へ動かす。 |
| **X and Y Size** | 図形の横方向・縦方向の大きさ。別々の値を使うと縦横比が変わる。 |
| **Rotation** | 指定した回転中心を基準に図形を回す。 |
| **X and Y Pivot** | Rotationの中心点を動かす。 |
| **Transform Axis** | 図形の軸にも変形を適用する設定。 |

### OffsetとSizeを区別する

**Offset**は画面内の場所を変え、**Size**は図形の大きさを変えます。Offsetは正規化された座標で扱われ、Manualでは**X Offsetが0.0なら画面中央、0.5なら図形の中心が画面右端**になる例が示されています。

X SizeとY Sizeを別々に変えると、元の形の縦横比を保たずに伸縮できます。円を横長にするなど、形を変える目的でも使えます。

### RotationとPivotを区別する

**Rotation**は回転量、**Pivot**は回転の中心です。同じ回転量でも、Pivotが星の中心にあれば自転するように見え、中心から離すと星の位置が回転中心の周囲を移動します。

ViewerではPivotが**赤いX印**として表示され、ドラッグして位置を調整できます。数値を入力する代わりに、画面上で回転中心を決められます。

### Transform Axisについて

**Transform Axis**は、Shapeの軸にも変形を適用するチェックボックスです。21.1 Manualで確認できるのはこの役割までです。後段の各Nodeに与える厳密な影響は、実機で中間結果を比べて確認してください。

## 制作例1：星を自転させながら周回させる

1. [sStar](./sstar)で星を作り、その出力をsTransformのInput1へつなぎます。
2. sTransformの出力を[sRender](./s-render)へつないで、結果をViewerで表示します。
3. **sStar側のAngle**にキーフレームを付け、星の向きを時間とともに変えます。
4. sTransformの**X/Y Pivot**を星の中心から離し、回転の中心を別の場所に置きます。
5. sTransform側の**Rotation**にもキーフレームを付け、星がその中心の周囲を動く様子を確認します。
6. 必要に応じてsTransformのOffsetやSizeで全体の配置と大きさを調整します。

```text
sStar〔Angle：星自身の向き〕
  ↓
sTransform〔Pivot：周回の中心 / Rotation：周回の角度〕
  ↓
sRender → Merge
```

**sStarのAngleは星そのものの回転、sTransformのRotationは後段で追加する回転**と役割を分けるのがポイントです。Manualはこの星の自転と周回を、sTransformを使う代表例として説明しています。

## 制作例2：複数の図形をまとめて移動する

円と星を別々に配置し、[sMerge](./smerge)で1つのShapeの流れにまとめてから、sTransformで全体の位置を調整する構成です。

```text
sEllipse ─┐
          ├─ sMerge → sTransform → sRender
sStar ────┘
```

円と星の間隔は前段で調整し、グループ全体を動かすOffsetやRotationは後段にまとめます。複数のShapeを構成した後で全体の位置を変えたい場合に使える設計例です。個別の図形だけを動かしたい場合は、sMergeより前でそれぞれにsTransformを挿入します。

この組み合わせは確認済みのShape入出力を利用した構成例で、Resolve 21.1実機での完成結果は未検証です。

## 関連Nodeとの違い

- [sStar](./sstar)、[sEllipse](./s-ellipse)：Shapeそのものを作る。sTransformは作成済みShapeに変形を追加する。
- [sMerge](./smerge)：複数のShapeをまとめる。まとめた結果をsTransformで動かす構成も取れる。
- [sGrid](./sgrid)：同じ図形を行と列に並べる。sTransformは複製数や行列の構成を決めるNodeではない。
- [sRender](./s-render)：Shapeから通常のImageへ変換する。sTransformはその前に置く。

## うまくいかないとき

- **Shapeを映像へ重ねられない**：sTransformの出力はShapeです。MergeなどのImage入力へ渡す前にsRenderを接続します。
- **Rotationを変えても周回せず自転するだけ**：X/Y Pivotが図形の中心にある可能性があります。Viewerの赤いX印を中心から動かして比較します。
- **星の自転と周回を別々に直したい**：sStar側のAngleとsTransform側のRotationを分担させます。
- **Sizeを変えると形がつぶれる**：X SizeとY Sizeの値が異なると縦横比が変わります。元の比率を保つなら両方向の値をそろえます。

## バージョンと検証状況

**確認した一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2766–2767**。Input1（オレンジ・必須）、階層的な変形、X/Y Offset・Size、Rotation、X/Y Pivot、Transform Axis、sRenderへの接続を確認しました。

**未確認：** Resolve 21.1実機の描画結果、各Controlの初期値・数値範囲、内部REGID、Free / Studioでの差、Transform Axisが後段処理に与える具体的な影響。したがって `verification: partial` を維持しています。
