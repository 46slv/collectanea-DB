---
title: Krokodoveの画像変形ノードを選ぶ
description: 13種類のImage Warp Toolsを、曲げる・伸ばす・反射する・画面を分割するといった見た目の目的から比較する。
doc_type: concept
term_id: krokodove-image-warp-guide
term_short: KrokodoveのImage Warp Toolsを、欲しい画像変形と入力データの違いから選ぶためのガイド。
verification: partial
aliases: [Krokodove Image Warp, Krokodove Warp]
concepts: [image-data, transform]
nodes: [Bend, Directional Scale, Kaleidoscope, Mirror, Offset, Radial, Relative Transform, Segment Transform, Shear, Shuffle, Spherize, Stretch, Warped Transform]
tasks: [warp-image, motion-graphics]
prerequisites: [image-data]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-22'
---

# Krokodoveの画像変形ノードを選ぶ

Krokodoveには、画像を曲げる、引き伸ばす、反射する、細かく分けて動かすなど、異なる変形がまとまっています。見た目が似ていても、**画面全体を変形するもの、部分ごとに処理するもの、別の入力を参照するもの**では、使う場面が異なります。

このページでは、DaVinci Resolve 21.1 Reference Manualが「Image Warp Tools」として列挙する13項目を、作りたい見た目から選べるように整理します。Manualへの掲載と、各製品・Editionの実機で使用できることは区別します。

## 先に区別すること

ここで扱うのは、<Term id="image">2D Image</Term>の画素を使った変形です。画像を何枚か重ねるMerge、輪郭を図形データのまま編集する<Term id="shape-data">Shape</Term>、3Dオブジェクトの頂点を動かす処理とは異なります。

例えば、四角いタイトル画像を斜めに傾けたい場合と、四角形の輪郭そのものを編集したい場合では、前者は画像変形、後者はShapeなどの図形編集が候補になります。通常の画像の位置・回転・サイズ調整なら、まず[Transform](../../nodes/transform/transform)も比較してください。

## 見た目から選ぶ13項目

以下はBlackmagic Designの21.1 Reference Manualに記載された役割の範囲でまとめたものです。「できること」は、初めて使う人が結果を想像しやすいように説明したもので、正確なパラメータ名を示すものではありません。

| こうしたい | ノード | 画像に起きること |
| --- | --- | --- |
| 画像を弓なりに曲げたい | [Bend](../../nodes/krokodove/bend) | 放射状の変形によって画像が曲がる。 |
| ひとつの方向へ長く伸ばしたい | [Directional Scale](../../nodes/krokodove/directional-scale) | 指定した方向に沿って画像が伸縮・変形する。 |
| 万華鏡のように繰り返したい | [Kaleidoscope](../../nodes/krokodove/kaleidoscope) | 画像を放射状に鏡映しして反復する。 |
| 鏡に映したように反転したい | [Mirror](../../nodes/krokodove/mirror) | 指定した線に沿って画像を反射する。 |
| 横または縦にずらして歪ませたい | [Offset](../../nodes/krokodove/offset-krokodove) | 水平・垂直方向の位置を変え、画像を歪ませる。 |
| 一部を押し込んだように変形したい | [Radial](../../nodes/krokodove/radial) | へこませるような変形を加える。Manualには追加のWarp Mask入力も記載されている。 |
| 画像内容を基準に回転・拡大縮小したい | [Relative Transform](../../nodes/krokodove/relative-transform) | 位置・回転・大きさに関係する変形を行う。第2入力と、実際の画素を基準にする変形中心が特徴。 |
| 画面の区画をそれぞれ傾けたい | [Segment Transform](../../nodes/krokodove/segment-transform) | 正方形の区画へ分け、それぞれに角度・大きさの変形を加える。 |
| 画像を斜めに押し流したい | [Shear](../../nodes/krokodove/shear) | 平行四辺形のように斜めへずらす変形。強さを決める第2入力がManualに記載されている。 |
| 画面の区画を入れ替えたい | [Shuffle](../../nodes/krokodove/shuffle) | 細分化した画面の位置を組み替える。 |
| 拡大鏡で覗くように歪ませたい | [Spherize](../../nodes/krokodove/spherize) | 指定した形の範囲内で、へこみを伴う拡大鏡に似た変形を行う。 |
| 線に沿って画素を引きずりたい | [Stretch](../../nodes/krokodove/stretch) | 指定した線に沿って画素を引き伸ばす。 |
| 伸縮と回転を組み合わせたい | [Warped Transform](../../nodes/krokodove/warped-transform) | 引き伸ばし、押し縮め、回転する変形を扱う。 |

「拡大鏡」と「指定した方向の伸縮」は、どちらも画素が大きく見えることがあります。ただし、[Spherize](../../nodes/krokodove/spherize)は領域内のへこみ状の変形、[Directional Scale](../../nodes/krokodove/directional-scale)は方向を決めた変形として説明されています。見た目の印象だけで同じ効果だと判断しないことが大切です。

また、[Segment Transform](../../nodes/krokodove/segment-transform)は**区画内の画像を変形**し、[Shuffle](../../nodes/krokodove/shuffle)は**区画の位置を入れ替え**ます。どちらも画面が分割されたように見えても、変形させたいのか、配置を組み替えたいのかで選びます。

## まず比較する組み合わせ

一見似た結果でも、何を変えたいかによって最初に試すノードは変わります。次の表は、Manualで確認できる役割から選ぶための目安です。特定の仕上がりが必ず得られるという意味ではありません。

