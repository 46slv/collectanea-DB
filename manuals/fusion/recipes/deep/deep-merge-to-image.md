---
title: Deep 合成を2Dへ戻す
description: dMergeでDeep 合成を行い、Deep to Imageで通常の2D Imageへflattenする最小Recipe。
doc_type: recipe
verification: partial
aliases: [deep merge, deep flatten]
concepts: [deep-image, data-domain]
patterns: [defer-domain-conversion]
nodes: [dMerge, Deep to Image]
tasks: [deep, composite, flatten, convert-domain]
prerequisites: [data-domain]
level: advanced
product_scope: fusion
---

# Deep 合成を2Dへ戻す

## 作るもの（Result）

Deep image同士の合成をDeep domainで行い、必要な段階で通常の2D Imageへ戻します。

## 必要なもの（Requirements）

- Deep image A
- Deep image B
- dMerge
- Deep to Image

## 手順（Steps）

1. Deep image A / BをdMergeへ接続します。
2. dMerge outputがDeep imageであることを前提に、Deep処理を完了します。
3. 2D Flowへ戻す地点でDeep to Imageへ接続します。
4. Deep to Image outputを通常の2D Image Nodeへ渡します。

```text
Deep A ─┐
        ├─ dMerge → Deep to Image → 2D Image
Deep B ─┘
```

## なぜこの構成で動くか（Why This Works）

dMergeはDeep samplesを保つ合成を行い、Deep to Imageがflatten boundaryを担当します。

## 別の方法（Variants / Alternatives）

Deep domain内ではdTransform / dResize / dRecolor等の専用Nodeを使う構成があります。

## うまくいかないときの確認（Failure Checks）

- dMergeへ通常2D Imageを直接渡す前提にしていないか。
- Deep to Imageより前にDeep固有処理を終えているか。
- flatten後もDeep sample情報が残ると考えていないか。
- 通常MergeとdMergeの用途を混同していないか。

## 関連パターン（Related Pattern）

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 関連ノード（Related Nodes）

- [dMerge](../../nodes/deep/d-merge)
- [Deep to Image](../../nodes/deep/deep-to-image)
