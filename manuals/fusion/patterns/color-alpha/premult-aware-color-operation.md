---
title: Alphaを保ったままColor operationする
description: transparent edgeを持つImageでpremultiplicationを意識し、color処理とAlpha relationを分離するPattern。
doc_type: pattern
verification: partial
aliases: [premult aware color, alpha divide multiply]
concepts: [alpha, premultiplication, color-adjustment]
patterns: [premult-aware-color-operation]
nodes: [Alpha Divide, Alpha Multiply, Color Corrector]
tasks: [color-correct, transparency, alpha, debug]
level: intermediate
product_scope: fusion
---

# Alphaを保ったままColor operationする

## Problem Family

transparent edgeを持つforegroundへ強いColor operationを行うと、黒縁・白縁・haloが出る問題です。

## Concepts

- [Alpha](../../learn/04-compositing/alpha)
- [Premultiplication](../../learn/04-compositing/premultiplication)

## Generic Graph

必要な場合のconceptual structure:

```text
premultiplied Image
      ↓
 Alpha Divide
      ↓
 color operation
      ↓
 Alpha Multiply
      ↓
 composite
```

## Invariant

- sourceのpremult状態を確認する。
- color operationの前後でRGB / Alpha relationを意識する。
- Node自身にpre-divide / post-multiply相当機能がある場合は二重処理しない。
- matte shapeの問題とpremultiplication問題を分ける。
- effect maskでedge artifactを隠して原因解決としない。

## Variants

### Node-managed

Color Node自身のpremult-aware optionを使う。

### Explicit pair

Alpha Divide → color → Alpha Multiplyを明示する。

### Keying pipeline

Keyer / Matte Control後にcolor operationを行い、Merge前でpremult relationを確認する。

## Failure Modes

- straight / premult状態を確認せずpairを挿入する。
- Alpha Divideだけ入れて再premultiplyせずcompositeする。
- Node側の自動処理とexplicit pairを二重に使う。
- edge matte問題をpremultだけで直そうとする。

## Recipes Using This Pattern

- [透明Edgeを保ってColor Correctする](../../recipes/color/transparent-edge-color-correction)

## Related Node Reference

- [Alpha Divide](../../nodes/matte-keying/alpha-divide)
- [Alpha Multiply](../../nodes/matte-keying/alpha-multiply)
- [Color Corrector](../../nodes/color/color-corrector)
