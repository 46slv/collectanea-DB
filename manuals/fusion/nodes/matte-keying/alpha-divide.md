---
title: Alpha Divide
description: RGBをAlphaで除算し、premultiplied状態を解除するためのNode。
doc_type: node
term_id: alpha-divide
verification: unverified
aliases: [Alpha Divide, ADV, unpremultiply]
concepts: [alpha, premultiplication]
nodes: [Alpha Divide]
node_family: matte-keying
inputs: [image]
outputs: [image]
tasks: [unpremultiply, color-correct, alpha]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---
# Alpha Divide

Alpha Divideは、premultiplied RGBA ImageのRGBをAlphaで割り、straight RGBへ戻すNodeです。

## 入力
2D Imageと任意Effect Maskを受けます。固有Inspector Controlはありません。

## 基本構成

    Premultiplied Image → Alpha Divide → Color Correction → Alpha Multiply

半透明edgeをColor補正する間だけstraight RGBとして扱い、最後に再premultiplyします。

対応Color NodeにPre-Divide / Post-Multiplyがある場合、1 Nodeだけの補正なら内部optionで代用できます。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 109 p.2504で、RGB ÷ Alpha、2 inputs、固有Controlなしを確認しました。
