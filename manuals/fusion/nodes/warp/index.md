---
title: Warp / Distortノード
description: FusionのWarpノードを、手動の格子変形・変位マップ・レンズ補正・4点変形・モーションベクトルから選ぶためのガイド。入力データと実際の接続例を整理する。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, warp-image, distort]
updated: "2026-10-14"
---

# Warp / Distortノード

Warp系ノードは、2D画像の**どの位置の画素を参照して出力を作るか**を変え、画像の形や遠近、ゆがみを調整します。撮影素材の看板へ別画像をはめ込む処理と、水面越しの像を波打たせる処理は、どちらもWarpですが、必要な入力データが異なります。

最初に決めるのは「何で変形を指定するか」です。画面上の点を手動で動かすのか、別の画像を変位マップとして読むのか、撮影素材の動きから推定したベクトルを使うのかで、選ぶノードが変わります。

## やりたいことから選ぶ

| やりたいこと | ノード | 入力と判断の目安 |
| --- | --- | --- |
| ノイズ模様に沿って熱気・水面のようにゆがませる | [Displace](./displace) | 変形する画像に加え、[Fast Noise](../generators/fast-noise)などで作った**変位マップ画像**を渡す。 |
| 服の一部や顔の輪郭を、Viewer上の格子点で細かく動かす | [Grid Warp](./grid-warp) | 画像と、手で編集するSource / Destinationの格子を使う。外部のベクトル素材は不要。 |
| ロゴ・画面を看板などの四辺形へはめ込む | [Corner Positioner](./corner-positioner) | ロゴ画像の4隅を置きたい位置へ移す。動きの追跡は別工程。 |
| 遠近の付いた画面・紙面を正面向きへ展開する | [Perspective Positioner](./perspective-positioner) | 撮影画像上の4点を指定して、斜めの平面をいったん平らにする。 |
| 実写レンズのゆがみを除き、合成後に戻す | [Lens Distort](./lens-distort) | 同じレンズ補正条件でUndistortとDistortを往復する。 |
| 別画像に入ったX/Yベクトルに沿って画像を動かす | [Vector Distortion](./vector-distortion) | 画像内のVector channel、または別のDistort画像のVector channelを参照する。 |
| あるフレームで描いた傷・模様を、変形する布や肌へ追従させる | [Vector Warp](./vector-warp) | **Studio専用**。連続フレームと、事前計算したVector / Back Vector、基準フレーム用の静止画像を用意する。 |
| ベクトルの移動・拡大・平滑化を先に調整する | [Vector Transform](./vector-transform) | **Studio専用のVector Warping系**。画像の見た目を直接移動させる通常のTransformとは役割が異なる。 |
| 円形の膨らみや凹みを加える | [Dent](./dent) | 中心・範囲・強さなどで局所的な変形を作る。 |
| 周期的な波紋を作る | [Drip](./drip) | Shapeや波の設定から変形を作る。別の変位マップは必要ない。 |
| 画像を渦巻き状にねじる | [Vortex](./vortex) | 中心・範囲・角度・Powerで巻き込み方を指定する。 |
| 横方向の模様を円形や放射状へ読み替える | [Coordinate Space](./coordinate-space) | 画像のRectangular（X/Y）座標とPolar（距離/角度）座標を相互変換する。 |

ここでいう**変位マップ**は、画像の画素値を「どの方向へ、どれだけ参照位置をずらすか」の指示として読むデータです。**モーションベクトル**は、フレーム間で画素がどう動いたかを表すX/Yの値です。両者は同じ「画像」形式に格納されていても意味が違い、そのまま置き換えられるとは限りません。ベクトルの格納先については[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels)も参照してください。

## 変形方法を4つに分けて考える

### 1. Viewerで形を直接合わせる

[Corner Positioner](./corner-positioner)は4隅の対応付け、[Grid Warp](./grid-warp)は格子点の対応付けに向いています。Corner Positionerはポスターやスクリーンなどの**1枚の平面**、Grid Warpは曲がった輪郭や画像の**一部分を細かく変える**場合に選びます。

