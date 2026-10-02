---
title: Edit ↔ Fusionの境界
description: Timeline上のclip責任と、Fusion Flow内のshot処理責任を分けて考える。
doc_type: concept
verification: partial
product_scope: resolve
suite_surfaces: [edit, fusion]
tasks: [timeline, vfx, choose-surface, cross-page-workflow]
level: foundation
---

# Edit ↔ Fusionの境界

## User intent

「この変更はTimeline側で行うのか、Fusion comp内で行うのか」を決めます。

## Which Resolve surface owns what

Blackmagic Designの現行Fusion説明では、MediaIn NodeはEdit Page timeline上のclipを表すものとして案内されています。

このmental modelを使うと:

```text
Edit timeline clip
      ↓
   MediaIn
      ↓
 Fusion Flow
      ↓
   MediaOut
```

と読みやすくなります。

## When Fusion is appropriate

- clip内部のcompositing
- tracked graphics
- cleanup / replacement
- custom title / VFX construction

## When Fusion is not the primary surface

- clip順序
- edit point
- story timing
- timeline全体のshot arrangement

は、まずEdit側の責任として考えます。

## Handoff / boundary

同じtransform / effectをEditとFusionの両方へ重ねる場合は、どちらが意図のownerか明示します。

「見た目が合う」だけではなく、後からどこを直せばよいかが一意になる構成を優先します。

## Related Fusion Concepts

- [Graphとして考える](../learn/01-flow/graph-as-flow)
- [Center / Pivot / Size / Angle](../learn/03-space/center-pivot-size-angle)

## Related cross-page workflow

- [どのworking surfaceを使うか](./choose-working-surface)
- [Fusion assetをResolveで再利用する](./reusable-fusion-assets)

---

Verification note: MediaInとEdit timeline clipの関係はBlackmagic Design現行Fusionページで確認。Timeline/Fusion間のexact processing orderはcurrent project / manualで確認します。
