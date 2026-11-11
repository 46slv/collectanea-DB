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
controls: [Source, Destination, Selection Type, Magnet Distance, Magnet Strength, X Grid Size, Y Grid Size, Subdivision Level, Center, Angle, Size, Edit None, Edit Grid, Edit Rectangle, Edit Line, Set Mesh to Entire Image, Copy Src to Dest, Right-Click Here for Mesh Animation, Render Method, Anti-Aliasing, Filter Type, Black Background]
inputs: [image, mask]
outputs: [image]
tasks: [warp-image]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-22"
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

### Edit None / Edit Grid / Edit Rectangle / Edit Line

- **Edit None** — Viewerの編集用gridやcontrolを非表示にする
- **Edit Grid** — gridの交点をViewer上で直接編集する
- **Edit Rectangle** — gridの外形を矩形controlで調整する。このモードではCenterの画面上のcontrolも表示される
- **Edit Line** — 布や顔の輪郭などに沿って線（spline）を描き、その形に合うgridを生成する

Edit LineのPoint Toleranceは線に沿うgridの細かさ、Oversize Amountは線の外側まで含める幅、Snap Distanceは近くの交点を線へ寄せる範囲を調整します。

**Set Mesh to Entire Imageは、gridを画像全体へ広げると同時に、それまでの頂点調整をresetします。** X/Y Grid Sizeの変更もgrid全体をresetするため、どちらも細かな変形を始める前に済ませます。

### Render Method / Anti-Aliasing / Filter Type

Render tabでは、変形の結果をどの品質で計算するかを決めます。

- **Render Method: Wireframe** — 最も軽い格子表示。変形範囲と重なりを確認するときに使う
- **Render Method: Render** — 最終解像度で変形結果を計算する標準モード
- **Anti-Aliasing** — Wireframeでは線の表示に対するon/off、それ以外のモードでは品質レベルを選ぶ。品質を上げるほど処理負荷が増える
- **Filter Type** — Wireframe以外で使用する画素の計算方法。標準のArea SampleよりSuper Sampleは高品質を狙えるが、render時間が長くなる

調整中は表示負荷を抑え、形が決まってから最終品質へ戻します。

### Black Background

gridの外側にあるsource pixelを保持するか、blackへ置き換えるかを切り替えます。

## 主な用途

- shot内の一部分だけを押し引きして、framingや形状を微調整する
- still Imageの一部を少しずつ動かし、静止画へ局所的なanimationを加える
- 顔・唇・布・有機的な輪郭にgridを合わせ、局所変形を作る
- 2つのGrid Warpを別領域へ使い、複数箇所を独立して変形する

<!-- capture:S299 -->

## 実機例：出力グリッドを動かす

`Text+` を `Grid Warp` に接続し、出力側のグリッド中央付近を上へ大きくドラッグしました。左Viewerは入力、右Viewerは出力です。

移動後は文字が大きく引き伸ばされ、画面上にはグリッドのガイドが表示されます。この例は操作を誇張した静止画で、強い引き伸ばしが見えます。操作の配信方式と物理入力は未確認で、滑らかな補正結果やアニメーションを確認したものではありません。[接続と設定の記録](/img/fusion/captures/S299/readback.json)に条件を記載しています。

[![Text+をGrid WarpとMediaOutへ接続した構成](/img/fusion/captures/S299/graph.png)](/img/fusion/captures/S299/graph.png)

文字画像をGrid Warpへ入力します。

[![出力グリッドを選択したGrid Warpの設定](/img/fusion/captures/S299/controls.png)](/img/fusion/captures/S299/controls.png)

出力側グリッドを選択しています。

[![グリッド編集前の入力と出力](/img/fusion/captures/S299/before.png)](/img/fusion/captures/S299/before.png)

グリッドを動かす前の入力と出力です。

[![出力グリッドを上に動かして文字を大きく引き伸ばした例](/img/fusion/captures/S299/after.png)](/img/fusion/captures/S299/after.png)

中央付近を大きく動かすと文字が強く引き伸ばされます。

[再現用Graph](/img/fusion/captures/S299/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S299/capture.json)

<!-- /capture:S299 -->

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
6. 次の「meshをアニメーションさせる」の手順でDestination側のanimationを有効にし、別frameでpointを移動します。
7. 必要ならSubdivision Levelを上げ、曲がり方を滑らかにします。

21.1 Manualでは、Grid Warpでshot内の領域を移動してreframeしたり、stillへわずかな動きを付けたりする用途が示されています。

