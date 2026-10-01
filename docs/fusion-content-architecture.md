# Fusion Content Architecture

Status: Proposed canonical structure
Updated: 2026-10-02
Scope: published Fusion documentation under `manuals/fusion/`

## Goal

大量のFusionドキュメントを、単なるNode一覧ではなく次の学習経路として成立させる。

```
概念を理解する
  → 最小例で確かめる
  → 何が不変かを言語化する
  → 別ノード / 別familyへ転用する
  → 実制作で使う
  → 必要な時はReference / Indexへ戻る
```

Learning path と lookup path は分離する。

- **Learn**: 順番に読む。理解を作る。
- **Patterns**: 概念を複数ノードへ転用する橋。
- **Node Reference**: 作業中に引く。Nodeそのものを記述する。
- **Recipes**: 具体的な完成目的から引く。
- **Troubleshooting**: 症状から原因を切り分ける。
- **Index**: 名前・概念・parameter・目的・症状から横断的に入口を作る。

同じ説明を複数領域へ複製しない。各ページ種別は1つの仕事だけを持つ。

## Information architecture

最終的な公開hierarchyは次を基準にする。

```
Fusion 日本語リファレンス
│
├─ Start Here
│  ├─ このマニュアルの使い方
│  ├─ 最初のFlow
│  └─ Nodeを読む
│
├─ Learn
│  │
│  ├─ 01 Flow & Evaluation
│  │  ├─ Graphとして考える
│  │  ├─ Input / Output / 接続
│  │  ├─ Nodeが評価される流れ
│  │  ├─ 中間結果を見る
│  │  └─ Transfer: 初見Nodeを読む
│  │
│  ├─ 02 Image / Mask / Data
│  │  ├─ Image
│  │  ├─ Mask
│  │  ├─ Parameter / Data
│  │  ├─ 接続できるもの・できないもの
│  │  └─ Transfer: Portの種類から役割を推測する
│  │
│  ├─ 03 Coordinates & Space
│  │  ├─ Normalized Coordinates
│  │  ├─ Center / Pivot
│  │  ├─ Size / Angle
│  │  ├─ Resolution / Aspect
│  │  ├─ Domain of Definition
│  │  └─ Transfer: 空間系Controlを別Nodeへ応用する
│  │
│  ├─ 04 Compositing & Alpha
│  │  ├─ Foreground / Background
│  │  ├─ Alpha
│  │  ├─ Premultiplication
│  │  ├─ Blend / Operator
│  │  ├─ Effect Mask
│  │  └─ Transfer: 「何に対して何をするか」を読む
│  │
│  ├─ 05 Time & Automation
│  │  ├─ Frame Evaluation
│  │  ├─ Keyframes / Spline
│  │  ├─ Modifiers
│  │  ├─ Expressions
│  │  ├─ Parameter Linking
│  │  └─ Transfer: Animatable Controlへ同じ考え方を適用する
│  │
│  ├─ 06 Reuse & Structure
│  │  ├─ Instance
│  │  ├─ User Controls
│  │  ├─ Group
│  │  ├─ Macro / Template
│  │  └─ Transfer: 再利用可能なGraphへ変える
│  │
│  └─ 07 Debugging Mental Models
│     ├─ Data typeを辿る
│     ├─ Branchを分離する
│     ├─ Alphaを確認する
│     ├─ Resolution / DoDを確認する
│     └─ Transfer: 症状ではなくGraphを診断する
│
├─ Patterns
│  ├─ Compositing
│  ├─ Masking & Shapes
│  ├─ Transform & Layout
│  ├─ Animation & Automation
│  ├─ Linking & Reuse
│  ├─ Color / Matte / Key
│  ├─ Tracking
│  ├─ Text & Motion Graphics
│  ├─ 3D
│  ├─ Particles
│  └─ Debugging & Performance
│
├─ Node Reference
│  ├─ Compositing
│  ├─ Generators
│  ├─ Transform
│  ├─ Masks
│  ├─ Color
│  ├─ Blur / Filter
│  ├─ Matte / Keying
│  ├─ Warp / Distort
│  ├─ Tracking
│  ├─ Text
│  ├─ Utility / I/O
│  ├─ 3D
│  └─ Particles
│
├─ Recipes
│  ├─ Compositing
│  ├─ Shapes & Masks
│  ├─ Layout
│  ├─ Animation
│  ├─ Text / Graphics
│  ├─ Tracking
│  └─ Automation
│
├─ Troubleshooting
│  ├─ Viewer / Output
│  ├─ Connections
│  ├─ Alpha / Mask
│  ├─ Position / Size / Resolution
│  ├─ Animation / Expression
│  └─ Performance
│
└─ Index
   ├─ Node A–Z
   ├─ Concept A–Z
   ├─ Controls / Parameters
   ├─ By Task
   ├─ By Symptom
   ├─ Connection / Data Types
   └─ Glossary
```

Advanced areas such as 3D, Particles, Tracking and specialized tools should be added as real content grows. Do not publish empty category forests solely to match this target tree.

## Learning transfer model

The central unit is not a Node page. It is a **concept → transfer** loop.

Each Learn concept should produce this progression:

