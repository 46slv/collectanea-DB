---
title: Directional Scale
description: Krokodove Directional Scaleの方向を指定した画像の伸縮・変形を、入出力、制作例、近いノードとの違いから説明。
doc_type: node
term_id: directional-scale
term_short: 指定した方向へ画像を伸ばしたり歪ませたりする、Krokodoveの2D画像変形ツール。
verification: partial
aliases: [Directional Scale]
concepts: [image-data]
nodes: [Directional Scale]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Directional Scale

**Directional Scaleは、指定した方向に沿って画像を伸ばしたり歪ませたりするKrokodoveの画像変形ツール**です。DaVinci Resolve 21.1 Reference Manualでは「Image Warp Tools」に分類され、「指定方向への画像の伸縮・変形」と説明されています。

例えば、平行な線や格子の入った画像を使い、特定方向への伸びを感じさせるモーショングラフィックスを作りたい場合の候補です。単に画像全体の表示サイズを変える操作とは目的を分けて考えると、ノードを選びやすくなります。

## 「方向を指定して伸ばす」とは

通常の拡大・縮小では、画像全体を大きくしたり小さくしたりします。横だけを広げれば、円は横長の楕円に見えます。

Directional Scaleも画像の形を変えますが、21.1 Manualが説明している特徴は**変形する方向を指定できること**です。画面内の直線、円、文字の輪郭などが、選んだ方向の伸びや歪みを受けたときの見え方を作るために使います。

ただし、Manualの説明は短く、変形が画像全域で均一なのか、場所によって変化するのか、どの位置を基準に伸ばすのかまでは分かりません。「片側だけが伸びる」「特定の角度パラメータがある」といった細かな挙動は、この資料からは確定できません。効果の形はViewerで確認します。

<!-- capture:S237 -->

## 実機例：文字を一方向に伸ばす

合成した `Text+` の文字を `Directional Scale` に渡し、Size Along Axisを1.5に設定しました。

この例では文字が横方向に伸びます。Viewerの操作用オーバーレイも画像に写っています。ほかの軸やAlphaの数値は未検証です。[接続と設定の記録](/img/fusion/captures/S237/readback.json)に条件を記載しています。

[![文字画像をKrokodove Directional Scaleへつなぐ構成](/img/fusion/captures/S237/graph.png)](/img/fusion/captures/S237/graph.png)

文字画像をDirectional Scaleへ渡します。

[![Directional ScaleのInspector](/img/fusion/captures/S237/controls.png)](/img/fusion/captures/S237/controls.png)

Size Along Axisを1.5に設定しています。

[![処理前の文字](/img/fusion/captures/S237/low.png)](/img/fusion/captures/S237/low.png)

処理前の文字です。

[![Directional Scaleで伸ばした文字](/img/fusion/captures/S237/high.png)](/img/fusion/captures/S237/high.png)

処理後は文字が横に伸びます。

[再現用Graph](/img/fusion/captures/S237/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S237/capture.json)

<!-- /capture:S237 -->

## 入力と出力

| 段階 | データ | 確認範囲 |
| --- | --- | --- |
| 入力 | **2D Image** | 21.1 Manualの「Image Warp Tools」分類と既存COLLECTANEAカタログに基づく分類。 |
| 処理 | 指定方向に沿った画像の伸縮・変形 | Manualで直接確認できる役割。 |
| 出力 | **2D Image** | 変形された画像を後段の画像処理・合成へ渡す。 |
| 未確認 | 出力端子の詳細、補助入力の挙動、初期値の普遍性・値域 | 実機ではImage入力と上記Inspector項目を確認。 |

ここでの<Term id="image">Image</Term>は、静止画・映像・画像化された文字など、画素で表現するデータを指します。図形の輪郭などをデータとして扱う<Term id="shape-data">Shape</Term>とは異なります。Directional ScaleはShapeそのものを編集するノードではなく、**入力された画像の見た目を変形するツール**です。

Frontmatterの`inputs: [image]`と`outputs: [image]`はデータ分類であり、Fusionの接続端子の正式名称や本数を表していません。

## 主な用途

### 線や格子を使った抽象背景

ストライプ、格子、同心円などは、伸びる方向や形の崩れを見分けやすい素材です。タイトルやMVの背景に方向性のある動きを加える前に、これらの素材で変形の特徴を確認できます。

### 実写に方向感のある歪みを加える

