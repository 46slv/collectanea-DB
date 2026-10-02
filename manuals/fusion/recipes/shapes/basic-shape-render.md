---
title: Shapeを2D Imageへrenderする
description: sEllipseでShapeを作り、sRenderで通常の2D Imageへ変換する最小Recipe。
doc_type: recipe
verification: partial
aliases: [shape render, sEllipse sRender]
concepts: [shape-domain, data-domain]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sRender]
tasks: [shape, render, convert-domain]
prerequisites: [data-domain]
level: intermediate
product_scope: fusion
---

# Shapeを2D Imageへrenderする

## 作るもの（Result）

Shape domainで作った形状を、通常の2D Merge / Blur / Color処理へ渡せるImageにします。

## 必要なもの（Requirements）

- sEllipse
- sRender

## 手順（Steps）

1. sEllipseを作ります。
2. sEllipse outputをsRenderへ接続します。
3. sRender outputをViewerで確認します。
4. 2D Imageとして使う場合は、sRender以降を通常のImage Flowへ接続します。

```text
sEllipse → sRender → 2D Image
```

## なぜこの構成で動くか（Why This Works）

sEllipseはShape streamを出し、sRenderはShape domainを2D Imageへrasterizeします。

→ [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 別の方法（Variants / Alternatives）

sRenderの前へ:

- sTransform
- sDuplicate
- sMerge
- sText

等のShape処理を追加できます。

## うまくいかないときの確認（Failure Checks）

- sEllipse outputを通常Mergeへ直接入れていないか。
- sRender outputをViewerで見ているか。
- Shape処理をsRender後のImage処理と混同していないか。

## 関連パターン（Related Pattern）

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 関連ノード（Related Nodes）

- [sEllipse](../../nodes/shapes/s-ellipse)
- [sRender](../../nodes/shapes/s-render)
