---
title: Custom Filter
description: 3×3・5×5・7×7のconvolution matrixへ整数weightを入力し、blur・sharpen・emboss・edge detection等を自作するFilter Node。
doc_type: node
term_id: custom-filter
verification: partial
aliases: [Custom Filter, CFlt]
concepts: [image-data, convolution, filtering]
nodes: [Custom Filter]
node_family: blur-filter
controls: [Color Channels, Matrix Size, Update Lock, Filter Matrix, Normalize, Floor Level]
inputs: [image, mask]
outputs: [image]
tasks: [custom-filter, convolution, edge-detect, sharpen]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Custom Filter

Custom Filterは、近傍pixelへどのweightを掛けるかをmatrixで指定し、convolution filterを自作するNodeです。

既存Filter Typeでは足りないkernelを作る場合に使います。blur、sharpen、emboss、relief、edge detection等を同じ仕組みで表現できます。

## 入力

2D Imageと任意Effect Maskを受けます。

## Matrix Size

3×3、5×5、7×7からkernel sizeを選びます。

Inspectorには7×7 gridが表示されますが、3×3を選んだ場合は中央9 cellだけが有効です。

大きいmatrixほど遠い近傍pixelまで参照し、計算量も増えます。

## Filter Matrix

中央cellがcurrent pixel、周囲cellがneighbor pixelを表します。

- 1 — そのpixel値をそのまま加える
- 0 — 無視
- 正の大きい値 — 強く加える
- 負値 — subtract方向へ寄与

21.1 Manualではmatrix cellは整数値として説明されています。

## Update Lock

matrixを編集中に毎回renderしないよう計算を止めます。

複数cellをまとめて変更し、設定後に解除してresultを確認できます。

## Normalize / Floor Level

Normalizeでkernel resultのlevelを調整し、Floor Levelで結果へbase offsetを加減します。

kernel sumによって全体brightnessが変わる場合の調整に使います。

## 最小構成

```text
Image → Custom Filter → Output
```

最初は3×3で1つの目的だけを作り、kernelの意味を確認してから5×5 / 7×7へ広げます。

## Filter Nodeとの違い

- **Filter** — Sobel、Laplacian、Grain等のpreset algorithmをmenuから選ぶ
- **Custom Filter** — convolution kernelをcell単位で直接定義

既存presetで足りるならFilterの方が意図を読みやすくできます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 99 pp.2332–2336で、3/5/7 matrix、integer weights、RGBA selection、Update Lock、Normalize、Floor Levelを確認しました。
