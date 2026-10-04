---
title: Vector Warp
description: precomputed Vector / Back Vectorを持つImage sequenceの動きに合わせてTextureを変形し、柔らかい表面へ貼り付けるStudio専用Node。
doc_type: node
term_id: vector-warp
term_short: "Vector Warpは、motion vectorを使ってTextureやImageをframeごとの動きに追従させるNode。"
verification: partial
aliases: [Vector Warp, VWp]
concepts: [image-data, auxiliary-channels, motion-vectors, warp]
nodes: [Vector Warp]
node_family: warp
controls: [Set Frame, Reference Frame, Operation, Generate Warp, Generate Warp + Map, Apply Warp Map, UnWarp, Smooth UV, Grid Overlay, Merge Warp over BG]
inputs: [image, texture, vector]
outputs: [image, vector]
tasks: [warp-image, track-texture]
product_scope: fusion-studio
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Vector Warp

Vector Warpは、source clipのmotion vectorを使って、別のstill Imageやtextureをframeごとの動きに合わせて変形するNodeです。

服や肌のように形が変わる面へlogo・傷・textureなどを追従させたいときに使います。Main sequence側には、Optical Flowまたはvector channel入りEXRで事前計算したVector / Back Vectorが必要です。

## 役割

```text
MediaIn → Optical Flow ─────────────┐
                                    ├→ Vector Warp → output
Texture / still ────────────────────┘
```

Input Layerのmotion vectorが「source clipのどこがどう動いたか」を表し、Texture Layerへ入れたstill Imageをその動きに沿ってwarpします。

## 入力

### Input

オレンジ色のInputへ2D Image sequenceを接続します。

このImageにはprecomputed Vector / Back Vector channelが必要です。21.1 Manualでは、Optical Flowの出力またはvector channelを保存したEXRを使えると説明されています。

### Texture

緑色のTexture inputへ、warpしたい2D still Imageを接続します。

reference frameで作ったlogo、修正patch、skin textureなどをsource clipの動きへ追従させる用途です。

## 出力

RGBA Imageを出力します。

21.1 Manualでは、出力にforward / backward tracking informationとしてVx / Vy / BVx / BVyなどの追加motion vector channelが含まれる場合があり、後段Nodeで利用できると説明されています。

## 主な設定項目

### Set Frame / Reference Frame

Set Frameは現在frameをreferenceとして設定します。

Reference Frameには、Textureやmapを作成した基準frameを指定します。source clipとTextureをどのframeで対応させるかをここで決めます。

### Operation

#### Generate Warp

reference frameからcurrent frameまでのwarp mapを生成し、UV channelへ保存します。

#### Generate Warp + Map

warp mapを生成したうえで、Texture側のmap frameにもwarpを適用します。

#### Apply Warp Map

入力済みのtexture mapから以前生成したwarp mapを使い、map frameを変形します。

#### UnWarp

reference frameでmapを固定し、current frameのMain sequenceを逆方向へwarpしてreference frameに近い形へ戻します。

### Smooth UV

近傍のUV値を平均し、warp mapの局所的な乱れを滑らかにします。

### Grid Overlay

warpの状態をViewer上のgrid overlayで確認します。

### Merge Warp over BG

warpしたmap ImageをMain sequence上へcompositeして表示します。

## 主な用途

- 動く服へlogoやgraphicsを貼り、布地の変形へ追従させる
- 顔や肌へscar / makeup / textureを貼り、表面の動きに合わせる
- reference frameで作ったpaint patchを別frameへ追従させ、除去・修正へ使う
- UV warp mapを生成し、後段で再利用する

## 最小構成

```text
MediaIn → Optical Flow → Vector Warp → MediaOut
                            ↑
                    Texture / still
```

まずOptical FlowのVector / Back Vectorが安定していることを確認します。次に、Textureを作成したframeをReference Frameへ設定してwarp結果を確認します。

## 運用例

shirtへlogoを追加する場合:

1. shirtが見やすいframeでlogo stillを作ります。
2. source clipをOptical Flowへ通してVector / Back Vectorを生成します。
3. Optical Flowの出力をVector WarpのInputへ接続します。
4. logo stillをTextureへ接続します。
5. logoを作ったframeをReference Frameへ設定します。
6. Generate Warp + Mapでlogoをmotionへ追従させ、必要ならSmooth UVで局所的な乱れを調整します。

この例は21.1 Manualに記載された用途とControlの役割から再構成した手順です。実際のshotではocclusionや大きな形状変化によって追加のmask / paint処理が必要になる場合があります。

## Vector Transformとの違い

- **Vector Transform** — motion vector / UV channel自体の位置・scale・角度・強さを調整する
- **Vector Warp** — motion vectorを使ってTextureやImageを実際に変形する

vector fieldの位置合わせが先に必要ならVector Transformを前段に置き、実際のtexture追従はVector Warpで行います。

## 挙動と注意点

Vector Warpは、21.1 Manual Chapter 112の **Vector Warping Toolset (Studio Version Only)** に含まれます。

Input LayerにVector / Back Vectorがない状態では、source clipのmotionに基づくwarpを行えません。まずOptical Flowのvector品質を確認してから、Reference FrameやOperationを調整します。

大きなocclusion、交差する動き、急激な変形ではOptical Flow自体の推定が不安定になる可能性があります。warp結果だけでなく元vectorも確認します。

## 関連Node

- [Optical Flow](../optical-flow/optical-flow)
- [Vector Transform](./vector-transform)
- [Vector Denoise](../optical-flow/vector-denoise)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2632–2633で、Input / Texture、Vector / Back Vector要件、RGBA output、Set Frame、Reference Frame、4つのOperation、Smooth UV、Grid Overlay、Merge Warp over BG、clothing / skinへの利用例を確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
