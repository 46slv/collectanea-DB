---
title: Color Matrix
description: RGBA入力を4×4 matrixとAdd列で再計算し、channel mix・swap・brightness offset等を数値で組むNode。
doc_type: node
term_id: color-matrix
term_short: RGBAをmatrix演算で別RGBAへ変換するNode。
verification: partial
aliases: [Color Matrix, CMx]
concepts: [image-data, channel-remap]
nodes: [Color Matrix]
node_family: color
controls: [Update Lock, Matrix, Invert]
inputs: [image, mask]
outputs: [image]
tasks: [channel-remap, matrix-color]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Color Matrix

Color Matrixは、入力RGBAをmatrix演算して別のRGBAへ作り替えるNodeです。

「RedへGreenを20%混ぜる」「RGBを入れ替える」「channelごとに一定値を足す」といった処理を、4×4 matrixとAdd列で数値的に定義できます。

## 入力

2D Imageと任意Effect Maskを受けます。

## Matrix

横方向が出力R/G/B/AとAdd、縦方向が入力R/G/B/Aです。

初期状態は対角成分が1で、入力RGBAをそのまま出力します。

別channelの係数を加えるとchannel mixになり、Add列は各出力へ一定値を加えます。

## Update Lock

matrixを複数cell編集するときにrender更新を止めます。設定後に解除して結果を確認します。

## Invert

matrixの逆変換を試みます。

channel swapなど可逆なmatrixの後段で元へ戻したい場合に使えますが、情報を失うmatrixは完全には戻せません。

## Channel Booleansとの違い

- **Channel Booleans** — Copy / Add / Multiply等のoperationをchannel単位で選ぶ
- **Color Matrix** — 複数channelの線形combinationをmatrixで同時に定義

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2176–2179で、4×4 matrix、Add列、Update Lock、Invert、channel mix例を確認しました。
