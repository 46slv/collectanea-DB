---
title: "sGrid"
description: "Shapeを指定した行数・列数へ複製するノード。格子状の配置、複合Shapeの反復、sJitterと組み合わせたパターン制作に使う。"
doc_type: node
term_id: "sgrid"
term_short: "sGridは、入力したShapeを行列状に複製し、行・列の数と間隔を調整するノード。"
verification: partial
aliases: ["sGrid"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sGrid"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Grid Cells X", "Grid Cells Y", "X Offset", "Y Offset"]
tasks: ["build-shape", "procedural-graphics", "repeat-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-23"
---

# sGrid

sGridは、入力した<Term id="shape-data">Shape</Term>を横方向と縦方向へ複製し、規則的な行列に並べるノードです。小さな円をドット状に敷き詰めたり、複数の図形を組み合わせた模様を一定間隔で反復したりできます。

ここでいうShapeは、ピクセル画像になる前の図形データです。[Shapeの基本](../../learn/02-data/shape)で、通常の2D ImageやMaskとの違いを確認できます。

## 入力と出力

**Input1（オレンジ、必須）**には、別のShapeノードの出力を接続します。例えば `sEllipse` の円を入れると、その円が行列状に複製されます。

`sMerge` で複数のShapeをまとめたものや、`sBoolean` で図形同士の重なりを処理した結果も入力できます。この場合、入力された**複合Shapeを一つの反復元として**行・列へ並べます。sGridに図形を何本も直接挿すのではなく、必要なら上流でまとめておく構成です。

出力もShapeです。後段のShapeノードで加工を続けられますが、通常の画像用MergeやBlurへ直接つなぐものではありません。画面に描画して合成するには、[sRender](./s-render)で2D Imageへ変換します。

```text
sEllipse → sGrid → sRender → Merge
                       ↑
             ここから2D Image
```

上のMergeでは、sRenderの画像を前景として、別に用意した背景画像と合成します。sGrid単体は画像を出力しないので、Viewerで結果を確認する場合もsRenderまで接続します。

## Inspectorの設定

### Grid Cells X / Grid Cells Y

横方向の列数と縦方向の行数を設定します。例えばXを5、Yを5にすると、入力したShapeを**5列×5行**に並べます。単一の円を入力した例なら、25個分の配置です。

数を増やしても元のShapeの大きさや列の間隔が自動で最適化されるとは限りません。細かな模様を作る際は、列数・行数だけでなく、入力図形のサイズと後述のOffsetを合わせて調整します。

### X Offset / Y Offset

列同士の横方向の距離と、行同士の縦方向の距離を調整します。どちらも0.0なら、各行・列のShapeは同じ場所へ重なります。**数を増やしているのに一つしか見えない場合は、まずOffsetを確認**してください。

21.1 Manualでは、X Offsetを1.0に設定すると、列がフレーム幅に相当する範囲へ広がる例が示されています。これは「1.0＝1ピクセル」という指定ではありません。ここでは厳密なピクセル位置や、各セルの座標計算式までは断定しません。

### Settingsタブ

SettingsはShape系ノードに共通するタブです。sGrid独自の行数・列数・間隔は、**Controls**タブで調整します。共通Settingsの説明を探している場合は、21.1 Manualの同章末尾にあるCommon Controlsを参照してください。

## 具体的な制作例

### 1. ドット状の背景を作る

```text
sEllipse（小さな円）
   ↓
sGrid（8列×6行）
   ↓
sRender
   ↓ Foreground
Merge ← Background（背景画像）
```

1. `sEllipse` で小さな円を一つ作ります。ここで決めるのは反復させる**一個のドット**の大きさです。
2. `sGrid` に接続し、Grid Cells Xを8、Yを6にします。円が8列×6行に複製されます。
3. X/Y Offsetを調整して、隣り合う円が重ならない間隔にします。配置が広がりすぎる場合はOffsetを小さくします。
4. `sRender` に接続して画像化し、`Merge` で映像や背景に重ねます。

結果は、円の大きさ、個数、間隔を別々に修正できるドット背景です。画面の密度を上げたいときに、完成画像を何枚も手作業で複製する必要はありません。

### 2. 二つの図形から作った模様を繰り返す

```text
sRectangle ─┐
            sMerge → sGrid → sRender
sEllipse ───┘
```

四角形と円を重ねて一つの装飾パーツにしたい場合は、`sMerge` で両方のShapeをまとめてからsGridへ渡します。sGridは、その組み合わせを行列状に繰り返します。

例えば、小さな四角形の中央に円を重ねたパーツを3列×4行に並べれば、同じ意匠のタイル背景を作れます。円だけ、あるいは四角形だけを変更した場合も、反復先へまとめて反映できます。

一方、四角形と円を**別々の密度や間隔で配置したい**なら、各Shapeに個別のsGridを付けて、後段でまとめる方が調整しやすくなります。

### 3. 等間隔の配置を少し崩す

```text
sEllipse → sGrid → sJitter → sRender → Merge
```

sGridで円を一定間隔に並べたあと、[sJitter](./sjitter)で個々の円の位置や大きさにばらつきを付ける構成です。

まずsGridだけで行数・列数・Offsetを決めます。続いてsJitterの**Fixed**モードでShape X/Y Offsetの範囲を少し広げると、規則的な配列を基準にした不揃いなドット背景になります。動くばらつきが必要な場合は、sJitter側の**Random**モードと範囲設定を使います。sGridのOffset自体がランダムな動きを生成するわけではありません。

この分離によって、模様の**基本的な密度・配列**はsGrid、**ばらつき**はsJitterという役割にできます。sJitterの詳しい設定は各ノードの記事を参照してください。

## どの位置にノードを置くか

sGridの前後に[sTransform](./stransform)を置くと、操作対象を分けられます。

- **sTransform → sGrid**：複製する前の元Shapeを移動・拡大縮小・回転させてから並べます。同じ変更を受けたパーツが各セルへ複製されます。
- **sGrid → sTransform**：作成済みの配列全体に追加の移動・拡大縮小・回転を与える構成です。画面上で模様全体を動かしたい場合はこちらが分かりやすくなります。

両者はノードの接続順序の違いです。Pivotや各Controlの細かな座標挙動まで同じになると決めつけず、必要ならsRenderのViewerで確認します。

## sDuplicateとの使い分け

**行と列の数を直接決めて等間隔に並べる**ならsGridが適しています。一方、[sDuplicate](./sduplicate)はコピーごとに位置・大きさ・回転などの変化を積み重ねられるノードです。

例えば、均一な円を6列×4行に配置するならsGrid、次のコピーほど小さくなる連続図形を作るならsDuplicateという選び方です。どちらもShapeを複製しますが、何をControlで指定したいかが異なります。

## 表示されない・想定と違うとき

- **行・列を増やしても一つに見える**：X/Y Offsetが0.0付近で、複製先が重なっていないか確認します。
- **画面内に収まらない／詰まりすぎる**：Grid Cellsだけで解決しようとせず、入力図形のサイズとX/Y Offsetを調整します。
- **sGridの出力を通常のImage系ノードへ接続できない**：出力はShapeです。sRenderで2D Imageへ変換します。
- **複数の図形を一緒に並べたい**：sMergeやsBooleanで上流のShapeをまとめ、sGridのInput1へ接続します。
- **規則的すぎる**：配列の規則性を残して一部だけ崩す場合は、sGridの後段にsJitterを追加します。

[Shapeノード一覧](./)には、生成・加工・複製・画像化の各ノードへの入口があります。

## 実機で作るドット配列

DaVinci Resolve Studio 21.1.0.14、Windows、日本語UIで撮影しました。画像を開くと原寸で端子や数値を読めます。

[![sEllipse1からsGrid1、sRender1、MediaOut1へ接続した実機Node Editor](/img/fusion/captures/S01/graph.png)](/img/fusion/captures/S01/graph.png)

1. `sEllipse` のWidth / Heightをともに0.055にします。
2. `sGrid` を挟み、Grid Cells Xを5、Yを3にします。
3. X Offsetを0.16、Y Offsetを0.18にし、`sRender` で画像化します。

[![sGridのオレンジ入力と白い出力端子](/img/fusion/captures/S01/node.png)](/img/fusion/captures/S01/node.png)

Shapeの接続を受ける端子です。Manualの表示名はInput1ですが、このbuildのScripting入力IDは `Input` でした。

[![sGrid Inspector。Grid Cells Xは5、Yは3、X Offsetは0.16、Y Offsetは0.18](/img/fusion/captures/S01/inspector.png)](/img/fusion/captures/S01/inspector.png)

[![フレーム0のsRender出力。白い円が5列3行、計15個並ぶ](/img/fusion/captures/S01/result.png)](/img/fusion/captures/S01/result.png)

1920×1080、フレーム0、Viewer倍率40%で、5列×3行の15個を確認しました。市松模様は透明部分です。数を変えるのはGrid Cells、間隔を変えるのはOffsetです。

[再現用Graph](/img/fusion/captures/S01/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S01/capture.json)

## バージョンと出典

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2743–2744**を参照しました。Input1（オレンジ、必須）、単一・複合Shapeの入力、sRenderへの接続、Grid Cells X/Y、X/Y Offsetの役割は同Manualに基づきます。

制作例のsJitterとの組み合わせは同Manual **pp.2744–2745**、sDuplicateとの使い分けは**pp.2735–2738**の記述と整合する構成として説明しています。上記の実機ドット配列以外の手順はManualの仕様から組み立てた例であり、個別の見た目やアニメーションを実機で検証した記録ではありません。

上記のドット配列ではREGID `sGrid`、入力接続、4つの主要Control、15個の描画を確認しました。Offsetの正確な座標計算式・数値範囲、Edition差、他の条件での描画結果・性能は未確認のため `verification: partial` を維持します。
