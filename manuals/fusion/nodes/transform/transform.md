---
title: Transform
description: 2D Imageの位置・大きさ・角度・変形中心を調整するTransform Node。
doc_type: node
verification: unverified
aliases: [Transform, 変形]
concepts: [normalized-coordinates, coordinate-space, parameter-data]
patterns: [share-position-across-elements, link-values-with-expression]
nodes: [Transform]
node_family: transform
controls: [Center, Pivot, Size, Angle]
inputs: [image, mask]
outputs: [image]
tasks: [position, scale, rotate, layout, animate]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
slug: /fusion/nodes/transform/transform
---

# Transform

2D Imageの位置・大きさ・角度・変形中心を調整するNodeです。

> Center / Pivot / Size / Angleのexact range・space・defaultはFusion 21.1 Reference Manual / hostで再確認前です。

## At a Glance

- **Family**: Transform
- **Inputs**: Image / Effect Mask
- **Output**: Image
- **Core concepts**: Coordinates、Point parameter、transform ownership
- **Common tasks**: 移動、拡大縮小、回転、複数要素のlayout

## Inputs

### Image

変形対象のImageを受け取ります。

### Effect Mask

Transformの適用範囲を制限できる入力として既存seedに記録されています。exact behaviorは再検証します。

## Output

変形後のImageを出力します。

## Controls

### Center

Imageの配置位置に関わるPoint controlです。Normalized Coordinatesの一般則と、Transform固有のspaceを分けて確認します。

### Pivot

回転・scaleの基準点に関わるcontrolとして既存seedに記録されています。

### Size

uniform scaleに関わるcontrolとして既存seedに記録されています。

### Angle

回転量に関わるcontrolとして既存seedに記録されています。

## Behavior / Notes

Flow全体で「位置責任をどのNodeに持たせるか」を決めると、後からExpressionやlayoutを組みやすくなります。

Merge側にも配置controlがある場合、同じ見た目を作れることと同じ責任を持つことを混同せず、どこをcanonical ownerにするか選びます。

## Minimal Examples

### Basic placement

```text
Image → Transform → Output
```

Centerだけを変更し、他controlを固定して位置挙動を観察します。

### Shared position

複数Transformのposition関係をmaster parameterから派生させる場合は、Pattern側へ責任を移します。

## Related Concepts

- [Normalized Coordinates](../../learn/03-space/normalized-coordinates)
- [Expressions](../../learn/05-time/expressions)
- [Keyframe / Spline / Time](../../learn/05-time/keyframes-spline-time)

## Related Patterns

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## Similar / Adjacent Nodes

ResizeやMerge内のtransform controlsは同じ結果を作る場面があっても、同一Node・同一spaceとは扱いません。比較は個別Referenceで行います。

## Version / Verification Notes

このページは `unverified`。既存seedをReference構造へ移行した段階で、Center / Pivot / Size / Angleのexact behaviorをFusion 21.1 Reference Manual / hostで検証する必要があります。