撮影された斜めの面をまず平らにして修正したいときは、[Perspective Positioner](./perspective-positioner)で平面を展開し、Paintなどで編集してからCorner Positionerで戻す方法があります。往復で再サンプリングが起こるため、細線や文字のにじみは確認が必要です。

### 2. 画素値から変形を作る

[Displace](./displace)は、別の入力画像のRed / Green / Blue / Alpha / Luminanceなどを参照して位置をずらします。Fast Noiseの明暗が変化すれば、同じ被写体でも場所ごとに異なるゆがみを作れます。自動的に被写体の動きを追跡するものではありません。

一方、[Dent](./dent)、[Drip](./drip)、[Vortex](./vortex)はノード内部の中心・形状・強さなどから変形を作ります。「波を作りたいだけ」なら、変位マップを用意するよりDripが短い構成になる場合があります。

### 3. 動きの情報に従って変形する

[Vector Distortion](./vector-distortion)はVector channelを画像のX/Y方向の変位に使います。元画像自身にVector channelがあればそれを読み、別のDistort入力にベクトル入り画像を接続すれば、そちらの情報を使用します。

[Vector Warp](./vector-warp)は用途が異なります。たとえば、服のしわが動く動画に、ある1フレームで描いた模様を貼る場合です。[Optical Flow](../optical-flow/optical-flow)などが作成したVector / Back Vectorを持つ**連続フレーム**と、模様を描いた**基準フレームの静止画像**を渡します。[Vector Transform](./vector-transform)は、その前後でベクトルやUV情報の大きさ・位置・滑らかさを調整する役割です。

Vector WarpとVector Transformは、21.1マニュアルのChapter 112「Vector Warping Toolset (Studio Version Only)」に含まれます。通常のWarp一覧にあるVector Distortionと、Edition条件まで同一と考えないでください。

### 4. レンズ・座標系を補正する

[ Lens Distort ](./lens-distort)は、撮影レンズの収差由来の幾何学的ゆがみを取り除いたり、元のゆがみへ戻したりする用途です。手動のGrid Warpで画面を似た形へ曲げることはできても、レンズ補正の往復を同じ条件で管理する目的ならLens Distortを選びます。

[Coordinate Space](./coordinate-space)は被写体の追跡ではなく、RectangularとPolarの座標変換です。横方向へ動かした模様を円周状へ配置したい場合や、放射状のパターンを作る場合に使います。

## 接続例：熱気で背景をゆらす

~~~text
撮影画像 ────────────────→ Displace（Input）────→ 出力
Fast Noise（ゆらぐ明暗）──→ Displace（Foreground Image）
~~~

1. 撮影画像をDisplaceのInputへ、Fast NoiseをForeground Imageへ接続します。
2. Fast Noiseのパターンを動かし、DisplaceのTypeとRefraction Channel、強さを調整します。
3. 壁の直線や建物の輪郭が、ノイズの位置に応じて揺れているか確認します。
4. 熱気が必要な場所だけにしたい場合は、DisplaceのEffect Maskへ別のマスクを接続します。

この例ではFast Noiseの模様が**変位の指示**になり、元の映像の画素が別の位置から読み直されます。ノイズ画像そのものを上に重ねる処理ではありません。背景を動きに追従させる必要があるなら、別途トラッキングを加えます。

## 接続例：動く看板の画面を差し替える

~~~text
差し替える画面 → Corner Positioner → Planar Transform ─┐
                                                       ↓
撮影素材 ─────────────────────────────────────────────→ Merge → 出力
~~~

まず撮影素材を[Planar Tracker](../tracking/planar-tracker)で追跡し、その解析結果から[Planar Transform](../tracking/planar-transform)を用意します。基準フレームでCorner Positionerの4点を看板へ合わせ、Planar Transformで撮影中の平面移動へ追従させ、Mergeで撮影素材に合成します。

