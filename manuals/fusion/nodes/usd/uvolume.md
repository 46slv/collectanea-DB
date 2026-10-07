---
title: uVolume
description: VDB file / sequenceをUSD environmentへ読み込み、density・emission・temperature・colorとtimeを調整するVolume Node。
doc_type: node
term_id: uvolume
verification: partial
aliases: [uVolume, uVo]
concepts: [usd-scene, volume-data, time]
nodes: [uVolume]
node_family: usd
controls: [File, Trim, Loop, Time Scale, Density Scale, Emission Mode, Emission Field, Color, Gradient, Transform]
outputs: [usd]
tasks: [usd, volume, vdb, smoke, fire]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uVolume

uVolumeは、VDB fileまたはVDB sequenceをFusionの<Term id="usd-scene">USD environment</Term>へ読み込むNodeです。

煙、雲、fire、explosion等のvolumetric assetを扱います。

## File / time

Node追加時にVDB fileを選びます。

single VDBだけでなくanimated sequenceを読み込め、Trim、Loop、speed変更でtimeを調整できます。

## Density

Scaleでvolume densityを調整します。

## Emission

Manualでは代表的に次のmodeが記載されています。

- Color — volume全体へcolor
- Field — 指定fieldを使ってcolorをscatter
- Blackbody — temperatureに基づくfire / explosion向けcolor
- Gradient — field値へcolor gradientをmapping

## Transform

USD共通Transform controlsでposition / rotation / scaleを調整します。

## 最小構成

```text
uVolume ────┐
uCamera ────┼─ uMerge → uRenderer
uLight ─────┘
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2928–2929で、VDB file / sequence、time control、Density、Emission mode、Transformを確認しました。

VDB field naming compatibilityとrender performanceは未確認です。
