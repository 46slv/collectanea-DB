---
title: Deep to Image
description: Deep Imageの複数depth sampleをflattenして通常2D Imageへ変換し、Volumetric Compositionやoutput image settingsを設定するNode。
doc_type: node
term_id: deep-to-image
verification: partial
aliases: [Deep to Image, DTI]
concepts: [deep-image, image-data, flatten]
nodes: [Deep to Image]
node_family: deep
controls: [Flip Depth, Volumetric Composition, Process Mode, Depth, Source Color Space, Source Gamma Space, Pre-Divide/Post-Multiply]
inputs: [deep-image]
outputs: [image]
tasks: [deep, flatten, convert-domain]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Deep to Image

Deep to Imageは、<Term id="deep-image">Deep Image</Term>の複数depth sampleを合成して、通常の2D <Term id="image">Image</Term>へflattenするNodeです。

Deep compを通常のBlur、Color、Merge等へ戻すdomain boundaryです。

## 入力 / 出力

1つのDeep Image inputを受け、2D Imageを出力します。

```text
Deep A ─┐
        ├─ dMerge → Deep to Image → Color / Blur / Merge
Deep B ─┘
```

## Flip Depth

depth informationの向きを反転します。

source Deep dataのdepth conventionと意図が逆の場合に確認します。

## Volumetric Composition

overlapしたDeep sampleをflat surfaceだけとしてではなく、semi-transparent volumeとしてblendします。

fog / VDBのようなvolumetric elementをDeepで合成する場合に、sample間の透過をより適切に扱うためのoptionです。

## Image tab

flatten後のImageについてProcess Mode、bit Depth、Color Space / Gamma metadata等を設定します。

Pre-Divide / Post-Multiplyも持ちます。

## 注意点

一度flattenすると、1 pixel内に保持されていた複数Deep sampleは通常2D Imageへ統合されます。

後段で再びImage to Deepを使っても、元と同じmulti-sample情報が自動復元されるわけではありません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2238–2240で、flatten、Flip Depth、Volumetric Composition、Image tabを確認しました。
