---
title: Normalized Coordinates
description: Fusionの2D controlで頻出する正規化座標を、pixel値と切り分けて考える。
doc_type: concept
verification: unverified
aliases: [正規化座標, normalized position, Center]
concepts: [normalized-coordinates, coordinate-space]
nodes: [Transform, Merge]
tasks: [position, align, layout, automate]
prerequisites: [image-data, parameter-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Normalized Coordinates

> このページの数値仕様は、Fusion 21.1 Reference Manual / hostでの再確認前です。現時点では既存seedを整理したDraftとして扱ってください。

## Question

Centerなどの位置controlを見たとき、pixel座標とは違う数値をどう理解すればよいでしょうか。

## Mental Model

Fusionの多くの2D位置controlでは、frameに対する位置を**正規化された値**として扱う考え方が使われます。

既存のFusion seedでは、代表的な2D Centerを次のように捉えています。

```text
X: 0.0 ───────── 0.5 ───────── 1.0
                 center
Y: 0.0 ───────── 0.5 ───────── 1.0
                 center
```

重要なのは数値の暗記より、**pixel数とrelative positionを混同しない**ことです。

## Minimum Example

TransformのCenterを基準に考えます。

```text
Center = (0.5, 0.5)
```

これを画面中央の基準として扱い、Xだけを変えて左右の移動を観察します。

## Invariants

概念として残したいのは次です。

- positionの値がpixel数なのか、frameに対するrelative valueなのかを確認する。
- Point controlではX/Yを別々に考えられる。
- 同じ座標系を共有できるcontrol同士は、LinkやExpressionで関係を保ちやすい。
- resolution / aspect / Node固有のspaceが関わる場合は、単純な0–1だけで判断しない。

## Change One Thing

CenterのYを固定し、Xだけを変えます。

```text
(0.50, 0.50)
→
(0.25, 0.50)
```

1軸だけ変えることで、値と画面上の移動の関係を観察します。

## Transfer

### Transform

CenterとPivotを「位置」と「変形中心」という別の責任として読めるようにします。

### Merge

Foreground配置用controlがどのspaceで働いているかを、Transformと同じだと決めつけず比較します。

### Mask family

EllipseやPolygonなどでposition / size controlを見たとき、pixel値かrelative valueかを先に確認する習慣を転用します。

## Predict

初見のposition controlを見たら、次を予測して確認します。

1. 値はpixelかnormalizedか。
2. X/Yを持つPointか。
3. frame / image / local objectのどのspaceか。
4. resolutionやaspectが変わると同じ見た目を保つか。

## Common Misread

**「0.5だから50%」だけで、すべてのNode・すべてのcontrolが同じspaceだと決めること。**

Normalized Coordinateという考え方と、各Nodeが実際にどのspaceを使うかは分けて確認します。

## Related Patterns

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## Node Reference

- [Transform](../../nodes/transform)
- [Merge](../../nodes/merge)

## Next

→ [Foreground / Background / Mask](../04-compositing/foreground-background-mask)
