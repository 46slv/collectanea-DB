---
title: sSpiral Create
description: 中心点や軸の周りを巻く、らせん状の曲線を作る。
doc_type: node
term_id: sspiral-create
term_short: 中心点または軸の周りに巻き付く曲線を生成するShapeツール。
verification: partial
aliases: [sSpiral Create, sSpiralCreate]
nodes: [sSpiral Create]
node_family: krokodove
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sSpiral Create

中心点や軸の周りを巻く曲線を作ります。閉じた円を複数置く代わりに、巻いて続く線を生成する用途です。

## 入力と出力

Shape Create Toolsに分類される曲線生成ツールです。Manualは中心点または軸の周りを巻く曲線と説明しています。3Dのばね形状や管を直接出力するとまでは確認していません。

## 運用例

らせんの線を基にした装飾を作りたい場合の候補です。輪郭を見せる[sWriteOn](./swriteon)との組み合わせは用途上の候補になりますが、線の進む順番と具体的な接続は実機で確認します。

巻き数、内外径、線幅などの設定名・単位・初期値は未確認です。Manualの一行から数値付きの完成レシピを作ってはいません。

## 似たツールとの違い

[sPrimitiveCreate](./sprimitive-create)は十字・長方形・星形などの基本図形、sSpiral Createは巻いた曲線を作る役割で選びます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。正式な表内表記は`sSpiral Create`です。スペースなし表記は検索補助であり、内部REGIDとしては未確認です。
