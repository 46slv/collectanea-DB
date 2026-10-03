---
title: "sPolygon"
description: "Shape domainのPolygon。19ガイド内で現行系として参照。"
doc_type: node
term_id: "spolygon"
term_short: "sPolygonは、Shape domainのPolygon。19ガイド内で現行系として参照。"
verification: partial
aliases: ["sPolygon"]
concepts: ["shape-data"]
nodes: ["sPolygon"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
tasks: ["build-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# sPolygon

Shape domainのPolygon。19ガイド内で現行系として参照。

## 概要

- **種別**: Node / Tool
- **分類**: Shape System (Resolve 17+)
- **主なデータ領域**: Shape
- **導入・系譜**: 17/19-confirmed
- **根拠レベル**: 導入版のBlackmagic Design公式資料で確認した現行系譜

## 入力と出力

この項目はカタログ上、**Shape**を主なデータ領域として扱います。上のfrontmatterにある入出力は領域を検索するための分類であり、Fusion 21.1の正確な端子数や端子名を断定するものではありません。

実際に組むときはFlow上の端子ラベルとInspectorを確認し、2D Image、Mask、Shape、Particle、Classic 3D、USD、Deep、パラメータ値を取り違えないようにします。

## 主な用途

Shape domainのPolygon。19ガイド内で現行系として参照。

## 使うときの判断

Shape領域のデータは2D Imageではありません。通常のMergeへ渡す前に`sRender`で画像へ変換します。

## 最小構成

```text
Shape Source → sPolygon → sRender → Image
```

## 注意点

- このページはノードを選ぶための役割・データ領域・系譜を先に揃えています。
- exactな内部ID、端子名、初期値、数値範囲、Edition差は、確認できたものだけ今後追記します。

## バージョンと検証状況

導入版のBlackmagic Design公式資料で現行系譜を確認しています。Fusion 21.1の端子名、Inspector項目、初期値、範囲は未検証です。

このリファレンスのinventory基準はDaVinci Resolve / Fusion 21.0.4です。Manual全体は21.1基準へ更新中のため、21.1で差がある箇所は現行資料または実機確認後に更新します。
