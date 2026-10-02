# Fusion Authoring Contract

Status: Proposed
Updated: 2026-10-02

## Purpose

大量執筆時に、ページごとの書き方がばらついて「Nodeごとの孤立した説明」へ戻るのを防ぐ。

各ページ種別は固定した役割と構造を持つ。
文章そのものは後で増やしてよいが、情報の置き場所は先に揃える。


## Reader-facing language policy

読者向け本文は、英語に慣れていなくても**日本語だけで一読して意味が分かる**ことを基準にする。

- 一般的な説明は日本語を主にする。 `feature parity`、`mental model`、`canonical`、`owner`、`scope`、`workflow` のような執筆側の英語を、そのまま読者へ押し付けない。
- DaVinci Resolve / Fusion の正式名称、Node名、UI名は英語を維持してよい。例: `Merge`、`Transform`、`MediaIn`、`Viewer`、`Inspector`。
- 技術用語として英語も覚えてほしいものは、初出で **日本語（English）** と書く。例: `前景（Foreground）`、`背景（Background）`、`入力（Input）`、`出力（Output）`、`データ領域（Data Domain）`。
- 一度対応関係を示した後は、毎回括弧書きを繰り返さない。読みやすさを優先する。
- セクション見出しも日本語を先にする。英語を残す場合は補助表記として括弧に入れる。
- frontmatterのmachine-facing key / facet値は英語のままでよい。読者向けの `title` / `description` / 本文はこの規則に従う。

悪い例:

```text
この章はfeature parity表ではありません。
どこをcanonical ownerにするとworkflowが読みやすいか判断します。
```

良い例:

```text
この章は、他のアプリとFusionの機能を一対一で対応させる表ではありません。
どのページを説明の正本にすると、作業の流れが分かりやすいかを判断します。
```

## 基本原則（Core Rule）

**1ページ = 1つの主な役割。**

混ぜないもの:

- 理解させる説明
- 作業手順
- Nodeの仕様記述
- 症状診断
- 索引

必要なら相互リンクで接続する。

## Concept page template

Path:
`manuals/fusion/learn/<chapter>/<concept>.md`

Purpose:
概念を理解し、別Nodeへ転用できる状態にする。

Required structure:

```
# Concept name

## このページで分かること（Question）
このページで何を理解するか。

## 基本の考え方（Mental Model）
一番重要なモデル。

## 最小例（Minimum Example）
最小Graph / 最小観察。

## 共通ルール（Invariants）
Nodeが変わっても残るルール。

## 1つだけ変えて確認する（Change One Thing）
1つだけparameter / connectionを変え、結果を観察。

## 他のNodeへ応用する（Transfer）
### Node / Family A
### Node / Family B
### Node / Family C

## 初見Nodeで予測する（Predict）
初見Nodeで何を予測できるか。

## よくある誤解（Common Misread）
誤解しやすいポイント。

## 関連する再利用構成（Patterns）
## 関連Node
## 次に読む
```

Transferは任意の「関連Node一覧」ではない。

最低でも:
- 何が同じか;
- 何がNode固有か;
- どこを見れば同じ概念だと判断できるか;

を示す。

## Pattern page template

Path:
`manuals/fusion/patterns/<family>/<pattern>.md`

Purpose:
1つの概念を複数Nodeへ適用する再利用可能な解法を示す。

Required structure:

```
# Pattern name

## 使う場面（Problem Family）
どの種類の問題に使うか。

## 前提となる概念（Concepts）
前提となるConcept。

## 基本構造（Generic Graph）
Node名へ依存しすぎない構造。

## 守る原則（Invariant）
構成を変えても残す条件。

## バリエーション（Variants）
### Variant A
### Variant B
### Variant C

## ノードの選び方（Node Choices）
Node familyごとの差。

## よくある失敗（Failure Modes）

## このパターンを使うレシピ（Recipes）
## 関連ノード（Node Reference）
```

Patternは「最終成果物の作り方」ではなく「再利用できる構造」を所有する。

## 関連Node template

Path:
`manuals/fusion/nodes/<family>/<node>.md`

Purpose:
作業中にNodeの事実を速く引けるようにする。

Required structure:

```
# Node Name

One-sentence description.

## At a Glance
- Family
- Inputs
- Output
- Core concepts
- Common tasks

## Inputs

## Output

## Controls
### Control A
### Control B
...

## Behavior / Notes

## Minimal Examples

## Related Concepts
## 関連する再利用構成（Patterns）
## Similar / Adjacent Nodes
## Version / Verification Notes
```

Rules:
- Conceptの長い説明を再掲しない。
- Inspector順だけに依存せず、意味の近いControlsをgroup化してよい。
- default / range / behaviorは確認済みのものだけ断定する。
- Node固有の例外はここに置く。

## Recipe template

Path:
`manuals/fusion/recipes/<family>/<recipe>.md`

