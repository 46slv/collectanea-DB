---
title: Layer MaskとFusion Mask / Alpha
description: Photoshop Layer Maskのhide/reveal modelから、FusionのMask data・Effect Mask・Image Alphaを分離して読む。
doc_type: bridge
verification: partial
product_scope: resolve
familiar_apps: [photoshop]
familiar_terms: [Layer Mask, transparency, mask]
compare_topics: [masking, alpha, effect-mask]
suite_surfaces: [fusion]
tasks: [mask, transparency, composite]
---

# Layer MaskとFusion Mask / Alpha

## Photoshopで知っている考え方

PhotoshopのLayer Maskは、Layerの一部をhide / revealするために使います。

Layer本体のピクセルを直接削除せず、visibilityを非破壊に制御できるのが基本考え方です。

## Resolveではどこで扱うか

Fusionで「どこを見せるか」を扱うとき、まず次を分けます。

- Image自身のAlpha
- Nodeのeffect範囲を制限するEffect Mask
- matte / キーイングで作るalpha情報

## Fusionでの考え方

```text
Image RGB + Alpha
        ↓
   effect node
        ↑
  Effect Mask
```

Photoshop Layer Maskの経験は「処理範囲を別dataとして持つ」という発想には役立ちます。

ただしFusionではEffect MaskとImage Alphaは別責任です。

## 共通する考え方

- 元画像（Source Image）を直接破壊せず、範囲を別に持つ
- mask shapeを後から編集する
- visibility / effect areaを分離して考える

## そのまま対応しない点

- Photoshop Layer Mask = Fusion Effect Mask、ではない。
- Fusion Effect Maskは必ずしもImage Alphaを書き換えない。
- キーイングで作るmatteとEffect Maskも同一ではない。
- Mask Node自体は通常2D Imageではない。

## 次に読む

- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [Alpha](../../learn/04-compositing/alpha)
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連Node

- [Ellipse Mask](../../nodes/masks/ellipse-mask)
- [Polygon Mask](../../nodes/masks/polygon-mask)
- [Merge](../../nodes/compositing/merge)

## 具体例

- [Mergeの適用範囲をMaskで限定する](../../recipes/masking/limit-merge-with-mask)

## 関連する索引

- [Connection / Data Types](../../index/connection-data-types)
- [By Symptom](../../index/by-symptom)

---

検証範囲: Adobeの現行Layer Mask資料で、Maskによる表示・非表示の考え方を確認しています。FusionのMaskとAlphaの違いはFusionの概念ページを基準にします。
