---
title: OCIO Color Space
description: OCIO configを読み込み、Source SpaceからOutput SpaceへImageを変換し、必要ならLookを適用するColor Management Node。
doc_type: node
term_id: ocio-colorspace
term_short: OCIO configを基準にcolor spaceを変換するNode。
verification: partial
aliases: [OCIO Color Space, OCS]
concepts: [image-data, color-space, ocio]
nodes: [OCIO Color Space]
node_family: color
controls: [OCIO Config, Source Space, Output Space, Look]
inputs: [image, mask]
outputs: [image]
tasks: [ocio, color-space]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# OCIO Color Space

OCIO Color Spaceは、OpenColorIO configを基準に、入力ImageをSource SpaceからOutput Spaceへ変換するNodeです。

facilityやprojectで共通OCIO configを使っている場合に、Fusion内の変換も同じ定義へ揃えられます。

## OCIO Config

使用する`.ocio` configを指定します。

環境変数OCIOで指定されたconfigを使うworkflowもあります。利用できるspace / Lookはconfig内容に依存します。

## Source Space / Output Space

sourceがどのspaceか、outputをどのspaceへ変換するか選びます。

Loader / MediaIn直後でworking spaceへ入れ、MediaOut / Saver前でdelivery spaceへ戻す構成が代表例です。

## Look

configにLookが定義されている場合、追加のcreative / display transformとして選べます。

## Gamut / CSTとの違い

OCIO Color SpaceはOCIO configが正本です。Resolve Color Managementのtransformを使う場合はColor Space Transform、Fusion内蔵spaceを使う場合はGamutと役割を分けます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2193–2195で、config、Source / Output Space、Look、典型的な入出力配置を確認しました。
