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

## 作るもの

Shape domainで作った形状を、通常の2D Merge / Blur / Color処理へ渡せるImageにします。

## 必要なもの

- sEllipse
- sRender

## 手順

1. sEllipseを作ります。
2. sEllipse outputをsRenderへ接続します。
3. sRender outputをViewerで確認します。
4. 2D Imageとして使う場合は、sRender以降を通常のImage Flowへ接続します。

```text
sEllipse → sRender → 2D Image
```

## この構成で動く理由

sEllipseはShape streamを出し、sRenderはShape domainを2D Imageへrasterizeします。

→ [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

<!-- capture-reuse:R02 -->
### 実機の参考例：最小構成の描画結果

sEllipseのShapeをsRenderへ渡し、透明部分を持つ白い楕円の2D Imageへ変換しています。

[![S04の実機撮影：最小構成の描画結果の接続](/img/fusion/captures/S04/graph.png)](/img/fusion/captures/S04/graph.png)

[![S04の実機撮影：最小構成の描画結果の表示結果](/img/fusion/captures/S04/result.png)](/img/fusion/captures/S04/result.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS04の固定例を再掲しています。[撮影条件と確認範囲](/img/fusion/captures/S04/capture.json)で元の設定を確認できます。

## 別の方法

sRenderの前へ:

- sTransform
- sDuplicate
- sMerge
- sText

等のShape処理を追加できます。

## うまくいかないとき

- sEllipse outputを通常Mergeへ直接入れていないか。
- sRender outputをViewerで見ているか。
- Shape処理をsRender後のImage処理と混同していないか。

## 関連パターン

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 関連Node

- [sEllipse](../../nodes/shapes/s-ellipse)
- [sRender](../../nodes/shapes/s-render)
