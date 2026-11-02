---
title: Warped Transform
description: Krokodove Warped Transformで画像を伸ばす・押し縮める・回す操作を、入出力、制作例、標準Transformとの違いから説明。
doc_type: node
term_id: warped-transform
term_short: 画像を伸ばす・押し縮める・回す変形をまとめて扱うKrokodoveの画像ツール。
verification: partial
aliases: [Warped Transform]
concepts: [image-data]
nodes: [Warped Transform]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [warp-image]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Warped Transform

**Warped Transformは、画像を引き伸ばす・押し縮める・回す変形を扱うKrokodoveのツール**です。DaVinci Resolve 21.1 Reference Manualでは「Image Warp Tools」に分類され、これらの操作を簡単に扱えるものと紹介されています。

例えば、正方形が並ぶ背景を縦長・横長に見せたり、文字を重ねる前のグラフィックに向きや形の変化を付けたりしたいときに、候補になります。ただし、公式マニュアルの説明は短く、個々の操作がどのような計算で組み合わされるかまでは記されていません。

## 画像を「伸ばす・押し縮める・回す」とは

格子模様の画像を思い浮かべてください。格子を引き伸ばすと、正方形だったマス目は細長く見えます。押し縮めると、線の間隔が狭くなったように見えます。向きを回すと、縦横に走っていた線の方向が変わります。このように、**画像に含まれる線や模様の見え方を変える**のが、このツールを理解するための出発点です。

ここで変形するのは、線や文字を構成する**画素の見え方**です。例えば画像に描かれた「A」を変形しても、文字のフォント情報やベクターの輪郭を直接編集するわけではありません。

「伸ばす」「押し縮める」「回す」は21.1 Manualで確認できる機能の説明ですが、**画像全体が均一に変形するのか、部分ごとに変形量が変わるのか、どの点を中心に回すのか**は、その説明だけでは分かりません。見た目の比較には、まず格子や円を使うと判断しやすくなります。

<!-- capture:S244 -->

## 実機例：文字を広げて回転する

合成した `Text+` の文字を `Warped Transform` に渡し、Size Xを1.3、Size Yを1、Angleを15に設定しました。

この例では文字が横方向に広がり、回転して見えます。Viewerには操作用オーバーレイが表示されています。Warp Maskの動作やAlphaの数値は未検証です。[接続と設定の記録](/img/fusion/captures/S244/readback.json)に条件を記載しています。

[![文字画像をKrokodove Warped Transformへつなぐ構成](/img/fusion/captures/S244/graph.png)](/img/fusion/captures/S244/graph.png)

文字画像をWarped Transformへ渡します。

[![Warped TransformのInspector](/img/fusion/captures/S244/controls.png)](/img/fusion/captures/S244/controls.png)

Size Xを1.3、Angleを15に設定しています。

[![処理前の文字](/img/fusion/captures/S244/low.png)](/img/fusion/captures/S244/low.png)

処理前の文字です。

[![Warped Transformで広げて回転した文字](/img/fusion/captures/S244/high.png)](/img/fusion/captures/S244/high.png)

処理後は文字が広がり、回転して見えます。

[再現用Graph](/img/fusion/captures/S244/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S244/capture.json)

<!-- /capture:S244 -->

## 入力と出力

| 段階 | データ・役割 | 確認範囲 |
| --- | --- | --- |
| 入力 | **2D Image** | 21.1 ManualのImage Warp Tools分類と既存のノードカタログに基づくデータ分類 |
| 処理 | 画像の引き伸ばし・押し縮め・回転 | Manualで明記された役割 |
| 出力 | 変形後の**2D Image** | 画像加工ツールとしての出力分類 |
| 未確認 | 正式な端子名・本数、追加のMask・Map・Region入力 | Manualの短い一覧では確認できない |

Fusionの<Term id="image">Image</Term>とは、写真や映像だけでなく、描画済みの文字・図形を含む画素データです。輪郭そのものを保持して編集する<Term id="shape-data">Shape</Term>とは区別します。

このページのFrontmatterにある inputs / outputs は**扱うデータの分類**であり、実際のノードタイルに表示される端子の正式名称や数を示すものではありません。

## 主な用途

### 幾何学模様に伸縮感を加える

格子、ストライプ、円の反復模様などは、伸縮や向きの変化が見えやすい素材です。MVの抽象背景を作るとき、静止画像のまま使うより変形後の構図が合うか試せます。実際の変形中心や作用範囲はViewerで確認します。

### 素材の形を変えてから合成する

