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
inputs: [image, texture]
outputs: [image]
tasks: [warp-image, track-texture]
product_scope: fusion-studio
suite_surfaces: [fusion]
updated: "2026-10-14"
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

この構成では、次の3種類の情報を区別します。

- **Main sequence**：時間とともに変化する撮影素材。RGB画像に加えて、フレーム間の動きを表すVector / Back Vector channelが必要です。
- **Texture（Map）**：基準フレームに合わせて用意した静止画像。ロゴやメイクの素材を置きます。静止画像そのものを自動追跡するわけではありません。
- **Warp map（UV channel）**：基準フレームから処理中のフレームへの画素の対応を記録する補助データ。RGBA画像とは別の情報です。補助データの考え方は[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels)も参照してください。

動きを推定するのは前段のOptical Flowなどであり、Vector Warpは推定結果を使って基準フレーム上の画像を別フレームへ移す役割を持ちます。

## 入力

### Input

オレンジ色のInputへ2D Image sequenceを接続します。

このImageにはprecomputed Vector / Back Vector channelが必要です。21.1 Manualでは、Optical Flowの出力またはvector channelを保存したEXRを使えると説明されています。

### Texture

緑色のTexture inputへ、warpしたい2D still Imageを接続します。

reference frameで作ったlogo、修正patch、skin textureなどをsource clipの動きへ追従させる用途です。

## 出力

出力端子は**Imageが1つ**です。RGBA Imageを出力し、必要に応じて補助チャンネルも持たせられます。

21.1 Manualでは、出力にforward / backward tracking informationとしてVx / Vy / BVx / BVyなどの追加motion vector channelが含まれる場合があり、後段Nodeで利用できると説明されています。

## 主な設定項目

### Set Frame / Reference Frame

Set Frameは現在frameをreferenceとして設定します。

Reference Frameには、Textureやmapを作成した基準frameを指定します。source clipとTextureをどのframeで対応させるかをここで決めます。

### Operation：何を生成・適用するか

| 選択肢 | 処理内容 | 選択の目安 |
| --- | --- | --- |
| **Generate Warp** | Reference Frameから現在のフレームへのWarp mapを作り、UV channelへ保存する。 | まず対応情報を生成したいとき。 |
| **Generate Warp + Map** | Warp mapの生成とともに、Texture側の静止画像を現在のフレームへ変形する。 | ロゴやペイントした修正画像をすぐに追従表示したいとき。 |
| **Apply Warp Map** | 入力にある生成済みのWarp mapを利用して、Map側の画像を変形する。 | 生成と適用を別工程にしたいとき。 |
| **UnWarp** | MapをReference Frameで固定し、現在のMain sequenceを逆方向に変形して基準フレームの見え方へ近づける。 | 動いている面の修正位置を基準フレームで確認したいとき。 |

最初は **Generate Warp + Map** で動作を確認すると、静止画像がフレームごとにどう変形するかを見やすくなります。Generate Warpは対応データの生成、Apply Warp Mapは生成済みデータの利用であり、同じ操作ではありません。

21.1マニュアルはApply Warp Mapについて、入力側にある以前生成したWarp mapを使うと説明しています。ただし、生成結果をどのノード間でどのように保持・受け渡すかの手順までは明記していません。複数ノードに分けるときはUV channelが下流に残るか確認してください。

### Smooth UV

近傍のUV値を平均し、warp mapの局所的な乱れを滑らかにします。

### Grid Overlay

warpの状態をViewer上のgrid overlayで確認します。

### Merge Warp over BG

WarpしたMap画像をMain sequenceの上に合成して表示するための設定です。UVの対応情報だけを確認する場合と、最終的な重なりを確認する場合とで表示目的が異なります。

### Settings TabのBlend

同章のCommon Controlsでは、Blend 0.0が元の入力画像、1.0が処理後の結果となる共通の混合操作として説明されています。Blendを0にすると通常は処理を省略しますが、Process When Blend Is 0.0を有効にすると0でも処理する設定です。これはMerge Warp over BGの表示設定とは別です。

## 主な用途

- 動く服へlogoやgraphicsを貼り、布地の変形へ追従させる
- 顔や肌へscar / makeup / textureを貼り、表面の動きに合わせる
- reference frameで作ったpaint patchを別frameへ追従させ、除去・修正へ使う
- UV warp mapを生成し、後段で再利用する

## 最小構成

~~~text
Main sequence（動画）→ Optical Flow ───→ Vector Warp（Input） → MediaOut
                                                 ↑
基準フレームで用意した静止画像 ───────→ Vector Warp（Texture）
~~~

Optical FlowでVector / Back Vectorを生成し、静止画像を描いた時点へReference Frameを合わせます。OperationをGenerate Warp + Mapにして確認し、元映像上への合成を見たいときはMerge Warp over BGも確認します。

## 運用例1：動くシャツにロゴを貼る

