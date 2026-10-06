---
title: 解像度 / アスペクト比（Resolution / Aspect）
description: ImageのWidth・Height、フレーム比、Pixel Aspect、正規化座標を分け、TransformとResize/Scale/Cropの違いを理解する。
doc_type: concept
term_id: resolution-aspect
term_short: Imageのピクセル寸法、フレーム比、Pixel Aspect、相対位置を別の値として扱う考え方。
verification: partial
aliases: [resolution, aspect ratio, pixel aspect]
concepts: [resolution, aspect-ratio, normalized-coordinates]
nodes: [Resize, Scale, Crop, Transform, Merge]
tasks: [resize, layout, position]
prerequisites: [normalized-coordinates]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# 解像度 / アスペクト比（Resolution / Aspect）

## このページで分かること

「画像を小さくした」「縦横比を変えた」「解像度を変えた」を同じ操作として扱わず、Fusionで何が変わったのかを分けて考えます。

## 基本の考え方

少なくとも次の4つを分けます。

- **Width / Height** — Imageが持つピクセル寸法
- **Frame Aspect** — WidthとHeightから決まる画面の縦横比
- **Pixel Aspect** — 1 pixelを表示するときの縦横比
- **Normalized Coordinates** — frame / reference sizeに対する相対位置

数値が似ていても役割は別です。

## Transformは解像度を変えない

TransformのSizeでImageを0.5倍に見せても、出力Width / Heightは入力と同じです。

```text
1920×1080
   ↓ Transform Size 0.5
1920×1080
```

画面の中でImageが小さく見えるだけです。

## Resizeはピクセル寸法を直接指定する

ResizeではWidth / Heightをピクセル単位で決めます。

```text
3840×2160
   ↓ Resize 1920×1080
1920×1080
```

後段が受け取るImageの物理解像度が変わります。

## Scaleは倍率で解像度を変える

Scaleは元のWidth / Heightに対する倍率で新しい解像度を決めます。

```text
1920×1080
   ↓ Scale 0.5
960×540
```

固定サイズへ揃えるならResize、元サイズに対する比率で処理するならScaleが読みやすくなります。

## Cropも解像度を変える

Cropは、入力Imageの一部を新しいWidth / Heightで出力します。

Maskで見える範囲を隠すことと、Imageそのものを小さいキャンバスへ切り出すことは別です。

## MergeではBackgroundが基準になる

21.1 Manualでは、MergeのBackground入力が出力解像度を決めます。

そのため:

```text
Image → Resize / Scale / Crop → Merge Background
```

のようにBackground前で解像度を変更すると、Merge全体の出力解像度も変わります。

Foreground側のTransform Sizeだけを変えても、MergeキャンバスのWidth / HeightはBackground基準のままです。

## Pixel Aspect

Resize / Scale / CropではPixel Aspectを変更できる設定があります。

Width / Heightが同じでもPixel Aspectが違えば表示上の形は変わります。通常の正方形pixel素材では、不用意に変更せず入力・出力formatの要件を確認します。

## Normalized Coordinatesとの関係

TransformのCenterは正規化座標で保持されます。

たとえばX = 0.5はframe中央を表しますが、「0.1移動すること」が常に同じpixel数を意味するわけではありません。Widthが変われば、同じ正規化距離に相当するpixel数も変わります。

TransformのReference SizeはCenterの**表示値**をpixel表記へ変えますが、内部値そのものは正規化されたままです。

## 1つずつ変えて確認する

次の3構成を比較します。

```text
A: Image → Transform Size 0.5
B: Image → Scale 0.5
C: Image → Resize
```

Viewer上の見た目だけでなく、それぞれの出力Width / Heightを確認します。

この比較で「見た目の大きさ」と「Imageデータの解像度」を分離できます。

## よくある誤解

### 小さく見えれば解像度も小さい

Transformでは成立しません。

### AspectとPixel Aspectは同じ

Frame全体の縦横比と、1 pixelの表示比率は別です。

### 同じCenter値なら同じpixel位置

正規化座標なら、reference dimensionsが変わるとpixel距離も変わります。

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Resize](../../nodes/transform/resize)
- [Scale](../../nodes/transform/scale)
- [Crop](../../nodes/transform/crop)
- [Merge](../../nodes/compositing/merge)

## 次に読む

→ [有効領域（Domain of Definition）](./domain-of-definition)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 120、pp.2862–2883でCrop / Resize / Scale / Transformの解像度処理と主要Controlを確認しました。MergeのBackground基準解像度はChapter 94、p.2212で確認しています。

特定formatのpixel aspect要件や、各filterの実機比較はこのConceptでは扱っていません。
