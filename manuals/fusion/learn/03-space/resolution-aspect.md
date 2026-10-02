---
title: 解像度 / アスペクト比（Resolution / Aspect）
description: ピクセル dimensions・aspect・normalized positionの関係を分けて考える。
doc_type: concept
verification: partial
aliases: [resolution, aspect ratio, pixel aspect]
concepts: [resolution, aspect-ratio, normalized-coordinates]
nodes: [Resize, Transform]
tasks: [resize, layout, position]
prerequisites: [normalized-coordinates]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# 解像度 / アスペクト比（Resolution / Aspect）

## このページで分かること（Question）

同じnormalized positionやSizeでも、resolutionが変わると見た目が変わるのはなぜでしょうか。

## 基本の考え方（Mental Model）

少なくとも次を分けます。

- **ピクセル dimensions** — width × height。
- **display / フレーム aspect** — 横と縦の比率。
- **ピクセル aspect** — 1 ピクセルの表示上の縦横比。
- **normalized coordinates** — フレームやreference sizeに対するrelative position。

Fusion 21系のsemantic baselineでは、一般的な2D positionはnormalized coordinateを多用しますが、ピクセル Aspect Ratio、reference size、image domainが最終位置へ影響します。

## 最小例（Minimum Example）

同じCenter値を持つ構成で、Imageのresolutionだけを変えます。

見た目が同じか、relative positionは同じでもピクセル距離が変わるかを観察します。

## 共通ルール（Invariants）

- normalized 値とピクセル距離は同じ単位ではない。
- Resizeでresolutionを変えることとTransform SizeでImageをscaleすることを分ける。
- fixed-ピクセル UIを作る場合は、ピクセル→normalized変換の管理元を1箇所へ寄せる。
- aspectが違うImage間で「同じ数値 = 同じ見た目」と決めない。

## 1つだけ変えて確認する（Change One Thing）

positionを固定したままresolutionだけを変更します。

次にresolutionを固定したままpositionだけを変更します。

## 他のNodeへ応用する（Transfer）

### Transform

Centerのrelative positionとピクセル distanceを分けます。

### Resize

出力解像度（Output Resolution）そのものを変更する責任として読みます。

### Masks

円・楕円やsize controlがフレーム aspectの影響を受ける場合、shape値とdisplay結果を分けて確認します。

## 初見Nodeで予測する（Predict）

resolution変更を含むFlowでは、配置がどの基準へ依存しているかを先に探せます。

## よくある誤解（Common Misread）

**0.1の移動 = 常に同じピクセル数の移動**と考えること。

relative coordinateならreference dimensionsが変わればピクセル距離も変わります。

## 関連する再利用構成（Patterns）

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## 関連Node

- [Resize](../../nodes/transform/resize)
- [Transform](../../nodes/transform/transform)

## 次に読む

→ [有効領域（Domain of Definition）](./domain-of-definition)

---

検証メモ: normalized coordinateとピクセル Aspect / reference size / image domainの関係はFusion 21系semantic baselineで確認。正確な Node 挙動は21.1 現在の evidenceを優先します。