1. シャツが見やすいフレームを選び、そのフレームに重なる位置で、透明背景のロゴ画像を作ります。まず大きさと角度を合せます。
2. シャツが動く動画をOptical Flowへ接続し、Vector / Back Vectorを生成します。Vector Warpだけで元動画からベクトルを推定することはできません。
3. Optical Flowの出力をVector WarpのInput、ロゴの静止画像をTextureへ接続します。
4. ロゴを作ったフレームに再生ヘッドを移し、Set Frameを押すかReference Frameに同じ番号を設定します。
5. Generate Warp + Mapを選び、布が曲がる部分や身体の動きに対してロゴがどう変形するか、前後のフレームで確認します。
6. 局所的なゆがみはGrid Overlayで確認し、必要に応じてSmooth UVを調整します。ベクトルの推定自体が間違っている部分は、Smooth UVだけでは直りません。

基準フレームでロゴがずれている場合は、まず静止画像の位置とReference Frameを直します。基準では合うのに時間とともに滑る場合はOptical Flowの推定を確認してください。腕がロゴの前を通るなどの遮蔽には、別途マスクや合成調整が必要です。

## 運用例2：顔のメイクや傷を追従させる

頬に描いた傷やメイクを基準フレームの静止画像として用意し、顔の動画から生成したVector / Back Vectorで変形します。頬や口元の動きでは、画像全体を一律に移動するだけでは模様が表情に追従しないため、画素ごとの動きに応じた変形を利用します。

接続方法はシャツの例と同じです。色や明るさの変化、前髪による隠れなどはVector Warpが自動的に解決するわけではありません。変形後の見え方を確認し、必要に応じてマスクや色の調整を追加します。

## 運用例3：動く面を基準フレームへ寄せて確認する

UnWarpは、静止画像を動画の動きに合わせるのとは逆に、Main sequenceの各フレームを基準フレームに近づけるOperationです。動く布や肌にある不要物を修正する際、まずUnWarpで同じ位置に近づくか確認し、固定された面としてペイントしたい領域を把握できます。

「UnWarpで固定 → ペイント → 再度Warp」という考え方は使えますが、実際に編集ノードを間に入れる構成では補助チャンネルを保持できるか確認が必要です。21.1マニュアルの説明だけで任意の中間ノードがUVを引き継ぐとは断定できません。

## Vector Transformとの違い

- **Vector Transform** — motion vector / UV channel自体の位置・scale・角度・強さを調整する
- **Vector Warp** — motion vectorを使ってTextureやImageを実際に変形する

vector fieldの位置合わせが先に必要ならVector Transformを前段に置き、実際のtexture追従はVector Warpで行います。

## 挙動と注意点

Vector Warpは、21.1 Manual Chapter 112の **Vector Warping Toolset (Studio Version Only)** に含まれます。

Input LayerにVector / Back Vectorがない状態では、source clipのmotionに基づくwarpを行えません。まずOptical Flowのvector品質を確認してから、Reference FrameやOperationを調整します。

大きなocclusion、交差する動き、急激な変形ではOptical Flow自体の推定が不安定になる可能性があります。warp結果だけでなく元vectorも確認します。

## うまく追従しないとき

| 症状 | 確認する箇所 |
| --- | --- |
| Textureが動かない | Main sequenceにVector / Back Vector channelがあり、Optical Flowの出力を使っているか。 |
| 最初から位置がずれている | Reference Frameと静止画像を作ったフレームが一致しているか。素材のサイズや位置は適切か。 |
| 時間が進むと模様が滑る | 遮蔽、反射、速い動きなどでOptical Flowの推定が不安定ではないか。 |
| 局所的な形が波打つ | Grid OverlayでWarpを確認する。Smooth UVは乱れを軽減しても誤ったベクトルそのものは修復しない。 |
| Warp mapを作ったのに画面で変形が見えない | Generate WarpとGenerate Warp + Mapの違い、Merge Warp over BGの表示を確認する。 |
| 別ノードでMapを再利用できない | 中間処理でUVなどの補助チャンネルが失われていないか。 |

Vector Warpは布の3D形状や隠れている部分の画像を復元する機能ではありません。遮蔽や形状の変化が大きい素材では、ロトスコープや別の合成処理と組み合わせます。

## 関連Node

- [Optical Flow](../optical-flow/optical-flow.md)
- [Vector Transform](./vector-transform)
- [Vector Denoise](../optical-flow/vector-denoise)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2632–2633で、Input / Texture、Vector / Back Vector要件、RGBA output、Set Frame、Reference Frame、4つのOperation、Smooth UV、Grid Overlay、Merge Warp over BG、clothing / skinへの利用例を確認しました。

全既定値・数値範囲、内部REGID、実機performance、複数ノード間のUV channel保持とApply Warp Mapの具体的な中間接続手順は未確認です。
