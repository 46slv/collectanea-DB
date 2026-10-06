---
title: パターン（Patterns）
description: Conceptを複数Nodeへ転用するための、再利用可能なGraph構造と判断パターン。
doc_type: index
verification: partial
product_scope: fusion
tasks: [build, reuse, choose-structure]
---

# パターン（Patterns）

Patternは、1つのNodeの説明でも、完成物の手順でもありません。

**Conceptを実制作へ運ぶための、繰り返し使えるGraphの考え方**をまとめます。

## 合成（Compositing）

- [画像を段階的に重ねる](./compositing/stack-images-with-merge)
- [Merge chainとMultiMergeを選ぶ](./compositing/choose-merge-vs-multimerge)

## マスク（Masking）

- [Maskで処理範囲を限定する](./masking/limit-effect-with-mask)

## Transform / 配置（Layout）

- [複数要素の位置関係を共有する](./transform/share-position-across-elements)
- [Resolutionを跨いでも位置関係を保つ](./transform/resolution-aware-positioning)

## アニメーションと自動化（Animation & Automation）

- [基準値とアニメーションのオフセット（Offset）を分ける](./animation/base-and-animation-offset)
- [Expressionで値の関係を保つ](./automation/link-values-with-expression)
- [親・追従パラメータ（Master / Follower）を作る](./automation/master-follower-parameters)

## 連動と再利用

- [再利用の境界を選ぶ](./reuse/choose-reuse-boundary)

## Color / Alpha

- [アルファ（Alpha）を保ったまま色処理する](./color-alpha/premult-aware-color-operation)

## Color / Matte / Key

- [Keyと合成を分ける](./matte-keying/key-then-composite)

## トラッキング

- [Trackを解いてから適用先を分ける](./tracking/solve-then-apply-track)

## Text & モーショングラフィックス

- [Textの内容 / 配置 / 見た目 / 動きを分ける](./text-motion/separate-content-layout-style)

## データ領域（Data Domain）

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](./data-domain/defer-domain-conversion)

## 診断と処理性能

- [Last Good / First BadでGraphを切る](./debugging/last-good-first-bad)

現在 **15 Pattern** です。Concept → Pattern → Node Referenceの中間層として使います。

具体的な完成手順が必要な場合は [Recipes](../recipes) へ、Node固有のcontrolは [Node Reference](../nodes/) を参照します。
