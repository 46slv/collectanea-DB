---
title: "Unsharp Mask"
description: "アンシャープマスク方式のシャープ化。"
doc_type: node
term_id: "unsharp-mask"
term_short: "Unsharp Maskは、アンシャープマスク方式のシャープ化。"
verification: partial
aliases: ["Unsharp Mask", "US"]
concepts: ["image-data"]
nodes: ["Unsharp Mask"]
node_family: "blur-filter"
inputs: ["image"]
outputs: ["image"]
tasks: ["filter-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# Unsharp Mask

アンシャープマスク方式のシャープ化。

## 概要

- **種別**: Node / Tool
- **分類**: Blur / Filter
- **主なデータ領域**: 2D Image / control
- **略称**: `US`
- **導入・系譜**: legacy
- **根拠レベル**: Blackmagic Design公式の旧Fusion Tool Referenceにある系譜

## 入力と出力

この項目はカタログ上、**2D Image / control**を主なデータ領域として扱います。上のfrontmatterにある入出力は領域を検索するための分類であり、Fusion 21.1の正確な端子数や端子名を断定するものではありません。

実際に組むときはFlow上の端子ラベルとInspectorを確認し、2D Image、Mask、Shape、Particle、Classic 3D、USD、Deep、パラメータ値を取り違えないようにします。

## 主な用途

アンシャープマスク方式のシャープ化。

## 使うときの判断

前後のノードと同じ2D Image領域で使うのが基本です。Maskや補助入力がある場合は、画像入力と役割を分けて接続します。

## 最小構成

```text
Image → Unsharp Mask → Image
```

## 注意点

- このページはノードを選ぶための役割・データ領域・系譜を先に揃えています。
- exactな内部ID、端子名、初期値、数値範囲、Edition差は、確認できたものだけ今後追記します。
- legacy系譜の項目は、現在のEffects Libraryに同名で表示されることまで一件ずつ実機確認したものではありません。

## バージョンと検証状況

旧Blackmagic Design公式Tool Referenceで役割と系譜を確認しています。Fusion 21.1での存在、端子名、Inspector項目、初期値、範囲は実機または現行マニュアルで再確認が必要です。

このリファレンスのinventory基準はDaVinci Resolve / Fusion 21.0.4です。Manual全体は21.1基準へ更新中のため、21.1で差がある箇所は現行資料または実機確認後に更新します。
