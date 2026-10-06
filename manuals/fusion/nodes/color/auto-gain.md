---
title: Auto Gain
description: 入力Imageの最暗部と最明部を指定Rangeへ自動remapし、低contrast素材のtonal rangeを広げるNode。
doc_type: node
term_id: auto-gain
term_short: 最暗部と最明部を基準にImage全体の値域を自動で伸縮するColor Node。
verification: partial
aliases: [Auto Gain, AG]
concepts: [image-data, tonal-range]
nodes: [Auto Gain]
node_family: color
controls: [Do Z, Range]
inputs: [image, mask]
outputs: [image]
tasks: [color-correct, normalize-range]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Auto Gain

Auto Gainは、入力した2D <Term id="image">Image</Term>の最暗部と最明部を調べ、指定したLow / Highへ収まるように中間値も含めて自動で伸縮するNodeです。

低contrastの素材を一度見やすい値域へ広げたいときや、float画像の値域を確認したいときに使えます。

## 入力と出力

オレンジのInputへ2D Image、青のEffect Maskへ任意のMaskを接続します。出力は補正後の2D Imageです。

```text
Image → Auto Gain → Color / Merge
          ↑
         Mask
```

## Range

LowとHighが、remap後のblack point / white pointを決めます。

入力の最暗値はLowへ、最明値はHighへ移り、その間の値は同じ比率で再配置されます。

## Do Z

Z / Depth channelにもAuto Gainを適用します。

異なるZ passの値域を合わせたい場合や、floatのZ値を見やすい範囲へ一時的にremapしたい場合に使います。

## 運用例

0.2〜0.8程度にしか値がないgradientを0〜1へ広げると、暗部から明部までの差が大きくなります。

一方、shot内で非常に明るいobjectが出入りすると、そのframeごとに最暗・最明値が変わり、画面全体のbrightnessが跳ねることがあります。連続shotのlookを固定する用途では、この自動追従を前提に使います。

## 似たNodeとの違い

- **Auto Gain** — frame内の実値を見て自動でrangeを伸縮
- **Brightness Contrast** — Gain / Lift / Gamma等を手動で固定
- **Color Corrector** — tone range別の総合補正

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2149–2150で、Input / Effect Mask、Do Z、Range、時間変化時の注意を確認しました。実機default値とperformanceは未確認です。
