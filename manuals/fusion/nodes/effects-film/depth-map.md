---
title: "Depth Map"
description: "AIで深度マップを推定。21で最大6x高速化。Edition/Neural Engine条件を確認。"
doc_type: node
term_id: "depth-map"
term_short: "Depth Mapは、AIで深度マップを推定。21で最大6x高速化。Edition/Neural Engine条件を確認。"
verification: partial
aliases: ["Depth Map"]
concepts: ["image-data"]
nodes: ["Depth Map"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# Depth Map

AIで深度マップを推定。21で最大6x高速化。Edition/Neural Engine条件を確認。

## 概要

- **種別**: Node / Tool
- **分類**: Resolve 18.5+
- **主なデータ領域**: 2D Image / control
- **導入・系譜**: 18.5 native AI / Resolve FX boundary
- **根拠レベル**: 導入版のBlackmagic Design公式資料で確認した現行系譜

## 入力と出力

この項目はカタログ上、**2D Image / control**を主なデータ領域として扱います。上のfrontmatterにある入出力は領域を検索するための分類であり、Fusion 21.1の正確な端子数や端子名を断定するものではありません。

実際に組むときはFlow上の端子ラベルとInspectorを確認し、2D Image、Mask、Shape、Particle、Classic 3D、USD、Deep、パラメータ値を取り違えないようにします。

## 主な用途

AIで深度マップを推定。21で最大6x高速化。Edition/Neural Engine条件を確認。

## 使うときの判断

前後のノードと同じ2D Image領域で使うのが基本です。Maskや補助入力がある場合は、画像入力と役割を分けて接続します。

## 最小構成

```text
Image → Depth Map → Image
```

## 注意点

- このページはノードを選ぶための役割・データ領域・系譜を先に揃えています。
- exactな内部ID、端子名、初期値、数値範囲、Edition差は、確認できたものだけ今後追記します。

## バージョンと検証状況

導入版のBlackmagic Design公式資料で現行系譜を確認しています。Fusion 21.1の端子名、Inspector項目、初期値、範囲は未検証です。

このリファレンスのinventory基準はDaVinci Resolve / Fusion 21.0.4です。Manual全体は21.1基準へ更新中のため、21.1で差がある箇所は現行資料または実機確認後に更新します。
