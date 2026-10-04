---
title: dHoldout
description: Foreground Deep Imageのdepth sampleでBackground Deep Imageをoccludeし、semi-transparent sampleの扱いとZ offsetを調整するNode。
doc_type: node
term_id: dholdout
verification: partial
aliases: [dHoldout, dHld]
concepts: [deep-image, holdout]
nodes: [dHoldout]
node_family: deep
controls: [Compute Occluded Samples, Holdout Z Offset, Holdout Center]
inputs: [deep, deep]
outputs: [deep]
tasks: [deep, holdout, occlusion]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dHoldout

dHoldoutは、Foreground <Term id="deep-image">Deep Image</Term>を使ってBackgroundのdepth sampleをoccludeするNodeです。

render elementを「手前objectの後ろだけ消す」といったDeep holdoutに使います。

## 入力

- Background — holdoutされるDeep Image
- Foreground — occluderとして使うDeep Image

## Compute Occluded Samples

semi-transparent foregroundで完全にsampleを捨てず、foregroundを通して見えるbackground値を計算します。

fogや半透明elementのholdoutで重要です。

## Holdout Z Offset / Center

Foreground holdoutのdepthとXY位置をずらします。

source間でdepth alignmentが少し違う場合の調整に使えます。

## 最小構成

```text
Background Deep ─┐
                 ├─ dHoldout → dMerge / Deep to Image
Holdout Deep ────┘
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2244–2245で、2 Deep inputs、Compute Occluded Samples、Z Offset、Centerを確認しました。
