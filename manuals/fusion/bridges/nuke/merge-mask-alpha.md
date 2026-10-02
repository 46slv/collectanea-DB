---
title: Merge / Mask / Alphaの読み替え
description: Nuke Merge経験をFusion Mergeへ移すとき、input namingとalpha/premult semanticsを分離して読む。
doc_type: bridge
verification: partial
product_scope: fusion
familiar_apps: [nuke]
familiar_terms: [Merge, A input, B input, mask, premult]
compare_topics: [merge, alpha, mask, premultiplication]
suite_surfaces: [fusion]
tasks: [composite, mask, transparency]
---

# Merge / Mask / Alphaの読み替え

## If you know Nuke

Nuke MergeはA / B inputとmaskを持ち、compositing algorithmを選んで複数Imageを合成します。

Foundryのcurrent Merge documentationでは、多くのmerge operationでpremultiplied inputを想定すると説明されています。

## First decision in Resolve

Fusion Mergeでは、まずNukeのA/B namingを忘れ、Fusionのroleを読みます。

- Background
- Foreground
- Effect Mask

## Fusion mental model

```text
Foreground ─┐
            ├─ Merge → Output
Background ─┘
             ↑
          Effect Mask
```

## What maps cleanly

- MergeがImage compositingの中心になる
- operator / modeによって合成意味が変わる
- Maskで処理範囲を制限できる
- premultiplicationを無視できない

## What does not map 1:1

- Nuke A / B = Fusion Foreground / Background、という名前対応を暗記しない。
- available operator inventory / defaultsは別。
- mask behaviorやchannel handlingを同一仕様と仮定しない。
- node scripting identityを流用しない。

## Learn this next

- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)
- [Premultiplication](../../learn/04-compositing/premultiplication)
- [Blend / Operator](../../learn/04-compositing/blend-operator)

## Reusable Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## Relevant Nodes

- [Merge](../../nodes/compositing/merge)

## Example tasks

- [2つのImageを重ねる](../../recipes/compositing/two-image-merge)

## Related index entries

- [Controls / Parameters](../../index/controls-parameters)

---

Verification scope: Foundry current Merge documentation establishes A/B/mask and premult expectations; Fusion-specific input roles and operators remain owned by Fusion canonical content.
