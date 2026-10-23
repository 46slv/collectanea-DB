---
title: Rank Filter
description: Rank FilterのSizeとRankで近傍画素を選び、点状ノイズの除去や水彩画風の加工を行う方法。入出力、Effect Mask、実例と注意点を説明する。
doc_type: node
term_id: rank-filter
verification: partial
aliases: [Rank Filter, RFlt]
concepts: [image-data, filtering, rank-statistics]
nodes: [Rank Filter]
node_family: blur-filter
controls: [Size, Rank]
inputs: [image, mask]
outputs: [image]
tasks: [rank-filter, denoise, stylize]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# Rank Filter

Rank Filterは、画像のある画素を処理するとき、その周囲の画素を値の順に並べ、**指定した順位にある画素の色で置き換える**フィルターノードです。周囲の色を平均する[Blur](./blur)とは仕組みが異なり、孤立した明るい点・暗い点を抑えたり、広い範囲を参照して絵画的な面を作ったりできます。

例えば、ほぼ均一な壁に白い点が1つだけある場合を考えます。周囲の大半が壁の色なら、中央付近の順位を選ぶことで、その点を周囲に近い色へ置き換えられます。ただし細い線や小さな文字も「孤立した画素の集まり」と判断される可能性があるため、ノイズだけを選んで除去する処理ではありません。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input（橙）** | 2D Image | 順位フィルターを適用する元画像 |
| **Effect Mask（青、省略可）** | Mask | 加工結果を適用する場所を制限する |
| **Output** | 2D Image | 順位フィルター適用後の画像を後段へ渡す |

基本構成は **MediaIn → Rank Filter → MediaOut** です。既存の合成途中に挿入しても使えます。

Effect Maskには、[Polygonなどで作ったマスク](../../learn/02-data/mask)を接続できます。例えば人物の服だけを加工し、顔や背景はそのままにする場合です。21.1マニュアルでは、Effect Maskは**フィルターの処理後に適用**されると説明されています。マスクをつないだだけで、画像そのものの参照範囲や画素の並べ替え方が変わるわけではありません。

## Controls：SizeとRank

### Size：どれだけ広い範囲を見るか

**Size**は、着目する画素の周囲を何ピクセル分参照するかを決めます。Sizeが**1**なら上下左右と斜めの隣接画素に中央の画素を加えた**3×3＝9画素**を対象にします。Sizeを大きくすると、さらに離れた画素も順位の選択候補に入ります。

- **小さいSize**：1画素程度の明暗の点を抑える出発点。細部をどこまで残せるか確認しやすい。
- **大きいSize**：細かな模様をまとめ、色や明るさのまとまりを強調する。水彩画に似た見た目を作れる反面、細い輪郭や文字も変形しやすい。

Sizeは「ぼかす強さ」ではなく、**どの範囲から画素を選び直すか**を決める値です。大きくしたから必ず滑らかになるわけではありません。

### Rank：暗い側・中央・明るい側のどこを選ぶか

**Rank**は0〜1の範囲で、参照した画素を値順に並べたときの選択位置を指定します。

| Rank | 選ぶ位置 | 起こりやすい変化 |
| --- | --- | --- |
| **0** | 最も低い値（暗い側） | 孤立した明るい点が抑えられ、暗い領域が広がりやすい |
| **0.5付近** | 中央付近の値 | 周囲の大多数と異なる明暗の点を抑えやすい |
| **1** | 最も高い値（明るい側） | 孤立した暗い点が抑えられ、明るい領域が広がりやすい |

ここで選ばれるのは、マニュアルの説明では**順位に対応する画素の色**です。「Rank 0.5ならRGB各チャンネルを個別に中央値へする」とは断定できません。内部で画素の「値」をどの成分から求めるかも、参照した範囲の資料だけでは特定できません。

明るい点だけが目立つならRankを低い側へ、暗い点だけなら高い側へ寄せると変化を確認しやすくなります。一方、極端な0や1では近傍の暗部・明部が強く広がるため、通常のノイズ除去ではまず0.5付近から調整します。

## 制作例

### 1. 固定した点状ノイズを目立たなくする

暗い壁に白い点、明るい壁に黒い点が少数散っている映像を想定します。粒が小さく、周囲の画素の多くが本来の壁の色であることが前提です。

1. **MediaIn → Rank Filter → MediaOut**と接続します。
2. **Size = 1、Rank = 0.5付近**から始めます。中央画素を含む9画素の順位を使うため、孤立した点が周囲の色に置き換わるか確認します。
3. 白い点が残るときはRankをやや低い側へ、黒い点が残るときは高い側へ動かして比較します。
4. ノイズと同程度に細い線、髪、文字、光点が消えていないか、元画像と交互に確認します。

これは近傍画素を使う**空間的な処理**です。前後フレームを比較して動くノイズだけを判定する時間方向のノイズ除去ではありません。被写体の細部まで失う場合は、Sizeを戻し、Effect Maskで場所を限定するか別のノイズ処理を検討します。

### 2. 水彩画風に輪郭と面を単純化する

風景写真の木々や建物の細かい模様を整理し、色の面がつながったような見た目を作る例です。

1. 元画像をRank FilterのInputへ接続します。
2. **Sizeを段階的に上げ**、模様と輪郭がどこから変わるか観察します。
3. **Rankを0.5から少し高い側へ**動かし、明るい面と暗い面の残り方を比較します。
4. 強すぎる場合はSizeを戻すか、Settingsタブの**Blend**で元画像と加工後を混ぜます。

