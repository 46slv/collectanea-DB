---
title: sExtrude
description: 接続したShapeに押し出し処理を加える。出力型や押し出し方式は追加確認が必要。
doc_type: node
term_id: sextrude
term_short: 接続したShapeを押し出すツール。3D形状への変換を断定する資料は未確認。
verification: partial
aliases: [sExtrude]
nodes: [sExtrude]
node_family: krokodove
inputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sExtrude

接続したShapeに押し出し処理を加えるツールです。ここでいうShapeは、画像の画素ではなく、輪郭などを形状として扱うデータです。

## 入力と出力

21.1 Manualで確認できるのは、接続したShapeを押し出すという役割です。出力の正式なデータ型や、どの方向にどのような形を作るかは説明されていません。

`Extrude`という名前だけから、必ず3Dメッシュや厚みのある立体を出力すると判断しないでください。このページでは未確認の出力型をfrontmatterへ登録していません。

## 使うときの判断

Shapeに押し出し表現を加えたいときの調査候補です。実機では、単純な輪郭を接続した結果と出力端子の型を先に確認します。画像用Krokodoveの[Extrude](./extrude)とは別項目です。

## 現在不足している情報

押し出し量・方向・段数の設定名、閉じた輪郭と開いた線の扱い、塗りと線への作用、出力の接続先は未確認です。これらを確定するまでは、完成した3D文字の作成手順として紹介しません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437、Shape ToolsのsExtrude行。名称と役割のみを確認した短いリファレンスです。
