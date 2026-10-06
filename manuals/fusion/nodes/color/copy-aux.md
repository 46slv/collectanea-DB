---
title: Copy Aux
description: Z・UV・Normal・Vector・Object ID等のauxiliary channel群をRGBAへ可視化したり、RGBAからAuxへ書き戻すNode。
doc_type: node
term_id: copy-aux
term_short: Auxiliary channel群とRGBAの間をまとめてコピーするNode。
verification: partial
aliases: [Copy Aux, CpA]
concepts: [auxiliary-channels, image-data]
nodes: [Copy Aux]
node_family: color
controls: [Mode, Aux Channel, Out Color Depth, Channel Missing, Kill Aux Channels, Enable Remapping]
inputs: [image, mask]
outputs: [image]
tasks: [auxiliary-channels, inspect-aov, channel-remap]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Copy Aux

Copy Auxは、Z、UV、Coverage、Object ID、Material ID、Normal、Vector、World Position等の<Term id="auxiliary-channels">補助Channel</Term>をRGBAへ持ち出したり、RGBAからAuxへ書き戻すNodeです。

Channel Booleansが個別channelを扱うのに対し、Copy AuxはAux channel groupをまとめて扱います。

## Mode

- **Aux to Color** — AuxをRGBAへコピーしてViewerや通常2D処理で扱う
- **Color to Aux** — 処理したRGBAを指定Auxへ書き戻す

```text
EXR + Z → Copy Aux (Aux to Color) → Color / Filter
       → Copy Aux (Color to Aux) → downstream AOV use
```

## Aux Channel

どの補助channelを読み書きするか選びます。

## Out Color Depth

Auxはfloat値を持つことが多いため、RGBAへコピーするときのbit depthを決めます。Auxのdepthに合わせるoptionもあります。

## Channel Missing

指定Auxがsourceに存在しない場合の扱いを決めます。

## Kill Aux Channels

不要なAuxをoutputから削除します。memory / cacheを軽くしたい場合の整理に使えます。

## Enable Remapping

Aux値をViewerで見やすくするためのstatic remapに使います。frameごとにauto-normalizeするViewer表示と違い、同じ値を時間で同じ色として比較できます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2182–2185で、Mode、Aux Channel、bit depth、missing channel、Kill Aux、static normalizationを確認しました。
