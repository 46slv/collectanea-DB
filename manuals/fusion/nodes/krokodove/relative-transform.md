---
title: Relative Transform（Krokodove）
description: 第2入力を使う画像変形と、実際の画素に対して基準点を指定する考え方を、接続・制作例・標準Transformとの違いから説明。
doc_type: node
term_id: relative-transform
term_short: 第2入力を利用して画像の位置・回転・大きさに関係する変形を行い、画素のある位置に対して変形の基準点を指定できるKrokodoveツール。
verification: partial
aliases: [Relative Transform]
concepts: [image-data, transform]
nodes: [Relative Transform]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-20'
---

# Relative Transform（Krokodove）

**Relative Transformは、第2入力を利用し、画像に位置・回転・スケールに関係する変形を加えるKrokodoveのツール**です。DaVinci Resolve 21.1 Reference Manualでは「Image Warp Tools」に分類されています。もうひとつの特徴は、変形の基準点（Pivot）を入力画像から検出し、実際に描かれた画素に対して相対的に指定できることです。

一般的なTransformでも画像は移動・回転・拡大縮小できます。Relative Transformを調べる際は、**第2入力が変形に参加すること**と、**画像全体の枠ではなく、画素のある位置を手掛かりに基準点を考えられること**に注目すると違いが分かりやすくなります。

ただし21.1 Manualの個別解説は短く、第2入力の正式な端子名やデータ型、Inspectorの項目名、基準点の検出方法までは示していません。このページでは確認済みの特徴と、試すための制作案を区別します。

## 「画素を基準にする」とは

例えば、1920×1080の透明な画像の左端近くに、小さなロゴだけが描かれている場面を考えます。**画像の中心**は画面の中央ですが、**見えているロゴの位置**は左側です。この2つは同じではありません。

Pivotは、画像を回したり大きさを変えたりするときの基準になる位置です。机の上で紙を回す場合も、紙の真ん中を押さえるのか端を押さえるのかで、動く軌跡が変わります。画像でも、どこを基準にするかによって、回転や拡大縮小をしたときの見え方が変わります。

21.1 Manualは、Relative TransformのPivotが**入力画像から検出され、実際の画素データに対して相対的に設定できる**と説明しています。透明な余白を含む画面全体と、実際に描かれた部分を区別して考えたい場面で意味のある特徴です。

ただし、次のような細部はManualだけでは確定できません。

- 画素のある範囲の中心、重心、端など、何を検出位置としているか。
- 透明度が低い画素や、見えないRGB値を持つ画素をどう扱うか。
- アニメーションで絵の範囲が変わったとき、基準点が毎フレームどう更新されるか。
- Pivot Xの数値を変えたときの位置変化は下の実機例で確認しました。座標系の意味や他の範囲は未確認です。

したがって「透明部分を自動で切り詰める」「ロゴの重心を正確に取る」など、資料にない動作までは断定しません。PivotとCenterの基本的な違いは[Center・Pivot・Size・Angle](../../learn/03-space/center-pivot-size-angle)も参照してください。

## 入力と出力

| 要素 | 役割 | 確認の範囲 |
| --- | --- | --- |
| 主な入力 | 変形したい2D <Term id="image">Image</Term> | ManualのImage Warp Tools分類と既存カタログに基づくデータ種別 |
| 第2入力 | 画像のwarp / distortionに関わる追加の入力 | 21.1 Manualに存在が明記されている |
| 処理 | 位置・回転・スケールに関係する変形。画像から検出したPivotを相対的に設定できる | Manualで明記された役割 |
| 出力 | 変形後の2D Image | 画像変形ツールとしての出力分類 |
| 未確認 | 第2入力のデータ型・ポート名・色、その他の入力端子、制御の適用順 | Manualの短い説明からは決められない |

ここでいうImageは、写真や動画に限りません。Text+で描画した文字、ロゴ、格子模様なども、画像として合成された後は画素の集合です。輪郭を編集できる[Shapeデータ](../../learn/02-data/shape)とは異なります。

Frontmatterの inputs: [image] / outputs: [image] は**主なデータ領域の分類**です。端子がそれぞれ1本しかない、または第2入力も必ずImage型であるという意味ではありません。第2入力へ何をつなげられるかは、実際のノードに表示されるポートと接続結果で確認してください。

