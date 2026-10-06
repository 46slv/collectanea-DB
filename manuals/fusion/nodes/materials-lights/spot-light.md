---
title: Spot Light
description: 位置と方向を持つcone状の光を作り、Cone Angle・Penumbra・Dropoff・shadow mapを調整するClassic 3D Light。
doc_type: node
term_id: spot-light
verification: partial
aliases: [Spot Light, Spotlight, 3SL]
concepts: [classic-3d, lighting]
nodes: [Spot Light]
node_family: materials-lights
controls: [Enabled, Color, Intensity, Decay Type, Cone Angle, Penumbra Angle, Dropoff, Enable Shadows, Shadow Color, Density, Shadow Map Size, Bias, Softness, Transform]
inputs: [classic-3d]
outputs: [classic-3d]
tasks: [shade-3d, light-3d, spotlight, shadow]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Spot Light

Spot Lightは、stage lightのように特定方向へcone状の光を出す<Term id="classic-3d">Classic 3D</Term> Lightです。

position、rotation、cone width、edge falloffを個別に調整できます。

## Color / Intensity

光の色と強さを決めます。

## Decay Type

No Falloff、Linear、Quadraticからdistance decayを選びます。

## Cone Angle

full intensityで照らすconeの幅です。

値を大きくすると広い範囲を照らします。

## Penumbra Angle

Cone Angleの外側でIntensityが0へ落ちるtransition領域を決めます。

0ではhard edgeになり、大きくすると柔らかいedgeになります。

## Dropoff

Penumbra内でIntensityがどの速さで落ちるかを調整します。

## Shadows

Spot Lightはshadow map controlsを持ち、Enable Shadows、Density、Map Size、Bias、Softness等を調整できます。

## Directional / Pointとの違い

- **Spot Light** — position + direction + cone
- **Point Light** — positionだけが重要で全方向
- **Directional Light** — directionだけが重要な平行光

objectだけを限定して照らす、stage light、projector的なlightを作る場合はSpot Lightが向きます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 89 pp.2038–2042で、Color / Intensity、Decay、Cone Angle、Penumbra、Dropoff、shadow controlsを確認しました。

renderer別shadow差と実機performanceは未確認です。
