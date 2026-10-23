---
title: dCrop
description: Deep Imageの画素内にある奥行きサンプルをZ値の範囲で選別するNode。Effect Mask、範囲反転、通常のCropとの違いを説明する。
doc_type: node
term_id: dcrop
term_short: "dCropは、Deep Imageの各画素に重なる奥行きサンプルを、指定したZ範囲で残す・除外するNode。"
verification: partial
aliases: [dCrop, dCr]
concepts: [deep-image, depth, mask-data]
nodes: [dCrop]
node_family: deep
controls: [Use Minimum Z, Minimum Z, Use Maximum Z, Maximum Z, Keep Outside Depth Range]
inputs: [deep-image, mask]
outputs: [deep-image]
tasks: [deep, crop-depth, isolate-depth]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# dCrop

dCrop [dCr]は、**Deep Imageに含まれる奥行き別のサンプルを、Z値の範囲で選んで残したり取り除いたりする**Nodeです。画面の上下左右を切り取るのではなく、映像の同じ位置に重なっている「手前の情報」と「奥の情報」を深度の条件で分けます。

通常の2D画像は、基本的に1画素につき1組の色と透明度を持ちます。一方、<Term id="deep-image">Deep Image</Term>では、同じ画素に複数の奥行きサンプルを保存できます。たとえば手前に半透明の煙、奥に壁があるCGなら、その両方が同じ画素の別サンプルになっていることがあります。dCropでは、こうしたサンプルを**2D画像へまとめる前に**選別できます。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Input**（オレンジの入力） | Deep Image | 奥行きサンプルを選別する元データ。dCropに必要な入力です。 |
| **Effect Mask**（青色、任意） | <Term id="mask">Mask</Term> | 画面のどの位置でdCropの処理を適用するかを限定します。 |
| **出力** | Deep Image | Z条件で選別した後も、奥行きサンプルを持つデータとして後段へ渡します。 |

Effect Maskは、楕円・多角形・ペイント・Bitmap Maskなどから作れます。ただし、**MaskとZ範囲は別の条件**です。Maskは画面内の位置を選び、Minimum Z / Maximum Zはその位置に含まれるサンプルの奥行きを選びます。

~~~text
Deep EXR（Loader / MediaIn） ─→ dCrop ─→ Deep to Image ─→ 通常の2D合成
                                 ↑
                       Ellipse Mask（必要なとき）
~~~

Deep to Imageは複数の奥行きサンプルを通常の2D画像にまとめるNodeです。**dCropの直後に必ず置く必要はありません**。dMergeやdColorCorrectorなど、ほかのDeep処理を続けてから変換できます。

## Inspector：Depth Crop

21.1 Reference ManualのControlsタブには、次の範囲指定が記載されています。

| 設定 | 何を変えるか |
| --- | --- |
| **Use Minimum Z** | 下限のZ値を使って選別するかどうかを切り替えます。 |
| **Minimum Z** | 有効にした下限のZ値を調整します。 |
| **Use Maximum Z** | 上限のZ値を使って選別するかどうかを切り替えます。 |
| **Maximum Z** | 上限として使うZ値です。 |
| **Keep Outside Depth Range** | 選別する側を反転し、設定した範囲の**外側**を残します。 |

MinimumとMaximumを両方有効にすれば、2つのZ値に挟まれたサンプルを対象にできます。一方だけ有効にした場合は、その境界を使った片側の選別になります。

**Sample**操作では、InspectorのSampleボタンからViewerへドラッグしてZ値を取得できます。目測で境界を決める前に、素材上で対象位置を確認すると設定しやすくなります。

Z値は、画面内の縦位置や透明度ではありません。**奥行きを表す数値**です。数値がどの距離に対応するかは元データの深度表現を確認してください。異なるCGレンダーのZ値が同じ基準で作られているとも限りません。

## 実例：手前と奥のサンプルを別々に扱う

ひとつの画素に、手前のサンプルA（仮のZ値2）と、奥のサンプルB（仮のZ値8）が入っているとします。**数値は仕組みを説明するための例**で、Fusionの距離単位やカメラ座標の既定値を示すものではありません。

1. Deep ImageをdCropへ入力します。
2. Use Minimum ZとUse Maximum Zを有効にし、下限を1、上限を4とします。この条件ではZ値2のAを残し、Z値8のBを範囲外として除外する構成になります。
3. 同じ設定で**Keep Outside Depth Range**を有効にすると、反対にZ値8のBを残す構成になります。
4. [Deep to Image](./deep-to-image.md)につないで、通常の2D画像に変換した結果を比較します。

