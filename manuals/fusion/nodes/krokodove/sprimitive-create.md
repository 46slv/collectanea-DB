---
title: sPrimitiveCreate
description: 十字・多角形・長方形・星形など、基本的なShapeを作る。
doc_type: node
term_id: sprimitive-create
term_short: 十字、多角形、長方形、星形などの基本Shapeを生成するツール。
verification: partial
aliases: [sPrimitiveCreate, sPrimitive Create]
nodes: [sPrimitiveCreate]
node_family: krokodove
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sPrimitiveCreate

十字・多角形・長方形・星形などの基本図形を作ります。ここでの「基本図形」は、複雑な輪郭を一から描く代わりに、種類を選んで使い始める形のことです。

## 入力と出力

Shape Create Toolsに分類される生成ツールです。作ったShapeは、輪郭の加工や見た目の調整に使う対象になります。補助入力の有無や生成時の正式な設定名は未確認です。

Shapeは完成した2D画像と異なります。画像として合成する工程は[sRender](../shapes/s-render)の説明を参照してください。

## 確認できた図形

Manualはcross、polygon、rectangle、starを例として挙げています。これを全選択肢の一覧とはみなしていません。星の頂点数や十字の縦横幅など、各形の詳細なコントロールは未確認です。

## 運用例

ロゴやモーショングラフィックスの基になる形を選び、[sRound](./sround)で角、[sRestyle](./srestyle)で見た目を調整する構成が候補になります。これは各ツールの役割を組み合わせた構成案で、実機で確認した配線例ではありません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。Manualの表記は`sPrimitiveCreate`です。公式21.1発表の`sPrimitive Create`も検索用の別表記として登録しています。いずれも内部REGIDの保証ではありません。
