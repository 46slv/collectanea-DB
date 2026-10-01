---
sidebar_position: 1
title: Merge
sidebar_label: Merge
---

# Merge

2つの画像を合成するための基本ノードです。ForegroundとBackgroundを受け取り、Apply ModeやBlend、Maskによって合成結果を制御します。

```text
Foreground ─┐
            ├─ Merge ─ Output
Background ─┘
              ↑
             Mask
```

## Overview

Mergeは、黄色のBackground入力を基準画像、緑のForeground入力を重ねる画像として扱います。青のMask入力を接続すると、合成範囲を制限できます。

### When to use

- 画像やテキストを重ねる
- Maskで合成範囲を限定する
- Apply Modeで演算合成する
- Transform controlsでForegroundを配置する

## Inputs

### Foreground

上に重ねる画像を入力します。

### Background

合成先となる基準画像を入力します。

### Effect Mask

Mergeの処理範囲を制限します。

## Controls

### Blend

Foregroundの寄与率を0〜1で調整します。

### Apply Mode

Normal、Screen、Multiplyなどの合成演算を選択します。色やalphaの状態によって結果が変わるため、目的と入力状態を分けて確認します。

### Operator

ForegroundとBackgroundのalpha関係を指定します。通常のover合成以外を使う場合は、premultiplicationとの関係を確認します。

## Examples

### Text over background

Backgroundへ映像、ForegroundへText+を接続します。文字の位置はMerge側でもText+側でも変更できますが、再利用する座標系を先に決めます。

### Masked composite

EllipseやPolygonをEffect Maskへ接続し、合成範囲を制限します。

## Notes

- ForegroundとBackgroundの接続を逆にすると、見た目だけでなくalpha処理の意味も変わります。
- Viewer上のドラッグ操作とInspector値は同じ座標を操作します。
- 複雑な合成では、Mergeを一段ずつ分けて中間結果を確認します。
