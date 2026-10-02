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

## 作るもの（Result）

USD sceneを構成し、通常の2D 合成へ渡せるrender 結果を作ります。

## 必要なもの（Requirements）

- USD scene 参照元（uLoader / uShape等）
- uMerge
- uRenderer

## 手順（Steps）

1. USD 参照元を用意します。
2. 複数参照元がある場合はuMergeへまとめます。
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

## なぜこの構成で動くか（Why This Works）

uMergeはUSD scene domainを維持し、uRendererがUSD sceneをrender結果へ変換します。

## 別の方法（Variants / Alternatives）

- uCamera / uLightsをsceneへ追加する。
- material / textureはUSD toolset内で組む。
- camera-relative normal等のAOVを使う場合は、現在の 21.x renderer仕様を確認する。

## うまくいかないときの確認（Failure Checks）

- Classic Merge 3DをUSD sceneへ混ぜていないか。
- uRendererへ渡しているのがUSD sceneか。
- renderer output / AOVを通常Imageと同一視していないか。
- 21固有のUSD featureを旧version前提で使っていないか。

## 関連パターン（Related Pattern）

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 関連ノード（Related Nodes）

- [uMerge](../../nodes/usd/u-merge)
- [uRenderer](../../nodes/usd/u-renderer)
