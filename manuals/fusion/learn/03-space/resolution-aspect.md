---
title: Resolution / Aspect
description: pixel dimensions・aspect・normalized positionの関係を分けて考える。
doc_type: concept
verification: partial
aliases: [resolution, aspect ratio, pixel aspect]
concepts: [resolution, aspect-ratio, normalized-coordinates]
nodes: [Resize, Transform]
tasks: [resize, layout, position]
prerequisites: [normalized-coordinates]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Resolution / Aspect

## Question

同じnormalized positionやSizeでも、resolutionが変わると見た目が変わるのはなぜでしょうか。

## Mental Model

少なくとも次を分けます。

- **pixel dimensions** — width × height。
- **display / frame aspect** — 横と縦の比率。
- **pixel aspect** — 1 pixelの表示上の縦横比。
- **normalized coordinates** — frameやreference sizeに対するrelative position。

Fusion 21系のsemantic baselineでは、一般的な2D positionはnormalized coordinateを多用しますが、Pixel Aspect Ratio、reference size、image domainが最終位置へ影響します。

## Minimum Example

同じCenter値を持つ構成で、Imageのresolutionだけを変えます。

見た目が同じか、relative positionは同じでもpixel距離が変わるかを観察します。

## Invariants

- normalized valueとpixel距離は同じ単位ではない。
- Resizeでresolutionを変えることとTransform SizeでImageをscaleすることを分ける。
- fixed-pixel UIを作る場合は、pixel→normalized変換のownerを1箇所へ寄せる。
- aspectが違うImage間で「同じ数値 = 同じ見た目」と決めない。

## Change One Thing

positionを固定したままresolutionだけを変更します。

次にresolutionを固定したままpositionだけを変更します。

## Transfer

### Transform

Centerのrelative positionとpixel distanceを分けます。

### Resize

output resolutionそのものを変更する責任として読みます。

### Masks

円・楕円やsize controlがframe aspectの影響を受ける場合、shape値とdisplay結果を分けて確認します。

## Predict

resolution変更を含むFlowでは、layoutがどの基準へ依存しているかを先に探せます。

## Common Misread

**0.1の移動 = 常に同じpixel数の移動**と考えること。

relative coordinateならreference dimensionsが変わればpixel距離も変わります。

## Related Patterns

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## Node Reference

- [Resize](../../nodes/transform/resize)
- [Transform](../../nodes/transform/transform)

## Next

→ [Domain of Definition](./domain-of-definition)

---

Verification note: normalized coordinateとPixel Aspect / reference size / image domainの関係はFusion 21系semantic baselineで確認。exact Node behaviorは21.1 current evidenceを優先します。
