---
title: Point Light
description: 3D空間の1点から全方向へ光を放ち、Color・Intensity・Decay・shadow mapを調整するClassic 3D Light。
doc_type: node
term_id: point-light
verification: partial
aliases: [Point Light, 3PL]
concepts: [classic-3d, lighting]
nodes: [Point Light]
node_family: materials-lights
controls: [Enabled, Color, Intensity, Decay Type, Enable Shadows, Shadow Color, Density, Shadow Map Size, Bias, Softness, Transform]
inputs: [classic-3d]
outputs: [classic-3d]
tasks: [shade-3d, light-3d, point-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Point Light

Point Lightは、電球のように1点から全方向へ光を放つ<Term id="classic-3d">Classic 3D</Term> Lightです。

位置とobjectまでの距離が重要で、rotationはlighting結果へ影響しません。

## 入力 / 出力

任意のScene Inputへ3D sceneを接続できますが、通常はPoint Light自体をMerge 3Dへ接続します。

## Color / Intensity

光の色と強さを調整します。

## Decay Type

distanceでIntensityを減衰させる方法を選びます。

- No Decay — 距離に関係なく同じ強さ
- Linear — 距離に応じて線形に減衰
- Quadratic — より強く距離減衰

localなlampのように見せたい場合はDecayを使います。

## Position

Transform tabのXYZ positionでLight sourceの場所を決めます。

360° sourceなのでrotationは意味を持ちません。

## Shadows

Enable Shadows、Shadow Map Size、Bias、Density、Softness等を持ちます。

shadow mapのresolutionとsoftnessを上げるほど処理負荷が増えるため、必要な品質へ調整します。

## Directional / Spotとの違い

- **Point Light** — 1点から全方向
- **Directional Light** — scene全体へ平行光
- **Spot Light** — 1点からcone状に照射

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 89 pp.2034–2038で、Scene Input、Color / Intensity、Decay Type、position、shadow controlsを確認しました。

shadow renderer差と実機performanceは未確認です。
