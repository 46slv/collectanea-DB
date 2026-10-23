---
title: rCube
description: 立方体状のRegionで効果の作用範囲を指定するKrokodoveノード。用途と関連ノードの違い。
doc_type: node
term_id: rcube
term_short: 立方体状の作用範囲（Region）を作る。立方体のCGモデルそのものは描画しない。
verification: partial
aliases: [rCube]
nodes: [rCube]
node_family: krokodove
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# rCube

rCubeは、**立方体の形を基準に、効果を適用する範囲を作る**KrokodoveのRegionツールです。箱状のCGを映像に描くためではなく、別のノードに「この範囲を処理の対象にする」という情報を渡します。

たとえば、中心から丸く広がる範囲ではなく、箱の面や角を基準にした領域を使いたいときに候補になります。ただし、立方体の初期位置や各軸の向きを、名前だけから判断することはできません。

## Regionとは

**Regionは、処理が作用する場所や範囲を表すデータ**です。映像の画素であるImageや、画面に描画する3Dモデルとは異なります。rCubeはRegionを作り、それを受け取った効果ノードが実際の画像・シーンを処理します。

したがってrCube単体で立方体の映像が現れるわけではありません。[Cube 3D](../3d/cube-3d)は物体としての立方体を生成する別のノードです。[Krokodoveのデータ分類](./)や[データの接続互換性](../../learn/02-data/connection-compatibility)も参照してください。

## 入力と出力

| 接続 | 何を扱うか |
| --- | --- |
| 入力 | rCubeは領域を生成するツールとして掲載されています。必須入力・補助入力の有無は21.1 Manualの該当表に示されていません。 |
| 出力 | **立方体状のRegion**。Region入力を持つ対応ツールへ渡し、効果の作用範囲に使います。 |

Region入力は通常のImage入力・3D Scene入力・Effect Mask入力と同一だと決めつけないでください。実際の端子の名前、数、色、内部データ型、接続できるノードの全一覧は未確認です。

## 主な調整

DaVinci Resolve 21.1 Reference Manualは、rCubeに**Softness、Invert、Transform**の調整があると記載しています。次はその意味をつかむための説明で、Inspectorの正式なラベル・初期値・数値範囲ではありません。

- **Softness（柔らかさ）**：範囲の境目で効果が急に切り替わるか、なだらかに変化するかを扱う調整です。境界の減衰方法は未確認です。
- **Invert（反転）**：指定範囲と外側の扱いを入れ替えるための調整です。具体的な結果は接続先の処理で比較します。
- **Transform（変形）**：生成した範囲の配置や形を調整する操作群です。位置・回転・大きさの個別項目、座標系、変形順序はこの表だけでは分かりません。

「cube region」という記述から確定できるのは、立方体状の領域を作る役割です。**辺の長さ、中心座標、境界の厚み、内部の距離計算**まで規定しているわけではありません。

## 運用例：箱状の範囲だけに効果を及ぼす

以下は**Regionの接続と働きを確かめるための構成案**です。特定のKrokodove効果で実機検証済みのレシピではありません。

1. Fusionで画像またはシーンと、それを処理する効果ノードを準備します。
2. 効果ノードに**Region入力があること**を確認します。一般のEffect Mask入力しかない場合は、この方法を前提にしません。
3. rCubeを配置し、Region出力を効果ノードのRegion入力へつなぎます。元画像やシーンを渡す経路は別に保ちます。
4. 効果ノードの結果をViewerに表示し、Region接続を外した状態と比較します。
5. rCubeのTransformに相当する設定を一つ動かし、効果の及ぶ範囲が変わるか確認します。次にSoftnessとInvertを個別に変えて比較します。

    rCube（Region） ──→ 対応する効果ノードのRegion入力
                                 ↑
                         処理対象は別の入力へ

変化がない場合、まず受け手のRegion入力が正しいか、処理自体の変化が見える状態かを確認します。rCubeを直接Viewerに表示して箱が描かれないことだけでは、不具合とは判断できません。

## 関連Regionツールとの違い

| ツール | 役割 |
| --- | --- |
| **rCube** | 立方体状の範囲を作る |
| [rSphere](./rsphere) | 球状の範囲を作る |
| [rPlane](./rplane) | 平らなカード状の範囲を作る |
| [rNoise](./rnoise) | Perlinノイズに基づく範囲を作る |
| [rTransform](./rtransform) | 生成済みRegionを変形する |
| [rMerge](./rmerge) | 複数Regionを統合する |
| [rModify](./rmodify) | 生成済みRegionを変更する |

一つの箱状範囲を動かすだけなら、まずrCube自身のTransform系調整で足りるか確認します。変形や統合を独立した工程として扱いたいときに、ほかのRegionノードを検討します。rMergeの結合方式やrModifyの詳細操作を、名称から推測して断定することはできません。

## バージョン・出典・未確認事項

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2438、「Region Tools — rCube」。

**確認済み**：立方体状のRegion生成、Softness・Invert・Transform調整、Region入力を持つ他ツールとの併用。

**未確認**：正式な端子名・個数、Inspectorの項目名・初期値・値域、座標系と領域の内部表現、対応ノード一覧、実機結果、Resolve Free / Studio / Fusion Studioでの提供差。確認できていない仕様は推測で補わず、`verification: partial`を維持します。
