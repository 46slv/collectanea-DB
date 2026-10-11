---
title: "sTransform"
description: "Shapeに追加の位置・大きさ・回転・回転中心を与え、図形の自転と全体の移動を分けてアニメーションするノード。"
doc_type: node
term_id: "stransform"
term_short: "入力されたShapeを、別の位置・スケール・回転・Pivotで変形するノード。"
verification: partial
aliases: ["sTransform"]
concepts: ["shape-data", "vector-shape", "transform", "rasterization"]
nodes: ["sTransform"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["X Offset", "Y Offset", "X Size", "Y Size", "Rotation", "X Pivot", "Y Pivot", "Transform Axis"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-11"
---

# sTransform

sTransformは、すでに作った図形に**もう一組の移動・拡大縮小・回転**を追加するShapeノードです。元の図形を作り直さずに、図形自身の回転と、画面内での移動や公転を別々に動かせます。

ここでいう[Shape](../../learn/02-data/shape)は、画像のピクセルへ変換する前の図形データです。sTransformの出力もShapeのままなので、通常の映像と合成する場合は後段に[sRender](./s-render)を置きます。

## 入力と出力

- **Input1（オレンジ、必須）**：別のShapeノードの出力を受け取ります。たとえばsStarで作った星、sRectangleで作った四角形、sMergeでまとめた複数図形を渡します。
- **出力（Shape）**：移動・拡大縮小・回転を追加したShapeを後段へ渡します。sRenderで2D Imageへ変換するほか、Shape系ノードで加工を続けられます。

DaVinci Resolve 21.1 Reference Manualは外部入力を`Input1`と明記しています。これとは別に画像入力やMask入力を想定する必要はありません。

```text
sStar → sTransform → sRender → Merge
                                   ↑
                              MediaIn（映像）
```

`sStar → sTransform` はShapeの接続です。`sRender`の後ろで初めて2D Imageになるため、通常の`Merge`へ直接sTransformをつなぐ構成ではありません。

## 主な設定

### X / Y Offset：追加の移動

入力したShapeを左右・上下へ移動します。元のShapeに位置の設定があっても、それとは別にsTransform側で配置を調整できます。

ManualではOffsetを**フレーム幅基準の正規化座標**として説明しています。`X Offset = 0.0`を中央、`0.5`を図形の中心が右端へ来る例として挙げています。ピクセル数をそのまま指定する項目ではありません。

元のShape側でもOffsetを変え、sTransformでもOffsetを変えた場合は、どの段階で配置を決めているかを分けて確認します。

### X / Y Size：追加の拡大縮小

入力されたShapeのX方向・Y方向の大きさをそれぞれ調整します。両方向を同じ比率で変えれば縦横の比率を保った拡大縮小になり、異なる値なら横長・縦長へ変形できます。

たとえばsRectangleで角丸の四角形を作り、後段のsTransformで画面上のサイズだけをアニメーションさせれば、元の角丸やStyleの設定と全体の拡大縮小を別の場所で管理できます。

### Rotation：追加の回転

入力したShapeを、後述の`Pivot`を基準に回転します。元のsStarやsRectangleにも`Angle`がありますが、sTransformの`Rotation`は**後段の別の回転**です。

図形自身を回転させながら、その図形全体を別の中心の周りに回したい場合、元Shapeの`Angle`とsTransformの`Rotation`へ別々にキーフレームを設定します。

### X / Y Pivot：回転中心

`X Pivot`と`Y Pivot`は、追加の回転に使う中心位置を決めます。Viewerでは**赤いX印**として表示され、ドラッグして位置を変更できます。

Pivotが図形の中心と重なっていれば、その場所を中心に回転します。Pivotを図形から離して`Rotation`を動かすと、図形が別の中心の周りを回るような動きを作れます。図形の位置を変更する`Offset`と、回転中心を変更する`Pivot`は役割が違います。

### Transform Axis：Shapeの軸へ変形を適用する

`Transform Axis`は、Manualで「変形をShapeのaxisに適用する」チェック項目として説明されています。

ただしManualの該当節は、この切り替えが複数Shapeの合成後や連続Transformの評価順序にどう影響するかまでは説明していません。軸の扱いを確認する場合は、sMergeの前後や複数のsTransformで実際のViewer結果を比較してください。未確認の内部計算順序を前提にしない方が安全です。

## 具体的な使い方

### 1. 星を自転させながら画面中央の周りに回す

[sStar](./sstar)で星を1個作り、まずsStar側の`X Offset`で中心から少し離れた場所へ配置します。次にsTransformをつなぎ、`X/Y Pivot`を画面中央に置き、`Rotation`をアニメーションさせます。

さらにsStarの`Angle`にも別の速度でキーフレームを設定すると、星は自分自身も回転しながら、中央のPivotの周りを動きます。

```text
sStar（位置を中心から離す・Angleで自転）
  → sTransform（Pivotを中央に置く・Rotationで公転）
  → sRender
  → Merge（背景映像と合成）
```

「星の向き」はsStar、「星全体を回す中心と動き」はsTransformが担当します。このように役割を分けると、一方のアニメーションを変えても、もう一方のキーフレームを作り直さずに済みます。これはManualにある階層アニメーションの考え方を使った制作例で、実機での見た目は未検証です。

### 2. 複数の図形を一緒に移動する

sRectangleで背景の帯を、sStarで装飾を作り、[sMerge](./smerge)で同じShapeのまとまりにします。その出力をsTransformへ渡すと、各図形の元の設定を残したまま、**まとめた図形全体**へ移動や回転を追加できます。

```text
sRectangle ─┐
            ├→ sMerge → sTransform → sRender → Merge
sStar ──────┘
```

帯と装飾の相対位置はそれぞれのShape側で、画面への登場や退出はsTransform側で調整する構成です。個々のパーツに同じ移動キーフレームを重複設定する必要を減らせます。

### 3. 配列を動かすか、配列する前の図形を動かすか

[sGrid](./sgrid)でShapeを規則的に並べる場合、sTransformを置く位置で調整の対象が変わります。

```text
sEllipse → sGrid → sTransform → sRender
                     ↑
                  配列全体を変形

sEllipse → sTransform → sGrid → sRender
              ↑
          配列前の元Shapeを変形
```

上は行列に並べた後でまとまり全体を動かす構成です。下は並べる前の図形に変形を加える構成です。図形1個の形と配置を変えたいのか、出来上がったパターンを画面内で動かしたいのかで順序を選びます。

## 似たノードとの違い・注意点

- [sDuplicate](./sduplicate)はShapeを**増やしてコピーごとに変化**を付けるノードです。sTransform自体はコピーを増やす役割ではありません。
- [sGrid](./sgrid)は入力されたShapeを行と列に並べるノードです。配列を丸ごと移動・回転したい場合は、その後段のsTransformが候補になります。
- [sMerge](./smerge)は複数のShapeをまとめます。まとまりを作る工程と、その後で全体を動かす工程を分けられます。
- 通常の[Transform](../transform/transform)は**2D Image**を変形します。sTransformは**Shape**を変形するため、使う位置はsRenderの前です。
- 図形がViewerに通常の画像として表示されない場合は、[sRender](./s-render)まで接続した状態で確認します。Transform自体の動作不良とは限りません。

Shapeノード全体の説明は[Shapeノード一覧](./index)から確認できます。

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、pp.2766–2767**に基づき、必須`Input1`、Shape出力、階層アニメーション、`X/Y Offset`、`X/Y Size`、`Rotation`、`X/Y Pivot`、`Transform Axis`を確認しました。

公式資料：[Blackmagic Design サポートセンター](https://www.blackmagicdesign.com/support)。

端子の内部REGID、Inspectorのデフォルト値・範囲、Edition差、`Transform Axis`の詳細な計算、実機での描画結果は未確認です。そのため`verification: partial`を維持しています。
