---
title: dMerge
description: Backgroundと動的に追加できる複数Foreground Deep streamをdepth sample単位で統合し、前後関係を保持するDeep Merge Node。
doc_type: node
term_id: d-merge
verification: partial
aliases: [dMerge, dMg]
concepts: [deep-image, compositing]
nodes: [dMerge]
node_family: deep
inputs: [deep]
outputs: [deep]
tasks: [deep, composite, merge-depth]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dMerge

dMergeは、複数の<Term id="deep-image">Deep Image</Term>をdepth sample単位で統合するNodeです。

通常のMergeのように「Foreground全体をBackgroundの上へ置く」のではなく、各pixelの複数depth sampleを使って前後関係を合成します。

## 入力

- Background — 基準Deep Image
- Foreground — 追加Deep Image。複数接続可能

```text
Deep A ─────┐
Deep B ─────┼─ dMerge → Deep to Image
Deep C ─────┘
```

Foregroundを追加接続するとinputが増えます。

## 出力

統合済みDeep Imageを出力します。

Deep to Imageへ進むまでmulti-sample depthを保持します。

## Mergeとの違い

- **dMerge** — Deep sampleをdepthで統合
- **Merge** — 2D RGBA ImageをAlpha等で合成
- **Merge 3D** — Classic 3D sceneを統合

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 p.2246で、Background + multiple Foreground inputs、depth sample mergeを確認しました。Deep Image toolsetはStudio Version Onlyです。
