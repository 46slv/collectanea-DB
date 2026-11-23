---
title: sRectangleのLengthで角丸の枠を描き進める
description: sRectangleの輪郭をLengthで開閉し、角丸の枠が伸びて完成するアニメーションを作る。
doc_type: recipe
verification: partial
aliases: [角丸枠アニメーション, 四角枠の描画, rectangle outline write-on, sRectangle Length]
concepts: [shape-domain, data-domain]
patterns: [defer-domain-conversion]
nodes: [sRectangle, sRender]
tasks: [shape, outline, animation, graphic]
prerequisites: [data-domain]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-23"
---

# sRectangleのLengthで角丸の枠を描き進める

## 作るもの

角の丸い長方形の輪郭が、途中で切れた状態から少しずつ伸び、最後に閉じるアニメーションです。完成した枠は透過した中心を持ち、テロップや注目箇所を囲む図形として合成できます。

形全体を拡大するのではなく、**sRectangleのLengthを0.0付近から1.0へ変える**ことで、輪郭の表示範囲を動かします。長方形の角丸形状はCorner Radiusで決めます。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1のFusionページ。新しいFusion Compositionなど、Shapeを扱える領域。
- **sRectangle**：長方形、角丸、輪郭およびLengthを設定します。
- **sRender**：Shapeを2D Imageへ変換して表示します。
- **MediaOut**：タイムラインへ送る場合のみ接続します。

ここでは1920×1080のCompositionを例に、フレーム0から48までを比較範囲とします。Width/HeightやBorder Widthなどの数値は操作を始めるための**設定例**です。実機で測定・再現した結果ではありません。

## 接続

~~~text
sRectangle（Solid OFF / Lengthをアニメーション）
           │ Shape
           ▼
        sRender
           │ 2D Image
           ▼
    MediaOut（必要な場合）
~~~

sRectangleは外部入力のないShape生成ノードです。sRenderの出力をViewerへ表示すると、画像としての輪郭を確認できます。

## 手順

### 1. 角丸の枠線を作る

1. sRectangleを追加し、そのShape出力をsRenderへ接続します。
2. Inspectorの**Controls → Solid**をオフにします。中心を色で塗るのではなく、輪郭だけにするためです。
3. **Width 0.50 / Height 0.18**を開始値として設定します。横長の長方形になります。
4. **Corner Radius 0.50**を開始値として角を丸めます。Corner Radiusは枠全体の角丸形状を変えます。
5. **Border Width 0.02**を目安に枠線の太さを調整します。**Border Style**はまずRoundにします。これは輪郭が角でつながる形の設定で、Corner Radiusとは別です。
6. **X Offset / Y Offset 0.0、Angle 0**を開始値として中央へ置きます。StyleタブのColorを白、Alphaを1.0に設定します。
7. **Length 1.0**で一度sRenderをViewerに表示し、閉じた角丸枠の完成形を確認します。

Solidをオフにすると、輪郭用の**Length / Position / Cap style**が使える構成になります。Width/HeightやBorder Widthの数字と画面上のピクセル寸法との関係は、このレシピでは測定していません。

### 2. Lengthに2つのキーフレームを置く

1. 再生ヘッドを**フレーム0**へ移し、sRectangleの**Length**を**0.0**に設定して、その項目のキーフレームを有効にします。
2. 再生ヘッドを**フレーム48**へ移動し、同じLengthを**1.0**に変更してキーフレームを記録します。
3. 中間の**フレーム24**でsRenderの出力を確認します。輪郭の一部だけが現れる想定です。
4. フレーム48で四角い枠の輪郭が閉じる想定で確認します。動きの速度を変えたいときは、キーフレームの間隔・補間を編集します。

21.1公式Manualは、Lengthが1.0なら閉じた輪郭、1.0未満なら輪郭に隙間ができ、キーフレームによる描画アニメーションが可能と説明しています。**0.0→1.0の具体的な48フレーム設定**は、本レシピが提案する再現用の例です。

### 3. 描き始めと線端を変えて比較する

1. **Position**を変えると、輪郭の隙間や描き始めに相当する位置を調整できます。Lengthのキーフレームは残したまま比較します。
2. 中間フレームなど**Lengthが1.0未満の状態**で、**Cap style**のFlat / Rounded / Squaredを切り替えます。開いた線の端の形を比較するためです。
3. **Border Style**もBevel / Round / Miterで比較できます。これは線の角の接合方式で、Cap styleの「端」とは別です。
4. 比較後に設定を元へ戻し、sRenderからMediaOutへつなぐ必要があれば接続します。

