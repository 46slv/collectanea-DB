---
title: Alpha Multiply
description: RGBへAlphaを乗算し、ストレートRGB（straight RGB）をpremultiplied状態へ戻すためのNode。
doc_type: node
term_id: alpha-multiply
verification: unverified
aliases: [Alpha Multiply, AML, premultiply]
concepts: [alpha, premultiplication]
nodes: [Alpha Multiply]
node_family: matte-keying
inputs: [image]
outputs: [image]
tasks: [premultiply, composite, alpha]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---
# Alpha Multiply

Alpha Multiplyは、straight RGBへAlphaを掛け、premultiplied RGBAへ戻すNodeです。

## 入力
2D Imageと任意Effect Maskを受けます。固有Inspector Controlはありません。

## 基本構成

    Alpha Divide → Color Correction → Alpha Multiply → Merge

sourceが最初からpremultipliedなのに重ねてMultiplyするとedgeを二重に暗くする可能性があるため、Alpha stateを確認して使います。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 109 p.2505で、RGB × Alpha、2 inputs、固有Controlなしを確認しました。
