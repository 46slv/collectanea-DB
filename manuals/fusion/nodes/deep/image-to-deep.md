---
title: Image to Deep
description: 2D画像へ奥行き情報を与えてDeep合成に組み込むNode。入出力、Specify Z・Z Scale・Z Offset、dMergeとの接続例を解説する。
doc_type: node
term_id: image-to-deep
term_short: 通常の2D画像へ奥行き情報を与え、Deep合成で使えるDeep Imageに変換するNode。
verification: partial
aliases: [Image to Deep, ITD]
concepts: [image-data, deep-image, depth]
nodes: [Image to Deep]
node_family: deep
controls: [Specify Z, Z Scale, Z Offset, Sample, Center X/Y]
inputs: [image]
outputs: [deep-image]
tasks: [deep, convert-domain, insert-2d]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# Image to Deep

**Image to Deep [ITD]は、通常の2D画像へ奥行き情報を与え、Deep合成に組み込めるようにするNodeです。** たとえば3Dレンダーを奥行き付きで合成している途中に、2Dで描いた看板やタイトルを追加したい場合に使います。

通常の<Term id="image">2D Image</Term>は、基本的に1画素につき1組の色とAlphaを持ちます。一方、<Term id="deep-image">Deep Image</Term>は、同じ画素位置で手前と奥に重なる複数のサンプルを保持でき、後段でその前後関係を使った合成ができます。

**Image to Deepを通すだけで、元の2D画像に写っていない物体の裏側や、複数の立体的な奥行き層が自動生成されるわけではありません。** 2D画像をDeep合成で扱える形式へ変換し、奥行きの位置を設定するものです。

## 入力・出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Input（オレンジ）** | 2D Image | Deep合成へ追加したい元画像。21.1 Manualに記載された唯一の必須入力です。 |
| **出力** | Deep Image | 奥行き情報を与えた画像をdMergeなどのDeep処理へ渡します。 |

~~~text
背景のDeep EXR ──────────────────────┐
                                     ├→ dMerge → Deep to Image → 2D合成
2Dタイトル → Image to Deep（Zを設定）─┘
~~~

[dMerge](./d-merge.md)は複数のDeep Imageを奥行きサンプルとして統合します。[Deep to Image](./deep-to-image.md)は、その結果を通常の2D Imageへまとめます。

Image to Deepは2D MergeのようなForeground・Backgroundの2入力を持つNodeではありません。**1枚の2D画像をDeep合成に渡す変換Node**で、複数素材の統合はdMergeで行います。

## Inspector：奥行きとXY位置を分ける

### Specify Z

**Specify Z**を有効にすると、現在のZ depthを明示的に指定するモードになります。2D画像を背景のDeepレンダーより手前へ置く、あるいは奥へ置く、といった配置を調整するための基本設定です。

21.1 Manualは、Specify Zを無効にした場合は下の**Z Scale**によって調整できると説明しています。このチェックとZ Scaleを無関係な独立機能として考えないでください。

なお、**Zの数値が増えると必ず手前へ移る**という方向は、Image to Deep節の記述だけからは確定しません。合成するDeep素材の深度規約を確認し、実際の前後関係で判断します。

### Z ScaleとZ Offset

| 設定 | 作用 | 変わらないこと |
| --- | --- | --- |
| **Z Scale** | ソースの奥行きサンプルの範囲を拡大・圧縮する。Manualでは増やすと奥行きの広がりが増え、減らすと圧縮されると説明されています。 | 2D画像の見た目のサイズを直接変更する設定ではありません。 |
| **Z Offset** | 奥行き情報をまとめて前後へ移す。 | 画面内の左右・上下位置を移動する設定ではありません。 |

Z Scaleは**奥行きの値の広がり**、Z Offsetは**奥行き全体の位置**を扱う、という区別です。元が1枚の2D画像なら、Z Scaleを動かしても失われた奥行き層が復元されるわけではありません。

### SampleとCenter X/Y

- **Sample**：InspectorのSampleボタンをViewerへドラッグし、画面上の位置から値を取得します。数値を調整するときに、参照する深度値を確認する手掛かりになります。
- **Center X/Y**：入力された2D画像の画面内の位置を動かします。Zの前後移動とは別です。

