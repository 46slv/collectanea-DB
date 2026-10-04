---
title: Directional Blur
description: 2D ImageをLinear・Centered・Radial・Zoom方向へ流し、移動感・放射・zoom streak・light ray風のblurを作るNode。
doc_type: node
term_id: directional-blur
term_short: Directional Blurは、方向・中心を持つblurを作るNode。
verification: partial
aliases: [Directional Blur, DrBl]
concepts: [image-data, filtering, mask-data]
nodes: [Directional Blur]
node_family: blur-filter
controls: [Type, Center, Length, Angle, Glow]
inputs: [image, mask]
outputs: [image]
tasks: [filter-image, motion-blur, radial-blur, light-rays]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Directional Blur

Directional Blurは、2D <Term id="image">Image</Term>を一定方向へ流したり、中心から放射状・zoom方向へ引き伸ばしたりするNodeです。speed感のあるmotion blurやlight ray風の表現に使えます。

## 役割

通常の[Blur](./blur)が周囲へ均一にぼかすのに対し、Directional Blurは**方向または中心を持つblur**を作ります。

```text
Image → Directional Blur → Output
                 ↑
              Effect Mask
```

## 入力

### Input

オレンジ色の必須入力です。Directional Blurをかける2D Imageを接続します。

### Effect Mask

青色の任意入力です。Maskの白い範囲だけDirectional Blur結果を適用します。

## 出力

Directional / Radial blur後の2D Imageを出力します。

21.1 ManualではDirectional BlurはRGBAすべてのchannelへ作用すると説明されています。

## 主な設定項目

### Type

blurの形を選びます。

- **Linear** — Imageを一直線方向へ流す。speeding trainの窓から見た景色のようなsmear
- **Radial** — 任意のCenterから外側へ放射状に流す
- **Centered** — Linearに似るが、元Imageの両側へ均等にblurを分配
- **Zoom** — slow shutterでzoom操作したようなscale方向のstreak

### Center X / Y

RadialとZoomで、blurの中心位置を決めます。

Linear / Centeredでは主にAngleとLengthを使うため、Centerは同じ意味で働きません。

### Length

blurの強さ・長さを決めます。

負の値ではAngleで示す方向とは逆へblurが伸びます。スライダー上限を超える値も数値入力できます。

### Angle

blurの方向を決めます。

Linear / Centeredではstraight blurの向きを変えます。Radial / Zoomでは、中心を基準とした回転方向のような変化として現れ、Lengthが0以外の場合はwhirlpoolのような見え方になる場合があります。

### Glow

Directional BlurへGlowを加えます。

Manualでは、長い露光時間で光が強く露出したような見え方を作る用途として説明されています。

## 最小構成

```text
MediaIn → Directional Blur → Output
```

まずTypeをLinear、Lengthを小さく設定し、Angleだけを変えて方向を確認します。その後Radial / Zoomへ切り替え、Centerの意味が変わることを観察します。

## 運用例

横方向へ高速移動しているような背景を作る場合:

1. Type = Linear
2. Lengthでblur量を決める
3. Angleで進行方向へ合わせる
4. 必要ならGlowを少量加える
5. 一部だけ処理したい場合はEffect Maskを接続する

放射状のlight ray風にしたい場合はRadialまたはZoomへ切り替え、Centerを光源位置へ合わせます。

## Blur / Defocusとの違い

- **Blur** — 方向を強く意識しない一般的なsoftening
- **Defocus** — camera lensのピント外れ・bokeh
- **Directional Blur** — 方向・中心・zoomを持つsmear

「detailを落とす」のか「ピントを外す」のか「動き・放射を表現する」のかで選びます。

## 挙動と注意点

- TypeによってCenter / Angleの意味が変わります。
- Lengthの正負でもblur方向が変わります。
- Radial / ZoomでCenterが画面外にあると、放射方向が直感と違って見える場合があります。
- Effect Maskは最終blur適用範囲を限定する用途です。blurの方向自体をMask形状で決めるわけではありません。

## 関連する考え方

- [マスク（Mask）](../../learn/02-data/mask)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 似たNode・関連Node

- [Blur](./blur)
- [Defocus](./defocus)
- [Vector Motion Blur](./vector-motion-blur) — motion vector mapから方向・量を得る
- Rays — 光線状の別Effect

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 92、pp.2114–2115で、Image / Effect Mask入力、RGBAへの作用、Type（Linear / Radial / Centered / Zoom）、Center、Length、Angle、Glowを確認しました。

内部REGID、各Typeの数学的kernel、実機性能、Edition差は未確認のため `verification: partial` としています。
