---
title: sTrace Create
description: 2Dの文字や図形をFusionのShape環境で扱うために変換する。
doc_type: node
term_id: strace-create
term_short: 2Dの文字や図形をShape環境へ渡すツール。太さ・不透明度・線のスタイルを調整できる。
verification: partial
aliases: [sTrace Create, sTraceCreate]
nodes: [sTrace Create]
node_family: krokodove
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sTrace Create

2Dの文字や図形を接続し、FusionのShape環境で扱うためのツールです。2Dで用意した文字・図形を、Shape系の処理へ渡す用途として説明されています。

## 入力と出力

Manualは2Dの文字や図形へ直接接続すると説明しています。ただし、それがどのノードのどの端子に当たり、画像データを受け付けるかまでは記載していません。任意の写真・SVG・ベクターファイルをそのまま入力できるとは断定しません。

出力先として説明されているのはFusionのShape環境です。輪郭を画像へ戻す工程は[sRender](../shapes/s-render)を参照してください。

## 主な設定

調整できる内容として、太さ、不透明度、線のスタイルが挙げられています。これらは役割の説明であり、Inspectorの正確なラベル・値域・初期値は未確認です。

## 運用例

2Dで用意した文字や図形を、Shape側の輪郭加工へ渡したいときの候補です。最初に接続できる出力型を確認し、次に単純な文字・図形で変換前後を比較する方法が考えられます。変換精度や穴・交差線の扱いは実機確認が必要です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。2Dの文字・図形との接続、Shape環境への変換、調整できる内容を確認しました。画像のトレースに使えるという分類は、入力型を確認するまで登録していません。