写真、イラスト、画像化されたロゴを別レイヤーとして変形し、その上から変更しない文字を重ねる構成に向いています。**変形の前に合成した要素は、原則として同じ画像の一部として処理対象になる**ため、文字を歪ませたくない場合は後段で合成します。

### 複数の画像変形を比較する

Warped Transformの結果を標準TransformやDirectional Scaleと見比べると、目的の表現にどのツールが必要か判断できます。名前が似ていても、Inspectorの構成や内部処理が一致するとは限りません。

## 制作例：格子背景だけを変形してタイトルを重ねる

以下は、**画像側の変形と文字の合成を分けるための構成例**です。公式のInspector値を指定する再現手順ではありません。

    MediaIn（格子画像） → Warped Transform → Merge（Background） → MediaOut
    Text+（タイトル） ────────────────────────────→ Merge（Foreground）

1. 同じ大きさの正方形が並ぶ格子画像を用意し、MediaInからWarped Transformに渡します。
2. 変形前と変形後をそれぞれViewerに表示します。縦横の線の傾き、間隔、四隅の形、画面外へ出る部分を比較します。
3. Inspectorで利用できる操作を**ひとつずつ**動かし、引き伸ばし・押し縮め・向きの変化を区別して観察します。ここでは未確認のパラメータ名や推奨値を指定しません。
4. 変形後の画像をMergeのBackgroundへ、Text+の出力をForegroundへ接続します。タイトルは背景を変形した後に重なるため、背景と同じ変形を受けません。
5. 動画素材で使う場合は再生しながら画面端や重なりを確認します。専用のアニメーション機構が備わっていることは、この構成例では前提にしていません。

比較する際は、**同じ素材・同じフレーム**を使い、変形量だけを変えると違いを見つけやすくなります。顔や複雑な写真を最初に使うと、画像のどこがどう変化したか把握しにくくなります。

## 近いノードとの違い

| ノード | 確認できる役割 | 選び分けの目安 |
| --- | --- | --- |
| **Warped Transform** | 伸ばす・押し縮める・回す操作を扱う | これらを使って画像の見え方を変えたい |
| **標準Transform** | 画像の移動・回転・拡大縮小、Aspect調整 | 通常の位置・向き・大きさの変更で足りる |
| [Directional Scale](./directional-scale) | 指定方向に画像を伸縮・変形する | 変形する方向を重視する |
| [Bend](./bend) | 放射状に画像を曲げる | 曲がりを伴う変形を試す |
| [Radial](./radial) | へこみ状の変形。追加warp mask入力を持つ | へこみ風の歪みや追加入力を使いたい |
| [Spherize](./spherize) | 指定した形の領域に虫眼鏡風の歪みを作る | 画像の一部にレンズ風の変化を付けたい |
| [Relative Transform](./relative-transform) | 第2入力を使い、位置・回転・スケールによる変形を行う | 別入力に基づく変形を検討したい |

標準TransformはDaVinci Resolve 21.1 Reference ManualのChapter 120で詳しく説明されています。一方、KrokodoveのWarped TransformはChapter 105に短い概要があるだけです。**標準Transformより高性能、または標準Transformと同じInspector項目を持つ**とは判断しないでください。

## 注意点・未確認の仕様

- **Inspector**：実機例ではSize X / YとAngleを確認しました。全項目の初期値・値域や変形方式の詳細は未確認です。
- **変形方式**：画面全体への均一な伸縮なのか、画素位置ごとに違う変形なのか、複数操作の適用順は未確認です。
- **画面端とAlpha**：フレーム外の画素の埋め方、透明部分、補間、premultiplicationへの具体的な影響は確認できていません。透過画像は後段のMerge結果でも確認します。
- **アニメーション**：Inspectorのどの項目にキーフレームを設定できるか、特殊な時間制御があるかは未確認です。
- **製品・Edition差**：実機でのREGIDは `KD_Transform` です。Resolve Free / Studio / Fusion Studio間の利用可否や正確な端子仕様は未確認です。

## バージョンと出典

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、**Chapter 105「Krokodove Nodes」p.2437**、Image Warp Toolsの「Warped Transform」。同章のDirectional Scale（p.2436）、Spherize（p.2437）、Relative Transform（p.2436）とも照合しました。

標準Transformとの比較には同Manualの**Chapter 120「Transform Nodes」pp.2879–2880**を使用しています。実機例以外の制作例と確認手順は記載された役割に基づく提案です。端子の詳細・補間・Edition差は未確認のため、verificationはpartialのままとしています。

[Krokodoveの全体像](./)と[Imageの基礎](../../learn/02-data/image)も参照してください。
