---
title: TextのContent / 配置 / 見た目 / 動きを分ける
description: Text+を1つの巨大設定として扱わず、文字内容・配置・見た目・アニメーション・公開controlの責任を分離するPattern。
doc_type: pattern
verification: partial
aliases: [text architecture, motion graphics text]
concepts: [parameter-ownership, reuse, animation]
patterns: [separate-content-layout-style]
nodes: [Text+, Transform, Merge]
tasks: [text, title, motion-graphics, template, reuse]
level: intermediate
product_scope: fusion
---

# Textの内容 / 配置 / 見た目 / 動きを分ける

## 使う場面（Problem Family）

Text+だけで文字・位置・見た目・アニメーションを全部調整し続け、後からtemplate化したときに何を触ればよいか分からなくなる問題です。

## 前提となる考え方（Concepts）

- [User Controlsで公開インターフェースを作る](../../learn/06-reuse/user-controls)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)
- [キーフレーム / スプライン / 時間（Keyframe / Spline / Time）](../../learn/05-time/keyframes-spline-time)

## 基本構成（Generic Graph）

Text systemを次の責任へ分けます。

```text
Content
  text string
      ↓
Layout
  position / box / alignment
      ↓
Style
  shading / color / appearance
      ↓
Motion
  time / expression / transform
      ↓
Composite
  Merge
```

実装上すべてがText+内部にある場合でも、**設計上の責任**は分けて考えます。

## 保つべき条件（Invariant）

- 内容と配置を同じ意味controlにしない。
- 見た目とアニメーションを独立して変更できるようにする。
- public controlsは利用者が変更すべきintentだけを見せる。
- position責任をText+とTransformの両方へ無秩序に持たせない。
- repeated titleでは基準となる値を明示する。

## バリエーション（Variants）

### Simple title

Text+だけで内容 / 見た目 / basic 配置を持ちます。

### Separate transform

Text+は内容 / 見た目、Transformはposition / scale / rotationを持ちます。

### Template-ready

User ControlsへText、Color、Position等の意味controlを集約し、内部GraphをMacro / Templateにします。

## Nodeの選び方（Node Choices）

- Text+ — text image generation
- Transform — 配置 役割を独立させる候補
- Merge — backgroundとの合成

## 失敗しやすい点（Failure Modes）

- Text+とMergeの両方でpositionを調整し、管理元が分からない。
- アニメーション用offsetを内容/配置のbase 値へ混ぜる。
- templateに内部controlを大量公開する。
- titleごとに同じ見た目を手入力し、再利用関係がない。

## この構成を使う手順（Recipes）

- [Text+をImageへ重ねる](../../recipes/text-graphics/text-over-image)
- [再利用可能なTitle構造を作る](../../recipes/text-graphics/reusable-title-structure)

## 関連Node

- [Text+](../../nodes/generators/text-plus)
- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
