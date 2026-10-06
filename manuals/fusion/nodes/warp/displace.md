---
title: Displace
description: 別Imageのchannel値を変位mapとして読み、2D Imageを中心方向またはX/Y方向へ歪ませるNode。
doc_type: node
term_id: displace
term_short: "Displaceは、別Imageの画素値を変位量として使い、Imageを歪ませるNode。"
verification: partial
aliases: [Displace, Dsp]
concepts: [image-data]
nodes: [Displace]
node_family: warp
controls: [Type, Center, Refraction Channel, Refraction Strength, X Refraction, Y Refraction, Light Power, Light Angle, Spread, Light Channel]
inputs: [image, image, mask]
outputs: [image]
tasks: [warp-image]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Displace

Displaceは、変形したいImageとは別に**変位map用のImage**を受け取り、その画素値を使ってmain Imageのsampling位置をずらすNodeです。Fast Noiseのような模様をmapへ使えば、熱気・水面・布の揺れのような不規則な歪みを作れます。

## 役割

```text
Image to warp ────────→ Input
Displacement map ─────→ Foreground Image → Displace → Image
Mask ─────────────────→ Effect Mask
```

mapそのものを合成するのではなく、Red / Green / Blue / Alpha / Luminanceの値を変位量として利用します。

## 入力

### Input

オレンジ色のInputへ、実際に歪ませたい2D Imageを接続します。21.1 Manualでは必須入力です。

### Foreground Image

緑色のForeground Imageへ、変位mapとして使うImageを接続します。こちらも必須です。どのchannelを変位へ使うかはRefraction Channelで選びます。

### Effect Mask

青色のEffect MaskへMaskを接続すると、効果を必要な領域だけに限定できます。MaskはNodeの処理後に適用されます。

## 出力

mapに従って座標が移動した2D Imageを出力します。後段では通常のImageとしてMerge、Color、Blurなどへ接続できます。

## RadialとX/Y

### Radial

Centerを基準に、mapの値でpixelを内側または外側へ動かします。Refraction Strengthで変位の強さを調整します。

### X/Y

X方向とY方向を別々に扱います。X Refraction / Y Refractionで各軸の強さを調整し、Refraction ChannelもXとYで個別に選べます。

## 主な設定項目

### Refraction Channel

変位mapのRed / Green / Blue / Alpha / Luminanceから、変位へ使うchannelを選びます。Radialでは1組、X/YではX用とY用の2組です。

### Light Power / Light Angle

変位mapの起伏へ仮想的な明暗を付けます。Light Powerは強さ、Light Angleは方向を調整します。

### Spread / Light Channel

Spreadはmapのridgeやedgeを広げます。Light Channelは仮想lightの計算へ使うColor / Red / Green / Blue / Alpha / Luminanceを選びます。

## 主な用途

- Fast Noiseをmapにして、空気が揺れるようなheat distortionを作る
- noiseを時間変化させ、布や水面へ不規則な揺れを加える
- channelごとに異なるmapを使い、X/Y方向を独立して歪ませる
- Light controlsを使い、屈折したedgeへ明暗を付けてbevel風に見せる

## 最小構成

```text
MediaIn ───────→ Displace → MediaOut
Fast Noise ───→ Foreground Image
```

Fast NoiseをForeground Imageへ接続し、Refraction Strengthを小さく動かして変位方向を確認します。Fast Noiseを時間変化させると、歪みも動きます。

## 運用例

背景へ熱気の揺らぎを加える場合、背景clipをInput、Fast NoiseをForeground Imageへ接続します。X/Y modeなら横方向と縦方向のchannel・強さを別々に調整できます。必要ならEffect Maskで熱気を出したい範囲だけに限定します。

21.1 ManualでもFast NoiseをDisplace mapへ使うBasic Node Setupが示されています。

## Grid Warp / Vector Distortionとの違い

- **Displace** — 別Imageのchannel値を変位mapとして使う
- **Grid Warp** — Viewer上のmeshを直接動かす
- **Vector Distortion** — vector channelをX/Y方向の変位量として使う

noiseやgrayscale mapから歪みを作るならDisplace、手で形を合わせるならGrid Warp、motion vector等を使うならVector Distortionを先に検討します。

## 挙動と注意点

Foreground Imageは変位量を決めるcontrol sourceです。map側のcontrastやchannel内容を変えると、同じStrengthでも歪み方が変わります。

## 関連Node

- [Fast Noise](../generators/fast-noise)
- [Grid Warp](./grid-warp)
- [Vector Distortion](./vector-distortion)
- [Vector Warp](./vector-warp)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2967–2969で、3入力、Radial / X/Y、Center、Refraction Channel、Refraction Strength、X/Y Refraction、Light Power / Angle、Spread、Light Channel、Fast Noiseを使うBasic Node Setupを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
