---
title: "Depth Blur (Deep Pixel)"
description: "Z深度を利用したブラー。"
doc_type: node
term_id: "depth-blur-deep-pixel"
term_short: "Depth Blur (Deep Pixel)は、Z深度を利用したブラー。"
verification: partial
aliases: ["Depth Blur (Deep Pixel)"]
concepts: ["deep-image"]
nodes: ["Depth Blur (Deep Pixel)"]
node_family: "deep"
inputs: ["deep"]
outputs: ["deep"]
tasks: ["process-deep"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# Depth Blur (Deep Pixel)

Z深度を利用したブラー。

## 概要

- **種別**: Node / Tool
- **分類**: Deep Pixel (legacy aux)
- **主なデータ領域**: Deep image
- **導入・系譜**: legacy
- **根拠レベル**: Blackmagic Design公式の旧Fusion Tool Referenceにある系譜

## 入力と出力

この項目はカタログ上、**Deep image**を主なデータ領域として扱います。上のfrontmatterにある入出力は領域を検索するための分類であり、Fusion 21.1の正確な端子数や端子名を断定するものではありません。

実際に組むときはFlow上の端子ラベルとInspectorを確認し、2D Image、Mask、Shape、Particle、Classic 3D、USD、Deep、パラメータ値を取り違えないようにします。

## 主な用途

Z深度を利用したブラー。

## 使うときの判断

Deep imageは通常の2D Imageと別のサンプル構造を持ちます。通常の2D処理へ戻すときは`Deep to Image`を使います。

## 最小構成

```text
Deep Source → Depth Blur (Deep Pixel) → Deep to Image
```

## 注意点

- このページはノードを選ぶための役割・データ領域・系譜を先に揃えています。
- exactな内部ID、端子名、初期値、数値範囲、Edition差は、確認できたものだけ今後追記します。
- legacy系譜の項目は、現在のEffects Libraryに同名で表示されることまで一件ずつ実機確認したものではありません。

## バージョンと検証状況

旧Blackmagic Design公式Tool Referenceで役割と系譜を確認しています。Fusion 21.1での存在、端子名、Inspector項目、初期値、範囲は実機または現行マニュアルで再確認が必要です。

このリファレンスのinventory基準はDaVinci Resolve / Fusion 21.0.4です。Manual全体は21.1基準へ更新中のため、21.1で差がある箇所は現行資料または実機確認後に更新します。
