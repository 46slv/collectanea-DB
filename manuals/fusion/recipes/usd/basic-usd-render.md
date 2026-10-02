---
title: USD sceneを2Dへrenderする
description: USD sceneをuMergeでまとめ、uRendererで2D Image / AOVへ変換する最小構造。
doc_type: recipe
verification: partial
aliases: [USD render, uMerge uRenderer]
concepts: [usd-scene, data-domain]
patterns: [defer-domain-conversion]
nodes: [uMerge, uRenderer]
tasks: [usd, render-3d, convert-domain]
prerequisites: [data-domain]
level: advanced
product_scope: fusion
---

# USD sceneを2Dへrenderする

## Result

USD sceneを構成し、通常の2D compositingへ渡せるrender resultを作ります。

## Requirements

- USD scene source（uLoader / uShape等）
- uMerge
- uRenderer

## Steps

1. USD sourceを用意します。
2. 複数sourceがある場合はuMergeへまとめます。
3. USD sceneをuRendererへ接続します。
4. uRendererの2D output / 必要なAOVを確認します。
5. 2D Imageとして使う場合は、その後通常のFusion Image Flowへ接続します。

```text
uLoader / uShape
      ↓
    uMerge
      ↓
   uRenderer
      ↓
2D Image / AOV
```

## Why This Works

uMergeはUSD scene domainを維持し、uRendererがUSD sceneをrender結果へ変換します。

## Variants / Alternatives

- uCamera / uLightsをsceneへ追加する。
- material / textureはUSD toolset内で組む。
- camera-relative normal等のAOVを使う場合は、current 21.x renderer仕様を確認する。

## Failure Checks

- Classic Merge 3DをUSD sceneへ混ぜていないか。
- uRendererへ渡しているのがUSD sceneか。
- renderer output / AOVを通常Imageと同一視していないか。
- 21固有のUSD featureを旧version前提で使っていないか。

## Related Pattern

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## Related Nodes

- [uMerge](../../nodes/usd/u-merge)
- [uRenderer](../../nodes/usd/u-renderer)
