---
title: dTransform
description: Deep Imageのsampleを保持したままXY位置・Pivot・SizeとZ Scale / Translateを変更するDeep Transform Node。
doc_type: node
term_id: dtransform
verification: partial
aliases: [dTransform, dXF]
concepts: [deep-image, transform, depth]
nodes: [dTransform]
node_family: deep
controls: [Scale Z, Translate Z, Center X, Center Y, Pivot X, Pivot Y, Size X, Size Y, Use Size and Aspect, Size, Aspect]
inputs: [deep, mask]
outputs: [deep]
tasks: [deep, transform, move-depth]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dTransform

dTransformは、<Term id="deep-image">Deep Image</Term>のsampleを保持したまま、XY配置とZ depthを変形するNodeです。

## 入力

Deep Imageと任意Effect Maskを受け取ります。

## Z transform

### Scale Z

depth sample間の距離を拡大・圧縮します。

### Translate Z

Deep object全体をcameraへ近づける / 遠ざける方向へ移動します。

## 2D transform

Center X/Y、Pivot X/Y、Size X/Yを持ちます。

Use Size and Aspectを有効にするとuniform Size + Aspectで調整できます。

## 最小構成

```text
Deep Image → dTransform → dMerge → Deep to Image
```

## Transformとの違い

通常Transformは2D Imageを扱います。

dTransformはDeep sampleとZ情報を保持したまま変形します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2250–2251で、Deep / Effect Mask input、Scale Z、Translate Z、Center、Pivot、Size、Aspectを確認しました。
