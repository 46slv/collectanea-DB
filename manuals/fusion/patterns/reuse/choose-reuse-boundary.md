---
title: 再利用の境界を選ぶ
description: Copy・Instance・Group・User Control・Macro/Templateを、共有したいものの種類で選ぶPattern。
doc_type: pattern
verification: partial
aliases: [reuse boundary, copy vs instance vs macro]
concepts: [instancing, groups, user-controls, macros, reuse]
patterns: [choose-reuse-boundary]
tasks: [reuse, organize-graph, expose-controls, template]
level: intermediate
product_scope: fusion
---

# 再利用の境界を選ぶ

## Problem Family

「同じものをもう一度使いたい」という理由だけでcopy / instance / group / macroを選ぶと、後からどこを直せばよいか分からなくなります。

## Concepts

- [Instanceで設定を共有する](../../learn/06-reuse/instances)
- [User Controlsで公開interfaceを作る](../../learn/06-reuse/user-controls)
- [GroupでGraphをまとめる](../../learn/06-reuse/groups)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)

## Generic Graph

選ぶ基準を「何を共有したいか」に置きます。

```text
one-time duplicate
  → Copy

same node parameters in several graph locations
  → Instance

several nodes as one editable structural unit
  → Group

semantic controls over internal parameters
  → User Controls

reusable packaged graph + public interface
  → Macro / Template
```

## Invariant

- shared stateのownerが1つ説明できる。
- duplicateするものとlinkするものを混同しない。
- structural organizationとdistributionを別判断にする。
- public interfaceは利用者のintentを表す。

## Variants

### Local reuse

同じcomposition内だけで使う。Instance / Groupが候補になりやすいです。

### Semantic control reuse

内部構造より「どの値を触るか」を統一したい。User Controls + Expressionが候補です。

### Cross-composition reuse

別compやEdit Pageから再利用する。Macro / Template境界を検討します。

## Node Choices

このPatternは特定Nodeを選ぶものではなく、authoring structureを選びます。

## Failure Modes

- すべてCopyして変更が同期しない。
- すべてInstanceにして個別差分を持てない。
- Groupにしただけでpublic interfaceまで完成したと思う。
- Macroへ内部parameterを大量に公開し、再利用側が実装詳細へ依存する。

## Recipes Using This Pattern

- Text+とMergeを再利用可能なtitleへ育てるRecipeを今後追加します。

## Related Node Reference

- [Text+](../../nodes/generators/text-plus)
- [Transform](../../nodes/transform/transform)
