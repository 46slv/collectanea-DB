---
title: Maskで処理範囲を限定する
description: effect内容と適用範囲を別分岐として設計し、Mask inputで合流させるPattern。
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

## 使う場面

effectや合成を、画像全体ではなく特定範囲にだけ適用したい場合に使います。

## 前提となる考え方

- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [前景（Foreground）/ 背景（Background）/ マスク（Mask）](../../learn/04-compositing/foreground-background-mask)

## 基本構成

```text
Image / effect branch ── 対象Node → Output
                            ↑
Mask branch ────────────────┘
```

Image 分岐とMask 分岐を別の責任として組み立てます。

## 保つべき条件

- Image側は「何を処理するか」を持つ。
- Mask側は「どこへ処理するか」を持つ。
- 問題が出たときは2 分岐を別々に確認できる。

## バリエーション

### Simple shape mask

Ellipse / Polygonなど1つのMask 参照元で範囲を作ります。

### Animated mask

Mask側のshape / positionを時間変化させます。effect側のアニメーションとは分離して考えます。

### Combined mask

複数Maskを組み合わせる場合でも、最終的に対象Nodeへ渡るMaskの意味を説明できるようにします。

## Nodeの選び方

MergeなどEffect Maskを持つNodeで適用できます。Node固有のMask挙動はReference側で確認します。

## 失敗しやすい点

- MaskをImage inputへ入れようとして役割を混同する。
- Imageの問題をMask調整だけで直そうとする。
- Maskを外した状態の結果を確認せず、原因を絞れない。
- invert / combine等のNode固有設定を概念説明へ混ぜる。

## この構成を使う手順

Recipesは次バッチで追加予定です。

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [Background](../../nodes/generators/background)