| 迷う場面 | 最初に比較する候補 | 見るところ |
| --- | --- | --- |
| 画像が曲がる・へこむ見た目が欲しい | [Bend](../../nodes/krokodove/bend) / [Radial](../../nodes/krokodove/radial) / [Spherize](../../nodes/krokodove/spherize) | 曲げとへこみの違い、変化する領域。RadialにはWarp Mask入力への言及がある。 |
| 一方向へ伸ばしたい | [Directional Scale](../../nodes/krokodove/directional-scale) / [Stretch](../../nodes/krokodove/stretch) | 前者は方向、後者は指定した線を基準に説明されている。 |
| 反転・繰り返しの模様を作りたい | [Mirror](../../nodes/krokodove/mirror) / [Kaleidoscope](../../nodes/krokodove/kaleidoscope) | 指定した線での反転か、放射状の鏡映を繰り返すか。 |
| 四角い区画を動かしたい | [Segment Transform](../../nodes/krokodove/segment-transform) / [Shuffle](../../nodes/krokodove/shuffle) | 区画内の角度・大きさを変えるか、区画の配置を入れ替えるか。 |
| ずれと斜め変形を区別したい | [Offset](../../nodes/krokodove/offset-krokodove) / [Shear](../../nodes/krokodove/shear) | 水平・垂直方向のずれ／歪みか、角度を伴うシアー変形か。 |

「指定した線」や「へこみ」は作用を説明する語であり、線の描き方や変形中心のInspector項目まで確定したものではありません。ノード名だけで設定方法を推測しないでください。

## 追加入力が記載された3項目

Manualには、次の3項目について通常の画像変形に加えて別の入力があると記載されています。ただし、**追加入力の存在と、接続が必須であることは別**です。

| ノード | 21.1 Manualで確認できること | この資料だけでは分からないこと |
| --- | --- | --- |
| [Radial](../../nodes/krokodove/radial) | へこみ状の変形と、追加のWarp Mask入力。 | マスク入力の端子名・受け取るデータ型・未接続時の動作。 |
| [Relative Transform](../../nodes/krokodove/relative-transform) | 第2入力を使い、位置・回転・倍率に関係する変形を行う。入力画像の実際の画素を基準に、変形の中心を相対指定できる。 | 第2入力の正確なデータ型、変形中心の検出方法・Inspectorの名称。 |
| [Shear](../../nodes/krokodove/shear) | 斜め方向のシアー変形。追加入力で強さを決める。 | 追加入力の端子名・受け取る値の形式・接続必須条件。 |

第2入力を持つという説明から、別のImageやMaskを何でも接続できると推測しないでください。実機では、補助入力なしで結果が出るかを確認し、対応する端子とデータ型を特定してから接続を試します。

## 比較用の素材と確認手順

同じ素材・解像度・フレームで試すと、ノードごとの違いを見分けやすくなります。例えば、**番号付きの格子、中央からずれた円、短い文字、透明な余白**を含む画像を使います。

1. 元画像をViewerに表示し、格子の交点・円・文字の位置を把握します。
2. 画像を候補のImage Warpノード1つに通して別のViewerへ表示し、元画像と同じ倍率で比較します。
3. 最初はInspectorで確認できた項目だけを1つ変更し、**直線が曲がったか、区画の場所が入れ替わったか、画像全体が動いたか**を区別します。
4. 透明部分を持つ素材でも試し、画面端の欠け・不要な透明領域・輪郭の変化を確認します。Alphaの保持方式や端の補間は、この一覧だけでは断定できません。
5. 別ノードを比較するときは、入力画像とフレームを変えずに入れ替えます。動画なら再生時のちらつきも確認します。

これらは**ノードを選ぶための観察手順**であり、Manual記載のInspector操作手順や21.1実機で確認した結果ではありません。

## 運用例：背景だけを変形し、タイトルを読みやすく残す

MVのタイトル背景を歪ませたい一方で、歌詞の文字は変形させたくない場合を考えます。背景と文字を先に一枚の画像へ合成してWarpへ渡すと、文字も加工対象になります。背景だけをWarpに通し、後段で文字を重ねれば、二つを分けて調整できます。

```text
MediaIn（格子・実写の背景） → BendなどのWarp → Merge（Background） → MediaOut
Text+（変形させない歌詞） ───────────────────────→ Merge（Foreground）
```

Bendの代わりにStretchやSegment Transformを挿入して、画面のどこが変わるか比較します。ノード個別の詳細設定は、Inspectorで確かめてから決めます。反対に文字まで変形したいなら、文字を合成した後の画像へWarpを適用する構成を比較してください。背景だけを加工する例は、**Warpに文字を通さないという合成順の説明**であり、各ノード固有のマスク機能を意味しません。

## 選び分けの注意点

通常の[Transform](../../nodes/transform/transform)だけで位置・回転・倍率の目的を達成できる場合は、まずそちらを使う方が構成を読みやすくできます。画面を局所的に曲げる、領域で異なる変化を加える、別入力を使うといった必要が出たとき、KrokodoveのImage Warp系を比較します。

また、ツール名が似ているからといって、After Effectsの同名エフェクトやFusion標準ノードのInspector項目が一致するとは限りません。たとえばKrokodoveの[Offset](../../nodes/krokodove/offset-krokodove)とShape系の[sOffset](../../nodes/shapes/soffset)は、扱うデータそのものが異なります。

## バージョンと出典

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 105「Krokodove Nodes」**pp.2436–2437**、Image Warp Tools。13項目の名称と概要、Radial・Relative Transform・Shearの追加入力に関する説明を確認しました。

Manualのこの箇所には、すべてのInspector項目、初期値・範囲、端子の完全な一覧、内部処理方式、Free / Studioごとの利用可否は掲載されていません。正式な端子構成、変形品質、実機での結果は未確認のため、`verification: partial`を維持します。詳しい説明は各ノード記事と[Krokodoveノード索引](../../nodes/krokodove/index)を参照してください。
