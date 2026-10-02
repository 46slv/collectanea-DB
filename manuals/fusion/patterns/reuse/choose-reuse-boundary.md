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

## 使う場面（Problem Family）

「同じものをもう一度使いたい」という理由だけでcopy / instance / group / macroを選ぶと、後からどこを直せばよいか分からなくなります。

## 前提となる考え方（Concepts）

- [Instanceで設定を共有する](../../learn/06-reuse/instances)
- [User Controlsで公開インターフェースを作る](../../learn/06-reuse/user-controls)
- [GroupでGraphをまとめる](../../learn/06-reuse/groups)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)

## 基本構成（Generic Graph）

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

## 保つべき条件（Invariant）

- shared stateの管理元が1つ説明できる。
- duplicateするものとlinkするものを混同しない。
- structural organizationとdistributionを別判断にする。
- public インターフェースは利用者のintentを表す。

## バリエーション（Variants）

### 同じGraph内で再利用する場合（Local reuse）

同じcomposition内だけで使う。Instance / Groupが候補になりやすいです。

### Semantic control reuse

内部構造より「どの値を触るか」を統一したい。User Controls + Expressionが候補です。

### Cross-composition reuse

別compやEdit Pageから再利用する。Macro / Template境界を検討します。

## Nodeの選び方（Node Choices）

このPatternは特定Nodeを選ぶものではなく、authoring 構造を選びます。

## 失敗しやすい点（Failure Modes）

- すべてCopyして変更が同期しない。
- すべてInstanceにして個別差分を持てない。
- Groupにしただけでpublic インターフェースまで完成したと思う。
- Macroへ内部パラメータを大量に公開し、再利用側が実装詳細へ依存する。

## この構成を使う手順（Recipes）

- Text+とMergeを再利用可能なtitleへ育てるRecipeを今後追加します。

## 関連Node

- [Text+](../../nodes/generators/text-plus)
- [Transform](../../nodes/transform/transform)
