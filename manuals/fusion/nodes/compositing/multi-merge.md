---
title: MultiMerge
description: 多数のForeground Layerを1 Nodeで合成し、各Layerへ個別Merge/Transform controlsを持つcompositing Node。
doc_type: node
verification: partial
aliases: [MultiMerge, Multi Merge]
concepts: [compositing, foreground-background, transform-controls]
nodes: [MultiMerge]
node_family: compositing
inputs: [image]
outputs: [image]
tasks: [composite, layer, multi-layer]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# MultiMerge

多数のForeground Layerを1つのNodeで合成するcompositing Nodeです。

## At a Glance

- **Family**: Compositing
- **Input domain**: 2D Image
- **Output domain**: 2D Image
- **Core concepts**: multi-layer compositing、per-layer transform
- **Common tasks**: 多数のgraphics / elementsを1 Nodeで管理する

## Inputs

Backgroundと複数Foreground Layerを持つ系統です。

Resolve 18.5以降の公式version資料では、Backgroundがoutput resolutionの基準となり、各Layerに個別Merge / Transform controlsがあると説明されています。

## Output

合成済みの2D Imageを出力します。

## Controls

各LayerごとのMerge / Transform controlを持つことはversion-primaryで確認済みです。

exact 21.1 layer management、blend/operator inventory、defaultはcurrent manual / host確認待ちです。

## Behavior / Notes

MultiMergeは「Mergeを何段も繋いだもの」と同じ結果を作れる場面があっても、Graph organizationとlayer managementの責任が異なります。

```text
Background ───────┐
Foreground A ─────┤
Foreground B ─────┼─ MultiMerge → Output
Foreground C ─────┤
                  ┘
```

## Minimal Examples

複数のtitle / graphic / image layerをMultiMergeへまとめ、それぞれのpositionやcompositing設定をLayer単位で管理します。

## Related Concepts

- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## Related Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## Similar / Adjacent Nodes

- Merge — 2 Imageを段階的に合成する基本Node
- Merge 3D — Classic 3D scene domain
- uMerge — USD scene
- dMerge — Deep image

## Version / Verification Notes

MultiMergeはResolve 18.5以降のofficial version資料で確認。21.1 exact controls / layer limits / UI behaviorは未検証です。
