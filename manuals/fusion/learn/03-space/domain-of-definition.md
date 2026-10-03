---
title: 有効領域（Domain of Definition）
description: フレーム（Frame）全体と、実際に有効なピクセルが存在する領域を分けて理解する。
doc_type: concept
verification: partial
aliases: [DoD, Domain of Definition, image domain, ROI]
concepts: [domain-of-definition, region-of-interest, image-extent]
nodes: [Transform, Resize]
tasks: [debug, transform, resize, performance]
prerequisites: [resolution]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# 有効領域（Domain of Definition）

## このページで分かること

フレーム外へ動かしたImageが戻せる場合と、戻せない場合の違いを説明します。

## 基本の考え方

Fusionでは少なくとも次を分けます。

- **フレーム / 画像範囲（Frame / image extent）** — 基準となる幅（width）と高さ（height）。
- **キャンバス（Canvas）** — Imageを扱う空間。
- **有効領域（Domain of Definition / DoD）** — 実際に有効なピクセルが存在する領域。
- **計算領域（Region of Interest / RoI）** — rendererが今回の計算を要求している領域。

DoDは「どこにピクセルが存在するか」、RoIは「どこを今回計算するか」を表します。

## 最小例

```text
Image
  → Transform A: frame外へ
  → Transform B: frame内へ戻す
  → Output
```

途中でピクセルがDoDとして残っていれば戻せる場合があります。途中でclip / cropされて失われた場合は、後段Transformでは復元できません。

## 共通ルール

- 「Viewerに見えない」と「ピクセルが存在しない」を分ける。
- フレームサイズとDoDを同一視しない。
- DoDとRoIを同一視しない。
- Crop / Resize / Transformなどが有効領域をどう扱うかは、各Nodeのリファレンス（Reference）で確認する。

## 1つずつ変えて確認する

途中Nodeを1つ外し、フレーム外ピクセルが後段で戻るか比較します。

## 他のNodeにも応用する

### Transform

位置（position）の問題と、切り落とし（clipping）の問題を分けます。

### Resize / Crop

解像度（resolution）や画像範囲（extent）の変更と、ピクセルが失われることを分けます。

### Blur / Filter

周囲のピクセルを参照する処理では、画面端と有効領域の扱いも確認します。

## 初見のNodeを読む

「端が消えた」症状を見たとき、位置（position）、解像度（resolution）、DoDのどこを調べるべきか判断できます。

## よくある誤解

**Imageがフレーム外にある = ピクセルが削除された**と考えること。

単に見えないだけなのか、実際にデータが失われたのかを観察してから判断します。

## 関連パターン

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Resize](../../nodes/transform/resize)

## 次に読む

診断での使い方:
→ [解像度（Resolution）/ 有効領域（Domain of Definition）を確認する](../07-debugging/resolution-domain-of-definition)

---

検証メモ: フレーム / Canvas / DoD / RoIの区別はFusion 21系の資料で確認しています。Node固有のclippingや領域設定は、現在のFusion 21.1の資料・実機確認を優先します。