Purpose:
具体的な成果を最短距離で作る。

Required structure:

```
# Goal

## 作るもの（Result）

## 必要なもの（Requirements）

## 手順（Steps）

## なぜこの構成で動くか（Why This Works）
短く説明し、Conceptへlink。

## バリエーション（Variants） / Alternatives

## うまくいかないときの確認（Failure Checks）

## 関連パターン（Related Pattern）
## 関連ノード（Related Nodes）
```

Recipeに長い概念講義を書かない。

## Troubleshooting template

Path:
`manuals/fusion/troubleshooting/<family>/<symptom>.md`

Purpose:
症状から原因を切り分ける。

Required structure:

```
# Symptom

## まず確認すること（Fast Checks）
最初の数十秒で確認するもの。

## 原因を切り分ける（Isolate）
問題範囲を小さくする手順。

## 主な原因（Likely Causes）
### Cause A
### Cause B
...

## 修正方法（Fix）

## なぜ起きるか（Why）
Conceptへlink。

## バージョン・例外（Version / Exception Notes）

## 関連する症状（Related Symptoms）
```

## Start Here page template

Purpose:
orientationのみ。

Structure:

```
# Page title

## What you will be able to do

## Do this

## What to notice

## Where to go next
```

深い説明が必要ならLearnへlinkする。

## Index entry contract

Index pages themselves do not own prose.

Generated/manual entry should contain only what scan/search needs:

```
Title
Type / Family
1-line summary
Aliases
Concept / Task / Symptom facets
Destination
```

## Frontmatter baseline

All substantial Fusion pages should converge on:

```yaml
title:
description:
doc_type:
verification:
aliases: []
concepts: []
patterns: []
nodes: []
node_family:
controls: []
inputs: []
outputs: []
tasks: []
symptoms: []
prerequisites: []
level:
product_scope:
familiar_apps: []
familiar_terms: []
compare_topics: []
suite_surfaces: []
```

Not every field is required on every page.
Use empty omission rather than meaningless placeholders.

## Verification states

Use:

- `verified`: primary source and/or host behavior sufficiently checked for the claim set.
- `partial`: some claims checked, material gaps remain.
- `unverified`: draft structure or claims still need verification.

Do not let polished prose hide unverified technical claims.

## Cross-App Bridge template

Path (long-term):

`manuals/resolve/bridges/<app>/<topic>.md`

Temporary Fusion-owned placement is allowed only until Resolve-wide documentation exists.

Purpose:
慣れたアプリの思考モデルからcanonical Resolve/Fusion contentへ翻訳する。

Required structure:

```
# Familiar task / concept

## If you know <App>
starting mental model

## First decision in Resolve
which surface owns this task

## Fusion mental model
only when Fusion is relevant

## What maps cleanly

## What does not map 1:1

## Learn this next

## Reusable Patterns

## Relevant Nodes

## Example Tasks
```

Rules:
- comparison prose is not the canonical explanation of Fusion behavior;
- never force a one-to-one feature mapping;
- non-equivalence is part of the page, not a footnote;
- link to canonical Concept / Pattern / Node pages.

## Resolve Integration page template

Purpose:
Resolve全体とFusionの境界を説明する。

Required structure:

```
# Boundary / workflow

## User intent

## Which Resolve surface owns what

## When Fusion is appropriate

## When Fusion is not the primary surface

## Handoff / boundary

## Related Fusion Concepts

## Related cross-page workflow
```

Do not expand this into complete Edit / Color / Fairlight manuals.

## Cross-link contract

Every Concept page:
- links to at least 1 Pattern when one exists;
- links to multiple relevant Nodes after transfer coverage exists.

Every Pattern:
- links back to its Concepts;
- links to relevant Node Reference;
- may link to Recipes.

Every Node:
- links back to Concepts;
- links to Patterns rather than duplicating general guidance.

Every Recipe:
- links to the Pattern/Concept that explains it.

Every Troubleshooting page:
- links to the concept behind the failure mode.

## Massive-writing workflow

For each new topic:

```
1. classify page type
2. choose canonical owner
3. add metadata
4. write only that page's job
5. add cross-links
6. verify technical claims separately
7. allow indexes/search to discover it from metadata
```

Before creating a new page, ask:

```
Is this:
- something to understand?
- a reusable pattern?
- a machine fact?
- a concrete goal?
- a symptom?
- only an index term?
```

That answer determines the destination.

## Batch writing order

When scaling up, write in this order:

1. core Concept pages;
2. transfer Patterns for those concepts;
3. representative Node Reference pages;
4. index metadata vocabulary;
5. Recipes;
6. Troubleshooting;
7. broader Node coverage;
8. specialized 3D / particles / tracking branches.

This maximizes reuse: later Node/Recipe pages can link to already-established concepts instead of re-explaining them.
