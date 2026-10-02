---
title: Alphaを保ったまま色処理（Color operation）する
description: transparent edgeを持つImageでpremultiplicationを意識し、color処理とAlpha 関係を分離するPattern。
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

# Alphaを保ったまま色処理（Color operation）する

## 使う場面（Problem Family）

透明エッジ（Edge）を持つ前景（Foreground）へ強い色処理（Color operation）を行うと、黒縁・白縁・ハロー（Halo）が出る問題です。

## 前提となる考え方（Concepts）

- [Alpha](../../learn/04-compositing/alpha)
- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## 基本構成（Generic Graph）

必要な場合のconceptual 構造:

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

## 保つべき条件（Invariant）

- 参照元のpremult状態を確認する。
- color operationの前後でRGB / Alpha 関係を意識する。
- Node自身にpre-divide / post-multiply相当機能がある場合は二重処理しない。
- マット（Matte）の形状の問題とpremultiplication問題を分ける。
- effect maskでエッジの乱れ（artifact）を隠して原因解決としない。

## バリエーション（Variants）

### Node-managed

Color Node自身のpremult-aware 設定を使う。

### 明示的に前後処理する方法

Alpha Divide → color → Alpha Multiplyを明示する。

### キーイング pipeline

Keyer / Matte Control後にcolor operationを行い、Merge前でpremult 関係を確認する。

## 失敗しやすい点（Failure Modes）

- straight / premult状態を確認せずpairを挿入する。
- Alpha Divideだけ入れて再premultiplyせず合成する。
- Node側の自動処理とexplicit pairを二重に使う。
- エッジのマット（Matte）の問題をpremultだけで直そうとする。

## この構成を使う手順（Recipes）

- [透明エッジ（Edge）を保って色補正する（Color Correct）](../../recipes/color/transparent-edge-color-correction)

## 関連Node

- [Alpha Divide](../../nodes/matte-keying/alpha-divide)
- [Alpha Multiply](../../nodes/matte-keying/alpha-multiply)
- [Color Corrector](../../nodes/color/color-corrector)
