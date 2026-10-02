---
title: Blend / Operator
description: 合成結果のmix量と、Foreground/Background間のcompositing演算を別々に理解する。
doc_type: concept
verification: partial
aliases: [Blend, Apply Mode, Operator, compositing mode]
concepts: [blend, compositing-operator, foreground-background]
nodes: [Merge]
tasks: [composite, mix, blend-mode]
prerequisites: [foreground-background, alpha]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Blend / Operator

## Question

Mergeで「どれだけ混ぜるか」と「どう合成するか」は同じcontrolでしょうか。

## Mental Model

少なくとも次を分けます。

- **Blend** — compositing結果と元状態のmix量。
- **Apply / Operator** — ForegroundとBackgroundをどの演算意味で合成するか。

Over、In、Atop、Xor、Screen等は同じ種類の「濃さ違い」ではなく、channel / alpha semanticsが異なるcompositing operationです。

## Minimum Example

まず通常の合成でForeground / Backgroundを確認します。

次にBlendだけを変え、演算modeは固定します。

その後、Blendを戻してOperator / Apply Modeだけを変更します。

## Invariants

- amountとoperationを分ける。
- mode名だけでalpha behaviorを推測しない。
- Screen等を通常のalpha-aware Overと同一視しない。
- input roleが正しいことを確認してからmodeを比較する。

## Change One Thing

BlendかOperatorのどちらか片方だけを変更します。

## Transfer

### Merge

Node固有controlを「amount」と「operation」へ分けて読めます。

### Color / effect nodes

Blend相当のeffect mixがあっても、compositing operatorと同じ意味だと決めません。

### Debugging

「modeを変えたら直った」を原因説明にせず、alpha / channel semanticsへ戻れます。

## Predict

初見のcompositing controlで、値のmixか演算選択かを先に分類できます。

## Common Misread

**Screen / Multiply等をBlend値のpresetのように考えること。**

演算自体が変わるため、RGB / alphaの意味も確認します。

## Related Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## Node Reference

- [Merge](../../nodes/compositing/merge)

## Next

→ [Keyframe / Spline / Time](../05-time/keyframes-spline-time)

---

Verification note: MergeのBlend、Apply/Operatorと複数compositing operationの区別はFusion 21系semantic baselineで確認。21.1 exact UI label / mode inventoryはcurrent Manual / hostで確認します。
