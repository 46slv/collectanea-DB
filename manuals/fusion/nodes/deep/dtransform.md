---
title: dTransform
description: Deep ImageのXY位置・Pivot・Sizeと、sample ZのScale / Translateを同時に調整し、depth sampleを保持するTransform Node。
doc_type: node
term_id: dtransform
verification: partial
aliases: [dTransform, dXF]
concepts: [deep-image, transform, depth, mask-data]
nodes: [dTransform]
node_family: deep
controls: [Scale Z, Translate Z, Center X/Y, Pivot X/Y, Size X/Y, Use Size and Aspect, Size, Aspect]
inputs: [deep-image, mask]
outputs: [deep-image]
tasks: [deep, transform, move-depth]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dTransform

dTransformは、<Term id="deep-image">Deep Image</Term>をXY方向へ移動・scaleしながら、Deep sampleのZ値も調整できるTransform Nodeです。

2D見た目だけを動かすのではなく、depth relationshipまで保ったまま変形します。

## 入力

Deep Image inputと任意Effect Maskを受け取ります。

## Z方向

### Scale Z

sample間のdepth rangeを拡大 / 圧縮します。

値を上げると奥行き差が大きくなり、下げるとdepthが圧縮されます。

### Translate Z

sample全体をcameraに対して前後へ移動します。

Viewer SampleからZ値を取得して位置合わせできます。

## XY方向

### Center X/Y

Deep Imageの画面内positionです。

### Pivot X/Y

scaleの中心を変えます。

### Size X/Y

axis別に2D sizeを調整します。

### Use Size and Aspect

有効にするとuniform SizeとAspectで調整できます。

## 最小構成

```text
Deep Element → dTransform → dMerge → Deep to Image
```

foreground Deep renderを少し手前へ出す場合はTranslate Z、screen上のplacementをずらす場合はCenterを使い分けます。

## Transformとの違い

通常Transformは2D Imageを変形します。

dTransformはDeep sampleのZも含めて扱うため、Deep composite途中で奥行き関係を変える場合に使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2250–2251で、Deep / Effect Mask inputs、Scale Z、Translate Z、Center / Pivot / Size / Aspectを確認しました。
