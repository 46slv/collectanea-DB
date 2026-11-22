---
title: Segment Transform（Krokodove）
description: 画像を正方形の区画に分け、それぞれに角度・拡大縮小の変形を加えるSegment Transformの仕組み、使い方、関連ノードとの違い。
doc_type: node
term_id: segment-transform
term_short: 画像を正方形の区画に分け、区画ごとに角度や大きさを変えて見せるKrokodoveの画像変形ツール。
verification: partial
aliases: [Segment Transform]
concepts: [image-data, transform]
nodes: [Segment Transform]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-20'
---

# Segment Transform（Krokodove）

**Segment Transformは、画像を正方形の小さな区画に分け、それぞれに角度とスケールの変形を加えるKrokodoveの画像変形ツール**です。DaVinci Resolve 21.1 Reference Manualでは「Image Warp Tools」に分類され、画面を正方形の区画に分割し、各区画へ角度・スケールの歪みを適用すると説明されています。

写真を一枚の板として傾けるのではなく、碁盤の目のように区切った部分ごとに向きや大きさが変わる、と考えると違いをつかみやすくなります。隣り合う区画で模様のつながり方が変われば、画面が細かなパーツに分かれて組み替わったような表現になります。

ただし、**区画がそれぞれ独立した画像レイヤーやShapeオブジェクトに変換される、という意味ではありません**。確認できるのは、2D画像に対する区画単位の変形という役割です。

<!-- capture:S348 -->

## 実機例：文字を区画ごとに回転する

`Text+`の文字をSegment Transformへ接続し、Segment Size Xを0.1、Angleを45に設定しました。同じフレームの左には元の文字、右には区画ごとに傾いた文字が表示されています。Scaleやマスク、アニメーションは確認していません。[接続と設定の記録](/img/fusion/captures/S348/readback.json)に条件を記載しています。

[![Text+からSegment Transformを経てMediaOutへ接続したノード](/img/fusion/captures/S348/graph.png)](/img/fusion/captures/S348/graph.png)

図中のLabelはText+、MapはSegment Transformです。文字画像をMapに通しています。

[![Segment Size X 0.1とAngle 45のInspector](/img/fusion/captures/S348/controls.png)](/img/fusion/captures/S348/controls.png)

Segment Size X 0.1、Angle 45です。

[![元の文字と区画ごとに傾いた文字の比較](/img/fusion/captures/S348/comparison.png)](/img/fusion/captures/S348/comparison.png)

同じフレームで入力と出力を表示しています。

[保存したGraph](/img/fusion/captures/S348/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S348/capture.json)

<!-- /capture:S348 -->

## どのような変形か

### 正方形の区画に分ける

たとえば、写真に格子を重ねて小さな正方形に区切るところを想像してください。Segment Transformは、そのように**画面を複数の領域として扱う**タイプの画像変形です。

21.1 Manualの一覧には、区画の大きさの設定や区画数、格子の原点について説明がありません。上の実機例ではSegment Size Xを0.1に設定しました。例として「10×10にする」といった設定値を指定できるとは限りません。

### 各区画に角度・スケールの変形を加える

**角度**は、区画内の見た目の向きに関わる変形です。**スケール**は、区画内の見た目の大きさに関わる変形です。たとえば、直線が多い画像なら一部の線の向きが変わり、円や文字があれば一部分が大きく、または小さく見えるような結果を想像できます。

これらは公式の機能説明を理解するための例です。全区画に同じ角度が付くのか、位置ごとに異なる値を与えられるのか、中心や補間方式を指定できるのかは、**実際のInspectorと出力で確認する必要があります**。上の実機例ではAngleとSegment Size Xを確認しています。

## 入力と出力

| 段階 | データ・処理 | 説明 |
| --- | --- | --- |
| 入力 | 2D <Term id="image">Image</Term> | 写真・動画・画像化された文字・図形など、変形したい画像を受け取る分類。 |
| 処理 | Segment Transform | 画面を正方形の区画へ分け、各区画に角度・スケールの歪みを加える。 |
| 出力 | 2D Image | 区画単位の変形を加えた結果を、別の画像処理や合成へ渡す分類。 |

Imageは色や透明度を持つ画素の集まりです。Segment Transformはその**画素の見え方**を加工するツールで、区画を編集可能な個別の図形として生成するとは説明されていません。輪郭やパスを保持して編集する<Term id="shape-data">Shape</Term>ノードとはデータの扱いが異なります。

この表とページ先頭の `inputs: [image]`、`outputs: [image]` はデータ分類を示しています。**正式な端子名・端子数、Maskなどの追加入力、Alphaの演算、画像の解像度の変化**は21.1 Manualの当該一覧からは分かりません。

## 使いどころ

### モザイク状に変形するモーショングラフィックス

格子・ストライプ・市松模様など、線のつながりがはっきりした画像で試すと、区画ごとの変形を観察しやすくなります。規則的だった線の角度や間隔が変われば、幾何学的な背景表現に利用できます。

