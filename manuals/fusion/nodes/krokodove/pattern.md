---
title: "Pattern"
description: "幾何図形を敷き詰め、画面全体に繰り返し模様を作るKrokodoveの画像生成ツール。"
doc_type: node
term_id: "pattern"
term_short: "図形を繰り返し並べて、画面全体を埋める模様を作るKrokodoveの画像生成ツール。"
verification: partial
aliases: ["Pattern"]
concepts: ["image-data"]
nodes: ["Pattern"]
node_family: "krokodove"
outputs: ["image"]
tasks: ["motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# Pattern

Patternは、幾何図形を繰り返し並べて、画面全体を模様で埋めるKrokodoveのツールです。例えば、小さな図形を一面に敷き詰めた背景を作りたいとき、図形を一つずつ配置する代わりの候補になります。

## 役割：画面を模様で埋める

DaVinci Resolve 21.1 Reference Manualでは、Patternは**Image Create**に分類されています。「敷き詰め（tessellation）」は、図形を一定の規則で繰り返し配置し、面を埋めることです。図形が一つだけ現れるのではなく、同じ種類の形が画面全体に続くような結果を狙います。

ここでいう図形（shape）は見た目の説明です。Fusionの<Term id="shape-data">Shapeデータ</Term>を受け取って加工するという意味ではありません。KrokodoveのPatternは、既存のCOLLECTANEAでは2Dの<Term id="image">Image</Term>を結果とするツールに分類されています。

## 入力と出力

- **入力：** 21.1 Reference ManualのKrokodove一覧には、Patternの入力端子名・端子数・外部画像の必須条件が記載されていません。元の記事にも入力の確定情報がないため、「画像を必ずつなぐ」「入力は一切ない」のどちらも断定しません。
- **出力：** このリポジトリのノード分類では2D Imageです。後段でほかの画像と重ねる場合は、通常の画像合成ノードを使う構成を検討できます。実機の端子表示と挙動は未確認です。

## 主な用途

- **タイトルの背景：** 文字の背後に、小さな幾何図形が繰り返される面を作る。
- **モーショングラフィックス：** 画面全体に反復模様を置き、その上に別の画像や文字を合成する。
- **見た目の比較：** 規則的な図形の敷き詰めと、線・同心図形・素材の複製で作る模様を比較する。

これらはManualで確認された「画面全体の模様を生成する」という役割から考えた**制作上の使い道**です。特定の形状プリセットやアニメーション機能が備わるという保証ではありません。

## 最小の確認手順

1. FusionのフローにPatternを追加し、その結果をViewerで確認します。入力が必要な表示になっている場合は、実際の端子表示を優先してください。
2. Inspectorに表示される設定を**一つずつ**変えます。模様を構成する一つの図形が変わるのか、画面内の並びが変わるのかを観察します。ここでは未確認の設定名を指定しません。
3. 画像として出力できることを確認できたら、`Background`を背景、Patternの出力を前景として`Merge`に重ね、模様を使った背景の構成を試します。合成時の透明度は実際の出力AlphaとMergeの結果を見て調整します。

```text
Background ───────→ Merge（背景） ──→ Viewer / MediaOut
Pattern ──────────→ Merge（前景）
```

この図は**接続を検討するための構成例**で、公式Manualが掲載した配線図や実機検証済みのレシピではありません。

## 似たツールとの違い

| ツール | まず比較する点 |
| --- | --- |
| [Lines](./lines) | 一本または複数組の線を繰り返す。線の反復が目的ならこちらを検討する。 |
| [Shapes](./shapes) | 円や四角などの図形を同心状に重ねる。画面全体への敷き詰めとは配置の考え方が異なる。 |
| [Duplicate](./duplicate) | **入力した画像**を、選んだ模様や形に沿って複製する。すでにある素材を増やすなら候補になる。 |
| [Pack](./pack) | 指定した色チャンネル内に、重ねた図形の模様を作る。Patternと同じ処理と見なさず、どこに模様を作るかで選ぶ。 |
| [sGrid](../shapes/sgrid) | 専用のShapeデータを縦横へ複製し、[sRender](../shapes/s-render)で画像にする。Shapeのまま図形を扱いたい場合の別系統。 |

## 注意点・確認できていないこと

Patternの分類は**Image Create**です。「Shape」という語が出てくるからといって、標準のShape系ノードへ直接つなげる前提で組まないでください。Shapeデータと2D Imageの違いは[画像データ](../../learn/02-data/image)と[Shapeデータ](../../learn/02-data/shape)にまとめています。

21.1 Manualの一覧はPatternの働きを短く説明するにとどまり、Inspectorの正式な項目名、各項目の初期値・範囲、入力端子の仕様、Free/Studioでの差、実際に選べる図形の種類までは示していません。これらは実機確認が必要です。

## 出典と検証状況

- Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*, Chapter 105「Krokodove Nodes」p.2435、**Image Create Tools / Pattern**。画面全体を埋める、敷き詰めた図形の配列を生成する役割を確認。
- 同章p.2435のLines・Shapes、およびp.2436のDuplicateの概要を、上記の使い分けの根拠として参照。
- 出力データ分類は既存COLLECTANEAメタデータによるもの。現行Fusionでの端子・Inspector・生成結果は未検証のため `verification: partial` を維持。

関連するノードを用途から探す場合は[Krokodoveの索引](./)を参照してください。
