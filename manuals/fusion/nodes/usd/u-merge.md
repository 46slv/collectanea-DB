---
title: uMerge
description: 複数のUSD scene / object streamを1つのUSD sceneへ統合するNode。
doc_type: node
verification: partial
aliases: [uMerge, USD Merge]
concepts: [data-domain, usd-scene, scene-graph]
nodes: [uMerge]
node_family: usd
inputs: [usd-scene]
outputs: [usd-scene]
tasks: [usd, combine-3d, scene]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
---

# uMerge

複数のUSD scene / object streamを統合するNodeです。

## At a Glance

- **Family**: USD
- **Input domain**: USD scene
- **Output domain**: USD scene
- **Core concepts**: USD scene graph、typed data
- **Common tasks**: USD objects / lights / camerasを1 sceneへまとめる

## Inputs

複数のUSD scene inputを受ける系統として扱います。dynamic inputやlayering semanticsのexact 21.1挙動はcurrent manual / host確認待ちです。

## Output

統合したUSD sceneを出力します。

通常の2D ImageやClassic Fusion 3D sceneではありません。

## Controls

scene merge / hierarchyに関するcontrolを持つ可能性がありますが、exact Inspector項目は未検証です。

## Behavior / Notes

```text
uShape / uLoader ─┐
uCamera ──────────┼─ uMerge → uRenderer → 2D Image / AOV
uLight ───────────┘
```

uMergeとMerge 3Dは名前が似ても別pipelineです。

## Minimal Examples

複数のUSD object / camera / lightをuMergeで1 sceneへまとめます。

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Related Patterns

USD Patternは今後追加します。

## Similar / Adjacent Nodes

- Merge 3D — Classic Fusion 3D
- Merge — 2D Image
- dMerge — Deep image

## Version / Verification Notes

uMergeはResolve 18.5以降のUSD toolsetとしてBlackmagic Design公式version資料系で確認。21.1 exact input / merge semanticsは未検証です。
