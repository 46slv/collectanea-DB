---
title: Generatorノード
description: upstream Imageを必要とせず、色・noise・text・sky・procedural patternなどの2D Imageを生成するNodeを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, generate-image, text, procedural-texture]
updated: "2026-10-04"
---

# Generatorノード

Generatorは、既存のImageを加工するのではなく、新しい2D <Term id="image">Image</Term>を作ってGraphへ供給するNodeです。

背景色、gradient、procedural noise、textなどを最初のsourceとして作り、MergeやEffectへ渡します。

## まず選ぶ

| 作りたいもの | Node | 向いている用途 |
| --- | --- | --- |
| 単色・2色/4色gradient・自由gradient | [Background](./background) | 背景色、solid、Maskと組み合わせた塗り |
| procedural noise / organic texture | [Fast Noise](./fast-noise) | 雲、霧、波、displacement源、particle / mask source |
| 2D text | [Text+](./text-plus) | title、lower third、文字animation |
| 複数text layerを1 Nodeで管理 | [MultiText](./multitext) | 複数style / layerのtext |
| procedural daylight sky | [Day Sky](./day-sky) | 空・太陽方向・大気表現 |
| fractal pattern | [Mandelbrot](./mandelbrot) | motion graphics、sci-fi pattern |
| procedural plasma pattern | [Plasma](./plasma) | animated color pattern |

## GeneratorとImage processorの違い

BlurやColor Correctorは、入力Imageがなければ処理対象がありません。

Background、Fast Noise、Text+は、自分でImageを作るため、Graphの先頭に置けます。

```text
Background ──┐
Text+ ───────┼─ Merge → Output
Fast Noise ──┘
```

## 出力解像度

DaVinci ResolveのFusion pageでは、Background、Fast Noise、Text+などFusion-generated Imageの既定解像度はTimeline resolutionを基準にします。

Generator共通のImage tabでは、Use Frame Format Settingsを外すとWidth / Height / Pixel Aspectを個別に指定できます。

そのため「Generatorは解像度を持たない」のではなく、**どの解像度のImageを生成するか**が後段のMergeやsamplingへ影響します。

→ [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)

## Effect Mask

多くのGeneratorは青色のEffect Mask入力を持ちます。

```text
Ellipse Mask ──→ Background → Merge
```

Maskをつなぐと、生成したImageのうちMask範囲だけを残せます。

たとえばBackground + Ellipse Maskなら、別途「円を描画するImage Generator」を探さなくても、単色Imageを円形Maskで切り出せます。

## Background

Backgroundは単色だけでなく、Horizontal / Vertical / Four Corner / Gradientを生成できます。

自由GradientではLinear / Reflect / Square / Cross / Radial / Angleなどの形を選べるため、単純な背景からMask source、lighting mapまで広く使えます。

## Fast Noise

Fast NoiseはPerlin Noiseを生成します。

Detail、Brightness、Contrast、Scale、Angle、Seetheでpatternを作り、Color tabでTwo ColorまたはGradientへ色付けできます。

Imageとして直接見せるだけでなく、Displace、DissolveのGradient Map、particle、Mask等へ「制御用のImage」として渡す用途が重要です。

## Text+

Text+は2D text Imageを生成します。

Styled Text、Font、Size、Tracking、Layout、Transform、Shading、Write On、Character Level Styling、Followerなどを持ちます。

Text 3DはClassic 3D scene domain、sTextはShape domainなので、同じ「文字」でも出力データ領域が異なります。

## 関連する考え方

- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)
- [マスク（Mask）](../../learn/02-data/mask)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 103 pp.2356–2403、およびFusion Fundamentals Chapter 75のresolution説明を基に整理しています。

このFamily Overviewは選び分けを担当します。各Generatorの全Control、procedural algorithmの内部仕様、render性能は個別Referenceへ分けます。
