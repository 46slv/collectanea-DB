---
title: Rank Filter
description: 周囲pixelを値順にsortし、指定Rankのpixel colorへ置き換えることでsalt-and-pepper noise除去からwatercolor風まで作るNode。
doc_type: node
term_id: rank-filter
verification: partial
aliases: [Rank Filter, RFlt]
concepts: [image-data, filtering, rank-statistics]
nodes: [Rank Filter]
node_family: blur-filter
controls: [Size, Rank]
inputs: [image, mask]
outputs: [image]
tasks: [rank-filter, denoise, stylize]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Rank Filter

Rank Filterは、current pixel周辺のpixelを値順に並べ、その中の**指定順位のpixel color**でcurrent pixelを置き換えるNodeです。

単純なaverage blurとは違い、近傍値の順位統計を使います。

## 入力

2D Imageと任意Effect Maskを受けます。

## Size

sampleする近傍rangeをpixel単位で決めます。

Size = 1ではcenterの周囲1 pixelを含む3×3、合計9 pixelをsampleします。

小さいSizeはsalt-and-pepper noise除去に向き、大きいSizeは形を平坦化してwatercolor-likeな見た目を作れます。

## Rank

sortした値のどこを選ぶかを0〜1で指定します。

- 0 — darkest / minimum
- 0.5付近 — median
- 1 — brightest / maximum

低Rankではbright speckを減らしやすく、高Rankではdark speckを減らしやすい方向になります。

## 最小構成

```text
Image → Rank Filter → Output
```

noise cleanupでは小さいSizeから始め、Rankを0.5付近で確認します。

stylizeではSizeを大きくし、edgeやflat regionがどう変わるか確認します。

## Erode Dilateとの違い

Erode Dilateはbright / dark領域の境界を広げ縮めるmorphology処理です。

Rank Filterは近傍pixelをsortし、選択順位の実pixel値へ置換します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 99 pp.2341–2342で、Image / Effect Mask、Size、Rank、noise removal / watercolor例を確認しました。
