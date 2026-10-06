---
title: 正規化座標（Normalized Coordinates）
description: Fusionの2D controlで頻出する正規化座標を、ピクセル値と切り分けて考える。
doc_type: concept
term_id: normalized-coordinates
term_short: 解像度から独立して位置を表す正規化座標。
verification: unverified
aliases: [正規化座標, normalized position, Center]
concepts: [normalized-coordinates, coordinate-space]
nodes: [Transform, Merge]
tasks: [position, align, layout, automate]
prerequisites: [image-data, parameter-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---
# 正規化座標（Normalized Coordinates）

> このページの数値仕様は、Fusion 21.1 Reference Manual / 実機での再確認前です。現時点では既存seedを整理したDraftとして扱ってください。

## このページで分かること

<Term id="center-pivot-size-angle">Center</Term>などの位置controlで使われる、ピクセル座標とは異なる数値の読み方を説明します。

## 基本の考え方

Fusionの多くの2D位置controlでは、フレームに対する位置を**正規化された値**として扱う考え方が使われます。

既存のFusion seedでは、代表的な2D <Term id="center-pivot-size-angle">Center</Term>を次のように捉えています。

```text
X: 0.0 ───────── 0.5 ───────── 1.0
                 center
Y: 0.0 ───────── 0.5 ───────── 1.0
                 center
```

重要なのは数値の暗記より、**ピクセル数とrelative positionを混同しない**ことです。

## 最小例

TransformのCenterを基準に考えます。

```text
Center = (0.5, 0.5)
```

これを画面中央の基準として扱い、Xだけを変えて左右の移動を観察します。

## 共通ルール

概念として残したいのは次です。

- positionの値がピクセル数なのか、フレームに対するrelative 値なのかを確認する。
- Point controlではX/Yを別々に考えられる。
- 同じ座標系を共有できるcontrol同士は、LinkやExpressionで関係を保ちやすい。
- resolution / aspect / Node固有のspaceが関わる場合は、単純な0–1だけで判断しない。

## 1つずつ変えて確認する

CenterのYを固定し、Xだけを変えます。

```text
(0.50, 0.50)
→
(0.25, 0.50)
```

1軸だけ変えることで、値と画面上の移動の関係を観察します。

## 他のNodeにも応用する

### Transform

CenterとPivotを「位置」と「変形中心」という別の責任として読めるようにします。

### Merge

Foreground配置用controlがどのspaceで働いているかを、Transformと同じだと決めつけず比較します。

### Mask family

EllipseやPolygonなどでposition / size controlを見たとき、ピクセル値かrelative 値かを先に確認する習慣を転用します。

## 初見のNodeを読む

初見のposition controlを見たら、次を予測して確認します。

1. 値はピクセルかnormalizedか。
2. X/Yを持つPointか。
3. フレーム（Frame）/ Image / ローカルオブジェクト（local object）のどの座標空間（Space）か。
4. resolutionやaspectが変わると同じ見た目を保つか。

## よくある誤解

**「0.5だから50%」だけで、すべてのNode・すべてのcontrolが同じspaceだと決めること。**

Normalized Coordinateという考え方と、各Nodeが実際にどのspaceを使うかは分けて確認します。

## 関連パターン

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## 次に読む

→ [前景（Foreground）/ 背景（Background）/ マスク（Mask）](../04-compositing/foreground-background-mask)