この例が示すのは、**1画素ごとの切り抜きではなく、その画素内のサンプル単位で選べる**ことです。Z値の分布や透明物の重なりが異なる実素材では、結果も変わります。

### 応用：奥行き別に色を調整する

同じDeepレンダーを2本に分け、片方は指定Z範囲の内側、もう片方はKeep Outside Depth Rangeで外側を残す構成です。

~~~text
                        ┌→ dCrop（範囲内）→ dColorCorrector ─┐
Deepレンダー ────────────┤                                  ├→ dMerge → Deep to Image
                        └→ dCrop（範囲外）─────────────────┘
~~~

例えば近景の煙だけを色調整し、それより奥の物体は元の見た目に近いまま合成する場合の**構成案**です。2つのdCropではZ境界の設定を揃え、片方だけKeep Outside Depth Rangeを有効にします。どのサンプルを残すかは、Deep to Imageの前後を比較して確認します。境界での見た目や半透明の重なり方は、実際のDeepレンダーで検証してください。

### 応用：画面の一部分だけ奥行きで選別する

人物の周囲だけに奥行きによる選別を行いたいなら、dCropの青いEffect MaskへEllipse Maskなどを接続します。**Z値の指定はdCrop側、画面上の適用領域はMask側**と分けて調整します。

「Maskをつないだから、その形で元画像のAlphaを切り抜いた」とは考えません。Effect MaskはdCropの処理範囲を制御する入力で、画像のAlphaを直接描く操作とは異なります。

## 似たNodeとの違い

| Node | 何を扱うか | 選ぶ基準 |
| --- | --- | --- |
| **dCrop** | Deep Imageの奥行きサンプル | 特定のZ範囲にあるサンプルを残す・除外する |
| [dHoldout](./dholdout.md) | 前景と背景のDeep Image | 前景の奥行きを使って背景側を隠す |
| [dTransform](./dtransform.md) | Deep Imageの位置とZ | サンプルの位置や深度を移動・変換する |
| [dResize](./dresize.md) | Deep Imageの画像サイズ | Deepの幅・高さを変更する |
| [Crop](../transform/crop.md) | 通常の2D Image | 画像の矩形範囲や出力キャンバス寸法を変更する |

dCropは**Z値で何を残すか**を決めます。dTransformは位置を変え、dHoldoutは別の前景Deepを使って背景を隠します。通常のCropでは、同じ画素の手前と奥を別々に選ぶことはできません。

## 期待した範囲が残らないとき

- **すべてが消えたように見える**：Minimum / Maximumの有効状態と値、Keep Outside Depth Rangeのオン・オフを確認します。まず片方の境界だけで試すと原因を絞れます。
- **どの部分が選ばれたか分からない**：対象サンプルのZ値をSampleで調べます。Viewerで見える2D画像の色だけから深度は判断できません。
- **画面内の一部分でしか変化しない**：青いEffect Maskに何か接続されていないか確認します。MaskとZ範囲の条件を一度分けて比較します。
- **通常のMergeへ直接送れない**：dCropの出力はDeep Imageです。普通の2D合成を続けるならDeep to Imageで変換します。
- **別レンダーと境界が合わない**：Z値の基準やCGカメラの設定を確認します。深度の数字だけを揃えても、異なるカメラ位置・投影条件までは一致しません。

## 関連する考え方とNode

- [Deep Imageの仕組み](../../learn/02-data/deep-image.md) — なぜ同じ画素に複数の奥行き情報を持てるのか。
- [マスク（Mask）](../../learn/02-data/mask.md) — 画面上の適用範囲を指定するデータ。
- [Deep / Auxiliary Channel一覧](./index.md) — true Deep ImageとZ補助チャンネル付き2D画像を区別する。
- [dMerge](./d-merge.md) — サンプルを保ったまま複数のDeep Imageを組み合わせる。
- [Deep to Image](./deep-to-image.md) — Deep処理を終え、通常の画像処理へ渡す。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 95「Deep Image Nodes」。**pp.2237–2238**でdCrop [dCr]のInput（オレンジ）・任意のEffect Mask（青）・Depth Crop・Sample・Keep Outside Depth Rangeを確認しました。**pp.2226–2227**でDeep Imageの仕組みと、Deep Image Compositing Toolsetが**Studio Version Only**であること、Deep合成にはlinear colorspaceが必要なことを確認しています。

本記事の運用例はManualで確認した入出力と設定を組み合わせた**構成例**であり、21.1実機でレンダリング結果を確認したものではありません。Inspectorの初期値・Z値の数値範囲・境界ちょうどのサンプルの扱い・深度表現による差は未検証のため、`verification: partial`としています。
