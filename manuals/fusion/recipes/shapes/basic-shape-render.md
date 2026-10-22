---
title: "Shapeを2D Imageに変換して映像へ重ねる"
description: "sEllipseで作った円をsRenderで画像化し、Mergeで映像へ重ねる。ShapeとImageの違いも確認する基本レシピ。"
doc_type: recipe
verification: partial
aliases: ["shape render", "sEllipse sRender", "Shapeの画像化"]
concepts: ["shape-data", "image-data", "rasterization"]
patterns: ["defer-domain-conversion"]
nodes: ["sEllipse", "sRender", "Merge"]
tasks: ["build-shape", "render", "convert-domain", "composite"]
prerequisites: ["shape-data"]
level: foundation
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# Shapeを2D Imageに変換して映像へ重ねる

Fusionで円や四角形を作るShape系Nodeの出力は、映像と同じ2D Imageではありません。このレシピでは、円を1つ作り、**sRenderで画像に変換してからMergeで背景映像へ重ねる**ところまでを確認します。

## 作るもの

背景映像の上に、色の付いた円を1つ表示します。円の外側は透明なので、下にある映像が見えます。

ここでいう<Term id="shape-data">Shape</Term>は、円の輪郭や配置をピクセルにする前の図形データです。sEllipseで作ったShapeを、そのまま通常のMergeへ接続するのではなく、**Shape → sRender → Image → Merge**という順序にします。

## 必要なもの

- **sEllipse**：円・楕円をShapeとして作ります。画像や別のShapeの入力は必要ありません。
- **sRender**：Shapeを、一般的な画像処理Nodeが受け取れる2D Imageに変換します。
- **Merge**：背景映像（Background）に、円の画像（Foreground）を重ねます。
- **MediaIn / MediaOut**：ResolveのFusionページで映像を使い、結果をタイムラインへ返す場合の入出力です。

単に円だけを表示したい場合は、最初の **sEllipse → sRender** までで確認できます。映像への合成はその後の工程です。

## 手順

### 1. 円をShapeとして作る

FusionページでsEllipseを追加します。Inspectorで**Solidを有効**にし、Styleタブの**Color**で目立つ色を指定します。**Width / Height**で円の大きさを調整し、必要なら**X / Y Offset**で場所を動かします。

sEllipseはShapeの生成元なので、左側に画像を接続する必要はありません。この時点で扱っているのは、画像の画素ではなく円の形状です。

### 2. sRenderで画像に変換する

sEllipseの出力を、sRenderの**Input1（Shape入力）**へ接続します。

```text
sEllipse → sRender → Viewer
  Shape       2D Image
```

sRenderをViewerに表示し、指定した色と大きさの円が見えるか確認します。背景をまだ接続していない場合、円の外側は透明な領域です。

まずはsRenderの**Auto Resolution**を有効にして、CompositionのFrame Formatに合わせて画像化する構成から始めます。別の解像度を使いたいときは、Auto Resolutionを無効にしてWidth / Heightなどを指定できます。

### 3. Mergeで背景映像へ重ねる

背景にするMediaInをMergeの**Background**へ、sRenderの画像出力をMergeの**Foreground**へ接続します。Mergeの結果をMediaOutへ渡します。

```text
sEllipse → sRender ────→ Merge（Foreground）
                          │
MediaIn ────────────────→ Merge（Background）
                          │
                          ↓
                        MediaOut
```

MergeをViewerに表示し、円の外側から背景映像が見えていることを確認します。**Mergeへ渡すのはsEllipseではなく、sRenderの出力**です。

### 4. 変更箇所を1つずつ確かめる

円の位置を動かすならsEllipseのX / Y Offset、大きさを変えるならWidth / Height、色を変えるならStyleタブのColorを調整します。背景と円の前後関係を変えたいときは、MergeのForeground / Backgroundの接続を確認します。

「円そのものの形」と「画像へ変換する解像度」と「映像へ重ねる処理」を別々のNodeで扱っている点が、この構成の要点です。

## この構成で動く理由

sEllipseとsRenderの間では、円は**Shapeデータ**のままです。sRenderが輪郭と色を画素へ変換し、そこで初めて通常の2D Imageになります。そのため、Imageを入力するMergeやGlowへ続けられます。

