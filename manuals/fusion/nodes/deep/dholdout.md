---
title: dHoldout
description: Foreground Deep Imageのdepth sampleを使い、Background Deep Imageを奥行きに応じてoccludeするNode。
doc_type: node
term_id: dholdout
verification: partial
aliases: [dHoldout, dHld]
concepts: [deep-image, depth, occlusion]
nodes: [dHoldout]
node_family: deep
controls: [Compute Occluded Samples, Holdout Z Offset, Holdout Center]
inputs: [deep-image, deep-image]
outputs: [deep-image]
tasks: [deep, holdout, occlusion]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dHoldout

dHoldoutは、Foreground <Term id="deep-image">Deep Image</Term>をholdoutとして使い、Background Deep Imageの奥側sampleを隠すNodeです。

2D matteでpixel全体を切るのではなく、foregroundのdepthに応じてbackground sampleをoccludeします。

## 入力

### Background

残したいbackground Deep Imageです。

### Foreground

holdoutとして使うforeground Deep Imageです。

```text
Background Deep ─┐
                 ├─ dHoldout → Deep to Image
Foreground Deep ─┘
```

## Compute Occluded Samples

semi-transparent foregroundで隠されるbackground sampleを単純削除せず、foreground越しに見える値を計算します。

volume / glass-likeな半透明Deep sampleを扱う場合に重要です。

## Holdout Z Offset

holdout sampleをdepth方向へ前後させます。

edgeでdepthがわずかに合わない場合の調整に使えます。

## Holdout Center

foreground holdoutをXY方向へ位置調整します。

## dMergeとの違い

- **dMerge** — 複数Deep streamをsample-awareに統合
- **dHoldout** — foreground Deepを使ってbackground sampleを隠す

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2245–2246で、Background / Foreground inputs、Compute Occluded Samples、Z Offset、Centerを確認しました。
