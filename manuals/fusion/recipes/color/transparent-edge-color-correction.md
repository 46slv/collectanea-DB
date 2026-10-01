---
title: 透明Edgeを保ってColor Correctする
description: transparent foregroundをColor Correctするとき、premultiplicationとmatteを分離してedge artifactを避ける構造。
doc_type: recipe
verification: partial
aliases: [color correct transparent edge, premult color correction]
concepts: [alpha, premultiplication, color-adjustment]
patterns: [premult-aware-color-operation]
nodes: [Alpha Divide, Color Corrector, Alpha Multiply]
tasks: [color-correct, transparency, alpha]
prerequisites: [alpha, premultiplication]
level: intermediate
product_scope: fusion
---

# 透明Edgeを保ってColor Correctする

> 必ずAlpha Divide / Multiplyが必要という意味ではありません。Color Node自身のpremult-aware optionがある場合は、current 21.1 behaviorを確認して二重処理を避けます。

## Result

transparent foregroundへColor operationを加えつつ、edge RGB / Alpha relationを壊さない構造を作ります。

## Requirements

- Alphaを持つforeground
- Color operation Node
- source / Node behaviorに応じたpremult handling

## Steps

1. foreground単体でAlphaとedgeを確認します。
2. Color operationを一度適用し、edge artifactが出るか確認します。
3. premult relationが原因と判断できる場合、explicitなAlpha Divide / Multiply構造を検討します。
4. Color operation前へAlpha Divide、後へAlpha Multiplyを置きます。
5. Merge前のforeground単体を再確認します。
6. 最終compositeでedgeを確認します。

```text
Foreground
  → Alpha Divide
  → Color Corrector
  → Alpha Multiply
  → Merge
```

## Why This Works

Color operationをstraight RGB側で行い、composite前にpremult relationへ戻すことで、transparent edge RGBを扱いやすくする構造です。

## Variants / Alternatives

- Color Corrector側のpre/post optionを使う。
- Matte Controlでmatte shapeを別stageとして修正する。
- Keyer後のspill / edge処理を独立させる。

## Failure Checks

- sourceが本当にpremultipliedか。
- Color Nodeが既にpremult-aware processingをしていないか。
- Alpha Divide / Multiplyを二重に使っていないか。
- edge problemがmatte shape由来ではないか。

## Related Pattern

- [Alphaを保ったままColor operationする](../../patterns/color-alpha/premult-aware-color-operation)

## Related Nodes

- [Alpha Divide](../../nodes/matte-keying/alpha-divide)
- [Color Corrector](../../nodes/color/color-corrector)
- [Alpha Multiply](../../nodes/matte-keying/alpha-multiply)
