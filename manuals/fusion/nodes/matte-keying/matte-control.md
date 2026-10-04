---
title: Matte Control
description: Alpha / matteの結合・反転・post 処理を行うMatte utility Node。
doc_type: node
term_id: matte-control
verification: unverified
aliases: [Matte Control, MAT]
concepts: [alpha, matte, compositing]
nodes: [Matte Control]
node_family: matte-keying
inputs: [image]
outputs: [image]
tasks: [matte, alpha, key, refine-matte]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---
# Matte Control

Matte Controlは、既存ImageのAlpha / matteを組み合わせ、反転・range調整・garbage / solid matte追加などを行うutility Nodeです。

keyerが作ったmatteを後段で整える「Alpha専用の調整場所」として使います。

## 入力

Imageに加え、Garbage Matte、Solid Matte、Effect Mask等を使えます。

## Matte処理

Threshold、Gamma、Post Multiply、Invert等でAlphaを整えます。hair等のedgeを戻すRestore Fringeや、matteのsolid / garbage領域を別Maskから追加できます。

## Garbage / Solid

- Solid Matte: 指定領域をopaqueへ
- Garbage Matte: 指定領域をtransparentへ

Keyer内のmatteだけで足りない場合、Matte Controlへ処理を分けるとGraphの責任を明確にできます。

## 最小構成

    Keyer → Matte Control → Merge
               ↑   ↑
            Solid Garbage

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2539–2544で、Alpha manipulation、Threshold、Restore Fringe、Invert、Solid / Garbage Matteを確認しました。
