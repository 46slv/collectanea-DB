---
title: "Primatte 5"
description: "Primatteキーイング。"
doc_type: node
term_id: "primatte-5"
term_short: "Primatte 5は、Primatteキーイング。"
verification: partial
aliases: ["Primatte 5"]
concepts: ["image-data", "alpha"]
nodes: ["Primatte 5"]
node_family: "matte-keying"
inputs: ["image"]
outputs: ["image"]
tasks: ["create-matte"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Primatte 5

このページはFusionのPrimatte keyerを扱います。DaVinci Resolve 21.1 Reference ManualではNode名をPrimatte [Pri]として記載し、Fusion Studio専用です。

Primatteはforeground / background pixelを複数zoneへ分類し、screen removal、transparency、spill suppressionを段階的に作るadvanced keyerです。

## 基本workflow

1. screen colorをsampleします。
2. background / foreground sampleを増やし、matte classificationを詰めます。
3. semi-transparent edgeとfine detailを調整します。
4. spill suppressionでgreen / blue tintを抑えます。

## zoneの考え方

Manualでは完全background、transparencyを持つforeground、spill suppressionだけを持つforeground、完全foregroundの4領域として説明しています。

単純な1 thresholdではなく、screenとsubjectの関係を段階的に分類します。

## Delta Keyerとの違い

どちらもgreen / blue screenに使えます。shotのscreen quality、hair、transparent detail、spillによって結果を比較します。

## 表記について

repo側の既存page名はPrimatte 5ですが、21.1 Manualのsection titleはPrimatte [Pri]です。runtimeのvisible name / exact REGIDは実機照合へ残します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2544–2557で、Fusion Studio限定、4 zone、selection workflow、fine tuning / spill removalを確認しました。
