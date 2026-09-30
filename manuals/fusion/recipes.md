---
sidebar_position: 5
title: Recipes
---

# Recipes

実現したい見た目や処理から、必要なノード構成を探します。

## 線だけの円

1. Backgroundを追加します。
2. EllipseをBackgroundのMask入力へ接続します。
3. EllipseのSolidを無効にします。
4. Border Widthで線幅を調整します。

### 外周を維持する

外周サイズを固定して内径だけを変える場合は、EllipseのWidth / Heightを固定し、Border Widthを変更します。

## 位置を同期する

同期先のCenterへExpressionを設定し、基準ノードを参照します。

```lua
SourceTransform.Center
```

### Offsetを加える

```lua
Point(SourceTransform.Center.X + 0.1, SourceTransform.Center.Y)
```

## ベジェ線を描く

BackgroundへPolygon Maskを接続し、Solidを無効にしてBorder Widthを設定します。

## 複数の円を等間隔にする

基準となる最小・最大サイズをUser Controlsへ置き、indexから各円のサイズを計算します。

```lua
minSize + (maxSize - minSize) * index / (count - 1)
```

## PNGの内径を広げる

合成済みPNGの場合は、Erode/DilateやMask生成を使います。外周を厳密に固定する必要がある場合は、元shapeから再構成した方が管理しやすくなります。
