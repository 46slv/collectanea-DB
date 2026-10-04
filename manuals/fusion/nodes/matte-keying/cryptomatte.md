---
title: "Cryptomatte"
description: "Cryptomatteをネイティブ処理。21でRenderer3DからのCryptomatte作成/利用を拡張。"
doc_type: node
term_id: "cryptomatte"
term_short: "Cryptomatteは、Cryptomatteをネイティブ処理。21でRenderer3DからのCryptomatte作成/利用を拡張。"
verification: partial
aliases: ["Cryptomatte"]
concepts: ["image-data", "alpha"]
nodes: ["Cryptomatte"]
node_family: "matte-keying"
inputs: ["image"]
outputs: ["image"]
tasks: ["create-matte"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Cryptomatte

Cryptomatteは、EXRへ埋め込まれたobject / material ID情報を読み、Viewer上の選択からmatteを取り出すStudio限定Nodeです。

色keyや手描きrotoではなく、3D rendererが書き込んだIDを使います。

## 入力
Cryptomatte dataを含む2D EXRを1 inputで受けます。

## View Layer / View Mode
View LayerでObject / Material等のmatte typeを選びます。

View ModeではColors、Edges、Beauty、Matte等へ表示を切り替えます。

## Select Matte
Viewerまたはlistからobject / materialを複数選択し、1つのmatteとして出力できます。

source EXRにCryptomatte layerが無ければ選択できません。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2514–2516で、Studio限定、EXR embedded mattes、View Layer / View Mode、Select Matteを確認しました。
