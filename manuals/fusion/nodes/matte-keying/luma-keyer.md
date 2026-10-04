---
title: "Luma Keyer"
description: "輝度でキーを抜く。"
doc_type: node
term_id: "luma-keyer"
term_short: "Luma Keyerは、輝度でキーを抜く。"
verification: partial
aliases: ["Luma Keyer", "LKY"]
concepts: ["image-data", "alpha"]
nodes: ["Luma Keyer"]
node_family: "matte-keying"
inputs: ["image"]
outputs: ["image"]
tasks: ["create-matte"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Luma Keyer

Luma Keyerは、Imageのluminance rangeを基準にAlpha matteを作るNodeです。

「明るい部分だけ残す」「暗い部分をtransparentにする」といったbrightness-based keyingに使います。

## 役割

Hueやscreen colorではなくpixelの明るさを判定してmatteを作ります。highlight、sky、light element、black background上のbright graphic等の分離に向きます。

## Range

Low / High側のrangeで透明・不透明へするluminance範囲を決め、matte controlsでtransitionを整えます。

## Chroma Keyerとの違い

- Luma Keyer: 明るさで選ぶ
- Chroma Keyer: 色で選ぶ

## 最小構成

    Image → Luma Keyer → Merge / Matte Control

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2530–2534で、luminance-based keyingとmatte controlsを確認しました。
