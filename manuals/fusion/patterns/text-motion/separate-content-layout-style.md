---
title: TextのContent / Layout / Style / Motionを分ける
description: Text+を1つの巨大設定として扱わず、文字内容・配置・見た目・animation・公開controlの責任を分離するPattern。
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

# TextのContent / Layout / Style / Motionを分ける

## Problem Family

Text+だけで文字・位置・見た目・animationを全部調整し続け、後からtemplate化したときに何を触ればよいか分からなくなる問題です。

## Concepts

- [User Controlsで公開interfaceを作る](../../learn/06-reuse/user-controls)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)
- [Keyframe / Spline / Time](../../learn/05-time/keyframes-spline-time)

## Generic Graph

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

## Invariant

- contentとlayoutを同じ意味controlにしない。
- styleとanimationを独立して変更できるようにする。
- public controlsは利用者が変更すべきintentだけを見せる。
- position責任をText+とTransformの両方へ無秩序に持たせない。
- repeated titleではsource of truthを明示する。

## Variants

### Simple title

Text+だけでcontent / style / basic layoutを持ちます。

### Separate transform

Text+はcontent / style、Transformはposition / scale / rotationを持ちます。

### Template-ready

User ControlsへText、Color、Position等の意味controlを集約し、内部GraphをMacro / Templateにします。

## Node Choices

- Text+ — text image generation
- Transform — layout responsibilityを独立させる候補
- Merge — backgroundとのcomposite

## Failure Modes

- Text+とMergeの両方でpositionを調整し、ownerが分からない。
- animation用offsetをcontent/layoutのbase valueへ混ぜる。
- templateに内部controlを大量公開する。
- titleごとに同じstyleを手入力し、再利用関係がない。

## Recipes Using This Pattern

- [Text+をImageへ重ねる](../../recipes/text-graphics/text-over-image)
- [再利用可能なTitle構造を作る](../../recipes/text-graphics/reusable-title-structure)

## Related Node Reference

- [Text+](../../nodes/generators/text-plus)
- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