21.1 Manualには上記のControlsが記載されています。ただし、各数値の初期値・範囲・符号規約や、Sample時の内部処理まではこの節だけで確定できません。

## 実例：Deep背景に2Dタイトルを加える

**背景はDeep EXR、タイトルは透明部分を持つ2D画像**として用意した例です。

1. 背景のDeep EXRをMediaInまたはLoaderで読み込みます。RGBAだけの通常画像ではなく、Deepデータが含まれているか確認します。
2. 2DタイトルをImage to DeepのInputへつなぎます。画面上の位置がずれている場合は、入力画像側または**Center X/Y**で合わせます。
3. **Specify Z**を有効にし、背景のDeepサンプルと比較しながらタイトルを置く奥行きを決めます。必要なら**Z Offset**で前後を調整します。
4. 背景DeepとImage to Deepの出力を**dMerge**へ接続し、**Deep to Image**で通常の2D画像にまとめて結果を確認します。
5. タイトルの前後関係がおかしい場合はZの単位と方向を確認します。サイズや遠近感が合わない場合は、Zだけを動かすのではなく元の2D画像の位置・大きさも調整します。

~~~text
Deep EXR（背景） ─────────────────────────────────┐
                                                ├→ dMerge → Deep to Image → MediaOut
Text+等の2D画像 → Image to Deep（Specify Z） ─────┘
~~~

これは各Nodeの機能を組み合わせた運用例であり、21.1実機でのレンダリング検証結果ではありません。画像へ設定したZと背景のDeepレンダーの深度単位やカメラ条件は、素材によって異なる可能性があります。

Image to Deepは画像を3Dカメラで再投影する処理でもありません。遠近感や物体の立体的な形が必要なら、元の3Dシーンやレンダリング工程で用意します。

## 似たNodeとの違い

| Node | 役割 |
| --- | --- |
| **Image to Deep** | 2D画像に奥行き情報を与え、Deep合成へ組み込む |
| [dTransform](./dtransform.md) | Deep ImageのXY位置・大きさやZ値を調整する |
| [dMerge](./d-merge.md) | 複数のDeep Imageのサンプルを統合する |
| [Deep to Image](./deep-to-image.md) | Deep Imageのサンプルを2Dへまとめる |
| [dCrop](./dcrop.md) | 指定したZ範囲でDeepサンプルを選別する |

Z補助チャンネルを1つ持つ2D画像と、複数サンプルを保持できるDeep Imageも同一ではありません。[Deep Imageの基本](../../learn/02-data/deep-image.md)と[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels.md)で区別できます。

## 期待した結果にならないとき

- **タイトルが意図と逆の奥行きに見える**：元Deep EXRとタイトルのZの単位・方向を確認し、Specify ZまたはZ Offsetを変更する前後のDeep to Image結果を比較します。
- **Z Scaleを動かしても立体にならない**：元の2D画像から隠れた面や複数の深度サンプルは自動生成されません。必要な情報は3Dレンダー側で用意します。
- **位置がずれている**：画面内のXY移動はCenter X/Yなどで調整します。Z Offsetは奥行きの調整です。
- **通常のColorやMergeへ渡したい**：Deep to Imageで通常の2D Imageへ戻してから処理します。
- **Nodeが見つからない**：21.1 ManualではDeep Image Compositing Toolsetは**Studio Version Only**です。Editionを確認します。
- **色や半透明部分が不自然**：ManualはDeep合成に**linear colorspace**を要求しています。入力素材の色空間、Alpha、Deepから2Dへの変換位置を確認します。Alpha変換の内部方式は未確認です。

## バージョン・出典・確認範囲

一次資料：**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）Chapter 95「Deep Image Nodes」**。

- **pp.2252–2253**：Image to Deep [ITD]、Input、Deep変換、Specify Z / Z Scale / Z Offset / Sample / Center X/Y。
- **pp.2226–2227**：Deep Imageの複数サンプル、Studio限定、linear colorspace要件、Deep EXR入出力。
- **pp.2238–2240、2246–2247**：Deep to ImageとdMergeによる合成・2D変換。

**未確認**：Specify Zでの数値フィールドの表示条件、Z Scaleの基準値、Z Offsetの正負方向、2D ImageのAlphaからDeepサンプルを作るときの内部規則、21.1実機での個別素材の結果。このためverificationはpartialのままです。
