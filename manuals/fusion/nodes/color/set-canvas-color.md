---
title: Set Canvas Color
description: ImageのDomain of Definition外にあるcanvas値をColorまたは別Imageから設定し、透明black以外の外側pixelを定義するNode。
doc_type: node
term_id: set-canvas-color
term_short: DoD外のcanvas color / alphaを設定するNode。
verification: partial
aliases: [Set Canvas Color, SCv]
concepts: [image-data, domain-of-definition]
nodes: [Set Canvas Color]
node_family: color
controls: [Color Picker]
inputs: [image, image]
outputs: [image]
tasks: [canvas, domain-of-definition, fill-outside]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Set Canvas Color

Set Canvas Colorは、Imageの<Term id="domain-of-definition">Domain of Definition（DoD）</Term>の外側を、何色・何Alphaとして扱うかを設定するNodeです。

TransformでImageを縮小してframe内に空きができた場合など、「pixelが無い領域」を透明black以外へ変えたいときに使います。

## 入力

### Input

基準となる2D Imageです。

### Foreground

任意の別Imageです。接続すると、そのImageからcanvas colorをsampleできます。

## Color Picker

Foreground未接続時はColor / Alphaを直接指定します。

既定のcanvasはblack / zero Alphaですが、mask invert等でcanvas semanticsが変わった場合の明示にも使えます。

## 最小構成

```text
Image → Transform → Set Canvas Color → Output
```

Transform後に見える空き領域へ、指定したcanvas値を与えます。

## Backgroundとの違い

Background Nodeはframeを持つ実Imageを生成します。

Set Canvas Colorは既存ImageのDoD外に対する**implicit canvas value**を変えるNodeです。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2198–2199で、DoD外canvas、Input / Foreground、Color Pickerを確認しました。
