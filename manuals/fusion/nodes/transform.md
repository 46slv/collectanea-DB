---
sidebar_position: 3
title: Transform
---

# Transform

画像の位置、角度、大きさ、pivotを変更する2D Transformノードです。

## Overview

Transformは入力画像を再配置します。Centerは正規化座標、Sizeは倍率として扱われます。

## Controls

### Center

X / Y位置を指定します。通常は0.5 / 0.5が画面中央です。

### Pivot

回転や拡大縮小の中心を指定します。

### Size

入力画像全体を均一に拡大縮小します。

### Angle

Pivotを中心に回転します。

## Expressions

### Reference another node

他ノードのCenterを参照し、複数要素の位置を同期できます。

```lua
OtherTransform.Center
```

## Notes

- 画面サイズと正規化座標を混同しないようにします。
- 連動値はExpressionかInstanceのどちらを使うか、編集責任で選びます。