建物の窓枠、道路の白線、棚など、直線が多い映像なら変形前後を比較しやすくなります。ただし、被写体がどこからどこへ移動するか、画面端をどう補うかは実機で確認する必要があります。

### 背景だけを変形して文字を残す

タイトルを後段で合成すれば、背景にだけ歪みをかけられます。すでに文字が合成された画像をDirectional Scaleへ入力すると、文字も画像の一部として処理対象になります。

## 制作例：ストライプ背景を変形してタイトルを重ねる

以下はノードの役割を理解するための構成例です。公式のInspector設定値を再現するチュートリアルではありません。

    MediaIn（ストライプ画像） → Directional Scale → Merge（Background） → MediaOut
    Text+（タイトル） ──────────────────────────────→ Merge（Foreground）

1. ストライプまたは格子の画像をMediaInからDirectional Scaleへ渡し、その出力だけをViewerで表示します。
2. 直線の傾き、間隔、画面端の見え方を入力画像と比較します。どの設定が方向を制御するかは、実際のInspectorを見て確認します。
3. 必要なら前段に標準Transformを追加し、素材の位置や大きさを変えた場合の結果を比べます。これはDirectional Scale内部の変形基準を変更したことと同義ではありません。
4. Directional Scaleの結果をMergeのBackgroundへ、Text+をForegroundへ接続します。文字の形を維持したまま背景の変形を使えます。
5. 静止画だけでなく再生中のフレームも確認し、画面端の欠けや文字との重なりを調整します。

最初から人物の顔など複雑な素材を使うより、直線や円で形の変わり方を確かめてから実素材へ替える方が判断しやすくなります。

## 近いノードとの違い

| ノード | 21.1 Manualで確認できる役割 | 選び分け |
| --- | --- | --- |
| **Directional Scale** | 指定した方向への伸縮・変形 | 方向性を持つ伸びや歪みを作りたい |
| [Bend](./bend) | 放射状に画像を曲げる | 直線を曲げるような変形を試したい |
| [Radial](./radial) | へこみ型の変形。追加のwarp mask入力が記載されている | へこみ状の歪みと作用範囲を検討する |
| [Shear](./shear) | 角度方向のせん断変形。強度を決める追加入力が記載されている | 斜めにずらすような変形を試したい |
| [Spherize](./spherize) | 指定領域に虫眼鏡のような変形を加える | 局所的な拡大鏡風の変形を作りたい |
| [Warped Transform](./warped-transform) | 画像を伸ばす・押し縮める・回す | 伸縮や回転をまとめて試したい |

標準の**Transform**も画像の移動・拡大縮小に使えますが、Directional Scaleと同じ変形結果を保証するものではありません。まず普通のサイズ調整で足りるかを判断し、変形の方向性が表現上必要ならDirectional Scaleを比較します。

## 注意点と確認できていない仕様

- **旧記事の「指定angle方向へ片側stretch」**：21.1 Manualに記載があるのは「specified direction」であり、「片側のみ」までは確認できません。実機InspectorにはAxis Angleが表示されますが、角度の全挙動は未確認です。
- **Inspectorと変形の基準**：実機ではAxis Angle、Center、Size Along Axis、Size Lateral Axisを確認しました。値域、初期値の普遍性、変形が均一かどうかは未確認です。
- **画面端・Alpha**：画像がフレーム外へ動く場合の補間、透明画素の扱い、premultiplyなどは資料から確認できません。透過素材は合成後も確認します。
- **アニメーション**：専用の時間制御や速度パラメータの存在は確認していません。上の例は入力に動画を使う構成です。
- **製品・Edition差**：21.1 Manualへの掲載は確認済みですが、Resolve Free / Studio / Fusion Studioそれぞれの利用可否、実機表示名は別途確認が必要です。実機のREGIDはKD_DirectionalScaleです。

## バージョンと出典

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』、Chapter 105「Krokodove Nodes」、**p.2436「Image Warp Tools / Directional Scale」**。同ページのBend、Radial、p.2437のShear、Spherize、Warped Transformの記述と比較しました。

この記事の画像入出力分類は公式カテゴリと既存COLLECTANEAカタログを併用しています。上記の文字画像の伸縮は実機で確認しました。その他の制作例は記載された役割に基づく提案です。端子の全詳細、Inspectorの全範囲、Alpha、Edition差は未確認のため、`verification: partial`を維持しています。

[Krokodove全体像](./)と[画像（Image）](../../learn/02-data/image)も参照してください。
