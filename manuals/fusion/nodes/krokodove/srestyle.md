---
title: sRestyle
description: 入力したShapeの塗りや輪郭線の見た目を上書きする。
doc_type: node
term_id: srestyle
term_short: 入力Shapeの塗り・輪郭線の見た目を変更するKrokodoveツール。
verification: partial
aliases: [sRestyle]
nodes: [sRestyle]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape, style-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sRestyle

入力したShapeの塗りや輪郭線の見た目を変更します。複数のShapeを受け取った場合も、上流で設定された見た目を上書きする用途が説明されています。

## 入力と出力

対象はShapeです。塗りは輪郭の内側をどう見せるか、輪郭線は境界をどう見せるかを表します。sRestyleはその見た目を調整する位置に置きます。画像として合成する段階については[sRender](../shapes/s-render)を参照してください。

## 運用例

形を作る処理と見た目を決める処理を分けたい場合の候補です。例えば輪郭を作った後で塗りや線の設定を変える構成が考えられます。使用できる線種・線幅・色の正式な設定名と、複数Shapeへ作用する範囲は実機確認が必要です。

## 似たツールとの違い

[sChangeStyle](../shapes/schangestyle)は標準Shape系の別ノードです。21.1 ManualではColorとAllow Combiningを上書きする仕様が詳しく説明されています。sRestyleの全設定がsChangeStyleと同一とは確認していません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。塗り・輪郭線の見た目を上書きする役割を確認しました。端子名、全設定、初期値、実機結果は未確認です。
