---
title: Maskで処理範囲を限定する
description: effect内容と適用範囲を別branchとして設計し、Mask inputで合流させるPattern。
doc_type: pattern
verification: partial
aliases: [Effect Mask, mask branch]
concepts: [mask-data, effect-mask]
patterns: [limit-effect-with-mask]
nodes: [Merge, Background]
tasks: [mask, isolate-effect, debug]
level: foundation
product_scope: fusion
---

# Maskで処理範囲を限定する

## Problem Family

effectや合成を、画像全体ではなく特定範囲にだけ適用したい場合に使います。

## Concepts

- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)

## Generic Graph

```text
Image / effect branch ── Target Node → Output
                            ↑
Mask branch ────────────────┘
```

Image branchとMask branchを別の責任として組み立てます。

## Invariant

- Image側は「何を処理するか」を持つ。
- Mask側は「どこへ処理するか」を持つ。
- 問題が出たときは2 branchを別々に確認できる。

## Variants

### Simple shape mask

Ellipse / Polygonなど1つのMask sourceで範囲を作ります。

### Animated mask

Mask側のshape / positionを時間変化させます。effect側のanimationとは分離して考えます。

### Combined mask

複数Maskを組み合わせる場合でも、最終的にTarget Nodeへ渡るMaskの意味を説明できるようにします。

## Node Choices

MergeなどEffect Maskを持つNodeで適用できます。Node固有のMask挙動はReference側で確認します。

## Failure Modes

- MaskをImage inputへ入れようとして役割を混同する。
- Imageの問題をMask調整だけで直そうとする。
- Maskを外した状態の結果を確認せず、原因を絞れない。
- invert / combine等のNode固有設定を概念説明へ混ぜる。

## Recipes Using This Pattern

Recipesは次バッチで追加予定です。

## Related Node Reference

- [Merge](../../nodes/merge)
- [Background](../../nodes/background)
