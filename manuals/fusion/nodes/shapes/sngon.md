---
title: "sNGon"
description: "三角形・五角形などの多角形Shapeを生成し、塗り・輪郭・位置・色を調整するNode。"
doc_type: node
term_id: "sngon"
term_short: "sNGonは、三角形・五角形など複数の辺を持つ多角形をShapeデータとして生成するNode。"
verification: partial
aliases: ["sNGon"]
concepts: ["shape-data", "rasterization"]
nodes: ["sNGon"]
node_family: "shapes"
outputs: ["shape"]
controls: ["Solid", "Border Width", "Border Style", "Cap Style", "Position", "Length", "X Offset", "Y Offset", "Width", "Height", "Angle", "Color", "Allow Combining"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# sNGon

sNGonは、三角形や五角形、八角形など、**直線の辺で囲まれた多角形**を作るShape生成Nodeです。内部を塗った図形だけでなく、輪郭だけの多角形や、一部が切れた線も作れます。

ここでいう<Term id="shape-data">Shape</Term>は、画像のピクセルに変換する前の図形データです。sNGonは映像に図形を直接描き込むのではなく、**後段で配置・複製・加工できる多角形**を出力します。

## 役割

sNGon自身が多角形を生成します。入力画像や別のShapeを受け取って変形するNodeではありません。作った多角形は、sDuplicateやsGridで増やしたり、sRenderで画像に変換したりできます。

## 入力

**外部入力はありません。** sNGon単体で図形を作るGeneratorです。

## 出力

多角形を**Shapeデータ**として出力します。通常の画像処理Nodeへ渡す前に、[sRender](./s-render)で2D Imageへ変換します。

    sNGon → sRender → 2D Image

sNGonの結果をそのまま通常のMergeへつなぐのではなく、Shapeを画像化する段階でsRenderを挟みます。

## 主な設定項目

### Solid / Border Width：塗りつぶしか輪郭か

**Solidをオン**にすると、Styleタブの色で内側を塗りつぶします。**オフ**にすると内側が透明になり、Border Widthで輪郭の太さを決めます。

Border WidthはSolidがオンの状態でも使用できます。輪郭線を作るときは、Solidをオフにして太さの変化を確認すると分かりやすくなります。

### Border Style：角のつながり方

多角形の角で輪郭線をどうつなぐかを選びます。

| 選択肢 | 見た目 |
| --- | --- |
| **Bevel** | 角の先端を斜めに切り落とす |
| **Round** | 角を丸める |
| **Miter** | 辺を延ばして角を尖らせる |

同じ多角形でも、輪郭線を太くすると角の処理の違いが分かりやすくなります。

### Cap Style / Position / Length：輪郭に切れ目を作る

Solidをオフにすると、輪郭を途中で終わらせるための設定が使えます。

- **Length**：1.0では閉じた輪郭です。1.0より小さくすると、輪郭の一部が描かれず、切れ目ができます。
- **Position**：切れ目を置く位置（輪郭の開始位置）を移動します。
- **Cap Style**：線の端の形を**Flat / Rounded / Squared**から選びます。Flatは平らな端、Roundedは半円状、Squaredは線の太さの半分ほど先へ張り出す四角い端です。

Cap Styleによる端の違いは、**Lengthを1.0未満にして線の端が見える状態**で確認できます。Lengthを時間とともに変化させると、多角形の輪郭が順に描かれていくようなアニメーションを構成できます。

### X / Y Offset、Width / Height、Angle：位置と大きさ

- **X / Y Offset**：フレーム内で図形を移動します。21.1 Manualでは、X Offset 0.0を中央、0.5を中心がフレーム右端に来る例として説明しています。座標はフレーム幅を基準に正規化されています。
- **Width / Height**：多角形の横方向・縦方向の大きさを調整します。値を変えて縦長・横長にしたときの形を確認できます。
- **Angle**：図形の中心を軸に回転させます。

### Styleタブ：Color / Allow Combining

**Color**では塗りまたは輪郭の色を設定します。カラースウォッチやスポイトに加え、RGBAの各チャンネルやAlpha値を調整できます。

**Allow Combining**は、後段で多角形を複製して**コピー同士が重なった場所のAlpha値**をどう扱うかを決めます。

- **オン**：重なっても元のShapeで指定したAlpha値を保ちます。
- **オフ**：重なった部分のAlpha値が累積し、ほかの部分より濃くなることがあります。

たとえばAlpha 0.5の多角形をsGridで重ねる場合、Allow Combiningのオン・オフで重なった部分の濃さが変わります。これは多角形の辺の数や重ね順を変更する設定ではありません。

## 主な用途

- **図形ロゴ・バッジ**：円ではなく直線の辺を持つマークを作り、色や角の形を整える。
- **反復模様**：同じ多角形をsGridで行・列に並べ、幾何学的な背景を作る。
- **段階的な反復**：sDuplicateでコピーをずらしたり回したりし、連続する図形を作る。
- **輪郭アニメーション**：SolidをオフにしてLengthを変え、図形の外周を描いていく演出を作る。

## 最小構成

    sNGon → sRender → Viewer

sNGonを追加し、まずSolidをオンにしてStyleタブで色を指定します。次にWidth / HeightとAngleを変え、Viewerで位置と形を確認します。輪郭だけを見たい場合はSolidをオフにします。

この接続と主要Controlは21.1 Manualで説明されています。以下の制作例はManualの挙動から組み立てたもので、Resolve 21.1実機での完成結果は未確認です。

## 運用例：多角形の反復背景

1. sNGonで小さな多角形を作り、Solidをオンにして色を決めます。
2. 出力を[sGrid](./sgrid)へ接続し、横・縦の行列へ並べます。
3. sRenderへ接続して2D Imageに変換し、Viewerで全体を確認します。
4. 多角形が重なる配置ではAllow Combiningを切り替え、重なった部分のAlphaの変化を比べます。
5. 行列ではなく、コピーするたびに位置や大きさを変えたい場合は[sDuplicate](./sduplicate)に置き換えます。

    sNGon → sGrid → sRender → 2D Image

最初にsNGonの大きさを小さくしてからsGridの行・列数や間隔を増やすと、図形そのものの大きさと並べ方を別々に調整できます。

## 挙動と注意点

- **sNGonはShape Generator**です。入力分類を「shape」とするだけでは誤解を招きますが、21.1 Manualは外部入力なしと明記しています。
- **sRenderの前後を区別**します。sNGon → sGrid / sDuplicateの区間はShapeデータ、sRenderの後ろは通常の2D Imageです。
- **辺数のInspector項目名は未確定**です。21.1 Manualの該当説明には三角形・五角形・八角形を作れることが記載されていますが、辺の数を切り替える個別Control名は本文に明示されていません。実機で確認するまでは名前・既定値・範囲を推測しません。
- **Width / HeightのManual表現に注意**します。sNGonの項目でありながら「ellipse」と書かれた箇所があるため、ここでは多角形の横・縦方向の寸法設定として説明しています。
- **別の形を作りたい場合**は、円や楕円なら[sEllipse](./s-ellipse)、星形なら[sStar](./sstar)、長方形なら[sRectangle](./srectangle)を使い分けます。

## 関連する考え方・構成

- [シェイプ（Shape）](../../learn/02-data/shape) — 画像になる前の図形データ。
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates) — X / Y Offsetの読み方。
- [sGrid](./sgrid) — 多角形を横と縦に規則正しく並べる。
- [sDuplicate](./sduplicate) — コピーごとに位置・大きさ・回転を変える。
- [sRender](./s-render) — 多角形を2D Imageに変換する。

## バージョンと検証状況

**確認済み：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2747–2750**。外部入力なし、Shape出力、sDuplicate / sGrid / sRenderへの接続、Solid、Border Width / Style、Cap Style、Position / Length、X / Y Offset、Width / Height、Angle、Style、Color、Allow Combiningを確認しました。公式資料は[Blackmagic Designのサポートページ](https://www.blackmagicdesign.com/support)から参照できます。

**未確認：** 辺数を変更する正確なInspector項目、Resolve 21.1実機での表示・描画・処理性能、内部REGID、Free / Studioの差。実機未検証部分が残るため、ページ全体の状態は **verification: partial** とします。
