---
title: TransformでImageを移動する
description: Transformを独立した配置責任として挿入し、Imageのpositionを調整する最小Recipe。
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

> Centerの正確な 21.1 numeric space / 初期値は現在の manual / ホスト上での確認待ちです。

## できあがるもの

Imageの処理分岐へTransformを追加し、position責任を独立させます。

## 必要なもの

- 2D Image
- Transform

## 手順

1. 移動したいImageのdownstreamへTransformを追加します。
2. Transform outputをViewerへ表示します。
3. positionに関わるcontrolを1軸だけ変更し、移動方向を確認します。
4. 期待したspaceで動くことを確認してから、最終位置へ調整します。

```text
Image → Transform → downstream
```

## この構成にする理由

Imageの生成／合成と位置調整を別Nodeへ分離すると、配置責任を読みやすくできます。

→ [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)

## 別の方法

- Merge側のtransform controlsを使う構成。
- 複数要素のpositionを共有する構成。
- Resizeでresolution自体を変更する構成。

見た目が似ても役割は同じではありません。

## うまくいかないとき

- ViewerはTransform outputを見ているか。
- Imageがフレーム外へ出ただけか、ピクセルがclipされたか。
- positionとPivotを混同していないか。
- ResizeとTransform Sizeを同じ操作だと思っていないか。

## 関連パターン

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Resize](../../nodes/transform/resize)
