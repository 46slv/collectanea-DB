---
title: dTransform
description: Deep Imageの画面内の位置・大きさと奥行きサンプルのZ値を調整するNode。XY変形とZ変形、接続例、Effect Maskの使い方を解説する。
doc_type: node
term_id: dtransform
term_short: "dTransformは、Deep Imageを2D画面内で移動・拡大縮小し、各サンプルの奥行きZ値も調整できるNode。"
verification: partial
aliases: [dTransform, dXF]
concepts: [deep-image, transform, depth, mask-data]
nodes: [dTransform]
node_family: deep
controls: [Scale Z, Translate Z, Sample, Center X/Y, Pivot X/Y, Size X/Y, Use Size and Aspect, Size, Aspect]
inputs: [deep-image, mask]
outputs: [deep-image]
tasks: [deep, transform, move-depth]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# dTransform

**dTransform [dXF]は、Deep Imageを画面内で動かす操作（XY）と、奥行き情報を動かす操作（Z）を1つのNodeで行います。** たとえば別々にレンダリングした人物と背景をDeep合成するとき、人物の画面上の位置を合わせるだけでなく、人物が背景より手前にあるかどうかを決めるZ値も調整できます。

通常の2D Imageは、基本的に1画素に1組の色とAlphaを持ちます。一方、<Term id="deep-image">Deep Image</Term>は、同じ画素の手前と奥にある複数のサンプルを分けて記録できます。dTransformはこの**サンプルの奥行き情報を扱ったまま**変形し、Deep Imageとして後段へ渡します。

ここで重要なのは、**XYとZが別の調整である**ことです。Translate Zで奥行きの数値を変えても、3Dカメラで再撮影したように被写体の見た目の大きさや遠近感が自動的に変わる、という説明にはなりません。画面上の大きさはSize、位置はCenterなどで別に調整します。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Image**（オレンジ） | Deep Image | 位置と奥行きを調整したい元のDeepデータ。 |
| **Effect Mask**（青、任意） | <Term id="mask">Mask</Term> | 変形処理を画面内のどこへ適用するか限定する入力。 |
| **出力** | Deep Image | 変形後も奥行きサンプルを含むデータとして渡す。 |

21.1 Reference ManualがdTransform固有の入力として記載するのは、Imageと任意のEffect Maskです。Effect Maskには多角形、図形、ペイント、Bitmapなどから作ったMaskを渡せます。**Maskは適用する画面領域を選ぶもの**で、Translate Zの代わりに奥行きを指定するものではありません。

~~~text
手前のDeep EXR（Loader / MediaIn）→ dTransform ──┐
                                                   ├→ dMerge → Deep to Image → 2D合成
背景のDeep EXR（Loader / MediaIn） ─────────────────┘
~~~

[dMerge](./d-merge.md)は複数のDeepデータを奥行きサンプルとして統合します。[Deep to Image](./deep-to-image.md)は、それらを通常の2D画像へまとめます。**dTransformの直後にDeep to Imageを置く必要はありません。** dMergeやほかのDeep処理を終えた段階で変換できます。

## Inspector：XYとZを分けて考える

### 奥行き（Z）の調整

| 設定 | 何を変更するか | 使用例 |
| --- | --- | --- |
| **Scale Z** | ソースのZサンプルが持つ奥行き範囲を拡大・圧縮する。 | 手前と奥のサンプル間の距離の開きを調整する。 |
| **Translate Z** | サンプルの奥行き値をまとめて前後へ移す。 | ほかのDeepレンダーと合成するとき、被写体の前後関係を調整する。 |
| **Sample** | InspectorのSampleボタンからViewerへドラッグし、その位置の値を取得する。 | 奥行きを目測ではなくソース上の値を参考に調整する。 |

**Scale Zはサンプル間の奥行きの広がり**に働き、**Translate Zは奥行き全体の位置**を動かす設定です。大きさを変える「Size」と、奥行きの値を変える「Scale Z」は別のものです。

ManualはScale Zについて、値を増やすと奥行き範囲が拡大し、減らすと圧縮されると説明しています。ただし、どのZ値を基準に拡大するか、数値の初期値・範囲、カメラに向かう方向が正負のどちらかは、この節だけでは確定できません。別素材と合わせるときは**どのサンプルが前面に出るかを実画像で確認**します。

### 画面内（XY）の調整

| 設定 | 何を変更するか |
| --- | --- |
| **Center X/Y** | Deep Imageの画面上の中心位置を動かす。 |
| **Pivot X/Y** | 拡大縮小するときの基準位置を動かす。 |
| **Size X/Y** | 横方向と縦方向の大きさをそれぞれ調整する。 |
| **Use Size and Aspect** | 下のSize / Aspect設定を使うモードへ切り替える。 |
| **Size** | 横・縦を同じ倍率で拡大縮小する。 |
| **Aspect** | 画像の縦横比を調整する。 |

たとえば人物を画面右へ動かすならCenter X/Y、人物の位置をなるべく保ったまま大きくしたいならPivotとSizeの組み合わせを検討します。横だけを伸ばす操作と、Sizeで均等に拡大する操作も区別します。

XYの変形でサンプルがどのように再配置・補間されるかは、21.1 ManualのdTransform節ではアルゴリズムまで説明されていません。細い輪郭や半透明の素材は、変形前後のDeep to Image結果を比較してください。

## 実例：別々のDeepレンダーを重ねる

