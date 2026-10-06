---
title: Scale
description: 元の2D Imageに対する倍率でWidth / Heightを変え、出力解像度そのものを拡大・縮小するNode。
doc_type: node
term_id: scale
term_short: Scaleは、元Imageに対する倍率で出力解像度を変更するNode。
verification: partial
aliases: [Scale, SCL]
concepts: [image-data, resolution, transform]
nodes: [Scale]
node_family: transform
controls: [Lock X/Y, Size, X Size, Y Size, Only Use Filter in HiQ, Change Pixel Aspect, Pixel Aspect, Filter Method]
inputs: [image]
outputs: [image]
tasks: [transform-image, resize, resolution]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Scale

Scaleは、元の2D <Term id="image">Image</Term>に対する倍率で出力解像度を変更するNodeです。

Resizeが「1920×1080」のようにピクセル寸法を直接指定するのに対し、Scaleは「2倍」「0.5倍」のように元サイズとの比率で指定します。

## 役割

ImageのWidth / Heightを相対倍率で変更します。

```text
1920×1080
  ↓ Scale 0.5
960×540
```

TransformのSizeと違い、Scaleでは後段へ渡るImageの物理解像度そのものが変わります。

## 入力

### Input

オレンジ色の入力です。解像度を変更したい2D Imageを接続します。

## 出力

指定倍率で解像度が変更された2D Imageを出力します。

Scale後のImageをMergeのBackgroundへ接続すると、そのScale後の解像度がMerge出力の基準になります。

## 主な設定項目

### Lock X / Y

有効にすると1つのSizeでX / Yを同じ倍率にします。

無効にするとX Size / Y Sizeを個別に設定できるため、縦横を別々の倍率へ変更できます。

### Size

元Imageに対する解像度倍率です。

- 1.0: 元と同じ解像度
- 2.0: Width / Heightを2倍
- 0.5: Width / Heightを半分

Imageを画面内で2倍に見せるだけではなく、実際に出力するピクセル寸法が2倍になります。

### Only Use Filter in HiQ

非HiQ renderで選択Filterを使うかどうかを制御します。

### Change Pixel Aspect

有効にするとPixel Aspectを変更できます。

### Filter Method

Scale時の再サンプリング方法を選びます。ManualにはResizeと同様、Box、Linear、Quadratic、Cubic、Catmull-Rom、Gaussian、Mitchell、Lanczos、Sinc、Bessel等が記載されています。

## 最小構成

```text
MediaIn → Scale 0.5 → Output
```

元ImageとScale後のWidth / Heightを比較すると、Transform Sizeとの違いを確認できます。

## 運用例

同じ処理を「入力解像度に対して常に半分」にしたい場合、Scale 0.5を使うと元素材のWidth / Heightへ依存して相対的に縮小できます。

固定の1920×1080へ揃える必要がある場合はResizeの方が意図を読みやすくできます。

## 挙動と注意点

- Scaleは出力解像度を変更します。
- 21.1 Manualでは、物理解像度が時間で変化することになるためScale controlsのアニメーションは推奨されていません。
- 位置・回転・見た目の大きさをアニメーションしたい場合は[Transform](./transform)を先に検討します。
- 正確なピクセル寸法へ揃える場合は[Resize](./resize)を使います。

## 関連する考え方

- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 似たNode・関連Node

- [Resize](./resize) — Width / Heightをピクセル数で指定
- [Transform](./transform) — 解像度を変えずに見た目を拡大縮小
- [Crop](./crop) — 切り出し・キャンバス寸法を変更

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 120、pp.2876–2878で、Input、物理解像度の変更、Lock X/Y、Size、Only Use Filter in HiQ、Change Pixel Aspect、Filter Methodを確認しました。

内部REGID、Edition差、各Filterの実機比較、性能は未確認のため `verification: partial` としています。
