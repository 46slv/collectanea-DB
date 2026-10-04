---
title: Background
description: 単色・simple gradient・custom gradientの2D Imageを生成し、Maskで形を切り出せる基本Generator Node。
doc_type: node
term_id: background
verification: partial
aliases: [Background, Bg]
concepts: [image-data, mask-data, resolution]
patterns: [limit-effect-with-mask]
nodes: [Background]
node_family: generators
controls: [Type, Color, Gradient Type, Use Frame Format Settings, Width, Height, Pixel Aspect, Depth]
inputs: [mask]
outputs: [image]
tasks: [generate-image, create-background, mask, gradient]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Background

Backgroundは、単色やgradientの2D <Term id="image">Image</Term>を作る基本Generatorです。

既存Imageを加工するNodeではなく、新しいImage sourceを作るため、Graphの先頭に置けます。

## 役割

背景色だけでなく、Maskと組み合わせたsolid、simple gradient、自由なgradient sourceを作ります。

```text
Background → Merge → Output
```

## 入力

### Effect Mask

青色の任意入力です。

生成したBackgroundのうち、<Term id="mask">Mask</Term>の白い範囲だけを残します。

```text
Ellipse Mask ──→ Background → Merge
```

たとえば赤いBackgroundへEllipse Maskを接続すると、円・楕円形に切り出された赤いImageを作れます。

## 出力

生成した2D Imageを出力します。

色だけでなくAlphaを持てるため、透明・半透明のgraphic sourceとしても使えます。

## Color tab

### Type

Backgroundの塗り方を選びます。

21.1 Manualでは次のstyleが説明されています。

- **Solid Color** — 1色で塗る
- **Horizontal** — 左右方向の2色gradient
- **Vertical** — 上下方向の2色gradient
- **Four Corner** — 4cornerの色からgradientを作る
- **Gradient** — 複数color stopを使うcustom gradient

単色が必要ならSolid Color、2色だけならHorizontal / Vertical、複雑な色変化が必要ならGradientを使います。

### Color / Color swatches

Solid Colorでは1つの色を設定します。

Horizontal / Vertical / Four Cornerでは、それぞれ方向やcornerに対応するcolor swatchを設定します。

Alphaも色と一緒に設定できるため、半透明Backgroundも作れます。

### Gradient Type

TypeをGradientにした場合、gradientの形を選びます。

Manualには次が記載されています。

- **Linear** — 直線方向
- **Reflect** — starting pointを境にLinearをmirror
- **Square** — 中心から四角形状
- **Cross** — 中心から十字形状
- **Radial** — 中心から円形
- **Angle** — 中心から反時計回りに角度方向へ展開

Gradient control上でcolor stopを追加・配置し、色変化を設計します。

## Image tab

Generator共通のImage tabで、生成Imageの仕様を決めます。

### Use Frame Format Settings

有効にすると、DaVinci ResolveではTimeline resolutionを基準にWidth / Height / Pixel Aspectを決めます。

Fusion Fundamentalsでも、BackgroundなどFusion-generated Imageの既定resolutionはTimeline resolutionを基準にすると説明されています。

### Width / Height

Use Frame Format Settingsを外した場合、生成Imageのピクセル寸法を指定します。

BackgroundをMergeのBackgroundへ接続すると、そのBackgroundの解像度がMerge出力の基準になるため、ここでのWidth / Heightは後段のcanvas sizeにも影響します。

### Pixel Aspect / Depth

Pixel AspectとImageのbit depthを指定します。

通常の作業ではproject / Timeline条件を使い、特別なformatやfloat処理が必要な場合に個別指定します。

## 最小構成

### 単色背景

```text
Background → MediaOut
```

### Imageへ色面を重ねる

```text
Background ─┐
            ├─ Merge → Output
Image ──────┘
```

BackgroundをForegroundとして使うかBackgroundとして使うかは、最終的に何を基準canvasへするかで決めます。

## 運用例

画面左から右へ暗色から明色へ変わる背景を作る場合:

1. Backgroundを追加します。
2. TypeをHorizontalにします。
3. 左右のcolor swatchを設定します。
4. Image tabで出力resolutionを確認します。
5. Text+などをMergeで重ねます。

円形のlight mapが必要ならGradient → Radialを使い、必要に応じてColor / Alphaを調整します。

## Fast Noiseとの違い

- **Background** — 明示的な色・gradientを設計
- **Fast Noise** — proceduralな不規則patternを生成

滑らかなlighting mapやsolid graphicならBackground、雲・霧・揺らぎ・displacement sourceなら[Fast Noise](./fast-noise)を検討します。

## 関連する考え方

- [Generatorノード](./)
- [マスク（Mask）](../../learn/02-data/mask)
- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 103 pp.2356–2359で、Effect Mask、Background Type、Color / gradient、Gradient Typeを確認しました。Generator共通Image tabはpp.2400–2402、Resolve上の既定resolutionはFusion Fundamentals Chapter 75 p.1642を基にしています。

Gradient interpolationの全Control、内部生成式、実機性能は未確認のため `verification: partial` としています。
