---
title: Crop
description: 2D Imageの一部を切り出す、または別のキャンバス寸法へ配置し、出力解像度そのものを変更するNode。
doc_type: node
term_id: crop
term_short: Cropは、Imageの切り出しやキャンバス寸法変更を行い、出力解像度を変えるNode。
verification: partial
aliases: [Crop, Crp]
concepts: [image-data, resolution, domain-of-definition]
nodes: [Crop]
node_family: transform
controls: [Offset X, Offset Y, Size X, Size Y, Keep Aspect, Keep Centered, Reset Size, Reset Offset, Change Pixel Aspect, Pixel Aspect, Clipping Mode, Auto Crop]
inputs: [image]
outputs: [image]
tasks: [transform-image, crop, resolution, format]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Crop

Cropは、2D <Term id="image">Image</Term>の一部を切り出したり、Imageを別のキャンバス寸法へ配置したりするNodeです。Maskのように見えない部分を隠すだけではなく、出力ImageのWidth / Heightそのものを変更します。

## 役割

Cropは「どの範囲を新しいImageとして出力するか」を決めます。

```text
元Image
  ↓
 Crop
  ↓
切り出された別解像度のImage
```

Crop後のImageをMergeのBackgroundへ接続すると、そのCrop後の解像度がMerge出力の基準になります。

## 入力

### Input

オレンジ色の入力です。切り出したい2D Imageを接続します。

## 出力

Size X / Yで指定したピクセル寸法の2D Imageを出力します。

Cropでは出力解像度が変わるため、後段の正規化座標やMergeのキャンバス基準にも影響します。

## 主な設定項目

### Offset X / Y

入力Imageを出力キャンバスに対して左右・上下へずらします。値はピクセル単位です。

Imageをずらして出力範囲の外へ出た部分はCropされます。

### Size X / Y

Crop後の出力Width / Heightをピクセル単位で指定します。

「どの範囲を残すか」だけでなく、出力Imageの解像度そのものを決めるControlです。

### Keep Aspect

有効にすると、入力Imageの縦横比を保つようにCropします。

### Keep Centered

有効にすると、Sizeを変えてもImageが中央に残るようOffset X / Yを自動調整します。

中央から均等に切り詰めたい場合に使いやすい設定です。

### Reset Size / Reset Offset

- **Reset Size**: 出力寸法を入力Imageのサイズへ戻す
- **Reset Offset**: Offset X / Yを既定位置へ戻す

### Change Pixel Aspect

有効にすると、出力ImageのPixel Aspectを変更できます。

### Clipping Mode

Domain of Definition（DoD）をどう扱うかを選びます。

- **Frame**: full frameをDoDとして扱う既定動作。upstream DoD外はblack / transparentとして扱う
- **Domain**: upstream DoDを尊重する
- **None**: source image clippingを行わない

Blurなど、現在のDoD外側のpixelを参照する処理と組み合わせた場合に違いが出ます。

### Auto Crop

Auto Cropタブでは、選んだRGBA channelを分析して背景色を推定し、背景と異なる最初のpixelまで各辺をCropします。

結果はCropタブのSize / Offsetへ反映されます。

透明背景や単色背景の周囲を自動的に詰めたい場合の候補です。素材によって背景判定結果が変わるため、自動結果を確認して使います。

## ViewerからCropする

21.1 Manualでは、CropをViewerへ表示した状態でAllow Box Selectionを有効にし、Viewer上で矩形をドラッグしてCrop範囲を指定できると説明されています。

数値だけでなく、画面を見ながら切り出したい場合に使えます。

## 最小構成

```text
MediaIn → Crop → MergeのBackground
```

Crop前後のWidth / Heightを確認すると、Maskとの違いを理解しやすくなります。

## 運用例

1920×1080のImageから中央の正方形だけを切り出したい場合:

1. Keep Centeredを有効にします。
2. Size X / Yを同じ値にします。
3. Viewerで残したい範囲を確認します。
4. 必要ならKeep Centeredを外し、Offset X / Yで位置を調整します。

正確な値は元素材と目的の解像度に合わせます。

## Maskとの違い

- **Mask**: Nodeの効果や表示範囲を制限しても、元Imageの解像度自体は通常変えない
- **Crop**: 出力するImageのWidth / Heightそのものを変更する

「周囲を透明にしたい」のか、「新しい小さいImageとして切り出したい」のかで選びます。

## 挙動と注意点

- Cropは物理解像度を変更します。
- 21.1 Manualでは、解像度が時間で変わるためCrop parametersのアニメーションは推奨されていません。
- Crop後のImageをMerge Backgroundへ置くと、Merge出力解像度も変わります。
- DoDに関係する問題ではClipping Modeを確認します。

## 関連する考え方

- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)
- [有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition)

## 似たNode・関連Node

- [Transform](./transform) — 解像度を変えずにImageを移動・拡大縮小
- [Resize](./resize) — Width / Heightを指定して全体を再サンプル
- [Scale](./scale) — 倍率で解像度を変更
- Mask family — 効果範囲を制限するが、Cropとは役割が異なる

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 120、pp.2862–2864で、Input、物理解像度の変更、Offset X/Y、Size X/Y、Keep Aspect、Keep Centered、Reset Size / Offset、Change Pixel Aspect、Clipping Mode、Auto Crop、ViewerのBox Selectionを確認しました。

内部REGID、Auto Cropの背景推定アルゴリズム、Edition差、実機結果は未確認のため `verification: partial` としています。
