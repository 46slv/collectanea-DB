---
title: Image
description: Fusionの2D Imageを、RGB・Alpha・resolution・domainを持つdataとして理解する。
doc_type: concept
verification: partial
aliases: [Image, 2D Image, RGBA]
concepts: [image-data, rgba, resolution]
tasks: [read-graph, composite, debug]
prerequisites: [typed-connections]
level: foundation
product_scope: fusion
---

# Image

## Question

Fusionで「画像」と呼んでいるものは、単なるViewerの見た目でしょうか。

## Mental Model

2D Imageを、少なくとも次を持つdataとして考えます。

- RGB color channels
- Alpha
- width / height
- image extent / Domain of Definition
- time-dependent result
- 必要に応じたmetadata / auxiliary channels

Viewerに見える結果は、このImage dataの1つの観察方法です。

## Minimum Example

```text
Background → Transform → Merge
```

BackgroundはImageを生成し、TransformはImageを受け取ってImageを返し、Mergeは複数Imageを合成します。

## Invariants

- ImageとMaskを同じdataとして扱わない。
- Image AlphaとEffect Maskを同一視しない。
- resolutionと見た目のscaleを分ける。
- frame全体とDoDを分ける。
- Viewerに見えないこととImage dataが存在しないことを分ける。

## Change One Thing

同じImageをTransform前後でViewerへ出し、data domainはImageのまま、positionだけ変わることを観察します。

## Transfer

### Generator

Background / Text+はImage sourceを作ります。

### Effect

Transform / Blur / Color Corrector等はImageを受け取ってImageを返します。

### Compositing

Merge / MultiMergeは複数Imageを1 Imageへまとめます。

## Predict

初見NodeがImageを生成・加工・合成するどれかを、Input / Outputから予測できます。

## Common Misread

**Viewerに見えるものはすべてImage domain**と考えること。

Maskやspecialized domainも可視化できる場合がありますが、Graph上のtypeは別です。

## Related Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## Node Reference

- [Background](../../nodes/generators/background)
- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## Next

→ [Mask](./mask)
