---
title: Patterns
description: Conceptを複数Nodeへ転用するための、再利用可能なGraph構造と判断パターン。
doc_type: index
verification: partial
product_scope: fusion
tasks: [build, reuse, choose-structure]
---

# Patterns

Patternは、1つのNodeの説明でも、完成物の手順でもありません。

**Conceptを実制作へ運ぶための、繰り返し使えるGraphの考え方**をまとめます。

## Compositing

- [画像を段階的に重ねる](./compositing/stack-images-with-merge)

## Masking

- [Maskで処理範囲を限定する](./masking/limit-effect-with-mask)

## Transform / Layout

- [複数要素の位置関係を共有する](./transform/share-position-across-elements)

## Animation & Automation

- [Expressionで値の関係を保つ](./automation/link-values-with-expression)

## Linking & Reuse

- [再利用の境界を選ぶ](./reuse/choose-reuse-boundary)

## Debugging & Performance

- [Last Good / First BadでGraphを切る](./debugging/last-good-first-bad)

現在6 Patternです。Concept → Pattern → Node Referenceのcross-linkが実際に成立するかを、この代表集合で検証します。

具体的な完成手順が必要な場合は [Recipes](../recipes) へ、Node固有のcontrolは [Node Reference](../nodes/) を参照します。
