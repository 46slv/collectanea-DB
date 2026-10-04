---
title: Defocus
description: camera lensのピント外れを再現し、Gaussian / Lens、bloom、絞り形状を調整できる2D Image Node。
doc_type: node
term_id: defocus
term_short: Defocusは、camera lensのピント外れ・bloom・bokeh形状を再現するNode。
verification: partial
aliases: [Defocus, Dfo]
concepts: [image-data, filtering, domain-of-definition, mask-data]
nodes: [Defocus]
node_family: blur-filter
controls: [Filter, Lock X/Y, Defocus Size, Bloom Level, Bloom Threshold, Lens Type, Lens Angle, Lens Sides, Lens Shape, Clipping Mode]
inputs: [image, mask]
outputs: [image]
tasks: [filter-image, defocus, bokeh, bloom]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Defocus

Defocusは、camera lensのピントが外れたようなぼけを2D <Term id="image">Image</Term>へ加えるNodeです。単純な均一Blurに加え、明るい部分のbloomや、Lens modeで絞り形状に近いbokehを作れます。

## 役割

通常の[Blur](./blur)がpixelを均一にぼかす基本Filterなのに対し、Defocusは**out-of-focus lensの見た目**を作ることを目的にしています。

```text
Image → Defocus → Output
            ↑
         Effect Mask
```

## 入力

### Input

オレンジ色の必須入力です。Defocusをかける2D Imageを接続します。

### Effect Mask

青色の任意入力です。Maskの白い範囲だけDefocus結果を適用します。

21.1 ManualではEffect MaskはDefocus処理後に適用されると説明されています。

## 出力

Defocus処理後の2D Imageを出力します。

## 主な設定項目

### Filter

Defocusの方式を選びます。

- **Gaussian** — 単純で高速
- **Lens** — よりlens-likeな結果。Gaussianより処理が重い

見た目の確認を始めるならGaussian、bokeh形状まで必要ならLensへ切り替えると役割を分けやすくなります。

### Lock X/Y

有効にするとX / Y方向で同じDefocus量を使います。解除すると軸ごとに別の量を設定できます。

### Defocus Size

Defocusの広がりを決めます。値を増やすほどImageが強くぼけ、bloomも大きくなります。

### Bloom Level

Bloom Thresholdを超えたpixelへ加えるbloomの強さ・大きさを調整します。

### Bloom Threshold

どの明るさ以上をbloom対象にするかを決めます。

Thresholdより暗いpixelはDefocusだけ、明るいpixelにはDefocusに加えてbloomが適用されます。

### Lens Type / Angle / Sides / Shape

FilterをLensにした場合だけ使います。

- **Lens Type** — bokehの基本形状
- **Lens Angle** — 形状の回転
- **Lens Sides** — NGonの辺数
- **Lens Shape** — NGonを丸い形から尖ったstar-likeな形へ調整

CircleではAngleやSidesの違いが見えにくいため、形状差を確認する場合はNGon系で観察します。

### Clipping Mode

Blurと同様、DoD境界の扱いをFrame / Domain / Noneから選びます。

大きなDefocusでは周囲のpixelを広く参照するため、frame edge付近の見え方が不自然な場合に確認します。

## 最小構成

```text
MediaIn → Defocus → Output
```

まずGaussianでDefocus Sizeだけを変え、次にBloom、最後にLensへ切り替えると、それぞれの役割を分けて確認できます。

## 運用例

夜景の明るい点をbokehへ変えたい場合:

1. FilterをGaussianのままDefocus Sizeで全体のぼけ量を決めます。
2. Bloom Thresholdを調整し、明るい光だけをbloom対象へします。
3. Bloom Levelで光の広がりを決めます。
4. bokeh形状が必要ならLensへ切り替え、Lens Type / Sides / Shapeを調整します。

## Blurとの違い

- **Blur** — 一般的なsoftening。FilterとBlur Sizeを中心に使う
- **Defocus** — camera lensのピント外れを意識し、bloomやlens shapeを持つ

「ただ柔らかくしたい」ならBlur、「ピント外れ・bokehとして見せたい」ならDefocusを先に検討します。

## 挙動と注意点

- Lens modeはGaussianより処理が重いとManualに明記されています。
- Bloomは全pixelへ同じように加わるのではなく、Thresholdより明るいpixelを対象にします。
- Defocusも近傍pixelを参照するためDoD / Clipping Modeの影響を受けます。
- Maskで範囲を限定する場合は、Defocusのbokeh形状とMaskのSoft Edgeを同時に変えず別々に確認します。

## 関連する考え方

- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)
- [マスク（Mask）](../../learn/02-data/mask)

## 似たNode・関連Node

- [Blur](./blur) — 標準的なsoftening
- [Directional Blur](./directional-blur) — 方向や中心を持つblur
- [Soft Glow](./soft-glow) — 明るい部分を柔らかく発光させる

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 92、pp.2112–2113で、Image / Effect Mask入力、Gaussian / Lens、Lock X/Y、Defocus Size、Bloom Level / Threshold、Lens Type / Angle / Sides / Shape、Clipping Modeを確認しました。

内部REGID、Lens kernelの詳細、実機bokeh描画、GPU性能、Edition差は未確認のため `verification: partial` としています。
