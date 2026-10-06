---
title: Grid Warp
description: Source gridとDestination gridの対応を直接編集し、2D Imageの一部または全体をmesh状に曲げて変形するNode。
doc_type: node
term_id: grid-warp
term_short: "Grid Warpは、sourceとdestinationのmeshを編集してImageを局所的に曲げるNode。"
verification: partial
aliases: [Grid Warp, Grd]
concepts: [image-data]
nodes: [Grid Warp]
node_family: warp
controls: [Source, Destination, Selection Type, Magnet Distance, Magnet Strength, X Grid Size, Y Grid Size, Subdivision Level, Center, Angle, Size, Edit Grid, Edit Rectangle, Edit Line, Set Mesh to Entire Image, Render Method, Anti-Aliasing, Filter Type, Black Background]
inputs: [image, mask]
outputs: [image]
tasks: [warp-image]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Grid Warp

Grid Warpは、Imageの上にmesh状のgridを置き、元の形を表す**Source grid**と、変形後の形を表す**Destination grid**の対応を編集してImageを曲げるNodeです。

数値mapではなくViewer上のcontrol pointを直接動かせるため、画面の一部を押す、引く、膨らませる、形を合わせるといった局所的な変形に向いています。

## 役割

```text
Image → Grid Warp → warped Image
          │
          ├─ Source grid      元画像上の対応位置
          └─ Destination grid 出力側で移動した位置
```

Grid Warpは、Source gridの各位置がDestination gridの対応位置へ移るようにImageを変形します。

SourceとDestinationを同じ形から始め、Destination側のcontrol pointだけを動かすと、どの領域をどの方向へ変形したか追いやすくなります。

## 入力

### Input

オレンジ色のInputへ、変形したい2D Imageを接続します。

### Effect Mask

青色のEffect Mask inputへMaskを接続すると、Grid Warpの結果を必要な領域だけに限定できます。

MaskはNodeの処理後に適用されます。

## 出力

gridの対応関係に従って変形された2D Imageを出力します。

後段では通常のImageとしてMergeやColor、Blurなどへ接続できます。

## Source gridとDestination grid

InspectorのSource / Destinationで、Viewer上で編集するgridを切り替えます。表示・操作できるのは一度に片方です。

- **Source** — 元のImage上で「どこにあったpixelか」を定義する
- **Destination** — その位置を「出力上のどこへ動かすか」を定義する

Copy Src to Dest / Copy Dest to Srcを使うと、一方のgrid形状をもう一方へコピーできます。変形を始める前に両方を同じ状態へ揃える用途に向いています。

## 主な設定項目

### Selection Type

control pointを動かしたとき、どこまで一緒に動かすかを選びます。

- **Selected** — 選択したpointだけを動かす
- **Region** — click開始時に一定範囲へ入っていたpointをまとめて動かす
- **Magnetic** — drag中に範囲へ入ったpointも含めて影響させる

Region / MagneticではMagnet DistanceとMagnet Strengthを使い、影響範囲とfalloffを調整します。

### X Grid Size / Y Grid Size

gridの分割数を増減します。交点ごとにcontrol vertexが作られます。

**変形を作った後にGrid Sizeを変えるとgrid全体がresetされます。** 詳細調整を始める前に必要な分割数を決めます。

### Subdivision Level

control vertex自体を増やさず、vertex間の分割を増やして変形を滑らかにします。

Subdivisionを増やすほど滑らかになりやすい一方、renderは重くなります。

### Center / Angle / Size

grid全体の位置・回転・scaleを調整します。

Centerは各vertexのanimationとは別にgrid全体を移動できます。21.1 Manualでは、顔の動きをTrackerで追い、Grid WarpのCenterをTrackerへ接続して、唇など局所変形のgridを顔へ追従させる例が示されています。

### Edit Grid / Edit Rectangle / Edit Line

- **Edit Grid** — 通常のmeshをViewer上で直接編集する
- **Edit Rectangle** — gridの外形・Centerを矩形controlで調整する
- **Edit Line** — organic shapeの外周へsplineを描き、その形に沿うgridを自動生成する

Edit LineではPoint Tolerance、Oversize Amount、Snap Distanceでgridの密度・外側の余白・splineへの吸着を調整します。

### Render Method / Anti-Aliasing / Filter Type

Render tabでwarpの表示・render品質を調整します。

Wireframeは設定中の確認に向き、Renderはfinal resolutionの結果を出します。高品質なanti-aliasingやSuper Sampleは品質を上げる代わりにrender時間が増えます。

### Black Background

gridの外側にあるsource pixelを保持するか、blackへ置き換えるかを切り替えます。

## 主な用途

- shot内の一部分だけを押し引きして、framingや形状を微調整する
- still Imageの一部を少しずつ動かし、静止画へ局所的なanimationを加える
- 顔・唇・布・有機的な輪郭にgridを合わせ、局所変形を作る
- 2つのGrid Warpを別領域へ使い、複数箇所を独立して変形する

## 最小構成

```text
MediaIn → Grid Warp → MediaOut
```

最初はSource gridを作り、Copy Src to Destで同じ形をDestinationへコピーします。その後Destination側の必要なpointだけを動かし、どの領域がどう変わるか確認します。

## 運用例

still Imageへ小さな動きを加える場合:

1. Grid WarpをImageの後段へ追加します。
2. X / Y Grid Sizeを必要な密度へ設定します。
3. Source gridを対象領域へ合わせます。
4. SourceをDestinationへコピーし、初期状態を一致させます。
5. Destination側で動かしたいpointを少し移動します。
6. mesh animationを有効にし、別frameでDestination gridを変形します。
7. 必要ならSubdivision Levelを上げ、曲がり方を滑らかにします。

21.1 Manualでは、Grid Warpでshot内の領域を移動してreframeしたり、stillへわずかな動きを付けたりする用途が示されています。

## Displace / Vector Distortionとの違い

- **Grid Warp** — Viewer上のmeshを直接編集して形を作る
- **Displace** — 別Imageの画素値を変位mapとして使う
- **Vector Distortion** — vector channelをX/Y方向の変位量として使う

「画面を見ながらここを押したい」という局所調整ならGrid Warp、別dataから自動的に変位を作るならDisplaceやVector Distortionを先に検討します。

## 挙動と注意点

Grid Sizeは変形後に変更するとgridをresetするため、初期設定で決めます。

Subdivision、Anti-Aliasing、Super Sampleなどを高くすると品質は上がりますが、複雑なgridではrender時間が増えます。設定中は低負荷な表示を使い、final時に品質を上げる方が扱いやすくなります。

gridが複雑になりすぎた場合は、ViewerのStop Renderingで一時的にGrid Warpのrenderを止めながら細かいpoint調整を行えます。

## 関連Node

- [Displace](./displace)
- [Vector Distortion](./vector-distortion)
- [Corner Positioner](./corner-positioner)
- [Perspective Positioner](./perspective-positioner)
- [Planar Transform](../tracking/planar-transform)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2972–2978で、Input / Effect Mask、Source / Destination、Selection Type、Magnet、Grid Size、Subdivision、Center / Angle / Size、Edit modes、mesh copy / animation、Render tab、Viewer contextual controlsを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
