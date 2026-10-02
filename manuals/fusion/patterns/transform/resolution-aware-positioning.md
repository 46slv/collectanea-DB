---
title: Resolutionを跨いでも位置関係を保つ
description: ピクセル距離とnormalized positionを分離し、resolution変更時にも配置 intentを保つPattern。
doc_type: pattern
verification: partial
aliases: [resolution-aware layout, pixel to normalized]
concepts: [normalized-coordinates, resolution, aspect-ratio]
patterns: [resolution-aware-positioning]
nodes: [Transform, Resize]
tasks: [position, layout, resize, align]
level: intermediate
product_scope: fusion
---

# Resolutionを跨いでも位置関係を保つ

## 使う場面

同じGraphを別の解像度（Resolution）で使うと、余白（Margin）・オフセット（Offset）・配置が意図せず変わる問題です。

## 前提となる考え方

- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)
- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)

## 基本構成

ピクセル基準のdesign intentを1箇所でnormalized 値へ変換します。

```text
desired pixel offset
      + reference width/height
              ↓
     normalized relation
              ↓
      Transform / layout
```

## 保つべき条件

- ピクセル値とnormalized値を同じパラメータとして扱わない。
- reference resolutionの管理元を1箇所に置く。
- 複数Nodeで個別にピクセル→normalized換算しない。
- Resize後のImage extentを明示する。

## バリエーション

### Relative 配置

フレーム比率を保つことを優先し、normalized 値を直接使います。

### Fixed-ピクセル 配置

一定ピクセル marginを保ちたい場合、現在の reference dimensionsからnormalized offsetを導きます。

### Mixed 配置

major positionはrelative、stroke/marginはピクセル intentとして分離します。

## Nodeの選び方

Transformはposition/配置、Resizeはresolution contractを所有する候補です。

## 失敗しやすい点

- 1920×1080前提の数値を4Kでもそのまま使う。
- ResizeとTransform Sizeを混同する。
- X/Yのreference dimensionsを逆にする。
- ピクセル Aspect / non-square ピクセルを無視する。

## この構成を使う手順

- [TransformでImageを移動する](../../recipes/layout/move-image-with-transform)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Resize](../../nodes/transform/resize)