## 主な用途

### 透明な余白を持つロゴや文字を変形する

透明な大きい画布の一部にだけ絵がある場合、画布の中央を基準に回すことと、描かれた部分に近い位置を基準に回すことでは構図が変わります。Relative Transformの画素基準のPivotが、その差を扱う候補になります。

例えば、画面の左下に置いた小さなタイトルを回転させる場合です。文字を画面中央の周囲で大きく動かしたいのか、文字に近い場所で傾けたいのかを分けて考えます。ただしPivotの検出・指定結果はViewerで確かめる必要があります。

### 別の入力も使う変形を試す

第2入力を使うことは、21.1 Manualに記載されたRelative Transformの特徴です。単独の画像を変形するだけでなく、**追加で入るデータを使った変形**を検討するときの候補になります。

一方、第2入力が参照画像なのか、別の種類のデータなのか、そこからどの情報を使うのかは未確認です。「第2入力の動きを自動追跡する」「別画像のピクセル位置をそのまま変形量にする」といった具体的な機能を、この説明から推測してはいけません。

### 通常のTransformと比較して選ぶ

位置・回転・拡大縮小を調整するだけなら、標準の[Transform](../transform/transform)を先に試す方法があります。Relative Transformを選ぶ理由は、追加の入力と、画素データに対するPivotの指定が必要かどうかです。Krokodove版の内部処理が標準Transformと同じとは限りません。

<!-- capture:S294 -->

## 実機例：回転中のPivot Xを変える

`Text+` を `Relative Transform` のImageに接続し、Axis Angleを30に設定します。同じ文字とframeでPivot Xを0から0.5に変えると、回転した文字の位置が変わって見えます。

左は入力、右は出力で、画面上の印は編集ガイドです。撮影後はPivot Xを0に戻しました。この例では自動検出の仕組みや第2入力の動作は確認していません。[接続と設定の記録](/img/fusion/captures/S294/readback.json)に条件を記載しています。

[![Text+をRelative TransformとMediaOutに接続した構成](/img/fusion/captures/S294/graph.png)](/img/fusion/captures/S294/graph.png)

文字画像をRelative Transformに入力します。

[![Axis Angle 30、Pivot X 0の設定](/img/fusion/captures/S294/controls.png)](/img/fusion/captures/S294/controls.png)

Axis Angleを30に固定しPivot Xを比較します。

[![Pivot X 0の入力と回転出力](/img/fusion/captures/S294/pivot-zero.png)](/img/fusion/captures/S294/pivot-zero.png)

Pivot X 0での入力と出力です。

[![Pivot X 0.5の入力と回転出力](/img/fusion/captures/S294/pivot-half.png)](/img/fusion/captures/S294/pivot-half.png)

Pivot X 0.5では右の文字位置が変わります。[撮影時のInspector](/img/fusion/captures/S294/half-source.png)で0.5を確認できます。

[再現用Graph](/img/fusion/captures/S294/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S294/capture.json)

<!-- /capture:S294 -->

## 制作例：透明ロゴを使ってPivotの違いを観察する

以下は**役割を理解するためのテスト構成案**です。公式Manualに掲載された完成グラフや、21.1実機で検証済みの操作手順ではありません。

    Background（透明の画布） → Merge A（Background） → Relative Transform → Merge B（Foreground） → MediaOut
    Text+（テスト文字） ───→ Merge A（Foreground）
    MediaIn（背景映像） ──────────────────────────────→ Merge B（Background）

第2入力については、使用するデータ型とポートの名称を実機で確認した後、必要な素材を別系統から接続します。上の配線図は**主な画像経路のみ**を表しています。下の実機例では第2入力を接続せず、画像の回転を表示しました。他の条件は未確認です。

