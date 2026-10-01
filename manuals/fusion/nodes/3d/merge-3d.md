---
title: Merge 3D
description: 複数のClassic Fusion 3D scene/object streamを1つの3D sceneへ統合するNode。
doc_type: node
verification: unverified
aliases: [Merge3D, Merge 3D, 3MG]
concepts: [data-domain, classic-3d, scene-graph]
nodes: [Merge 3D]
node_family: 3d
inputs: [classic-3d-scene]
outputs: [classic-3d-scene]
tasks: [combine-3d, scene, composite-3d]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Merge 3D

複数のClassic Fusion 3D scene / object streamを統合するNodeです。

## At a Glance

- **Family**: 3D
- **Input domain**: Classic 3D scene
- **Output domain**: Classic 3D scene
- **Core concepts**: scene graph、typed data
- **Common tasks**: geometry / camera / light等を1 sceneへまとめる

## Inputs

複数のClassic 3D scene / object inputを受ける系統です。exact dynamic input behaviorは21.1で確認します。

## Output

統合したClassic 3D sceneを返します。

2D Imageではありません。

## Controls

3D sceneのmerge / ordering / lighting関連controlがある場合も、exact 21.1 UIを確認してから固定します。

## Behavior / Notes

```text
3D object ─┐
Camera ────┼─ Merge 3D → Renderer 3D → 2D Image
Light ─────┘
```

Merge 3Dと2D Mergeは名前が似てもdata domainが異なります。

## Minimal Examples

Classic 3D objectsをMerge 3Dへまとめ、Renderer 3Dで2D Imageへ変換します。

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Related Patterns

3D Patternは今後追加します。

## Similar / Adjacent Nodes

- Merge — 2D Image compositing
- uMerge — USD scene
- dMerge — Deep image
- sMerge — Shape stream

## Version / Verification Notes

Merge 3Dのidentityと複数3D scene/object統合という役割はlegacy-primary Fusion referenceで確認。