ここでいう「モザイク」は**小さな領域が集まった見た目**の意味で、画素を粗くするピクセル化や、内容を隠すモザイク処理を指しません。

### 一枚の写真を分割したように崩す

建物の窓、タイル、看板など、規則的な要素が写る素材は区画ごとの変化が目立ちやすい候補です。元の写真と出力を比較し、どこに区切りが現れ、画面のどの部分が読み取れるか確認します。

### タイトルを保ったまま背景を加工する

背景にSegment Transformを適用してからText+を合成すれば、文字を加工対象から外せます。文字も区画単位で変形させたい場合は、Text+を先に背景へ合成する構成を比較します。

## 制作例：格子背景を区画ごとに変形する

次は**接続と確認のための作例**です。Blackmagic DesignがInspector値まで指定したチュートリアルではありません。

~~~text
MediaIn（格子画像） → Segment Transform → Merge（Background） → MediaOut
Text+（タイトル） ─────────────────────────→ Merge（Foreground）
~~~

1. 正方形の格子や縦横のストライプがはっきり見える画像を用意し、MediaInからSegment Transformへつなぎます。写真より単純な線画の方が、最初は変化を見分けやすくなります。
2. Segment Transformの出力をViewerに表示し、元画像と切り替えて比較します。**画面全体が一緒に回っているのか、正方形の区画ごとに変化しているのか**をまず確認します。
3. Inspectorに実際に表示される設定だけを操作し、区画の大きさ、線の向き、模様の連続性がどのように変わるか見ます。ここでは未確認のパラメータ名や数値を指定しません。
4. 出力をMergeのBackgroundへつなぎ、Text+をForegroundへ接続します。こうするとタイトルはSegment Transformを通らず、文字の形を保てます。
5. 動画では区画の境目がちらつかないか、細い線や文字が読みづらくならないかを再生して確認します。透明画像を使う場合は背景へ合成した状態でも確認してください。

**よくある混同：** Segment Transformで「分割する」とは、画像の中で区画を扱って変形するという意味です。区画ごとの独立ノードが生成されたり、後から一つずつ手で動かせるレイヤーが作られたりすることを、公式Manualは説明していません。

## 関連ノードとの違い

| ノード | 21.1 Manualに書かれた役割 | 選ぶときの視点 |
| --- | --- | --- |
| **Segment Transform** | 正方形の区画に分け、各区画へ角度・スケールの歪み | 区画の内部の向きや大きさを変えたい。 |
| [Shuffle](./shuffle) | 分割された画面の区画を画像内で再配置 | 区画を**どこに置くか**という変化が中心。 |
| [Shear](./shear) | 角度を伴うシアー変形。強さを決める追加入力あり | 画像を斜めにずらしたような歪みを比べたい。 |
| [Warped Transform](./warped-transform) | 画像を伸ばす・押し縮める・回すための簡単な操作 | 区画単位という条件に限らず画像を変形したい。 |
| [Duplicate](./duplicate) | 指定したパターン・形状に沿って入力画像を複製 | 一つの画像の**コピーを増やす**ことが目的。 |

特にShuffleとの違いは、**区画内に加える変形**と**区画そのものを再配置する操作**です。ただし、両ツールのInspectorの設定がどこまで重なるか、組み合わせた際の境界処理が同じかは確認できていません。

## 注意点・確認できていないこと

- **分割位置と区画数：** Segment Size X 0.1を一例として確認しました。区画数、原点、端数の扱い、区画間の間隔は未確認です。
- **角度とスケール：** 変形の基準点、制御単位、ランダム化の可否、既定値・設定範囲・補間方式は未確認です。区画ごとに個別の数値を入力できるとも断定しません。
- **画像の境界：** 変形により区画の間に隙間や重なりが生じるか、そこで画素をどう補うか、Alphaやpremultiplyをどう扱うかは出典から分かりません。Viewerで確認します。
- **アニメーション：** 動画を入力できる分類であることと、各区画に専用の時間変化やランダムな動きを設定できることは別です。後者の機能は未確認です。
- **Version / Edition：** 21.1 Manualへの掲載は確認済みですが、Resolve Free・Resolve Studio・Fusion Studioの提供差や今回の接続以外の端子は未検証です。

## バージョンと出典

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2437「Image Warp Tools / Segment Transform」**。同ページのShuffle・Shear・Warped Transform、およびp.2436のDuplicateの説明と比較しています。

**公式資料で確認したこと**は、正方形の区画への分割、区画ごとの角度・スケール変形、Image Warp Toolsという分類です。格子背景やタイトルの制作例、モザイク状の見え方は機能から考えた実践案であり、上記の実機例とは別の、Inspector値を指定していない提案です。入出力のImage分類には既存COLLECTANEAカタログも併用しています。未確認部分が残るため、`verification: partial`を維持しています。

[Krokodoveノード一覧](./)、[Imageデータの説明](../../learn/02-data/image)、[Shapeデータの説明](../../learn/02-data/shape)も参照してください。