21.1公式マニュアルには、**Size = 7、Rank = 0.7**で水彩画風の効果を作る例があります。この値は作例の設定であり、どの解像度・素材にも適する推奨初期値ではありません。元画像の細部を残したい場合は小さなSizeから決めます。

### 3. 一部分だけに適用する

人物の衣装や背景の壁だけを絵画的にし、顔の目元・口元などの細部を残したい場合は、Polygonなどで加工したい場所を囲み、そのMask出力をRank Filterの青いEffect Mask入力へ接続します。

~~~text
MediaIn → Rank Filter → MediaOut
              ↑
       Polygon（Effect Mask）
~~~

Rank FilterはMask入力がなくても画像全体を処理できます。Maskを使うと**加工結果を表示する範囲**を制限できますが、境界付近では元画像と加工画像の違いが目立つ場合があります。マスクの輪郭や柔らかさも含めて確認してください。

## 似たノードとの使い分け

| ノード | 画素への作用 | 主な用途 |
| --- | --- | --- |
| **Rank Filter** | 近傍の画素を値順に並べ、選んだ順位の画素色へ置換 | 孤立した明暗の点、絵画的な面の整理 |
| [Blur](./blur) | 周囲の画素をフィルターで混ぜる | 硬い輪郭を柔らかくする |
| [Erode Dilate](./erode-dilate) | 近傍の暗い値・明るい値を広げ、境界の太さを変える | キー抜きマットや図形の縮小・拡張 |
| [Sharpen](./sharpen) | 輪郭のコントラストを強める | ぼけた印象の補正 |

Rankを0または1にすると、暗部・明部の拡張という点ではErode Dilateに似た見た目が出る場合があります。ただし、**操作パラメータと用途が同じという意味ではありません**。マットの境界を何ピクセル分内外へ移したいかが目的なら、まずErode Dilateを検討します。

## 思ったように変わらないとき

- **効果がほとんど分からない**：元画像が滑らかで、周囲の画素値が似ている可能性があります。変化の分かる細部をViewerで拡大し、Sizeを少しずつ上げて比較します。
- **明るい点を消したいのに暗い点が強調される**：Rankを極端な側へ寄せすぎていないか確認します。元画像へ戻して0.5から調整し直します。
- **輪郭や文字まで消えた**：Sizeを小さくします。Rank Filterはノイズと細部を自動的に識別しません。
- **画面の一部しか変わらない**：青いEffect Mask入力と、そのマスクの表示範囲を確認します。
- **効果が強すぎる**：SizeまたはRankを調整し、必要ならSettingsタブのBlendで元画像の割合を増やします。
- **動くノイズだけを除去したい**：Rank Filterは前後フレームの比較を前提とする処理ではありません。目的に合う時間方向の処理を検討します。

## 実機例：Sizeを保ってRankを変える

<!-- capture-case:S65 -->

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の固定チャートを接続しました。通常の比較は両Viewer Color／40%です。内部REGIDは`RankFilter`でした。

[![LoaderからRankFilter1とMediaOut1へ接続した実機Graph](/img/fusion/captures/S65/graph.png)](/img/fusion/captures/S65/graph.png)

[![Rank FilterのSize7とRank0.5を示すInspector](/img/fusion/captures/S65/inspector.png)](/img/fusion/captures/S65/inspector.png)

[![Size7とRank0.5では右の細い格子や小さい文字が減り、太い色パッチが残る](/img/fusion/captures/S65/compare.png)](/img/fusion/captures/S65/compare.png)

Size7、Rank0.5では、細い格子や小さな文字が減り、太い色パッチは残っています。細部を保ったままノイズだけを消した例ではありません。

同じSize7でRankを0にすると、暗い領域が広がって細い白線や白点が減りました。

[![Size7を保ちRankを0へ下げたInspector](/img/fusion/captures/S65/rank0-inspector.png)](/img/fusion/captures/S65/rank0-inspector.png)

[![Rank0では右の暗い領域が広がり、細い白線と白点が減る](/img/fusion/captures/S65/rank0.png)](/img/fusion/captures/S65/rank0.png)

Rankを1にすると、明るい領域が広がり、白点や格子が太くなります。Sizeは参照する周囲の広さ、Rankはその中から選ぶ値の位置という違いを、同じチャートで比較できます。

[![Size7を保ちRankを1へ上げたInspector](/img/fusion/captures/S65/rank1-inspector.png)](/img/fusion/captures/S65/rank1-inspector.png)

[![Rank1では右の明るい領域が広がり、白点と格子が太くなる](/img/fusion/captures/S65/rank1.png)](/img/fusion/captures/S65/rank1.png)

最後はSize7／Rank0.5へ戻して保存しました。実写、salt-and-pepper noiseの除去、Mask、Alpha、境界処理、内部の順位付け、性能は未確認です。

[再現用Graph](/img/fusion/captures/S65/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S65/capture.json)

## バージョンと根拠

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 99「Filter Nodes」、**pp.2341–2343**。Rank Filterの入力、Size、Rank、Size 7／Rank 0.7の作例、Effect Maskの適用順、共通SettingsのBlendを確認しました。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/jp/support/)。

ノイズ除去や部分加工の手順は、確認した仕様から組み立てた運用例です。S65の内部REGID、Size7／Rank0・0.5・1と出力表示は確認済みです。画素単位の結果、内部の順位付け、全既定値・数値範囲、実写ノイズ除去、Edition差は未確認のため、verificationはpartialを維持します。
