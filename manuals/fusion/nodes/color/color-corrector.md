---
title: Color Corrector
description: Shadows・Midtones・Highlightsを含む主要な2D color correction Node。
doc_type: node
term_id: color-corrector
verification: unverified
aliases: [Color Corrector, CC]
concepts: [image-data, color-adjustment, alpha]
nodes: [Color Corrector]
node_family: color
inputs: [image]
outputs: [image]
tasks: [color-correct, shadows, midtones, highlights]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Color Corrector

2D Imageのcolor correctionを行う主要Nodeです。

## 概要

- **分類（Family）**: Color
- **主入力（Primary input）**: 2D Image
- **出力（Output）**: 2D Image
- **関連概念（Core concepts）**: color correction、tone ranges、alpha awareness
- **よく使う作業（Common tasks）**: shadows / midtones / highlights補正、色調整

## 入力

### Image

補正対象の2D Imageを受け取ります。

Mask等の補助入力（auxiliary inputs）の正確な仕様は21.1で確認します。

## 出力

補正後の2D Imageを出力します。

## 主な設定項目

Shadows / Midtones / Highlightsを含む補正系を持つことはlegacy Fusion referenceで確認されています。

正確なTab構成、範囲、channel mode、pre-divide / post-multiply相当設定は21.1 現在の資料または実機での確認待ちです。

## 挙動と注意点

Color CorrectorとDeep用の `dColorCorrector` は別domainです。

通常2D Imageを扱うColor Correctorを、Deep image向けNodeの単純な低機能版として扱いません。

透明edgeを強く補正する場合は、Node固有のalpha 処理 設定とmanualなAlpha Divide / Multiplyを二重適用しないよう確認します。

## 最小例

```text
Image → Color Corrector → Output
```

## 関連する考え方

- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)
- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連パターン

Color / Matte Patternは今後追加します。

## 似たNode・関連Node

- Brightness Contrast
- Color Curves
- dColorCorrector — Deep image domain

## バージョンと検証状況

Color Correctorの存在とShadows / Midtones / Highlights系の役割は旧版のBlackmagic Design公式Fusion資料で確認。Fusion 21.1での正確な設定項目、alpha 設定、初期値は未検証です。
