---
title: "LUT Cube Analyzer"
description: "LUT cubeを解析。"
doc_type: node
term_id: "lut-cube-analyzer"
term_short: "LUT Cube Analyzerは、LUT cubeを解析。"
verification: partial
aliases: ["LUT Cube Analyzer", "LCA"]
concepts: ["image-data"]
nodes: ["LUT Cube Analyzer"]
node_family: "lut"
inputs: ["image"]
outputs: ["image"]
tasks: ["apply-lut"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# LUT Cube Analyzer

LUT Cube Analyzerは、[LUT Cube Creator](./lut-cube-creator)から始まったcolor cube Imageを解析し、その間に行ったColor処理を3D LUT fileとして書き出すNodeです。

## 入力

orange Inputへ、LUT Cube Creator由来のImageを接続します。

    LUT Cube Creator
       → Color Correction
       → LUT Cube Analyzer
       → LUT file

元のcubeを何も変えずAnalyzerへ入れると1:1 LUTになります。

## Type

出力する3D LUT formatを選びます。ManualではALUT3、ITX、3DLが説明されています。

## Filename / Write File

Filenameで保存先とfile名を指定し、Write Fileで実際にLUTを生成します。

## 使う場面

Fusion内の複数Color Nodeによる処理を、別appや別compで再利用できるLUTへ焼き込む場合に使います。

ただしposition依存、Mask、spatial effect等、RGB valueだけでは表せない処理はLUTへ完全には変換できません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 107 pp.2456–2457で、Input、LUT Creator由来のcube、Type、Filename、Write Fileを確認しました。
