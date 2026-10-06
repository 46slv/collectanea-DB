---
title: "sJitter"
description: "Shape属性へランダム揺らぎ。"
doc_type: node
term_id: "sjitter"
term_short: "sJitterは、Shape属性へランダム揺らぎ。"
verification: partial
aliases: ["sJitter"]
concepts: ["shape-data"]
nodes: ["sJitter"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
tasks: ["build-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# sJitter

sJitterは、入力した<Term id="shape-data">Shape</Term>へrandomな位置・size・rotation・point displacementを加えるNodeです。

特にsGrid / sDuplicateで作った規則的な配列を崩し、手作業では作りにくいばらつきを与える用途に向きます。

## 入力 / 出力

1つのrequired Shape inputを受け、jitter後のShapeを出力します。

    sEllipse → sGrid → sJitter → sRender

## Jitter Mode

staticなばらつきと、auto-animating random modeを切り替えます。

auto-animationを使うと、keyframeを大量に打たずにshapeが時間で揺らぐ動きを作れます。

## variation controls

Controls tabのrange controlsで位置、size、rotationのrandom幅を決めます。

Point Jitterは、shapeを構成するvector point自体を動かすため、単なるobject position jitterではなく輪郭の歪みにも使えます。

## 運用例

ドット背景を完全なgridではなく少し手描き風にする場合:

1. sEllipseをsGridで並べます。
2. sJitterで位置variationを少量追加します。
3. size / rotation variationも必要量だけ加えます。
4. sRenderでImage化します。

## sDuplicateのJitterとの違い

sDuplicateにもcopy単位のJitterがあります。sJitterは独立Nodeなので、既に作ったcompound / grid全体へ後段からrandomizeでき、point-level jitterも扱えます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 117 pp.2744–2746で、Shape input、arrayへのrandom offset、Jitter Mode、position / size / rotation / point jitterを確認しました。
