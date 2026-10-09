---
title: Chromatic Aberration Removal
description: Red/Cyan・Green/Purple・Blue/Yellowのcolor fringeをViewer guideで見つけ、Scale / Edgeを手動調整してlens色収差を補正するNode。
doc_type: node
term_id: chromatic-aberration-removal
term_short: lens由来の色ずれをchannel pairごとに手動補正するNode。
verification: partial
aliases: [Chromatic Aberration Removal, CAR]
concepts: [image-data, lens]
nodes: [Chromatic Aberration Removal]
node_family: color
controls: [Lens Center, Stronger Correction, R/C Balance, G/P Balance, B/Y Balance, Brightness, R/C Scale, G/P Scale, B/Y Scale, R/C Edge, G/P Edge, B/Y Edge, Show Estimated Fringes]
inputs: [image, mask]
outputs: [image]
tasks: [chromatic-aberration, lens-correction]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Chromatic Aberration Removal

Chromatic Aberration Removalは、lensの色収差によってedgeに出るRed/Cyan、Green/Purple、Blue/Yellowのfringeを手動で位置合わせするNodeです。

## Show Estimated Fringes

各color pairの推定fringeだけをgray background上へ表示します。

補正値を変える前に「どこにどの色ずれがあるか」を見つけるためのguideです。

## Aberration Correction

R/C、G/P、B/YごとにScaleとEdgeを調整します。

Scaleはchannel pairの大きさ / alignmentを合わせ、Edgeはlens curvatureによる周辺部のずれを補います。

## Estimation Options

Show Estimated Fringes使用中だけ有効になり、BalanceとBrightnessでguideを見やすくします。最終Image自体には影響しません。

## Advanced Options

Lens Centerでlens中心をずらせます。reframe / rerenderでoptical centerがframe中央から外れているshotに使います。

Stronger Correctionはfringeに似た特徴をより強く検出します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2146–2148で、Estimated Fringes、Scale / Edge、Estimation Options、Lens Centerを確認しました。
