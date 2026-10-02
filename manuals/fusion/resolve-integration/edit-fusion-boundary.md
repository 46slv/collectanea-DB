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

## 目的

「この変更はTimeline側で行うのか、Fusion comp内で行うのか」を決めます。

## どのページで何を担当するか

Blackmagic Designの現行Fusion説明では、MediaIn NodeはEdit Page timeline上のclipを表すものとして案内されています。

この考え方を使うと:

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

## Fusionが向いている場合

- clip内部の合成
- tracked graphics
- cleanup / replacement
- custom title / VFX construction

## Fusionを主に使わない場合

- clip順序
- edit point
- story timing
- timeline全体のshot arrangement

は、まずEdit側の責任として考えます。

## ページ間の受け渡し

同じtransform / effectをEditとFusionの両方へ重ねる場合は、どちらが意図の管理元か明示します。

「見た目が合う」だけではなく、後からどこを直せばよいかが一意になる構成を優先します。

## 関連するFusionの考え方

- [Graphとして考える](../learn/01-flow/graph-as-flow)
- [Center / Pivot / Size / Angle](../learn/03-space/center-pivot-size-angle)

## 関連するページ間の流れ

- [どの作業ページを使うか](./choose-working-surface)
- [Fusion assetをResolveで再利用する](./reusable-fusion-assets)

---

検証メモ: MediaInとEdit timeline clipの関係はBlackmagic Design現行Fusionページで確認。Timeline/Fusion間の正確な 処理順は現在の project / manualで確認します。
