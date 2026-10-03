---
title: sResample
description: Shapeの輪郭をどのようにサンプリングするかを変更する。
doc_type: node
term_id: sresample
term_short: Shapeの輪郭のサンプリングを変更する。画像の解像度変更とは区別する。
verification: partial
aliases: [sResample]
nodes: [sResample]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sResample

Shapeの輪郭のサンプリングを変更します。ここでのサンプリングは輪郭を扱うためのもので、完成画像の縦横の画素数を変えることではありません。

## 入力と出力

対象はShapeの輪郭です。Manualは輪郭のサンプリングを変えると説明していますが、点数指定・間隔指定などの方式や、出力される点・線分の構成までは示していません。

## 使う場面

輪郭を使う後段の処理に対し、その輪郭の表現を調整したいときの候補です。使用前後で元の形がどう変化するかを確認します。再サンプリングしても輪郭が完全に不変である、必ず点が等間隔になる、といった保証は未確認です。

## 似たツールとの違い

[sSmooth](./ssmooth)は線分を曲げて輪郭を滑らかにする役割です。sResampleはサンプリングの変更であり、「滑らかにするツール」の別名としては扱いません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。名称と輪郭サンプリングの変更を確認しました。アルゴリズム、設定名、閉曲線・開曲線の扱い、実機結果は未確認です。
