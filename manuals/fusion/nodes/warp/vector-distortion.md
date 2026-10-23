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
updated: "2026-10-22"
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

## 運用例：布の動きで別のグラフィックを歪ませる

撮影した布の動きから得たベクトルを、別に作ったグラフィックへ適用する例です。**布の映像は動かし方を決める側**、**グラフィックは実際に変形される側**として分けます。単に2枚を重ねる合成でも、グラフィックそのものを追跡する処理でもありません。

1. 布が動く映像を**Optical Flow**へ接続し、出力Imageに前後のフレームの動きを表すvector channelを生成します。布の模様が激しく変わる部分や画面外へ出る部分は、ベクトルの推定結果が不安定になる場合があります。
2. Optical Flowの出力をVector Distortionの**Distort（緑）**へ接続します。この枝は変形量の参照元です。
3. 変形したいグラフィックを**Input（オレンジ）**へ接続します。Distortへ布の映像をつないでも、出力で変形されるのはInput側です。
4. Inspectorの**X Channel / Y Channel**で、Distort側Imageに実際に入っている横方向・縦方向のvector channelをそれぞれ選びます。チャンネル名や並びを推測で指定せず、入力素材に含まれるデータを確認します。
5. **Scale**を小さく調整し、変形量と方向を確かめます。横方向だけ逆に見える場合は**Flip Channel X**、縦方向だけなら**Flip Channel Y**を比較します。**Center Bias**は方向別のずれを加える操作であり、vector fieldそのものを生成し直す機能ではありません。
6. 布の動きが必要な領域にだけ適用したいときは、**Effect Mask（青）**へMaskを接続します。Maskは処理結果の適用範囲を制限しますが、Distort側のvector channelを作り替えるわけではありません。
7. 最後に**Edges**を確認します。Canvasは露出した端をcanvas color（通常は透明または黒）で扱い、Duplicateは端の画素を引き延ばすため、周辺ににじみが出ることがあります。背景へ載せたい場合は、後段のMergeで合成結果を見ながら選びます。

布の映像とグラフィックで画角・位置・フレームの対応が違うと、ベクトルの大きな部分と歪ませたい場所が一致しないことがあります。Vector Distortionが自動で両素材を位置合わせするとは考えず、入力枝ごとに対象領域と時間の対応を確認してください。

## うまく変形しないとき

| 症状 | 順に確認すること |
| --- | --- |
| 画像がほとんど変形しない | Distort側またはInput側に**vector channel**が存在するか、X/Y Channelでそのデータを選んでいるか、Scaleが小さすぎないかを確認する。普通のRGB画像をDistortへつないだだけでは、必要なベクトルが生成されるわけではない。 |
| 意図した画像とは違うものが歪む | **Inputが変形対象、Distortがvector参照元**になっているか接続を見直す。DistortをつなぐとInput自身のvector channelより優先される。 |
| 横／縦の動きが逆になる | X ChannelとY Channelの割り当てを先に確認し、必要な軸だけFlip Channel X/Yを比較する。 |
| XとYが同じように動いてしまう | 選択名だけでなく、2つのchannelに入っている値が独立した横・縦成分なのか確認する。両軸へ同じデータを指定していないかも見る。 |
| 画面端が黒い・透明になる／端が伸びる | EdgesのCanvasとDuplicateを比較する。どちらも元画像の外に本来の画素を復元する機能ではないため、Scaleや合成時の画角も確認する。 |
| Maskを動かしても渦や歪みの方向が変わらない | Effect Maskは**処理後の効果範囲**を決める。変位方向はX/Y Channel、Flip、Scale、Biasと入力vectorで調整する。 |

これらは21.1 Manualに記載された端子・Controlの働きから組み立てた診断手順です。布やグラフィックを使った同一構成を21.1実機でレンダリング検証した結果ではありません。

## Vector Warpとの違い

- **Vector Distortion** — 選んだX/Y channelをそのまま2D Imageの変位量として使う
- **Vector Warp** — precomputed Vector / Back VectorとReference Frameを使い、Textureをsequenceの動きへ追従させる

単純にvector fieldでImageを押し曲げたい場合はVector Distortion、reference frame基準でtexture追従やwarp map生成を行いたい場合はVector Warpを先に検討します。

## 挙動と注意点

Vector Distortion自身はmotion vectorを推定しません。Optical Flowなど、必要なvector channelを作る前段が別途必要です。

Distortを接続した場合はそのvector channelがmain Input側より優先されます。別のImageへ変形を転用するときは、**変形されるのはInput側の画像、動かし方を指定するのはDistort側の画像**と分けて考えてください。Vector channelのX/Y成分を取り違えると意図しない方向へ歪むため、ScaleやFlipの前にX Channel / Y Channelの割り当てを確かめます。

EdgesをDuplicateにすると外周pixelを引き伸ばして空きを埋めるため、edge付近ではsmearが見える場合があります。

## 関連Node

- [Optical Flow](../optical-flow/optical-flow.md)
- [Vector Transform](./vector-transform)
- [Vector Warp](./vector-warp)
- [Vector Motion Blur](../blur-filter/vector-motion-blur)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2983–2985で、Input / Distort / Effect Mask、Distort側vectorの優先、X Channel / Y Channel、Flip、Scale、Bias、Edges、Glowを確認しました。Fusion Fundamentals Chapter 77 p.1698でもforward XY Vector channelをVector Distortionへ利用できることを確認しています。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
