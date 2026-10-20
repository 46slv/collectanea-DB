---
title: Vector Distortion
description: source Imageまたは別のDistort Imageに含まれるvector channelをX/Y別に読み、2D Imageをその方向と強さに沿って変形するNode。
doc_type: node
term_id: vector-distortion
term_short: "Vector Distortionは、vector channelをX/Yの変位量として使い、Imageを歪ませるNode。"
verification: partial
aliases: [Vector Distortion, Dst]
concepts: [image-data, auxiliary-channels, motion-vectors]
nodes: [Vector Distortion]
node_family: warp
controls: [X Channel, Y Channel, Flip Channel X, Flip Channel Y, Lock Scale X/Y, Scale, Lock Bias X/Y, Center Bias, Edges, Glow]
inputs: [image, image, mask]
outputs: [image]
tasks: [warp-image]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-20"
---

# Vector Distortion

Vector Distortionは、Imageに含まれるvector channelをX方向とY方向の変位量として読み、画素の参照位置をずらして画像を歪ませるNodeです。ここでのvector channelはImageの補助チャンネルであり、独立した「Vector入力端子」ではありません。[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels)でデータの持ち方を確認できます。

vector dataは変形したいImage自身から使うことも、別のImageをDistort入力へつないで参照することもできます。Optical Flowで作ったmotion vectorを使って、別素材へ動き由来の歪みを与える構成も作れます。

## 役割

```text
動きの参照動画 → Optical Flow → Distort（緑・Image）─┐
                                                   ├→ Vector Distortion → 変形後Image
変形したい画像 ───────────────→ Input（橙・Image）──┘
必要な範囲のMask ───────────→ Effect Mask（青）
```

Vector Distortionが行うのは、vector fieldを生成することではなく、既に存在するchannel値を「Xへどれだけ、Yへどれだけ動かすか」という変位として使うことです。

別のDistort Imageを接続した場合は、そのImageのvector channelがmain Input側のvector channelより優先されます。

## 入力

### Input

オレンジ色のInputへ、実際に歪ませたい2D Imageを接続します。この入力は必須です。

このImage自身がvector channelを持っている場合、Distort入力を使わなくてもそのchannelを変形へ利用できます。反対にDistortへ別の画像をつないだときは、どちらの画像からベクトルを読むかを明示的に確認してください。

### Distort

緑色のDistort入力には、変位の元になるvector channelを持つ**2D Image**を接続します。Vector値だけを渡す独立端子ではありません。この入力は任意で、未接続ならInput側のvector channelを参照します。

21.1 Manualでは、Optical Flowで生成したvector channelをここへ渡し、別のImageを変形する構成が示されています。Distortを接続すると、main Input側にあるvector channelよりこちらが優先されます。

### Effect Mask

青色のEffect Mask inputへMaskを接続すると、Vector Distortionの効果を必要な領域だけに限定できます。

MaskはNodeの処理後に適用されます。

## 出力

出力端子はImageが1つです。選択したX/Yチャンネルの値に従って変形された2D Imageを出力します。

後段では通常のImageとしてMergeやColor、Blurなどへ接続できます。

## 主な設定項目

### X Channel / Y Channel

Distort ImageのどのchannelをX方向・Y方向の変位へ使うかを選びます。

Distort Imageがない場合はmain Input側のchannelを参照します。

### Flip Channel X / Flip Channel Y

選んだchannelによる変位方向を、軸ごとに反転します。

warpが期待と逆方向へ動く場合に、vector sourceを作り直さず向きだけ反転できます。

### Scale / Lock Scale X/Y

Scaleはvector値へ倍率を掛け、変形量を強めたり弱めたりします。

Lock Scale X/Yを分離すると、XとYで別々の倍率を設定できます。

### Center Bias / Lock Bias X/Y

Center Biasはvectorによる変位へ一定量のoffsetを加えます。X/Yを分離して個別に調整することもできます。

### Edges

warpで元画像の外側が見えるときの扱いを選びます。

- **Canvas** — 露出した領域をcanvas colorで埋める
- **Duplicate** — edge pixelを複製して伸ばし、空いた領域を埋める

### Glow

vector distortionの結果へGlowを加えます。

## 主な用途

- Optical Flowで得たmotion vectorを使い、別のImageへ同じ動き由来の歪みを与える
- vector channelを持つrenderやEXRを使い、画面内の動きに沿って2D Imageを変形する
- Scaleを下げてvector由来のwarpを弱くし、強すぎる変形量を調整する
- Effect Maskで顔や衣服など一部分だけにvector distortionを適用する

## 最小構成

別のclipからvectorを作って変形へ使う場合:

```text
Guide clip → Optical Flow → Distort
                              ↓
Image to warp ─────────→ Vector Distortion → MediaOut
```

まずOptical Flowの出力ImageがX/Yのvector channelを保持しているか確認します。次にVector Distortionで**X ChannelとY Channelをそれぞれ選び**、Scaleを小さく動かして変形方向を確かめます。画像が動かないときはDistortの接続だけでなく、参照先のchannel選択も確認します。

## 運用例

動いている布のclipから動きだけを取り出し、別のgraphicsへ同じ方向の揺れを与える場合:

1. 布のclipをOptical Flowへ通してvector channelを生成します。
2. Optical Flowの出力をVector DistortionのDistortへ接続します。
3. graphicsをInputへ接続します。
4. X Channel / Y Channelで使用するvector channelを選びます。
5. Scaleで変形量を調整します。
6. 必要ならEffect Maskで歪ませる範囲を限定します。

これは21.1 ManualのBasic Node SetupとControlの役割から再構成した運用例です。特定shotでの見た目は実機確認していません。

## Vector Warpとの違い

- **Vector Distortion** — 選んだX/Y channelをそのまま2D Imageの変位量として使う
- **Vector Warp** — precomputed Vector / Back VectorとReference Frameを使い、Textureをsequenceの動きへ追従させる

単純にvector fieldでImageを押し曲げたい場合はVector Distortion、reference frame基準でtexture追従やwarp map生成を行いたい場合はVector Warpを先に検討します。

## 挙動と注意点

Vector Distortion自身はmotion vectorを推定しません。Optical Flowなど、必要なvector channelを作る前段が別途必要です。

Distortを接続した場合はそのvector channelがmain Input側より優先されます。別のImageへ変形を転用するときは、**変形されるのはInput側の画像、動かし方を指定するのはDistort側の画像**と分けて考えてください。Vector channelのX/Y成分を取り違えると意図しない方向へ歪むため、ScaleやFlipの前にX Channel / Y Channelの割り当てを確かめます。

EdgesをDuplicateにすると外周pixelを引き伸ばして空きを埋めるため、edge付近ではsmearが見える場合があります。

## 関連Node

- [Optical Flow](../optical-flow/optical-flow)
- [Vector Transform](./vector-transform)
- [Vector Warp](./vector-warp)
- [Vector Motion Blur](../blur-filter/vector-motion-blur)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2983–2985で、Input / Distort / Effect Mask、Distort側vectorの優先、X Channel / Y Channel、Flip、Scale、Bias、Edges、Glowを確認しました。Fusion Fundamentals Chapter 77 p.1698でもforward XY Vector channelをVector Distortionへ利用できることを確認しています。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
