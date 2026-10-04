---
title: OCIO CDL Transform
description: ASC-CDL互換のSlope・Offset・Power・Saturationを手動またはCDL fileから適用し、Forward / Reverseを選べるOCIO Node。
doc_type: node
term_id: ocio-cdl-transform
term_short: ASC-CDLのSOP + Saturation gradeをOCIO workflowで適用するNode。
verification: partial
aliases: [OCIO CDL Transform, OCT]
concepts: [image-data, color-space, ocio]
nodes: [OCIO CDL Transform]
node_family: color
controls: [Operation, Direction, Slope, Offset, Power, Saturation, Export File]
inputs: [image, mask]
outputs: [image]
tasks: [ocio, cdl, color-grade]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# OCIO CDL Transform

OCIO CDL Transformは、ASC Color Decision List互換のSlope / Offset / Power / SaturationをImageへ適用するNodeです。

facility間で共有するCDL gradeを読み込む場合と、Fusion内でSOP値を作って書き出す場合の両方に使えます。

## Operation

- **File** — CDL fileを読み込む
- **Controls** — Slope / Offset / Power / Saturationを直接編集する

## SOP + Saturation

- **Slope** — 値を乗算。Brightness ContrastのGainに近い
- **Offset** — 値を加算。Brightnessに近い
- **Power** — Gamma curveを適用
- **Saturation** — 色の強さを調整

## Direction

Forwardでgradeを適用、Reverseで逆変換を試みます。

ただし、Slope 0でblackへ潰す等、情報を失うtransformは数学的に元へ戻せません。

## OCIO 3 Nodeの役割

- **CDL Transform** — CDL grade
- **OCIO Color Space** — configに基づくspace変換
- **OCIO File Transform** — LUT / file transform

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2190–2192で、OCIO workflow、Operation、Direction、Slope / Offset / Power / Saturation、Exportを確認しました。
