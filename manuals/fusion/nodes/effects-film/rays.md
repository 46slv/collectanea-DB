---
title: Rays
description: Alphaや明るい部分から指定Centerへ向かうmodified zoom blurを作り、Decay・Weight・Exposure・Thresholdで光条を調整するNode。
doc_type: node
term_id: rays
term_short: 指定点から放射する光条をImageのAlpha / luminanceから作るNode。
verification: partial
aliases: [Rays, CIR]
concepts: [image-data, alpha, blur]
nodes: [Rays]
node_family: effects-film
controls: [Center, Blend, Decay, Weight, Exposure, Threshold]
inputs: [image, mask]
outputs: [image]
tasks: [rays, light-rays, stylize]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Rays

Raysは、Image内のobjectから指定した中心点へ向かって放射状のlight rayを伸ばすNodeです。

内部的にはmodified zoom blurに近く、Alphaを持つtextやlogo、bright sourceから光条を作る用途に向きます。

## 入力

2D Imageと任意Effect Maskを受けます。ManualではAlphaを持つgraphicをsourceにすると使いやすいと説明されています。

## 主な設定

- Center: rayが集まるlight source位置
- Decay: rayの長さ
- Weight: rayのfalloff
- Exposure: rayのbrightness
- Threshold: rayを発生させる明るさの下限
- Blend: 元Imageとray結果のmix

## 最小構成

    Text+ / Graphic → Rays → Merge

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 97 pp.2293–2294で、2 inputs、Center、Blend、Decay、Weight、Exposure、Thresholdを確認しました。