人物と背景を別々のDeep EXRとしてレンダリングしたものの、合成すると人物の画面上の位置と前後関係が少し合わないケースを考えます。

1. 人物と背景のDeep EXRを読み込み、同じカメラ設定・深度基準でレンダリングされているか確認します。
2. 人物側にdTransformを置きます。**Center X/Y**で画面内の位置、**Size X/Y**または**Size / Aspect**で大きさを合わせます。
3. 人物側のZ値をViewerのSampleで確認し、背景のサンプルとの前後関係が意図したものになるよう、必要に応じて**Translate Z**を調整します。
4. 2つをdMergeへ接続し、Deep to Imageで2D表示した結果を確認します。被写体の重なりが変わっても、画面内の大きさは自動で合わせられないため、XY設定は別に調整します。
5. 必要があるときだけScale Zで人物のサンプル間の奥行きの開きを調整します。**位置合わせにScale Zをむやみに使うと、人物自体の厚みや透明部分の奥行き関係も変わり得ます。**

~~~text
人物Deep → dTransform（XYを合わせる → 必要に応じZ調整）─┐
                                                          ├→ dMerge → Deep to Image
背景Deep ──────────────────────────────────────────────────┘
~~~

**これはNodeの機能に基づく構成例**です。異なるカメラ位置や画角で作られたレンダーを、dTransformのXYとZだけで正しい3D投影へ修正できると保証するものではありません。元のレンダー条件が一致していない場合は、まず素材側の条件を確認します。

### 画面の一部分だけを変形する

背景の一部だけで変形を適用したい場合は、dTransformの青いEffect MaskへEllipse MaskやPolygonなどのMaskをつなぎます。

Maskで**画面上の適用範囲**を決め、Center / Size / Zのどの値を変えるかはdTransform側で決めます。Maskを接続しただけでDeep sampleのZが変わるわけではなく、Maskが奥行き別サンプルを選び出すわけでもありません。

奥行きの範囲自体を条件に**サンプルを残す・除外する**なら、[dCrop](./dcrop.md)を使います。

## 似たNodeとの違い

| Node | 主な用途 | 扱うデータ |
| --- | --- | --- |
| **dTransform** | XY位置・大きさとZ値を調整する | Deep Image → Deep Image |
| [dResize](./dresize.md) | Deep画像全体の幅・高さを変更する | Deep Image → Deep Image |
| [dCrop](./dcrop.md) | 指定したZ範囲内外のサンプルを残す | Deep Image → Deep Image |
| [dMerge](./d-merge.md) | 複数のDeepサンプルをまとめる | Deep Image群 → Deep Image |
| [Deep to Image](./deep-to-image.md) | Deep合成を通常の2D画像へまとめる | Deep Image → 2D Image |

通常の2D **Transform**はRGBA Imageを画面内で移動・拡大縮小するNodeです。Deep合成の途中で変形を続けたいなら、奥行きサンプルを扱うdTransformを選びます。逆にDeep to Imageで2Dへ変換した後なら、通常のTransformを使う構成もあります。

## 期待した結果にならないとき

- **前後関係が逆に見える**：人物と背景の元Z値を確認し、Translate Zの変更前後をdMerge → Deep to Imageで比較します。Zの正負方向を推測で固定しないでください。
- **奥行きを動かしても被写体が大きくならない**：Translate Zは深度チャンネルの調整です。画面上の拡大縮小にはSizeを使います。3Dカメラによる再投影とは異なります。
- **一部でしか変化しない**：Effect Maskが接続されていないか、Maskの形状・適用領域を確認します。
- **重なりは合ったが輪郭が不自然**：XY変形量、元Deep素材の解像度、半透明部分を確認し、変形前後を比較します。補間方式は未検証です。
- **通常の2D Mergeへ渡したい**：先にDeep to Imageで通常の画像へ変換します。Deep dataを保つ間はdMergeなどのDeep Nodeを使います。
- **Nodeが見つからない**：21.1 ManualはDeep Image Compositing Toolsetを**Studio Version Only**としています。Editionを確認します。

## 関連する考え方

- [Deep Imageの仕組み](../../learn/02-data/deep-image.md) — 1画素の中に複数の奥行きサンプルがあるとはどういうことか。
- [マスク（Mask）](../../learn/02-data/mask.md) — 画面上の処理範囲を指定するデータ。
- [Deep / Auxiliary Channelノード一覧](./index.md) — Deep ImageとZ補助チャンネル付き2D画像の違い。
- [dCrop](./dcrop.md) — 値を移動するのではなく、Z範囲でサンプルを選ぶ。
- [dResize](./dresize.md) — 画像全体の幅・高さを変更する。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 95「Deep Image Nodes」。**pp.2250–2251**でdTransform [dXF]、Image・Effect Mask入力とScale Z / Translate Z / Sample / Center / Pivot / Size / Aspectを確認しました。**p.2227**には、Deep Imageに複数の奥行きサンプルがあること、Deep合成が**Studio Version Only**であること、合成には**linear colorspace**を使用する必要があることが明記されています。

本記事の接続例はManualの機能説明から組み立てたもので、21.1実機でのレンダリング検証結果ではありません。Inspectorの数値初期値・許容範囲、Zの正負方向、Scale Zの基準位置、XY変形での再サンプリング方式、Effect Maskの境界での挙動は未検証です。このため`verification: partial`を維持しています。
