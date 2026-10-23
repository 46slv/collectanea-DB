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
updated: "2026-10-17"
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

### Clipping Mode — 出力範囲とDoDを混同しない

Domain of Definition（DoD）は、Imageの幅・高さとは別に、画像データが存在する範囲を表す情報です。`Clipping Mode`はDoDを使った処理で、画像の端やDoDの外側をどう扱うかを指定します。`Size X / Y`で切り出し範囲を決める操作とは別です。

- **Frame（既定）**: 現在のDoDを無視して、画像フレーム全体をDoDとして扱います。上流のDoDがフレームより小さいとき、残る部分は黒／透明として扱われます。
- **Domain**: 上流から渡されたDoDを尊重します。大きくぼかすFilterなどでは、必要な周辺画素が対象範囲から外れ、端が不自然に切れる場合があります。
- **None**: 入力画像に対するClippingを実行しません。ただし、上流DoDの外に必要なサンプルは黒／透明として扱われます。存在しない画素を復元する設定ではありません。

たとえば、透明なロゴをCropした後にBlurで輪郭を広げたい場合、端だけ急に切れていないかをViewerで確認します。問題が出るときは、CropのSize / Offsetだけでなく、後段のFilterとDoDの関係も確認してください。[DoDの基礎](../../learn/03-space/domain-of-definition)を参照できます。

### Auto Crop — 余白を画像から判定する

`Auto Crop`タブの`RGBA Color Channels`で、背景判定に使うR / G / B / Aチャンネルを選びます。オフにしたチャンネルは判定対象から除外されます。たとえば背景に青いグラデーションがある画像では、チャンネルの選び方でCrop結果が変わり得ます。

`Auto Crop`を実行すると、選択チャンネルの値から背景色を推定し、各辺で背景と異なる最初の画素まで範囲を詰めます。計算結果は**CropタブのSize / Offset**へ反映されます。Auto Crop後も手動で微調整できます。

透明なロゴ画像の余白を取り除くときは、Alphaを判定に使う方法を検討します。一方、背景と被写体の色が近い場合やグラデーションがある場合は、思った範囲より内側へ切れる可能性があります。実行後にViewerで四辺を確認してください。背景推定の厳密なアルゴリズムや許容差はManualからは確定できません。

## Viewerで矩形を選んでCropする

1. Cropを選択してViewerへ表示します。
2. Viewerの**左上**にある`Allow Box Selection`を有効にします。
3. Viewer上で残したい範囲を囲む矩形をドラッグします。
4. InspectorのSize X / YとOffset X / Y、Viewerの切り出し結果を確認します。

21.1 Manualに記載されたViewer上の操作です。ドラッグ後に細かい位置を揃える場合は、数値欄で調整します。

## 最小構成

```text
MediaIn → Crop → MergeのBackground
```

Crop前後のWidth / Heightを確認すると、Maskとの違いを理解しやすくなります。

## 運用例：1920×1080から中央の1080×1080を切り出す

横長の映像から中央の正方形だけを取り出し、後段へ**1080×1080のImage**として渡す例です。

```text
MediaIn（1920×1080） → Crop（1080×1080） → MergeのBackground
```

1. 1920×1080のMediaInをCropへ接続します。
2. `Keep Aspect`をオフにします。元の16:9を保持したままでは、正方形の出力寸法にできません。
3. `Keep Centered`をオンにし、`Size X=1080`、`Size Y=1080`を設定します。
4. 1920−1080＝840pxなので、左右の切り落とし量は中央基準で**420pxずつ**です。Viewerで意図した被写体が残っているか確認します。
5. 被写体が中央からずれている場合は`Keep Centered`を外し、`Offset X / Y`で切り出す位置を調整します。

この操作はフレーム全体を1080×1080へ押し縮める**Resize**とは違い、元画像の一部を残す操作です。Crop出力をMergeのBackgroundへ接続すると、そのMerge出力も1080×1080を基準に合成されます。

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
