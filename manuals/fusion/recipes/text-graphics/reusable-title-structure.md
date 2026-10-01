---
title: 再利用可能なTitle構造を作る
description: Text+・Transform・Mergeを責任分離し、後からMacro/Templateへ育てやすいtitle Graphを作る。
doc_type: recipe
verification: partial
aliases: [reusable title, title template structure]
concepts: [reuse, user-controls, parameter-ownership]
patterns: [separate-content-layout-style, choose-reuse-boundary]
nodes: [Text+, Transform, Merge]
tasks: [title, motion-graphics, template, reuse]
prerequisites: [node-graph, reuse]
level: intermediate
product_scope: fusion
---

# 再利用可能なTitle構造を作る

> Macro / Templateのexact保存先やEdit Pageへの登録手順はFusion 21.1 current Manualで確認する必要があります。このRecipeはGraph structureとpublic interface設計を扱います。

## Result

titleのcontent・layout・composite責任を分け、後からUser Controls / Macro / TemplateへまとめやすいGraphを作ります。

## Requirements

- Text+
- Transform
- Merge
- Background Image

## Steps

1. Text+で文字内容とappearanceを作ります。
2. position / scale責任を独立させたい場合、Transformを追加します。
3. Background ImageをMergeのBackgroundへ接続します。
4. Text branchをMergeのForegroundへ接続します。
5. 利用者が変更する値を列挙します。
6. internal implementation用parameterとpublic control候補を分けます。
7. repeated useが必要ならGroup / Macro / Template境界を選びます。

```text
Text+
  ↓
Transform
  ↓
Foreground ─┐
            ├─ Merge → Output
Background ─┘
```

## Why This Works

Text content、layout、compositeの責任が分かれるため、style変更・motion追加・template化のchange localityが保ちやすくなります。

## Variants / Alternatives

### Text+ owns layout

単純なtitleならTransformを省略し、Text+側へlayout responsibilityを持たせます。

### External animation

Transformや別parameter sourceでmotionを持たせます。

### Template-ready controls

Text、Color、Position等の意味parameterだけをUser Controlsへ公開します。

## Failure Checks

- 同じpositionを複数Nodeで二重管理していないか。
- public controlが内部実装名のままになっていないか。
- layoutとanimation offsetを同じ値へ押し込んでいないか。
- MergeのForeground / Background roleが正しいか。

## Related Pattern

- [TextのContent / Layout / Style / Motionを分ける](../../patterns/text-motion/separate-content-layout-style)
- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## Related Nodes

- [Text+](../../nodes/generators/text-plus)
- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
