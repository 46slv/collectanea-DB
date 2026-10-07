---
title: "Pseudo Color"
description: "値域を疑似色へマッピング。"
doc_type: node
term_id: "pseudo-color"
term_short: "Pseudo Colorは、値域を疑似色へマッピング。"
verification: partial
aliases: ["Pseudo Color", "PSCL"]
concepts: ["image-data"]
nodes: ["Pseudo Color"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Pseudo Color

Pseudo Colorは、Imageの値をwaveformへmappingし、元とは異なるfalse-color patternへ変換するstylize Nodeです。

scientific visualization風の色分けや、psychedelicなcolor cyclingを作る用途に向きます。

## 主な設定
Red / Green / Blue / Alphaそれぞれへwaveformを設定し、入力値に応じた出力colorを作ります。

- Phase: waveform位置。animationするとcolor cycling
- Mean: waveform中心値
- Amplitude: 色変化の強さ

## 使う判断
Color Correctorのように自然な補正をするNodeではなく、値を意図的に別色へ再配置するNodeです。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 97 pp.2291–2293で、waveform-based mapping、Phase、Mean、Amplitudeを確認しました。
