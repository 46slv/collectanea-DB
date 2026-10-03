---
title: Center / Pivot / Size / Angle
description: 2D Transform系controlを、位置・変形中心・倍率・回転量という別責任として読む。
doc_type: concept
verification: unverified
aliases: [Center, Pivot, Size, Angle, transform controls]
concepts: [coordinate-space, transform-controls]
nodes: [Transform, Merge]
tasks: [position, scale, rotate, layout]
prerequisites: [normalized-coordinates]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Center / Pivot / Size / Angle

> 正確な 初期値・範囲・NodeごとのspaceはFusion 21.1 Manual / 実機で再確認前です。

## このページで分かること

Transform系Nodeで似た見た目を作れるcontrolが複数あるとき、それぞれ何を変えているかを整理します。

## 基本の考え方

2D transformを、少なくとも4つの責任へ分けます。

- **Center** — Imageをどこへ置くか。
- **Pivot** — scale / rotationの基準点をどこに置くか。
- **Size** — どれだけ拡大縮小するか。
- **Angle** — どれだけ回転するか。

同じ「位置が変わったように見える」場合でも、CenterとPivotでは意味が違います。

## 最小例

TransformでCenterだけを変えます。

次にCenterを戻し、Pivotだけを変えた状態でAngleを動かします。

この2つを分けると、「Imageの位置」と「変形の中心」を別々に観察できます。

## 共通ルール

- positionとtransform originを分ける。
- scaleとresolution changeを分ける。
- Nodeごとのcoordinate spaceを同一だと決めない。
- Merge内のForeground transformとTransform Nodeを、見た目だけで同一責任にしない。

## 1つずつ変えて確認する

Center / Pivot / Size / Angleのうち1つだけを変更し、Viewer上の変化を比較します。

## 他のNodeにも応用する

### Transform

4つの役割をそのまま読む基準になります。

### Merge

Foreground transform controlsがある場合も、何を所有させるかを同じ4分類で考えます。

### Mask family

position / size / angleがある場合、Image transformと同じspaceだと決めず、役割だけを転用します。

## 初見のNodeを読む

初見controlでも、「位置」「変形中心」「倍率」「回転」のどれを変えるものかを先に分類できます。

## よくある誤解

**Pivotを動かすこととImageを移動することを同じ操作として扱うこと。**

Pivotは変形中心の責任を持つため、rotation / scaleと組み合わせたときに差が現れます。

## 関連パターン

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## 次に読む

→ [解像度 / アスペクト比（Resolution / Aspect）](./resolution-aspect)
