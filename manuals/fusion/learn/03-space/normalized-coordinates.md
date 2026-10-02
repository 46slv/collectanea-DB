---
title: 正規化座標（Normalized Coordinates）
description: Fusionの2D controlで頻出する正規化座標を、ピクセル値と切り分けて考える。
doc_type: concept
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

## このページで分かること（Question）

Centerなどの位置controlを見たとき、ピクセル座標とは違う数値をどう理解すればよいでしょうか。

## 基本の考え方（Mental Model）

Fusionの多くの2D位置controlでは、フレームに対する位置を**正規化された値**として扱う考え方が使われます。

既存のFusion seedでは、代表的な2D Centerを次のように捉えています。

```text
X: 0.0 ───────── 0.5 ───────── 1.0
                 center
Y: 0.0 ───────── 0.5 ───────── 1.0
                 center
```

重要なのは数値の暗記より、**ピクセル数とrelative positionを混同しない**ことです。

## 最小例（Minimum Example）

TransformのCenterを基準に考えます。

```text
Center = (0.5, 0.5)
```

これを画面中央の基準として扱い、Xだけを変えて左右の移動を観察します。

## 共通ルール（Invariants）

概念として残したいのは次です。

- positionの値がピクセル数なのか、フレームに対するrelative 値なのかを確認する。
- Point controlではX/Yを別々に考えられる。
- 同じ座標系を共有できるcontrol同士は、LinkやExpressionで関係を保ちやすい。
- resolution / aspect / Node固有のspaceが関わる場合は、単純な0–1だけで判断しない。

## 1つだけ変えて確認する（Change One Thing）

CenterのYを固定し、Xだけを変えます。

```text
(0.50, 0.50)
→
(0.25, 0.50)
```

1軸だけ変えることで、値と画面上の移動の関係を観察します。

## 他のNodeへ応用する（Transfer）

### Transform

CenterとPivotを「位置」と「変形中心」という別の責任として読めるようにします。

### Merge

Foreground配置用controlがどのspaceで働いているかを、Transformと同じだと決めつけず比較します。

### Mask family

EllipseやPolygonなどでposition / size controlを見たとき、ピクセル値かrelative 値かを先に確認する習慣を転用します。

## 初見Nodeで予測する（Predict）

初見のposition controlを見たら、次を予測して確認します。

1. 値はピクセルかnormalizedか。
2. X/Yを持つPointか。
3. フレーム（Frame）/ Image / ローカルオブジェクト（local object）のどの座標空間（Space）か。
4. resolutionやaspectが変わると同じ見た目を保つか。

## よくある誤解（Common Misread）

**「0.5だから50%」だけで、すべてのNode・すべてのcontrolが同じspaceだと決めること。**

Normalized Coordinateという考え方と、各Nodeが実際にどのspaceを使うかは分けて確認します。

## 関連する再利用構成（Patterns）

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## 次に読む

→ [前景（Foreground）/ 背景（Background）/ マスク（Mask）](../04-compositing/foreground-background-mask)