sRenderは単なる表示補助ではなく、**データ形式を変えるNode**です。Shapeの複製や変形を後から追加したい場合は、sRenderの**前**にShape系Nodeを置きます。一般的な画像エフェクトは**後**に置きます。

詳しい考え方は[シェイプ（Shape）](../../learn/02-data/shape)と[必要な地点で2D Imageに変換するパターン](../../patterns/data-domain/defer-domain-conversion)を参照してください。

## バリエーション

### 輪郭だけの円を描く

sEllipseの**Solidを無効**にし、**Border Width**で輪郭線の太さを決めます。**Length**を1.0未満にすると輪郭に切れ目ができ、時間とともに1.0へ変えることで、円周を描くアニメーションを作れます。この場合もsRenderを通してからMergeへ接続します。

### 円を規則的に並べる

sEllipseとsRenderの間に**sGrid**を追加します。

```text
sEllipse → sGrid → sRender → Merge
```

sEllipseは1個の円の形と色、sGridは**横・縦の複製数と配置間隔**を担当します。例えば小さな円を複数行・複数列に並べて、ドット模様の背景を作れます。並べた後もsRenderまではShapeです。

### 角丸の帯を作る

sEllipseを**sRectangle**に置き換え、Width / Heightで横長の長方形を作ります。**Corner Radius**を上げると角が丸くなり、テロップの背景帯などに使えます。sRectangleも外部入力のないShape Generatorなので、sRender以降の接続を変更する必要はありません。

### 円にGlowを加える

光る円を作るときは、**sRenderの後ろ**にGlowを挿入します。

```text
sEllipse → sRender → Glow → Merge
```

Glowは画像を処理するため、ShapeのままのsEllipseとsRenderの間へ置く構成ではありません。

## うまくいかないとき

- **円が表示されない**：まずMergeを外してsRenderをViewerに表示し、ShapeからImageへの変換まで成立しているか確認します。sEllipseのSolid、ColorのAlpha、Width / Heightも見直します。
- **Mergeに接続できない**：sEllipseのShape出力を通常のMergeに直接渡していないか確認します。間にsRenderが必要です。
- **円は見えるが背景映像と合成されない**：背景映像がMergeのBackground、sRenderがForegroundへ接続されているか確認します。
- **大きさや解像度が想定と違う**：sEllipseのWidth / Height（円そのものの寸法）と、sRenderのAuto Resolution / Width / Height（画像化する解像度）を区別します。Mergeで重ねる場合、出力解像度はBackground側の画像が基準になります。
- **円の一部しか出ない**：sRenderの青い**Effect Mask**入力にマスクを接続している場合は、表示範囲が限定されていないか確認します。
- **sGridで並べたのに1個しか見えない**：sGridのGrid Cells X / Yで複製数を確認し、X / Y Offsetで図形が重ならない配置へ調整します。

## 関連ページ

- [sEllipse](../../nodes/shapes/s-ellipse) — 円の塗り、輪郭、位置、形状を設定する。
- [sRender](../../nodes/shapes/s-render) — Shape入力、画像解像度、Effect Maskを確認する。
- [Merge](../../nodes/compositing/merge) — ForegroundとBackgroundの合成を確認する。
- [sGrid](../../nodes/shapes/sgrid) — 円を行列状に増やす。
- [sRectangle](../../nodes/shapes/srectangle) — 四角形や角丸の帯を作る。
- [画像（Image）](../../learn/02-data/image) — Shapeから変換した先のデータを理解する。

## バージョンと検証状況

**資料で確認した内容**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）Chapter 117「Shape Nodes」、**sEllipse pp.2738–2741、sGrid pp.2743–2744、sRectangle pp.2756–2759、sRender pp.2759–2761**。Shape Generatorの外部入力、ShapeからImageへの接続、主要ControlとsRenderの入力・画像化設定を根拠にしています。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)からマニュアルを参照できます。

**構成例と未確認範囲**：映像に円を重ねる手順、ドット模様、角丸帯、Glowの応用は、確認済みのNode仕様を組み合わせた制作例です。Resolve 21.1実機での完成結果、処理負荷、Edition差、内部REGIDはこのレシピでは未検証です。そのためページの状態は `verification: partial` としています。
