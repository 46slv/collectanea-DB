---
title: Deep to Image
description: Deep imageを通常の2D Imageへflattenするdomain変換Node。
doc_type: node
verification: partial
aliases: [Deep to Image]
concepts: [data-domain, deep-image, flatten]
nodes: [Deep to Image]
node_family: deep
inputs: [deep-image]
outputs: [image]
tasks: [deep, flatten, convert-domain]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
---

# Deep to Image

Deep imageを通常の2D ImageへflattenするNodeです。

## At a Glance

- **Family**: Deep / Conversion
- **Input domain**: Deep image
- **Output domain**: 2D Image
- **Core concepts**: domain conversion、flattening
- **Common tasks**: Deep compositing結果を通常2D Flowへ戻す

## Inputs

### Deep image

dMergeやDeep toolsetから来るDeep imageを受け取ります。

## Output

通常の2D Imageを出力します。

## Controls

flatten / sample resolutionに関するexact control surfaceはFusion 21.1 current manual / runtime verification待ちです。

## Behavior / Notes

Deep to Imageは**Deep image → 2D Image**のdomain boundaryです。

一度2Dへflattenした後は、Deep samplesを前提とするdMerge等へ戻す場合に同じ情報が保持されるとは考えません。

## Minimal Examples

```text
Deep A ─┐
        ├─ dMerge → Deep to Image → Merge / Color / Blur
Deep B ─┘
```

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Related Patterns

Deep-specific Patternは今後追加します。

## Similar / Adjacent Nodes

- Image to Deep — 2D Image → Deep image
- Renderer 3D — Classic 3D scene → 2D Image
- uRenderer — USD scene → 2D Image / AOV
- pRender — Particle set → 2D Image

## Version / Verification Notes

Deep to ImageはResolve/Fusion 20以降のDeep toolsetとしてBlackmagic Design公式version資料系で確認。21.1 exact controlsは未検証です。
