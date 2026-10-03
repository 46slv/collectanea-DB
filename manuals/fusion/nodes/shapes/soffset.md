---
title: sOffset
description: Shapeの輪郭を外側へ広げる、または内側へ縮める。Numberで処理を繰り返せる。
doc_type: node
term_id: soffset
term_short: Shapeの輪郭を外側・内側へずらし、広げたり縮めたりするツール。
verification: partial
aliases: [sOffset]
concepts: [shape-data]
nodes: [sOffset]
node_family: krokodove
inputs: [shape]
outputs: [shape]
controls: [Number]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sOffset

Shapeの輪郭を外側へ広げたり、内側へ縮めたりします。ここでのoffsetは、図形全体を画面の別の位置へ移動することではなく、輪郭を広げる・縮める処理です。

## 入力と出力

対象はShapeの輪郭です。輪郭を変更したShapeを後段で扱います。通常の画像合成へ渡す工程は[sRender](./s-render)を参照してください。正式な端子名と内部型は実機未確認です。

## 主な設定

21.1 Manualには、処理を繰り返す`Number`スライダーがあると記載されています。輪郭をずらす量、正負の方向、繰り返した輪郭の塗り方などの正式な設定名・初期値は未確認です。

## 運用例

元の図形に沿った別の輪郭を作りたいときの候補です。単純な形から始め、外側へ広げた場合と内側へ縮めた場合を比較すると、位置移動との違いを確認できます。Numberによる反復結果も、元の輪郭との関係を見ながら確認します。

## 似たツールとの違い

[sRound](../krokodove/sround)は角を丸め、[sSmooth](../krokodove/ssmooth)は角を保って辺を滑らかにします。sOffsetの確認済みの役割は輪郭の拡張・収縮です。

## 出典と旧記述の訂正

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437のKrokodove Shape Toolsに基づき改稿しました。索引の分類もKrokodoveに合わせ、従来URLと用語IDは維持しています。

旧ページは「Shapeをoffset」とだけ記載し、導入版を17と断定していました。今回確認した資料はその初出を裏付けないため、導入版の断定を取り除いています。同名の別ツールがあるかも含め、REGIDと系譜は実機・過去資料の追加照合が必要です。
