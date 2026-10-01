# Fusion Index Architecture

Status: Proposed canonical index model
Updated: 2026-10-02
Scope: Fusion manual indexes and cross-navigation

## Goal

検索だけでは拾いにくい「名前を知らない」「概念は分かるがNode名を知らない」「症状から探したい」を解決する。

Indexは1個の巨大一覧にしない。
同じcontent metadataから複数の入口を生成する。

```
Node名が分かる
  → Node A–Z

概念から探す
  → Concept Index

Control名を知っている
  → Controls / Parameters

やりたいことから探す
  → By Task

症状から探す
  → By Symptom

接続の意味から探す
  → Connection / Data Types

用語の意味を探す
  → Glossary
```

## Published index hierarchy

```
Index
├─ Node A–Z
├─ Concept A–Z
├─ Controls / Parameters
├─ By Task
├─ By Symptom
├─ Connection / Data Types
├─ Glossary
├─ By Resolve Surface
└─ By Familiar App
   ├─ After Effects
   ├─ Photoshop
   ├─ Premiere Pro
   └─ Nuke
```

## 1. Node A–Z

Primary key:
- canonical Node name

Also index:
- aliases;
- old/alternate names;
- Japanese search terms where useful.

Row/card fields:

```
Merge
Compositing
Concepts: compositing / alpha / masking
Inputs: image / image / mask
```

The A–Z index should remain a lookup surface, not a replacement for family browsing.

## 2. Concept A–Z

Concepts are stable mental models shared across multiple Nodes.

Examples of concept IDs:

```
alpha
aspect-ratio
center
data-types
domain-of-definition
evaluation
foreground-background
masking
normalized-coordinates
parameter-linking
pivot
premultiplication
resolution
time
```

Each entry links to:
- canonical Learn page;
- related Patterns;
- Nodes carrying the concept;
- related controls.

## 3. Controls / Parameters

This index is essential for transfer learning.

A user often remembers a control name before remembering which Node they saw it on.

Examples:

```
Center
  concept: normalized coordinates
  appears on: multiple spatial nodes
  related: Pivot / Position

Blend
  concept: contribution / compositing
  appears on: multiple processing nodes

Size
  concept: scale
  appears on: transform-like nodes
```

Do not write separate long explanations here.
Each control entry points to:
- canonical concept explanation;
- Nodes that expose it;
- important exceptions.

## 4. By Task

Task vocabulary should match user intent rather than product taxonomy.

Initial task families:

```
合成する
位置を動かす
大きさを変える
回転する
形を作る
Maskする
範囲を限定する
色を変える
透明度を扱う
追従させる
値を連動する
自動化する
繰り返す
Textを作る
Keyする
Trackする
3Dで配置する
軽くする / 高速化する
```

Each task points first to a Pattern or Recipe, then to Node Reference.

Avoid routing a beginner directly into an arbitrary Node list when a reusable Pattern exists.

## 5. By Symptom

Troubleshooting lookup is symptom-first.

Initial symptom families:

```
何も表示されない
黒くなる
透明にならない
Maskが効かない
位置がずれる
Sizeが合わない
画面外で切れる
端が消える
Expressionが効かない
Node同士を接続できない
Animationしない
重い / 遅い
解像度が合わない
Alphaがおかしい
```

Each symptom entry links to:
1. diagnostic page;
2. relevant concepts;
3. likely Node families.

## 6. Connection / Data Types

Browse by what flows through the graph.

Initial types:

- Image
- Mask
- Numeric / scalar data
- Point / coordinate data
- Time-dependent values
- 3D scene/data when documented

This index should make port colors/names understandable without requiring the Node name first.

## 7. Glossary

Glossary is for terminology only.

Entry structure:

```
Term
Short definition
Canonical concept page
Related terms
Aliases
```

Do not turn glossary entries into mini tutorials.

## Metadata contract

Indexes should eventually be generated from frontmatter/content metadata rather than manually maintained tables.

Common fields:

```yaml
doc_type: concept | pattern | node | recipe | diagnostic | index
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
level: foundation | intermediate | advanced
product_scope: fusion | resolve | edit | color | fairlight | media | deliver
familiar_apps: []
familiar_terms: []
compare_topics: []
suite_surfaces: []
verification: verified | unverified | partial
```

Node example:

```yaml
doc_type: node
node_family: compositing
concepts:
  - foreground-background
  - alpha
  - masking
controls:
  - blend
  - apply-mode
inputs:
  - image
  - image
  - mask
outputs:
  - image
tasks:
  - composite
aliases:
  - merge
```

Concept example:

```yaml
doc_type: concept
concepts:
  - normalized-coordinates
tasks:
  - position
  - align
prerequisites:
  - image-mask-data
level: foundation
```

Diagnostic example:

```yaml
doc_type: diagnostic
symptoms:
  - nothing-visible
  - black-output
concepts:
  - evaluation
  - alpha
tasks:
  - debug
```

## 8. By Resolve Surface

統合型ツールとして、同じtaskがResolveのどこに属するかを引ける入口。

Initial facets:

- Edit / Timeline
- Fusion
- Color
- Fairlight
- Media
- Deliver
- Cross-page workflow

This index should answer **where should I do this?** before sending users into a Fusion Node list.

Exact surface behavior is version-sensitive and must be verified before publication.

## 9. By Familiar App

既存アプリ経験を入口にする。

Initial lenses:

- After Effects
- Photoshop
- Premiere Pro
- Nuke

Each app lens is generated from canonical metadata such as:

```yaml
familiar_apps: [after-effects]
familiar_terms: [Composition, Layer, Precomp]
compare_topics: [layer-stack, nesting]
```

Rules:

- app-specific terminology is routing metadata;
- canonical Fusion terminology stays in Learn / Patterns / Reference;
- one page may appear under several familiar-app views without duplicating prose;
- mapping is task/intent-based, not feature-equality-based.

The architecture owner is:
- `docs/resolve-integration-cross-app-architecture.md`

## Canonical ownership

Metadata is not prose.

- Concept explanation lives in Learn.
- Cross-node application lives in Patterns.
- Node-specific facts live in Node Reference.
- Concrete production result lives in Recipes.
- Diagnosis lives in Troubleshooting.
- Index only reads metadata and links to owners.

This prevents one correction from requiring edits in five different index pages.

## Index generation direction

Do not hand-author every index row once volume grows.

Desired pipeline:

```
Markdown frontmatter
      ↓
Docusaurus/catalog projection
      ↓
normalized metadata
      ↓
Node A–Z
Concept Index
Control Index
Task Index
Symptom Index
Data Type Index
Glossary
```

The existing COLLECTANEA catalog/search pipeline is the natural owner for this projection.

Implementation should begin only after the metadata vocabulary has been exercised on a representative sample of:
- 5–10 concepts;
- 10–20 Nodes;
- 5 Patterns;
- several Recipes/Troubleshooting pages.

Do not lock a taxonomy based on only three Node pages.

## UI direction

Manual top should expose two distinct affordances:

```
学ぶ
  → Start Here / Learn

引く
  → Node Reference / Index
```

Index pages should favor:
- compact lists;
- A–Z jump;
- facets;
- counts only when real;
- aliases;
- scan speed.

Avoid:
- large promotional cards;
- long prose;
- duplicating search results UI exactly.

Search and Index complement each other:
- Search = query-driven.
- Index = browse-driven.
