---
title: Premultiplication
description: RGBとAlphaの保存関係を分け、透明edgeのcolor処理を正しく考える。
doc_type: concept
verification: partial
aliases: [premultiplied alpha, straight alpha, premult]
concepts: [alpha, premultiplication, compositing]
nodes: [Merge, Color Corrector]
tasks: [composite, color-correct, debug, transparency]
prerequisites: [alpha]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Premultiplication

## Question

透明edgeへcolor correctionをかけたとき、なぜ黒縁や色汚れが出ることがあるのでしょうか。

## Mental Model

RGBとAlphaの保存関係には、少なくとも次の考え方があります。

- **premultiplied** — RGBがAlphaの影響を受けた状態。
- **straight / unpremultiplied** — RGBとAlphaを別々に保持する状態。

premultiplied RGBを標準的なOverで合成する概念式は:

```text
Cout = Cf + Cb * (1 - Af)
Aout = Af + Ab * (1 - Af)
```

同じ式をstraight RGBへ無条件に適用しません。

## Minimum Example

透明edgeを持つForegroundへ強いcolor operationを加えます。

結果にedge artifactが出た場合、RGBだけでなくsourceがどのalpha relationshipを前提にしているか確認します。

## Invariants

- RGBとAlphaのrelationを明示する。
- straight / premultipliedを混同しない。
- Alpha Divide → color operation → Alpha Multiplyのような構成は必要な場合だけ使う。
- Node自身に同等のpre/post処理がある場合、二重に適用しない。

## Change One Thing

color operationだけを外し、edge artifactがsourceから存在するか比較します。

## Transfer

### Color correction

透明edgeを強く補正するときのdiagnosticとして使います。

### Merge

Foregroundのalpha-aware compositingを読む基礎になります。

### Keyed elements

key / matteで作ったedgeでもRGB/alpha relationを確認します。

## Predict

透明edge問題で、Maskではなくpremultiplicationを疑うべき場面を切り分けられます。

## Common Misread

**Alphaが正しければRGB edgeも必ず正しい**と考えること。

透明pixel周辺のRGB値とAlphaのrelationが重要です。

## Related Patterns

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## Node Reference

- [Merge](../../nodes/compositing/merge)
- [Color Corrector](../../nodes/color/color-corrector)

## Next

→ [Blend / Operator](./blend-operator)

---

Verification note: standard Over概念式、straight / premultiplied区別、Alpha Divide / Multiplyの考え方はFusion 21系semantic baselineで確認。Node固有optionはcurrent 21.1 evidenceを優先します。
