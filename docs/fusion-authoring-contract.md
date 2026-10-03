# Fusion Authoring Contract

Status: Active
Updated: 2026-10-03

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

## Node Reference template

Path:
`manuals/fusion/nodes/<family>/<node>.md`

Purpose:
作業中にNodeの事実を速く引けるだけでなく、**そのNodeを初めて見た読者が「何を入れると、何が起きて、何に使えるか」をこのページだけで理解できる状態**にする。

Node Referenceは辞書の見出しではない。別の専門語で役割名を言い換えるだけの説明を避ける。

悪い例:

```text
主な用途
ShapeをGrid複製。
```

この書き方では、`Grid複製` が何を意味するか分からない読者に情報が増えていない。

良い例:

```text
sGridは、入力したShapeを横方向と縦方向へ規則正しく並べ、行列状の反復パターンを作るNodeです。
同じ円や四角を一定間隔で並べたいときに使います。
```

Required structure:

```
# Node Name

1〜3文の平易な説明。
「何を受け取り」「何をする」「結果がどうなるか」を専門語だけで圧縮せず書く。

## 役割
このNodeがFlowの中で何を担当するか。
名前を言い換えるだけでなく、入力前と出力後で何が変わるかを書く。

## 入力
### Input A
- 受け取るデータ領域
- 何を接続する場所か
- 必須 / 任意が確認できている場合は明記

## 出力
- 返すデータ領域
- 後段で何へ接続できるか
- Viewerへ直接表示できない場合は、その理由と変換Nodeを書く

## 主な設定項目
確認済みのControlだけを、値の意味と見た目の変化が分かる形で説明する。
Inspector名の列挙だけにしない。

## 主な用途
「○○処理」「Grid複製」のような短い名詞で終わらせず、実際に何を作るときに使うかを2〜4例示す。

## 最小構成
最小Graphを示す。

## 運用例
具体的な素材・目的・接続結果を1つ以上示す。
例: 小さな円を入力して、横8×縦6へ並べ、ドット背景を作る。

## 挙動と注意点
Node固有の例外、data domain、rasterize前後、重い使い方、似たNodeとの違い等。

## 関連する考え方
## 関連する再利用構成（Patterns）
## 似たNode・関連Node
## バージョンと検証状況
```

Rules:
- Conceptの長い説明を丸ごと再掲しない。ただし、**そのNodeを理解するために最低限必要なConcept説明はページ内にも書く**。リンクを踏まないと役割が分からない状態にしない。
- 専門語を専門語で定義しない。初学者が結果を想像できる具体語へ開く。
- `description` / 冒頭 / `主な用途` を同じ一文のコピーで埋めない。それぞれ「検索用要約」「役割の説明」「実際の用途」を分ける。
- Inspector順だけに依存せず、意味の近いControlsをgroup化してよい。
- default / range / behaviorは確認済みのものだけ断定する。
- exactな端子名を未確認でも、確認済みのdata domainと接続の役割は説明する。
- Node固有の例外はここに置く。
- 代表的なNodeでは、後から操作画面・Node graph・Before/After等の画像を追加できる構造にする。画像が未用意の段階で空placeholderを大量生成しない。
- 読者に先に理解してほしいデータ領域や概念（Shape、Mask、Deep等）がある場合はConceptページを用意し、本文の重要な初出へ `<Term>` を付ける。hover説明は短い定義、詳しい説明はConceptページを正本とする。
- 同じ用語を一文ごとにhover化しない。初出・意味が分かりにくい箇所・別概念との区別が重要な箇所を優先する。

## Node Referenceの完成条件

Nodeページは、項目が埋まっているだけでは完成としない。初見の読者がページを読んだ後に、少なくとも次を説明できることを目標にする。

- 何を入力するNodeか
- 入力に対して何が起きるか
- 何を出力し、次にどこへつなげるか
- 主要Controlを変えると結果がどう変わるか
- 最小Graphを1つ組んで挙動を確かめる方法
- 似たNodeと迷ったときの最初の選択基準
- どこまでが21.1 Manual / 公式資料 / 実機で確認済みか

「用語を別の用語へ置き換えただけ」「分類名と一行要約だけ」「未検証なので具体的な役割も書かない」は未完成として扱う。

### Nodeの型に合わせて構成を変える

全Nodeへ同じ見出しを機械的に強制しない。上の必須情報を保ちながら、Nodeの役割に応じて説明順を変えてよい。

| 型 | 最初に説明すること | 重視する項目 |
| --- | --- | --- |
| Generator / Source | 何を新しく作るか | 入力がないこと、生成Control、最小出力 |
| Processor / Transform | 入力の何を変えるか | 入力→変化→出力、変化量、Before/After |
| Combiner / Mixer | 何をどうまとめるか | 各入力の役割、順序、重なり・演算 |
| Converter / Renderer | どのデータ領域から何へ変えるか | domain境界、変換後に接続できるNode |
| Controller / Modifier / Region | 何の値・範囲を制御するか | 対象側の入力、直接画像を作らない場合の意味 |

該当しない見出しを空で残すより、そのNodeで必要な説明を前へ出す。

### Family Overview

Shape、Particle、Deep、USD、Classic 3D、Krokodoveなど、Node名を読む前にデータ領域や共通構造を理解した方がよいFamilyは、`manuals/fusion/nodes/<family>/index.md` に短いFamily Overviewを持てる。

Family OverviewはConceptの全文コピーではなく、Referenceを選ぶための地図を担当する。

- 何を扱うFamilyか
- 典型的なInput / Output domain
- 「作る / 変える / 増やす / 組み合わせる / 描画する」等の役割分類
- 最小の代表Graph
- 2D Imageへ戻す境界やrenderer
- 詳細Conceptへのリンク
- 代表Nodeへのリンク

概念の正本はLearn、個別仕様の正本は各Node Referenceに置く。

### 根拠の扱い

`verification` はページ全体の状態であり、個々の主張の根拠を隠すために使わない。

- **21.1 Manualで確認**: 現行Reference Manual本文・図・表で確認できた内容。
- **公式発表で確認**: release note / New Features等で名称や役割だけ確認した内容。
- **実機確認**: 現行hostで端子・Inspector・結果を観測した内容。
- **構成案 / 確認案**: 確認済みの役割から組み立てた提案。実機結果として書かない。

Manualに端子名・Control名・例があるなら、`partial`だからという理由でそれらを伏せない。逆に一行summaryしかないNodeでは、文章量を揃えるために存在しないControlやレシピを作らない。

出典は必要なページで `出典と確認範囲` にManual章・ページ、release note、runtime条件等を残す。公式資料の文章や画像を大量に複製せず、独自の説明として再構成する。

### 画像

画像は装飾ではなく、文章だけでは理解しにくい点を示すために置く。優先順の目安:

1. Node tile / 接続端子
2. 最小Graph
3. 説明している主要Inspector部分
4. 結果画像またはBefore / After

すべてを全ページへ義務化しない。自前の実機captureや検証用素材を優先し、公式Manualの画像をそのまま転載することを標準手段にしない。

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
