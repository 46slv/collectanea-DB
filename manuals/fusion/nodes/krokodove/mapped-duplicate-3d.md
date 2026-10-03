---
title: Mapped Duplicate 3D
description: 3Dオブジェクトを縦・横・奥行き方向へ並べ、画像を使って各複製の位置・回転・大きさ・時間を制御する。
doc_type: node
term_id: mapped-duplicate-3d
term_short: 3DオブジェクトをX・Y・Z方向へ並べ、画像で各複製の変化を制御するツール。
verification: partial
aliases: [Mapped Duplicate 3D]
nodes: [Mapped Duplicate 3D]
node_family: krokodove
inputs: [classic-3d, image]
outputs: [classic-3d]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# Mapped Duplicate 3D

一つの3Dオブジェクトを複製し、X・Y・Z方向へ規則的に並べます。XとYだけなら縦横の列、Zにも並べると奥行きのある配置になります。これがこのツールの「3D grid」の意味です。

画像を制御マップとして使うと、各複製の位置のずれ、回転、大きさ、時間などを制御できます。

## 入力と出力

役割の異なる二種類のデータを扱います。3D側は複製するオブジェクト、画像側は複製の変化を制御するマップです。画像は単に表面へ貼る絵として説明されているわけではありません。

出力の役割は複製配置された3Dオブジェクトです。通常の画像として使う段階は[Renderer3D](../3d/renderer-3d)を参照してください。画像入力の正式な名前・本数、どのチャンネルがどの値に対応するかは未確認です。

## 運用例

同じ立体を多数並べ、一部分だけ高さ・向き・大きさの異なる配置を作りたい場合の候補です。画像による制御を確かめるなら、まず単純な配置を作り、位置または大きさの一種類だけにマップを使う方法が考えられます。

明るさと変化量の対応、複製が参照する画像上の位置、時間制御の挙動はManualの短い説明にはありません。明るい部分が必ず大きくなる、といった変換式を前提にした手順にはしていません。

## 似たノードとの違い

[Duplicate 3D](../3d/duplicate-3d)とは別項目です。Mapped Duplicate 3Dを選ぶ際の特徴は、X・Y・Zの配置と画像による制御です。両者のInspectorや内部処理が同一とは扱いません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2434。配置の意味、画像で制御できる量、3Dの役割を確認しました。REGID、端子、初期値、値域、実機結果は未確認です。
