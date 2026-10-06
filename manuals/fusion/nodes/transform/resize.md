---
title: Resize
description: 2D ImageのWidth / Heightをピクセル数で指定し、出力解像度そのものを変更するNode。
doc_type: node
term_id: resize
verification: partial
aliases: [Resize, Rsz]
concepts: [resolution, image-extent, domain-of-definition]
nodes: [Resize]
node_family: transform
controls: [Width, Height, Auto Resolution, Reset Size, Keep Frame Aspect, Only Use Filter in HiQ, Change Pixel Aspect, Pixel Aspect, Filter Method]
inputs: [image]
outputs: [image]
tasks: [resize, resolution, format]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Resize

Resizeは、2D <Term id="image">Image</Term>のWidth / Heightをピクセル数で指定し、出力解像度そのものを変更するNodeです。

「同じ1920×1080の中で画像を小さく見せる」のではなく、「1920×1080のImageを1280×720のImageへ変える」ときに使います。

## 役割

入力Imageを別のピクセル寸法へ再サンプリングします。

```text
1920×1080
    ↓
  Resize
    ↓
1280×720
```

TransformのSizeと違い、後段が受け取るImageのWidth / Heightが変わります。

## 入力

### Input

オレンジ色の入力です。解像度を変更したい2D Imageを接続します。

## 出力

指定したWidth / Heightの2D Imageを出力します。

Resizeの出力をMergeのBackgroundへ接続した場合、そのResize後の解像度がMerge出力の基準になります。

## 主な設定項目

### Width / Height

新しい出力解像度をピクセル数で指定します。

WidthまたはHeightを右クリックすると、Frame Formatから解像度を選べるメニューも利用できます。

### Auto Resolution

Fusion StudioではFrame Format、DaVinci ResolveではTimeline resolutionにWidth / Heightを合わせます。

### Reset Size

Width / Heightを入力Imageの元サイズへ戻します。

### Keep Frame Aspect

有効にすると、入力Imageの縦横比を保ったままWidth / Heightを変更します。

### Only Use Filter in HiQ

通常、非HiQ renderでは速度を優先してNearest Neighborを使います。この設定を無効にすると、非HiQでも選択したFilter Methodを使います。

### Change Pixel Aspect

有効にするとPixel Aspectを変更するControlが表示されます。

画像のWidth / Heightと、1ピクセル自体の縦横比は別の値なので、通常の正方形pixel素材では必要がある場合だけ変更します。

### Filter Method

Resize時の画素補間方法を選びます。

ManualにはBox、Linear、Quadratic、Cubic、Catmull-Rom、Gaussian、Mitchell、Lanczos、Sinc、Besselなどが記載されています。

素材や拡大縮小量によって結果が変わるため、名前だけで一律に高品質順と考えない方が安全です。

## 最小構成

```text
MediaIn → Resize → MergeのBackground
```

Resize前後でViewerの見た目だけでなく、ImageのWidth / Heightが変わっていることを確認します。

## 運用例

4K素材を1920×1080の作業用Imageへ変換する場合、ResizeでWidth / Heightを1920 / 1080へ設定します。

後段で位置アニメーションを加えるなら、まずResizeで解像度を確定し、その後ろにTransformを置くと「解像度変更」と「配置」を別のNodeで管理できます。

```text
4K Image → Resize 1920×1080 → Transform → Merge
```

## 挙動と注意点

- ResizeはImageの物理解像度を変更します。
- 21.1 Manualでは、解像度が時間とともに変わることになるためResize controlsのアニメーションは推奨されていません。
- MergeのBackground前に置くと、Mergeの出力解像度にも影響します。
- 見た目だけを拡大縮小したい場合は[Transform](./transform)を先に検討します。
- 元解像度に対して2倍・0.5倍のような倍率で指定したい場合は[Scale](./scale)が直接的です。

## 関連する考え方

- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)
- [有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition)

## 似たNode・関連Node

- [Transform](./transform) — 解像度を変えずに配置・拡大縮小
- [Scale](./scale) — 倍率で解像度を変更
- [Crop](./crop) — 切り出し・キャンバス寸法を変更
- [Merge](../compositing/merge) — Backgroundが出力解像度の基準

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 120、pp.2873–2875で、Input、物理解像度の変更、Width / Height、Auto Resolution、Reset Size、Keep Frame Aspect、Only Use Filter in HiQ、Change Pixel Aspect、Filter Methodを確認しました。

内部REGID、Edition差、各Filterの実機比較、処理性能は未確認のため `verification: partial` としています。
