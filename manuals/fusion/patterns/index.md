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
- [Resolutionを跨いでも位置関係を保つ](./transform/resolution-aware-positioning)

## Animation & Automation

- [Expressionで値の関係を保つ](./automation/link-values-with-expression)

## Linking & Reuse

- [再利用の境界を選ぶ](./reuse/choose-reuse-boundary)

## Color / Matte / Key

- [KeyとCompositeを分ける](./matte-keying/key-then-composite)

## Tracking

- [Trackを解いてから適用先を分ける](./tracking/solve-then-apply-track)

## Text & Motion Graphics

- [TextのContent / Layout / Style / Motionを分ける](./text-motion/separate-content-layout-style)

## Data Domain

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](./data-domain/defer-domain-conversion)

## Debugging & Performance

- [Last Good / First BadでGraphを切る](./debugging/last-good-first-bad)

現在 **11 Pattern** です。Concept → Pattern → Node Referenceの中間層として使います。

具体的な完成手順が必要な場合は [Recipes](../recipes/index) へ、Node固有のcontrolは [Node Reference](../nodes/) を参照します。
