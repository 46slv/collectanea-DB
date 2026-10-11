---
title: Vector Transform
description: Optical Flowが作ったVector / Back VectorやUV channelを平滑化・減衰・移動・scale・回転し、別の画像やsequenceへ合わせるStudio専用Node。
doc_type: node
term_id: vector-transform
term_short: "Vector Transformは、motion vectorやUV channel自体を整形して後段のwarpへ渡すNode。"
verification: partial
aliases: [Vector Transform, VXf]
concepts: [image-data, auxiliary-channels, motion-vectors, transform]
nodes: [Vector Transform]
node_family: warp
controls: [Smooth UV, Smooth Vector, Attenuate UV, Attenuate Vector, Center X, Center Y, Size X, Size Y, Use Size and Aspect, Size, Aspect, Angle]
inputs: [image, vector, mask]
outputs: [image, vector]
tasks: [warp-image, transform-vector]
product_scope: fusion-studio
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Vector Transform

Vector Transformは、画像そのものを移動・拡大する通常のTransformではなく、Imageに含まれるmotion vectorやUV channelを平滑化・減衰・移動・scale・回転するNodeです。

Optical Flowで得たVector / Back Vectorを別の画像やsequenceへ合わせ直したいときや、Vector Warpへ渡す前にvector fieldを整えたいときに使います。

## 役割

```text
MediaIn → Optical Flow → Vector Transform → Vector Warp
```

Optical Flowが生成したVector / Back Vector channelを受け取り、そのvector情報の位置・大きさ・角度・強さを調整します。

見えているRGB Imageを直接変形することが主目的ではなく、後段が参照するmotion / UV dataを整えるNodeです。

## 入力

### Input

オレンジ色のInputへ2D Imageを接続します。

21.1 Manualでは、Optical Flowの出力を接続し、そのImageに含まれるVector / Back Vector channelを変換する構成が示されています。

### Attenuate Mask

白色のAttenuate Mask inputへMask shapeを接続します。

vector / UVの減衰を画面全体ではなく、必要な領域へ限定したい場合に使います。

## 出力

2D Imageを出力し、その中のvector / UV channelへVector Transformの調整結果を反映します。

後段ではVector Warpなど、motion vectorやUV channelを利用するNodeへ接続できます。

## 主な設定項目

### Smooth UV

近傍pixelのUV値を平均し、UV channelの局所的な乱れや不連続を滑らかにします。

### Smooth Vector

隣接frame間でvectorを滑らかにします。21.1 Manualでは、texture mapを使うVector Warpの前処理として使えると説明されています。

### Attenuate UV

UV magnitudeがwarpへ与える影響を強めたり、弱めたり、0まで落としたりします。

### Attenuate Vector

motion vectorの長さを短くし、vectorによるwarp量をfullから0まで減らします。

### Center X / Y

UV channelの位置を移動します。

### Size X / Y

UVをX / Y方向へ個別にscaleします。

### Use Size and Aspect / Size / Aspect

Use Size and Aspectを有効にすると、SizeでX / Yをまとめてscaleし、Aspectで縦横比を調整できます。

### Angle

UV channelの角度を回転します。

## 主な用途

- Optical Flowで得たtracking / motion情報を別サイズの画像やsequenceへ合わせる
- Vector Warpの前でUVやmotion vectorの局所的な乱れを滑らかにする
- vector fieldを移動・scale・回転し、貼り付けるtextureとの位置関係を調整する
- Attenuate Maskでvectorの効く領域を限定し、warp量を部分的に弱める

## 最小構成

```text
MediaIn → Optical Flow → Vector Transform → Vector Warp → MediaOut
                                      ↑
                              Texture / still
```

まずOptical Flowの出力でmotion vectorが得られていることを確認し、その後にVector Transformで位置・scale・角度・強さを調整します。

## 運用例

動く布地へtextureを追従させる場合は、先にOptical Flowで布地のmotion vectorを生成します。

そのvectorの位置やscaleが貼り付けたいtextureと合っていなければ、Vector TransformのCenter / Size / Angleで調整し、必要に応じてSmooth Vectorで揺れを抑えます。その出力をVector Warpへ渡してtextureを変形します。

これは21.1 Manualで確認できるNodeの役割から組んだ運用例で、特定shotでの結果を実機確認したものではありません。

## Vector Warpとの違い

- **Vector Transform** — vector / UV dataそのものを整形する
- **Vector Warp** — そのvectorを使ってTextureやImageを実際にwarpする

Vector Warpの結果がずれているとき、warp処理そのものではなくvector fieldの位置・scale・角度を直したい場合はVector Transformを使います。

## 挙動と注意点

Vector Transformは、21.1 Manual Chapter 112の **Vector Warping Toolset (Studio Version Only)** に含まれます。

通常のTransform Nodeと違い、主な対象はRGB Imageの見た目ではなくvector / UV auxiliary channelです。前段で必要なVector / Back Vectorが生成されていない場合、意図したmotion warp用dataを調整できません。

## 関連Node

- [Optical Flow](../optical-flow/optical-flow.md)
- [Vector Denoise](../optical-flow/vector-denoise)
- [Vector Warp](./vector-warp)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2630–2631で、Input / Attenuate Mask、Optical FlowからのVector / Back Vector利用、Smooth UV、Smooth Vector、Attenuate UV、Attenuate Vector、Center、Size、Aspect、Angleを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