```
1. Question
   ↓
2. Mental model
   ↓
3. Minimum graph / observable example
   ↓
4. Invariant
   ↓
5. Change one variable
   ↓
6. Predict another Node
   ↓
7. Transfer to 2–4 different Nodes/families
   ↓
8. Link to Patterns / Node Reference
```

The learner should leave a concept page able to predict behavior on an unfamiliar Node.

Example of the structural idea only:

```
Normalized Coordinates
  → one canonical position control
  → invariant: normalized 2D position
  → compare how the same idea appears in multiple node families
  → Pattern: aligning and linking positions
  → Reference: exact controls for each Node
```

The concept page owns the general rule. Node pages must link back to it rather than restating the full explanation.

## Patterns as the transfer bridge

Patterns are the important middle layer.

A Pattern is broader than one Node but narrower than a general concept.

```
Concept
  normalized coordinates
      ↓
Pattern
  keep several elements aligned
      ↓
Nodes
  Transform / Merge / Mask / Text / ...
      ↓
Recipe
  concrete finished composition
```

Patterns answer:

- which concept is being reused;
- what remains invariant;
- which part changes by Node family;
- what generic graph shape to look for;
- which Nodes are interchangeable or adjacent choices.

This prevents the manual from becoming either:
- abstract theory with no practical transfer; or
- hundreds of isolated Node pages with no mental model.

## Page ownership rules

### Start Here

Job: orientation only.

Owns:
- how to navigate the manual;
- how to inspect a Flow;
- how Learn / Patterns / Reference / Recipes / Troubleshooting / Index differ.

Does not own:
- deep concept explanations;
- exhaustive parameter tables.

### Learn

Job: understanding.

Owns:
- mental models;
- invariants;
- relationships between ideas;
- transfer exercises.

Does not own:
- exhaustive Node controls;
- goal-specific production steps.

### Patterns

Job: reusable application across Nodes.

Owns:
- generic graph patterns;
- cross-node comparison;
- reusable decisions and tradeoffs.

Does not own:
- one-off final outcomes;
- complete per-Node parameter documentation.

### Node Reference

Job: precise lookup.

Owns:
- purpose;
- input/output;
- controls;
- defaults/ranges where verified;
- Node-specific behavior;
- version notes;
- links to concepts/patterns.

Reference should be concise and structurally consistent. It should not become a tutorial.

### Recipes

Job: concrete result.

Owns:
- target result;
- prerequisites;
- exact procedure;
- alternatives;
- links to the concepts that explain why it works.

### Troubleshooting

Job: diagnosis.

Owns:
- symptom;
- quickest checks;
- likely causes;
- isolation steps;
- fixes;
- related concept links.

### Index

Job: routing only.

Owns:
- lists;
- facets;
- aliases;
- cross-links.

Do not put substantive explanations in Index pages.

## Current-file migration map

Current files are treated as seed content, not the final architecture.

```
manuals/fusion/getting-started.md
  → Start Here

manuals/fusion/concepts.md
  → split across Learn/01–05

manuals/fusion/expressions.md
  → Learn/05-time-and-automation/expressions
  → later exact syntax/details may also receive a Reference surface

manuals/fusion/nodes/*.md
  → Node Reference/<family>/*.md

manuals/fusion/recipes.md
  → Recipes/index + one page per concrete recipe

manuals/fusion/troubleshooting.md
  → Troubleshooting/index + one page per symptom/diagnostic path
```

Do not duplicate old prose while migrating. Move each claim to its canonical owner.

## Folder plan

Target filesystem naming:

```
manuals/fusion/
├─ index.md
├─ start/
├─ learn/
│  ├─ 01-flow/
│  ├─ 02-data/
│  ├─ 03-space/
│  ├─ 04-compositing/
│  ├─ 05-time/
│  ├─ 06-reuse/
│  └─ 07-debugging/
├─ patterns/
├─ nodes/
├─ recipes/
├─ troubleshooting/
└─ index/
```

Use English/stable path names and Japanese page titles.

## Navigation model

There are three different navigation modes.

### 1. Sequential learning

Used in Learn.

Each page may expose:
- prerequisites;
- previous;
- next;
- next concept;
- transfer exercise.

### 2. Structural browsing

Used in Node Reference.

Browse by:
- family;
- alphabetical name;
- input/output type;
- concept;
- shared control.

### 3. Goal/symptom lookup

Used in Recipes / Troubleshooting / Index.

Browse by:
- task;
- desired result;
- symptom;
- parameter;
- alias.

Search complements these modes; it does not replace them.

## External structure references

Checked 2026-10-02.

- Diátaxis distinguishes tutorials, how-to guides, reference and explanation by user need. COLLECTANEA adopts the separation of jobs, but does not force four empty top-level directories.
  - https://diataxis.fr/
- Diátaxis Reference recommends that reference mirror the structure of the machinery and stay consistent/neutral.
  - https://www.diataxis.fr/reference/
- Cycling '74 separates User Guide / Tutorials / Object Reference and provides multiple lookup/navigation surfaces.
  - https://docs.cycling74.com/userguide/
  - https://docs.cycling74.com/userguide/documentation_window/
  - https://docs.cycling74.com/learn/series/max-tutorials/