## 期待される結果

| 条件 | 期待する表示 |
| --- | --- |
| Solid OFF / Length 1.0 | 中心が透明で、輪郭が閉じた角丸枠 |
| Solid OFF / Length 0.0 | 輪郭が表示されない、またはごく短い開始状態 |
| Solid OFF / Lengthが0と1の間 | 一部分だけが描かれ、残りに隙間がある輪郭 |
| Position変更 | 隙間・開始位置が輪郭に沿って移る |
| Cap style変更 | 閉じていない輪郭の線端の形が変わる |

これは公式Manualの制御の意味から導いた**期待結果**です。設定値ごとの実描画、補間時の見え方、開始フレームの端点、透明画素値は今回の実機検証では確認していません。

## この構成で動く理由

sRectangleはShapeデータとして長方形を生成します。**Solid**は塗り／輪郭を切り替え、**Corner Radius**は角丸の幾何形状、**Border Style**は枠線の角での接続、**Length**は表示する輪郭の割合をそれぞれ扱います。値を時間変化させたShapeは、sRenderで2D Imageに変換して通常の合成へ渡します。

ShapeとImageの違いは[Shapeの基本](../../learn/02-data/shape)と[必要な場所でImageへ変換する考え方](../../patterns/data-domain/defer-domain-conversion)を参照してください。

## 別の方法と使い分け

- **静止画の角丸背景を作る**：Solidをオンにし、Corner Radiusで角を付けます。これは塗りつぶされた帯で、この枠線アニメーションとは別の表現です。
- **角の丸さを変える**：Corner Radiusを0.0にすると角のある長方形になり、値を上げるほど角丸が強くなります。Border StyleをRoundにしただけでは、Corner Radiusと同じ幾何形状変更にはなりません。
- **円弧を描きたい**：円の輪郭を目的にするなら[sEllipseの輪郭Recipe](../shapes/outline-circle-with-sellipse)を使います。
- **自由曲線を描きたい**：点やハンドルで曲線を決めたい場合は[sPolygonの開いた曲線Recipe](../shapes/draw-open-bezier-curve-with-spolygon)が適しています。

## うまくいかないとき

- **内側まで塗られる**：Solidがオンになっていないか確認します。Alphaを0にして隠すと輪郭も消えるため、輪郭が欲しいときはSolidをオフにします。
- **最初から枠全体が見える**：再生ヘッドがフレーム0か、Lengthのキーフレームが正しい項目へ付いているか確認します。
- **枠の一部が欠けたままになる**：最後のLengthが1.0に達しているか確認します。Positionだけを変えてもLengthは増えません。
- **角が丸くならない**：Corner Radiusを確認します。Border Styleは角の接続であり、図形の角丸量そのものはCorner Radiusで調整します。
- **Cap styleを変えても差がない**：Lengthが1.0で閉じた輪郭を見ていないか確認します。線端の差は隙間がある状態で比較します。
- **輪郭が見えない**：Border Width、StyleのAlpha、sRenderのViewer表示を確認します。sRectangleを通常のMergeへ直接つなぐ構成ではありません。

## 関連資料

- [sRectangleのNode Reference](../../nodes/shapes/srectangle)
- [sRenderのNode Reference](../../nodes/shapes/s-render)
- [Shapeを2D Imageへ変換する最小構成](../shapes/basic-shape-render)
- [Transformをキーフレームで動かす別の例](./animate-transform-center)
- [Shapeの概念](../../learn/02-data/shape)

## 出典と検証範囲

**公式仕様**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 117「Shape Nodes」pp.2756–2760。sRectangleの外部入力なし、Solid / Border Width / Border Style / Cap style / Position / Length / X/Y Offset / Width / Height / Corner Radius / Angle / Style、sRenderのShape→Image変換を、ChatGPT Libraryに保存されている公式PDFの当該ページで照合しました。[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

**既存の実機資料**：[sRectangleのNode Reference](../../nodes/shapes/srectangle)にある21.1のS19 captureは、Solid ONの長方形についてCorner Radius 0 / 0.65を比較したものです。**Solid OFF・Lengthのアニメーションの成功証拠には使いません。**

**未検証**：本記事の0→48フレーム操作、キーフレーム補間、輪郭が画面に現れる順序、具体的な数値での描画、Position/Cap/Border Styleの実際の比較、透明画素、Free/Studioや他OS/GPU差、ブラウザ・production build・公開表示はNOT_RUNです。記事の`verification: partial`は維持します。
