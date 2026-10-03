---
title: "Positioner"
description: "source/destination corner pin。"
doc_type: node
term_id: "positioner"
term_short: "Positionerは、source/destination corner pin。"
verification: partial
aliases: ["Positioner"]
concepts: ["image-data"]
nodes: ["Positioner"]
node_family: "krokodove"
inputs: ["image"]
outputs: ["image"]
tasks: ["motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# Positioner

source/destination corner pin。

## 概要

- **種別**: Node / Tool
- **分類**: Krokodove / Image Pixel
- **主なデータ領域**: 2D Image または3D
- **導入・系譜**: 21
- **根拠レベル**: Resolve 21 New Features GuideのKrokodove項目で確認

## 入力と出力

この項目はカタログ上、**2D Image または3D**を主なデータ領域として扱います。上のfrontmatterにある入出力は領域を検索するための分類であり、Fusion 21.1の正確な端子数や端子名を断定するものではありません。

実際に組むときはFlow上の端子ラベルとInspectorを確認し、2D Image、Mask、Shape、Particle、Classic 3D、USD、Deep、パラメータ値を取り違えないようにします。

## 主な用途

source/destination corner pin。

## 使うときの判断

Resolve/Fusion 21へ統合されたKrokodove項目です。同名・近い役割の標準Fusionノードがあっても、設定と処理系は別として扱います。

## 最小構成

```text
Image → Positioner → Image
```

## 注意点

- このページはノードを選ぶための役割・データ領域・系譜を先に揃えています。
- exactな内部ID、端子名、初期値、数値範囲、Edition差は、確認できたものだけ今後追記します。
- Krokodove版と標準Fusionの同名・類似ノードを同一仕様として扱わないでください。

## バージョンと検証状況

Resolve 21のBlackmagic Design公式資料で役割を確認しています。Fusion 21.1の実機差、端子名、初期値、範囲は必要に応じて再確認します。

このリファレンスのinventory基準はDaVinci Resolve / Fusion 21.0.4です。Manual全体は21.1基準へ更新中のため、21.1で差がある箇所は現行資料または実機確認後に更新します。