1. Backgroundで透明な画布を用意し、Text+で「TEST」のような短い文字を描きます。Merge Aで合成し、文字以外の部分が透明な1枚のImageにします。
2. Text+を画面の中央から大きく外して配置します。背景の画像サイズを変えずに、見える画素の位置だけが偏っている状態を作るのが目的です。
3. Merge Aの結果をRelative Transformへ渡し、変形前と変形後をそれぞれViewerに表示します。標準Transformを別系統に置いて比較しても構いません。
4. InspectorとViewerで、位置・回転・スケールに関わる制御やPivotに相当する操作を確認します。実際に表示された名称を使い、少しずつ値を動かして、ロゴがどの位置を中心に変化するか観察します。
5. 同じ大きさの画布で、文字を中央に置いた版も作り、同じ操作を比較します。絵の位置だけを変えたときにPivotの挙動が変わるか、変わらないかを確認します。結果を見ずに自動中心合わせがあると判断しません。
6. 第2入力に対応するデータ型・ポートを実機で特定できた場合だけ、互換する別素材を接続します。入力なしの場合との違いを観察し、変化が位置・回転・スケールのどれに現れるかを記録します。
7. 最後にMerge Bで背景映像と合成します。透明部分、輪郭、画面外に出る箇所を確認します。ロゴの回転が正しくても、合成境界で不自然さが出る場合があります。

**確認を一度に増やさないこと**がポイントです。最初から回転・拡大縮小・第2入力をすべて変えると、何が結果に効いたのか分かりにくくなります。まず同じフレーム・同じ素材で、ひとつずつ比較します。

## 近いノードとの使い分け

| ノード | 確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Relative Transform** | 第2入力を使う位置・回転・スケール系の変形。画素データを基準にPivotを扱う | 追加の入力や画素の位置に対する基準点を検討したい |
| [Transform](../transform/transform) | 通常の位置・回転・拡大縮小などの変形 | まず一般的な2D配置を行いたい |
| [Warped Transform](./warped-transform) | 伸ばす・押し縮める・回す操作をまとめて扱う | 画像そのものを変形する操作を試したい |
| [Directional Scale](./directional-scale) | 指定した方向に画像を伸縮・変形する | どの方向に伸ばすかを重視したい |
| [Positioner](./positioner) | SourceとDestinationの四隅を対応させるコーナーピン | 看板や画面など四辺形に素材を合わせたい |
| [Bend](./bend) | 画像を放射状に曲げるwarp | 画像全体に曲がりを加えたい |

「Relative」は、標準Transformの座標へ必ず自動加算される、親子関係を自動認識する、あるいは別素材を自動追従する、という意味だとは確認できていません。ツール名から機能を補わず、Manualに明記された第2入力とPivotの特徴を基準に選びます。

## 注意点と未確認項目

- **第2入力**：実機例では未接続で回転結果を表示しました。正式な名称・データ型・接続先の意味や、追加のMask・Region入力は未確認です。
- **Inspector**：実機例ではAxis Angle 30とPivot X 0・0.5を確認しました。他の項目の働き、既定値、値域、座標系、適用順と補間方式は未確認です。
- **Pivotの検出**：画素範囲をどう判断するか、Alphaや透明余白の扱い、時刻ごとの再計算、基準点の具体的な数式は未確認です。
- **画像品質**：解像度、Domain of Definition、画面端でのサンプリング、Alphaやpremultiplicationへの影響は実機で確認していません。
- **製品差**：DaVinci Resolve Free / Studio / Fusion Studioでの個別の可用性、内部REGID、表示上のカテゴリーやアイコンは未確認です。
- **動きを伴う合成**：このツールに自動トラッキングや平面追跡があるとは確認できません。被写体の動きを解析する用途なら、[Planar Tracker](../tracking/planar-tracker)など専用の手段を別に検討します。

## バージョン・出典

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、**Chapter 105「Krokodove Nodes」p.2436、Image Warp Tools / Relative Transform**。第2入力、position / rotation / scaleに関係する変形、入力画像からのPivot検出と画素データに対する相対指定を確認しました。

比較対象：同ManualのTransform Nodes（Chapter 120）と、本サイトの[Warped Transform](./warped-transform)、[Positioner](./positioner)。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/jp/support/)から現行資料を確認できます。

透明ロゴの例と段階的な確認手順は、本記事で提案した実験です。実機例は1つの文字画像と2つのPivot X値に限ります。第2入力のデータ型、他の設定、Pivotの検出規則とEdition差は未確認のため、verification: partialを維持しています。[Krokodoveの概要](./)と[Imageの基礎](../../learn/02-data/image)も併読してください。