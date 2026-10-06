---
title: dMerge
description: Background Deep Imageへ複数Foreground Deep streamを追加し、各pixelのdepth sampleを奥行き順で統合するDeep compositing Node。
doc_type: node
term_id: d-merge
verification: partial
aliases: [dMerge, Deep Merge, dMg]
concepts: [deep-image, compositing, depth]
nodes: [dMerge]
node_family: deep
inputs: [deep-image, deep-image]
outputs: [deep-image]
tasks: [deep, composite, merge]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dMerge

dMergeは、複数の<Term id="deep-image">Deep Image</Term>を、各pixel内のdepth sampleを保ったまま1つへ統合するNodeです。

通常MergeのForeground / Background alpha合成ではなく、sampleの奥行き関係を使ってDeep compositeを作ります。

## 入力

### Background

オレンジ色のDeep background inputです。

### Foreground

白色のDeep foreground inputです。

追加接続するとForeground inputが増え、複数Deep sourceを1つのdMergeへまとめられます。

```text
Deep Background ──┐
Deep Foreground A ─┼─ dMerge → Deep to Image
Deep Foreground B ─┘
```

## 出力

統合後もDeep Imageのままです。

後段でdColorCorrector、dTransform、dCrop等を続けられます。

## Inspector

21.1 ManualではdMerge固有のControls tabは記載されず、主な役割はdepth sample streamの統合です。

「設定が少ない = 通常Mergeと同じ」ではなく、data model自体が違います。

## 2D Image input

Chapter 95では、Image to Deep / Deep to Imageを除くDeep compositing toolが2D Image inputを自動Deep変換できると説明されています。

ただし2D sourceのdepth位置を明示したい場合は[Image to Deep](./image-to-deep)でZを設定してからdMergeへ入れる方が意図を読みやすくなります。

## Mergeとの違い

- **Merge** — 2D ImageのRGBA / Alpha合成
- **dMerge** — Deep sampleのdepth-aware統合

dMergeを「高品質なMerge」と考えるのではなく、別domainのcombinerとして扱います。

## linear colorspace

Deep compositingはlinear colorspaceで行う必要があります。

合成後にDeep to Imageでflattenし、必要に応じてdisplay / delivery spaceへ変換します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2227、2246–2247で、Deep toolset、Background + multiple Foreground inputs、sample mergeを確認しました。

Studio限定Deep toolsetです。
