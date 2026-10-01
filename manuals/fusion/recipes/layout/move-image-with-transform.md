---
title: TransformでImageを移動する
description: Transformを独立したlayout責任として挿入し、Imageのpositionを調整する最小Recipe。
doc_type: recipe
verification: unverified
aliases: [move image, position image]
concepts: [normalized-coordinates, coordinate-space]
patterns: [share-position-across-elements]
nodes: [Transform]
tasks: [position, move, layout]
prerequisites: [normalized-coordinates]
level: foundation
product_scope: fusion
---

# TransformでImageを移動する

> Centerのexact 21.1 numeric space / defaultはcurrent manual / host verification待ちです。

## Result

Imageの処理branchへTransformを追加し、position責任を独立させます。

## Requirements

- 2D Image
- Transform

## Steps

1. 移動したいImageのdownstreamへTransformを追加します。
2. Transform outputをViewerへ表示します。
3. positionに関わるcontrolを1軸だけ変更し、移動方向を確認します。
4. 期待したspaceで動くことを確認してから、最終位置へ調整します。

```text
Image → Transform → downstream
```

## Why This Works

Imageの生成／合成と位置調整を別Nodeへ分離すると、layout責任を読みやすくできます。

→ [Normalized Coordinates](../../learn/03-space/normalized-coordinates)

## Variants / Alternatives

- Merge側のtransform controlsを使う構成。
- 複数要素のpositionを共有する構成。
- Resizeでresolution自体を変更する構成。

見た目が似てもresponsibilityは同じではありません。

## Failure Checks

- ViewerはTransform outputを見ているか。
- Imageがframe外へ出ただけか、pixelがclipされたか。
- positionとPivotを混同していないか。
- ResizeとTransform Sizeを同じ操作だと思っていないか。

## Related Pattern

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## Related Nodes

- [Transform](../../nodes/transform/transform)
- [Resize](../../nodes/transform/resize)
