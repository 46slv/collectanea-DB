---
title: Gamut Limiter
description: Current Gamut / Gammaを基準に、指定したLimit Gamut外の色をhard clipして納品gamutを超えないよう制限するNode。
doc_type: node
term_id: gamut-limiter
term_short: 指定gamutを越える色を最終段でhard clipする制限Node。
verification: partial
aliases: [Gamut Limiter, GML]
concepts: [image-data, color-space]
nodes: [Gamut Limiter]
node_family: color
controls: [Current Gamut, Current Gamma, Limit Gamut]
inputs: [image, mask]
outputs: [image]
tasks: [gamut-limit, delivery, qc]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Gamut Limiter

Gamut Limiterは、Imageが指定したgamutを越えないように**out-of-gamut値をhard clip**するNodeです。

たとえばdelivery spaceはRec.2020でも、QC上はP3内へ制限したい場合に使います。

## Current Gamut / Gamma

入力Imageが現在どのgamut / gammaにいるかを指定します。

## Limit Gamut

最終的に許可するgamutを選びます。

その境界を越える値はclipされるため、失われたsaturation detailは後段で戻せません。

## 置く位置

Manualは「limiterなのでnode treeの最後に近い場所へ置く」ことを推奨しています。

creative color correctionの途中へ置くと、その後の処理に使えた色dataを先に切り捨ててしまいます。

## Gamut Mappingとの違い

- **Gamut Limiter** — 境界を越えた値をhard clip
- **Gamut Mapping** — saturationを圧縮 / 再配置してgamut差を滑らかに吸収

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2141–2142で、hard clip、Current Gamut / Gamma、Limit Gamut、末尾配置の注意を確認しました。
