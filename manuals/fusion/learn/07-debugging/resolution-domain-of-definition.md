---
title: Resolution / Domain of Definitionを確認する
description: frame size・有効pixel領域・計算要求領域を分け、切れ・消失・位置ずれを診断する。
doc_type: concept
verification: partial
aliases: [DoD, Domain of Definition, resolution, canvas]
concepts: [resolution, domain-of-definition, canvas, roi]
tasks: [debug, resize, transform, performance]
prerequisites: [coordinate-space, image-data]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Resolution / Domain of Definitionを確認する

## Question

画像をTransformしたら端が消えた、戻しても復活しない、Nodeによってframe外の扱いが違うのはなぜでしょうか。

## Mental Model

「画像サイズ」を1つの概念にまとめず、少なくとも次を分けます。

- **Frame / image extent**: nominalなwidth / height。
- **Canvas / image space**: 画像が配置される空間。
- **Domain of Definition (DoD)**: 実際に有効pixelが存在する領域。
- **Region of Interest (RoI)**: rendererが今回計算を要求している領域。

DoDは「どこにpixelが存在するか」、RoIは「どこを今計算してほしいか」で、同じものではありません。

## Minimum Example

TransformでImageをframe外へ動かし、その後戻す構成を考えます。

```text
Image → Transform A (outside) → Transform B (back) → Output
```

Aの段階で有効pixelが保持されていれば戻せる場合があります。途中でclip / cropされてpixelが失われれば、Bで位置を戻しても復活しません。

## Invariants

- frame sizeとDoDを同じだと決めない。
- 「見えない」と「pixelが失われた」を分ける。
- Crop / Resize / Transform等でdomain behaviorが変わる可能性を考える。
- performance問題ではRoIとDoDの広がりも候補にする。
- exact clipping behaviorはNodeごとにReferenceで確認する。

## Change One Thing

途中Nodeを1つ外し、frame外へ出したpixelが後段で戻せるか比較します。

位置だけでなく、「その時点でpixelが存在しているか」を意識してViewer / Node behaviorを確認します。

## Transfer

### Transform

position problemとclipping problemを分けます。

### Blur / Filter

filterによって必要領域が広がる場合、edgeやdomain behaviorを確認します。

### Resize / Crop

resolutionを変える操作と、単にImageをscaleする操作を同一視しません。

## Predict

「端が切れる」症状を見たら、次を順に考えられます。

1. 画面外にあるだけか。
2. DoDとしてpixelは残っているか。
3. 途中でclip / cropされたか。
4. resolution自体が変わったか。

## Common Misread

**Transformのpositionを元へ戻せば、どこかで失われたpixelも必ず戻ると思うこと。**

後段は存在するdataしか再配置できません。

## Related Patterns

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## Node Reference

- [Transform](../../nodes/transform/transform)
- Resize Referenceはこのバッチで追加します。

## Next

→ [症状ではなくGraphを診断する](./diagnose-graph-not-symptom)

---

Verification note: DoD / RoI / frame extentの区別はFusion 21系semantic baselineに基づく。Nodeごとのcurrent clipping/domain optionは21.1 host/manual verificationを優先します。
