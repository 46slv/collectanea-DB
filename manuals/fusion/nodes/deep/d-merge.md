---
title: dMerge
description: Deep sample-aware compositingを行うDeep image domainのMerge Node。
doc_type: node
verification: partial
aliases: [dMerge, Deep Merge]
concepts: [data-domain, deep-image, compositing]
nodes: [dMerge]
node_family: deep
inputs: [deep-image]
outputs: [deep-image]
tasks: [deep, composite, merge]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
---

# dMerge

Deep image domainでsample-aware compositingを行うMerge Nodeです。

## At a Glance

- **Family**: Deep
- **Input domain**: Deep image
- **Output domain**: Deep image
- **Core concepts**: per-pixel depth samples、front/back relation
- **Common tasks**: Deep compositing、depth-aware merge

## Inputs

Deep imageを受け取るNodeとしてResolve 20以降のofficial version資料系で確認されています。

exact input count / auxiliary portsはFusion 21.1 current verification待ちです。

## Output

Deep imageを出力します。

通常の2D Imageではありません。

## Controls

Deep compositing operatorやsample handlingに関するcontrolを持つ系統ですが、exact 21.1 UI / defaultは未検証です。

## Behavior / Notes

Deep imageは1 pixelに複数depth sampleを保持できるため、通常2D Mergeのalpha compositingとは同じ問題ではありません。

```text
Deep A ─┐
        ├─ dMerge → Deep to Image → 2D
Deep B ─┘
```

dMergeを「通常Mergeの高品質版」として扱わないことが重要です。

## Minimal Examples

2つのDeep imageをdMergeでcompositeし、必要ならDeep to Imageで2Dへflattenします。

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Alpha](../../learn/04-compositing/alpha)

## Related Patterns

Deep-specific Patternは今後追加します。

## Similar / Adjacent Nodes

- Merge — 2D Image
- Merge 3D — Classic 3D scene
- uMerge — USD scene

## Version / Verification Notes

dMergeはResolve/Fusion 20以降のDeep toolsetとしてBlackmagic Design公式version資料系で確認。21.1 exact controls / sample rulesは未検証です。
