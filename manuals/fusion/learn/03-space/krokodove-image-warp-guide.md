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
updated: '2026-10-21'
---

# Krokodoveの画像変形ノードを選ぶ

Krokodoveには、画像を曲げる、引き伸ばす、反射する、細かく分けて動かすなど、異なる変形がまとまっています。見た目が似ていても、**画面全体を変形するもの、部分ごとに処理するもの、別の入力を参照するもの**では、使う場面が異なります。

このページでは、DaVinci Resolve 21.1に収録された「Image Warp Tools」13項目を、完成させたい画面から選べるように整理します。各ノードのInspector項目を一覧化したものではありません。

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

## 追加の入力が必要な場合

21.1 Manualでは、次の3項目について通常の画像入力以外の入力に言及しています。

- **Radial**：Warp Mask入力。へこみ状の変形と、その影響範囲を扱う候補です。
- **Relative Transform**：第2入力。位置・回転・拡大縮小に関係する変形を行い、変形中心を実際の画素に対して相対指定できると説明されています。
- **Shear**：変形の強度を決める追加入力。

「第2入力がある」ことと「その端子に任意の画像を接続できる」ことは同じではありません。**端子の正式名称、色、受け取るデータ型、未接続時の挙動**はこの章だけでは確定しません。各ノードを開き、表示される端子と接続可能なデータ型を確認します。

## 制作例：タイトルに部分的な歪みを加える

例えば、直線的なタイトルを柔らかく曲げたいならBend、引き伸ばしてスピード感を出したいならDirectional ScaleやStretchが候補です。画面をタイル状に切り替える演出ならSegment TransformとShuffleを比較します。

まずは同じ素材を使い、どこが変わったか判断できる状態で試します。

1. 白い格子模様と短い文字を含む2D画像を用意します。単色だけの画像より、直線や文字の変化を確認しやすくなります。
2. 画像をそのまま表示する枝と、調べたいノードを通す枝を用意し、Viewerで比較します。最初はノードを1種類に絞ります。
3. Inspectorで実際に表示された設定だけを操作し、変化する方向、範囲、区画の境界を観察します。正確な項目名・初期値をこの記事から推測しません。
4. 同じ条件で別の候補に切り替えます。BendとSpherizeなら「曲がる位置」、Segment TransformとShuffleなら「区画内の形と位置」の違いを見ます。
5. 透明なロゴでも試し、画像の端や透明部分に意図しない変化がないか確認します。必要な結果を選んでから[Merge](../../nodes/compositing/merge)で背景へ重ねます。

これはノード選択のための**比較方法の提案**です。Inspectorの数値、端子配線、処理結果を21.1実機で検証した完成レシピではありません。

## 選び分けの注意点

通常の[Transform](../../nodes/transform/transform)だけで位置・回転・倍率の目的を達成できる場合は、まずそちらを使う方が構成を読みやすくできます。画面を局所的に曲げる、領域で異なる変化を加える、別入力を使うといった必要が出たとき、KrokodoveのImage Warp系を比較します。

また、ツール名が似ているからといって、After Effectsの同名エフェクトやFusion標準ノードのInspector項目が一致するとは限りません。たとえばKrokodoveの[Offset](../../nodes/krokodove/offset-krokodove)とShape系の[sOffset](../../nodes/shapes/soffset)は、扱うデータそのものが異なります。

## バージョンと出典

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 105「Krokodove Nodes」**pp.2436–2437**、Image Warp Tools。13項目の名称と概要、Radial・Relative Transform・Shearの追加入力に関する説明を確認しました。

Manualのこの箇所には、すべてのInspector項目、初期値・範囲、端子の完全な一覧、内部処理方式、Free / Studioごとの利用可否は掲載されていません。正式な端子構成、変形品質、実機での結果は未確認のため、`verification: partial`を維持します。詳しい説明は各ノード記事と[Krokodoveノード索引](../../nodes/krokodove/index)を参照してください。
