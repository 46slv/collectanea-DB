---
title: rModify
description: 既存のRegionを変更する。変更できる属性の詳細は実機確認が必要。
doc_type: node
term_id: rmodify
term_short: Regionを変更するためのツール。変更項目の一覧はManualにない。
verification: partial
aliases: [rModify]
nodes: [rModify]
node_family: krokodove
inputs: [region]
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# rModify

Regionを変更するツールです。Regionは、対応する効果へ作用範囲を渡すために使います。

## 確認できた役割

21.1 Manualの説明は「領域の変更」にとどまります。境界のぼかし、反転、値の乗算などをrModifyの機能として断定できる情報は、この項目にはありません。

## 入力と出力

Regionを扱うツールという分類で登録しています。正式な型、端子本数、外部制御入力の有無は未確認です。

## 他のRegionツールとの区別

[rTransform](./rtransform)はRegionの変形、[rMerge](./rmerge)はRegionの統合として別々に掲載されています。rModifyを両者の上位互換として扱わず、Inspectorに実際にある変更項目を確認して選びます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2438。名称・分類・領域変更という役割を確認しました。数値付きの運用例を作るための情報は不足しているため、実機レシピは未掲載です。
