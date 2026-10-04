---
title: Blur
description: 2D Imageを均一にぼかし、Filter・X/Y Blur Size・処理channel・Clipping Modeを調整する基本Blur Node。
doc_type: node
term_id: blur
verification: partial
aliases: [Blur]
concepts: [image-data, filtering, domain-of-definition, mask-data]
nodes: [Blur]
node_family: blur-filter
controls: [Filter, Color Channels, Lock X/Y, Blur Size, Clipping Mode, Blend]
inputs: [image, mask]
outputs: [image]
tasks: [blur, soften, filter]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Blur

Blurは、2D <Term id="image">Image</Term>を均一にぼかす基本Filter Nodeです。単純なsoftening、背景のぼかし、detailを落とす前処理などで使います。

## 役割

入力Imageの周囲のpixelを参照して、輪郭やdetailを広げるようにぼかします。

```text
Image → Blur → Output
          ↑
       Effect Mask
```

## 入力

### Input

オレンジ色の必須入力です。ぼかしたい2D Imageを接続します。

### Effect Mask

青色の任意入力です。Maskの白い範囲だけBlur結果を適用します。

21.1 ManualではEffect MaskはBlur処理後に適用されると説明されています。

## 出力

Blur処理後の2D Imageを出力します。

別のImage-processing NodeやMergeへそのまま接続できます。

## 主な設定項目

### Filter

Blurの計算方法を選びます。

21.1 Manualでは次の5種類が記載されています。

- **Box Blur** — 速いが低品質な単純filter
- **Bartlett** — より滑らかなanti-aliased blur
- **Multi-box** — Boxを複数pass重ね、Gaussianに近づける
- **Gaussian** — smoothでsymmetricalなblur
- **Fast Gaussian** — Gaussian系の高速方式。Manualでは既定filterとして記載

Gaussianはfloat-depth Imageを極端にぼかす場合、edge付近にringingが出ることがあります。Manualではその場合Multi-boxが候補として挙げられています。

### Color Channels（RGBA）

R / G / B / AのどのchannelへBlurを適用するか選びます。

この選択は処理**前**に使われ、外したchannelはBlur処理そのものをskipします。Common Controls側のRGBA checkboxは処理後に適用されるため、役割が異なります。

### Lock X/Y

有効にするとX / Y方向のBlur量を同じにします。既定は有効です。

解除すると横方向と縦方向で別のBlur Sizeを設定できます。

### Blur Size

Blurの強さ・広がりを決めます。

Lock X/Yを外すとX / Yを個別に調整できます。横だけ流したようなsofteningが必要なら、まずDirectional Blurとどちらが目的に合うか比較します。

### Clipping Mode

DoD境界をどう扱うかを選びます。

- **Frame** — full frameをDoDとして扱う既定動作
- **Domain** — upstreamのDoDを尊重
- **None** — source image clippingを行わない

大きなBlurでは周囲のpixelが必要になるため、edgeだけ切れたり不自然になる場合に確認します。

### Blend

Blur済みの結果と元Imageを混ぜます。

0へ近づけるほど元Imageが多く戻ります。Blur Sizeで「ぼかし幅」を決め、Blendで「最終結果へどれだけBlurを混ぜるか」を分けて調整できます。

## 最小構成

```text
MediaIn → Blur → Output
```

最初はFilterを既定のままBlur Sizeだけを変更します。次にFilterを変え、最後にClipping Modeやchannelを確認すると違いを分けて観察できます。

## 運用例

背景だけを柔らかくしたい場合:

1. ImageへBlurを追加します。
2. Blur Sizeで必要なぼかし量を決めます。
3. Ellipse / Polygon MaskをEffect Maskへ接続します。
4. Mask側のSoft EdgeでBlur適用範囲の境界をなじませます。

```text
Image → Blur → Output
          ↑
      Polygon Mask
```

BlurのFilterとMaskのSoft Edgeは別の処理です。どちらが境界を変えているか分からなくならないよう、1つずつ調整します。

## 挙動と注意点

- Blurは近傍pixelを参照するためDoD / edge条件に影響されます。
- Gaussianのringingは通常目立ちにくいものの、float-depth Imageの後段処理で問題になる場合があります。
- Alphaも処理対象にできるため、RGBだけぼかす場合とRGBAすべてをぼかす場合で透明Edgeの見え方が変わる可能性があります。
- Lensのbokehやbloomを再現したい場合は[Defocus](./defocus)を検討します。
- 一方向・放射・zoom streakなら[Directional Blur](./directional-blur)が直接的です。

## 関連する考え方

- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)
- [マスク（Mask）](../../learn/02-data/mask)
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## 似たNode・関連Node

- [Defocus](./defocus) — camera lensのピント外れを再現
- [Directional Blur](./directional-blur) — 方向・中心を持つblur
- [Vari Blur](./variblur) — mapで場所ごとにblur量を変える
- [Vector Motion Blur](./vector-motion-blur) — motion vectorを使う

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 92、pp.2109–2111で、Image / Effect Mask入力、5種類のFilter、RGBA処理channel、Lock X/Y、Blur Size、Clipping Mode、Blend、Gaussian ringingの注意を確認しました。

内部REGID、各Filterの正確なkernel、GPU実装、Edition差、実機性能は未確認のため `verification: partial` としています。