**4点を合わせることと、時間方向に追うことは別の処理**です。看板が動いているのに1フレームだけ形が合う場合、まず追跡データとPlanar Transformを確認し、その後にCorner Positionerの4点を見直します。反射、前景の遮蔽、モーションブラーは別途合成調整が必要です。

## 接続例：布に描いた模様をフレーム間で追う

~~~text
撮影素材 → Optical Flow ─────→ Vector Warp（Input）──→ 出力
基準フレームで描いた静止画 ─→ Vector Warp（Texture）
~~~

最初に布がよく見えるフレームを基準にして模様を描きます。Optical Flowで撮影素材からVector / Back Vectorを生成し、Vector Warpに接続します。Vector WarpのReference Frameを模様の基準フレームに合わせ、Generate Warp + Mapで変形の結果を確認します。

模様がしわに沿わず滑るなら、すぐにWarpの強さを変える前に、Optical Flowのベクトルが遮蔽や大きな形状変化の付近で破綻していないか確認します。これは位置の推定を基にした追従であり、布の3D形状や隠れた面を復元するものではありません。

## 接続例：レンズ補正を往復する

~~~text
撮影素材 → Lens Distort（Undistort）→ 3D/Graphics合成 → Lens Distort（Distort）
~~~

実写の曲がった直線をいったん補正し、平らになった映像へ3Dや文字を合わせ、最後に同じレンズ設定で歪みを戻します。両側でレンズモデルや補正条件が異なると位置がずれます。強い補正で画像の外側が切れる場合は、Lens DistortのEdgesやClipping Modeと、合成中の画像領域を確認してください。

## Effect Maskと画像のAlpha

Warp系の多くの2Dノードには、効果を適用する範囲を指定する**Effect Mask**入力があります。これは入力画像が持つ透明度（Alpha）とは別のデータです。たとえばDisplaceへEllipse Maskを接続すれば、マップが作るゆがみを楕円内へ限定できます。マスクの白黒は**処理をどこに適用するか**を決め、変位マップの明暗は**どこから画素を参照するか**を決めます。

マスクの基礎は[マスク（Mask）](../../learn/02-data/mask)を参照してください。特にVector Warpなど、ほかのWarpノードと入力構造が異なるものでは、個別記事の端子説明を優先します。

## うまくいかないときの切り分け

| 症状 | 先に確認すること |
| --- | --- |
| 何も変形しない | 変位マップやVector channelが接続されているか、マップに差があるか、Effect Maskが全黒になっていないか。 |
| 狙った方向と逆に動く | DisplaceのX/Y割り当て、Vector DistortionのX/Y channelと符号、元データの座標規約。 |
| 動画で貼り付けた模様が滑る | 4点配置の問題か、Planar Tracker / Optical Flowの追跡の問題かを分けて確認する。 |
| 画像端が黒い、欠ける | 元画像の外側を参照していないか、Edges / Clippingの設定、画像の有効領域を確認する。 |
| 細線や文字がぼやける | Corner / Perspectiveの往復や強い再サンプリング、格子変形の強さを見直す。 |
| ベクトルをつないでも変形しない | Vector / Back Vectorが本当に保存されているか、接続先が要求するデータ型とチャンネルが合っているかを確認する。 |

## 出典と確認範囲

一次資料はBlackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）です。Chapter 123「Warp Nodes」pp.2960–2989（Coordinate Space、Corner Positioner、Dent、Displace、Drip、Grid Warp、Lens Distort、Perspective Positioner、Vector Distortion、Vortex）と、Chapter 112「Optical Flow」pp.2629–2633（Vector Warping Toolset、Vector Transform、Vector Warp）に基づき、分類・入力データ・利用例を整理しました。

[Blackmagic Design公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

本ページはノードの選び方と接続の入口です。各ノードの正確な端子、Inspector設定、既定値、数値範囲、Host / Edition差は個別記事と実機を優先してください。ここに示す構成例はマニュアルを基にした実用例であり、すべての素材や21.1実機での結果を検証したものではありません。
