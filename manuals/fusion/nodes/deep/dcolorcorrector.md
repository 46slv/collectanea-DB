---
title: "dColorCorrector"
description: "Deep image専用Color Corrector。histogram matching/equalization、hue/tint/suppression等。"
doc_type: node
term_id: "dcolorcorrector"
term_short: "dColorCorrectorは、Deep image専用Color Corrector。histogram matching/equalization、hue/tint/suppression等。"
verification: partial
aliases: ["dColorCorrector"]
concepts: ["image-data"]
nodes: ["dColorCorrector"]
node_family: "deep"
controls: ["Correction", "Ranges", "Options"]
inputs: ["image"]
outputs: ["image"]
tasks: ["process-deep"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# dColorCorrector

Deep image専用Color Corrector。histogram matching/equalization、hue/tint/suppression等。

## 概要

- **種別**: Node / Tool
- **分類**: Resolve 21
- **主なデータ領域**: 2D Image / control
- **導入・系譜**: 21 [dCC]
- **根拠レベル**: Resolve 21のBlackmagic Design公式資料で確認

## 入力と出力

この項目はカタログ上、**2D Image / control**を主なデータ領域として扱います。上のfrontmatterにある入出力は領域を検索するための分類であり、Fusion 21.1の正確な端子数や端子名を断定するものではありません。

実際に組むときはFlow上の端子ラベルとInspectorを確認し、2D Image、Mask、Shape、Particle、Classic 3D、USD、Deep、パラメータ値を取り違えないようにします。

## 主な用途

Deep image専用Color Corrector。histogram matching/equalization、hue/tint/suppression等。

## 使うときの判断

前後のノードと同じ2D Image領域で使うのが基本です。Maskや補助入力がある場合は、画像入力と役割を分けて接続します。

## 最小構成

```text
Deep Source → dColorCorrector → Deep to Image
```

## 主に確認する設定

- `Correction`
- `Ranges`
- `Options`

上記は公式資料で役割が確認できた主要項目です。表示名や配置はFusion 21.1のホストで再確認します。

## 注意点

- このページはノードを選ぶための役割・データ領域・系譜を先に揃えています。
- exactな内部ID、端子名、初期値、数値範囲、Edition差は、確認できたものだけ今後追記します。

## バージョンと検証状況

Resolve 21のBlackmagic Design公式資料で役割を確認しています。Fusion 21.1の実機差、端子名、初期値、範囲は必要に応じて再確認します。

このリファレンスのinventory基準はDaVinci Resolve / Fusion 21.0.4です。Manual全体は21.1基準へ更新中のため、21.1で差がある箇所は現行資料または実機確認後に更新します。