## meshをアニメーションさせる

**gridは初期状態では静止しています。** 単に別frameへ移動してpointを動かすだけでは、時間によって形が変わるanimationとして記録されません。

1. 動かしたい画像をGrid Warpへ接続し、X/Y Grid Sizeを決めます。
2. **Source**側で元画像に合うgridを配置し、**Copy Src to Dest**でDestinationを同じ形へ揃えます。
3. **Destination**を選び、Inspectorの**Right-Click Here for Mesh Animation**を右クリックして、表示されるメニューからgridのanimationを有効にします。
4. 開始frameでDestinationの必要な頂点を調整します。
5. 後のframeへ移動して同じgridの頂点を別の位置に動かします。前後を再生し、形が途中で補間されているか確認します。

このanimationは**Polychange spline**で管理されます。頂点を1つ動かした場合も、該当frameではgrid全体の頂点に対するkeyframeが追加・更新されます。「点ごとに別々の時間情報を作っている」とは考えないでください。

SourceとDestinationを取り違えないよう、形を変えるときはInspectorの選択状態を確認します。Centerは頂点の変形とは独立してgrid全体を移動できるため、画面内の被写体が移動するshotでは、頂点のanimationと位置追従を分けて扱えます。

## 運用例：顔の動きに追従する口元の補正

顔が左右に動くshotで唇の輪郭だけを変える場合は、次のように作業を分けます。

1. Grid WarpのSource gridを唇の周囲に合わせます。必要ならEdit Lineで輪郭を囲み、gridを作ります。
2. SourceをDestinationへコピーし、Destination側の頂点を少し動かして口元の変形を作ります。
3. 必要なframeでは上記のmesh animationを使い、開閉などの形の変化を付けます。
4. 別途Trackerで顔の特徴点の動きを追い、**Grid WarpのCenterをTrackerへ接続**してgrid全体を顔の移動へ追従させます。
5. 顔が移動するframeを確認し、変形する位置が唇から外れていないか、周辺の画像に不必要なゆがみが出ていないか確認します。

21.1マニュアルには、CenterをTrackerへ接続して頭の動きを追い、頂点のanimationは唇の形の補正に使う例があります。Trackerの設定や接続はshotに依存するため、追跡方式・位置合わせの値はここでは固定しません。

## Displace / Vector Distortionとの違い

- **Grid Warp** — Viewer上のmeshを直接編集して形を作る
- **Displace** — 別Imageの画素値を変位mapとして使う
- **Vector Distortion** — vector channelをX/Y方向の変位量として使う

「画面を見ながらここを押したい」という局所調整ならGrid Warp、別dataから自動的に変位を作るならDisplaceやVector Distortionを先に検討します。

## 挙動と注意点

Grid Sizeは変形後に変更するとgridをresetするため、初期設定で決めます。

Subdivision、Anti-Aliasing、Super Sampleなどを高くすると品質は上がりますが、複雑なgridではrender時間が増えます。設定中は低負荷な表示を使い、final時に品質を上げる方が扱いやすくなります。

gridが複雑になりすぎた場合は、ViewerのStop Renderingで一時的にGrid Warpのrenderを止めながら細かいpoint調整を行えます。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| 後のframeで頂点を動かしてもanimationにならない | **Right-Click Here for Mesh Animation**でmesh animationを有効にしたか。gridは初期状態では静止している。 |
| gridの編集位置が分からない | Source / Destinationのどちらを選んでいるか、Edit Noneになっていないか。CenterはEdit Rectangleで表示できる。 |
| 調整した変形が突然消えた | X/Y Grid Sizeの変更やSet Mesh to Entire Imageを行っていないか。いずれも頂点の調整がresetされる。 |
| 画像の一部だけ黒くなる | Render tabのBlack Backgroundと、Source gridの範囲を確認する。 |
| pointを動かすたびに表示が重い | SubdivisionやAnti-Aliasing、Filter Typeを確認する。複雑なmeshではViewerのStop Renderingを使い、一時的にrenderを止めて編集できる。 |

## 関連Node

- [Displace](./displace)
- [Vector Distortion](./vector-distortion)
- [Corner Positioner](./corner-positioner)
- [Perspective Positioner](./perspective-positioner)
- [Planar Transform](../tracking/planar-transform)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2972–2978で、Input / Effect Mask、Source / Destination、Selection Type、Magnet、Grid Size、Subdivision、Center / Angle / Size、Edit modes、gridのreset、Polychange splineによるmesh animation、Render tab、Viewer contextual controlsを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
