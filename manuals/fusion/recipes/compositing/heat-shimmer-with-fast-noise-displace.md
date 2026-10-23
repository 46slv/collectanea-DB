---
title: Fast NoiseとDisplaceで熱気の揺らぎを作る
description: 映像と変位マップを別入力に分け、Fast Noiseの時間変化をDisplaceへ渡して局所的な熱気の揺らぎを作る。
doc_type: recipe
verification: partial
aliases: [heat shimmer, heat haze, heat distortion, 熱気, 陽炎]
concepts: [image-data, mask-data]
patterns: [limit-effect-with-mask]
nodes: [Fast Noise, Displace, Polygon]
tasks: [heat-distortion, warp-image, composite]
prerequisites: [image-mask-data]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-23"
---

# Fast NoiseとDisplaceで熱気の揺らぎを作る

## できあがるもの

道路や排気口などの熱い場所の上で、**奥にある映像の輪郭がゆっくり揺れて見える**効果を作ります。ノイズ模様を映像へ重ねるのではなく、ノイズの明暗を使って元映像の参照位置をずらします。

最初は固定した背景の直線や文字で変形を確認し、最後に熱気が立ち上る範囲だけへ効果を絞ります。これは熱流体の物理シミュレーションではなく、2Dの画像変形による表現です。

~~~text
MediaIn ───────────→ Displace ─────→ MediaOut
                       ↑
Fast Noise ─────────→ 緑: Foreground Image（変位マップ）
Polygon ────────────→ 青: Effect Mask（適用範囲）

MediaInの接続先: Displaceの橙 Input（変形する元画像）
~~~

## 必要なもの

- 熱気の背後に線・模様・建物など、揺れを確認できる映像
- **Displace**：元画像と変位マップを受け取る
- **Fast Noise**：時間変化する変位マップを生成する
- **Polygon**などのMask Node：効果を画面の一部へ限定するときに使う。最初の動作確認では省略できる

## 手順

1. Fusionページで映像のMediaInをDisplaceの**橙 Input**へ、Displaceの出力をMediaOutへ接続します。まずDisplaceだけをViewerで見て、映像が表示されることを確認します。
2. Fast Noiseを追加し、その出力をDisplaceの**緑 Foreground Image**へ接続します。この入力は画面へ重ねる前景ではなく、変位量を決める別画像です。Displaceでは元画像とこのマップの両方が必須です。
3. Displaceの**Type**を**X/Y**にします。まずX側の**Refraction Channel**に**Luminance**を選び、**X Refraction**を小さく変化させて、背景の直線が左右へ揺れることを確かめます。**Y Refraction**は最初は0に近い状態にし、横方向だけの違いを観察します。値を決め打ちせず、Viewerで歪みを確認しながら調整します。
4. Fast Noiseを単体でViewerへ表示し、模様が細かすぎないか確認します。**Scale**で模様の大きさ、**Contrast**で明暗差を調整します。必要なら**Lock X/Y**を切り替えて縦横のScaleを別々に変え、熱気の方向に合う模様を探します。縞や筋の形は実際のViewerで判断します。
5. Displaceへ表示を戻します。Fast Noiseの**Seethe Rate**を少しずつ上げ、数フレーム進めて揺れの速さを確認します。Seethe RateはNoise模様をフレームごとに変化させるため、Seetheへ個別にキーフレームを付けなくても動きます。
6. 横揺れだけでは単調な場合は、Displaceの**Y Refraction**も少し動かし、縦方向の変位を加えます。X/YモードではX用とY用の**Refraction Channel**を個別に選べます。どちらを変えた結果なのか分かるよう、まず一方ずつ調整します。
7. 画面全体で効果が確認できたら、Polygonなどで熱気の領域を囲み、Displaceの**青 Effect Mask**へ接続します。境界が目立つ場合はMaskの縁を滑らかにします。背景全体のゆがみと、熱気領域だけのゆがみを比較してください。
8. 最後に複数の時点で再生し、変位が強すぎて被写体の輪郭が崩れないか、Maskの境界が映らないか、画面端で不自然な伸びがないかを確認します。

## なぜこの構成で動くか

Displaceは元の2D画像と、画素値を変位量として読む**別の2D画像**を受け取ります。Fast Noiseの模様が変わるとDisplaceが参照する位置も変わり、元映像が揺れて見えます。

**変位マップ**は「どの方向へ、どの程度ずらすか」を決め、**Effect Mask**は「画面のどこに処理を適用するか」を決めます。Maskは変位マップそのものではありません。DisplaceのEffect Maskは、Manual上ではNodeの処理後に適用されます。

この分離を理解するには、[Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)と[Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)を参照してください。

## バリエーション

### 揺れをゆっくり流す

Fast Noiseの**Center**を時間変化させると、模様の位置を動かせます。**Seethe Rate**は模様自体を変化させます。どちらの動きを使っているか分けて調整すると、背景が一方向へ滑って見える状態と、熱気が揺らぐ状態を比較できます。

### 細かく揺らす

Fast NoiseのScaleとDetailを変えて細かな変化を加えます。ただしDetailを増やすほど計算が重くなるとManualに記載されているため、最初は大きな模様と小さな変位量で成立させます。

### 熱気の出る場所が動く

熱源に合わせてEffect Maskの位置も動かします。撮影カメラや熱源が動く素材では、Maskの位置合わせや追跡が別途必要です。このRecipeでは追跡精度までは扱いません。

## うまくいかないとき

| 症状 | 切り分けと対応 |
| --- | --- |
| Displaceの出力に映像が出ない | 橙Inputへ元画像、緑Foreground ImageへFast Noiseが入っているか確認。どちらも必須です。 |
| 映像がほとんど揺れない | DisplaceのX/Y Refractionを片方ずつ動かす。Fast Noise単体に明暗差があるか、Refraction Channelがその情報を読む設定か確認します。 |
| 動画にしても静止した歪みになる | Fast NoiseのSeethe Rateが変化を生む設定か確認し、同じ場所を異なるフレームで比較します。 |
| 映像全体が激しく波打つ | まずX/Y Refractionを弱め、次にFast NoiseのContrastやScaleを1つずつ変更します。 |
| 熱気の範囲が四角く見える | DisplaceのMask接続と境界の柔らかさを確認。Fast NoiseのEffect MaskとDisplaceのEffect Maskを混同しないようにします。 |
| 画面端が不自然になる | 変位を弱め、効果範囲を端から離して比較。入力画像の外側をどう参照しているかは素材とGraphで確認が必要です。 |

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連ノード

- [Displace](../../nodes/warp/displace)
- [Fast Noise](../../nodes/generators/fast-noise)
- [Polygon Mask](../../nodes/masks/polygon-mask)

## 出典と確認範囲

**DaVinci Resolve 21.1 Reference Manual**（Blackmagic Design、September 2026）に基づきます。

- Chapter 123、pp.2967–2969：Displaceの元画像・Foreground Image・Effect Mask、Radial / X/Y、Refraction Channel / Strength、Fast Noiseを用いた基本構成。
- Chapter 103、pp.2363–2365：Fast NoiseのNoise Detail / Brightness Map、Scale、Contrast、Detail、Center、Seethe / Seethe Rate。

**確認済み**：上記の入力役割、主な設定の働き、Fast NoiseをDisplaceのマップへ渡す基本構成。**制作手順はManualに基づく構成案**で、現行21.1実機での映像・描画・速度検証は行っていません。数値の既定値・範囲、特定素材に最適な値、版別の差は未確認のため断定していません。
