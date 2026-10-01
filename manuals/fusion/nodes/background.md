---
sidebar_position: 2
title: Background
---

# Background

単色、gradient、alphaを持つ画像を生成するGeneratorノードです。

## Overview

BackgroundはFrame Formatまたは指定したWidth / Heightに従って画像を生成します。Maskを接続すると、生成領域を制限できます。

## Controls

### Color

RGBとAlphaを設定します。透明なshapeを作る場合はalphaも確認します。

### Width and Height

生成する画像サイズを決めます。後段の処理とDomain of Definitionへ影響します。

### Gradient Type

Solid、Linear、Radialなどの塗りを選択します。

## Examples

### Shape with a mask

BackgroundへEllipseを接続すると、Ellipse範囲だけ色を生成できます。

### Outline circle

EllipseのSolidを無効にし、Border Widthを設定したMaskをBackgroundへ接続します。
