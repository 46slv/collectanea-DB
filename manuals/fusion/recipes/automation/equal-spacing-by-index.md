---
title: 複数要素を等間隔に配置する考え方
description: min・max・index・countを分け、複数要素のpositionを規則的に派生させるRecipe。
doc_type: recipe
verification: unverified
aliases: [equal spacing, distribute, indexed layout]
concepts: [expressions, normalized-coordinates, parameter-linking]
patterns: [master-follower-parameters, resolution-aware-positioning]
nodes: [Transform]
tasks: [layout, distribute, automate, repeat]
prerequisites: [expressions, normalized-coordinates]
level: intermediate
product_scope: fusion
---

# 複数要素を等間隔に配置する考え方

> 正確な Fusion Expression syntaxは21.1 現在の Manual / ホスト上での確認待ちです。このページでは、数式構造とパラメータの管理関係を扱います。

## できあがるもの

複数要素を、手入力ではなくindexと個数から等間隔へ配置できる構造にします。

## 必要なもの

- start position
- end position
- element count
- element index

## 手順

0-based indexを使う場合、概念式は次です。

```text
t = index / (count - 1)

position = start + (end - start) * t
```

例:

```text
count = 5
index = 0,1,2,3,4
```

なら、startからendまでを4区間へ分けます。

## この構成にする理由

各要素へpositionを手入力せず、

- start
- end
- count
- index

という少数の意味パラメータから最終positionを導きます。

## 別の方法

### Center + spacing

```text
position = center + (index - centerIndex) * spacing
```

### Fixed ピクセル spacing

resolution-aware conversionを1箇所で行います。

### 2D grid

row / column indexへ分解し、X / Yを別々に導きます。

## うまくいかないとき

- count = 1で `count - 1` が0になる。
- 0-based / 1-based indexを混同する。
- normalized 値とピクセル spacingを混同する。
- 各要素へlocal補正を入れすぎて等間隔の基準となる値を失う。

## 関連パターン

- [親・追従パラメータ（Master / Follower）を作る](../../patterns/automation/master-follower-parameters)
- [Resolutionを跨いでも位置関係を保つ](../../patterns/transform/resolution-aware-positioning)

## 関連Node

- [Transform](../../nodes/transform/transform)
