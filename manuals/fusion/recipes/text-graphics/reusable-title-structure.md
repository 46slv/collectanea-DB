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

> Macro / Templateの正確な保存先やEdit Pageへの登録手順はFusion 21.1 現在の Manualで確認する必要があります。このRecipeはGraph 構造とpublic インターフェース設計を扱います。

## できあがるもの（Result）

titleの内容・配置・合成責任を分け、後からUser Controls / Macro / TemplateへまとめやすいGraphを作ります。

## 必要なもの（Requirements）

- Text+
- Transform
- Merge
- Background Image

## 手順（Steps）

1. Text+で文字内容とappearanceを作ります。
2. position / scale責任を独立させたい場合、Transformを追加します。
3. Background ImageをMergeのBackgroundへ接続します。
4. Text 分岐をMergeのForegroundへ接続します。
5. 利用者が変更する値を列挙します。
6. internal implementation用パラメータとpublic control候補を分けます。
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

## なぜこの構成にするか（Why This Works）

Text 内容、配置、合成の責任が分かれるため、見た目変更・動き追加・template化のchange localityが保ちやすくなります。

## 別のやり方（Variants / Alternatives）

### Text+ owns 配置

単純なtitleならTransformを省略し、Text+側へ配置 役割を持たせます。

### External アニメーション

Transformや別パラメータの供給元で動きを持たせます。

### Template-ready controls

Text、Color、Position等の意味パラメータだけをUser Controlsへ公開します。

## うまくいかないときの確認（Failure Checks）

- 同じpositionを複数Nodeで二重管理していないか。
- public controlが内部実装名のままになっていないか。
- 配置とアニメーション offsetを同じ値へ押し込んでいないか。
- MergeのForeground / Background 役割が正しいか。

## 関連する再利用構成（Pattern）

- [Textの内容 / 配置 / 見た目 / 動きを分ける](../../patterns/text-motion/separate-content-layout-style)
- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## 関連Node

- [Text+](../../nodes/generators/text-plus)
- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
