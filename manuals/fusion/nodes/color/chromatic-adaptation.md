---
title: Chromatic Adaptation
description: Source / Target illuminantを指定し、人間の視覚順応をmodel化して異なる色温度・white point間を高精度に変換するNode。
doc_type: node
term_id: chromatic-adaptation
term_short: Illuminant / white pointの違いをchromatic adaptation transformで補正するNode。
verification: partial
aliases: [Chromatic Adaptation, CrA]
concepts: [image-data, color-space, white-balance]
nodes: [Chromatic Adaptation]
node_family: color
controls: [Method, Source Illuminant, Target Illuminant, Current Color Space, Current Gamma]
inputs: [image, mask]
outputs: [image]
tasks: [white-point, color-temperature, color-management]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Chromatic Adaptation

Chromatic Adaptationは、「ある照明・white pointを前提にしたImageを、別の照明・white pointで見た場合へ変換する」ためのNodeです。

単純にRGBへ色を足すのではなく、人間のcone responseをmodel化したchromatic adaptation transformを使います。

## Method

CAT02、Bradford Linear、Von Kries等からtransform methodを選びます。

ManualではCAT02を幅広いdata setで扱いやすいmethodとして説明していますが、既存pipelineとの互換性が必要なら他methodを選ぶ場合があります。

## Source / Target Illuminant

sourceとtargetのilluminantを指定します。

Standard Illuminant、Color Temperature、CIE 1931 xy座標から定義できます。

## Current Color Space / Gamma

入力Imageが現在どのcolor space / gammaにいるかを指定します。

defaultはtimeline設定を使いますが、別spaceのsourceなら明示的に合わせます。

## White Balanceとの違い

White Balanceは撮影素材の色かぶり補正を素早く行う用途に向きます。

Chromatic Adaptationは、white point / illuminant変換そのものをcolor managementとして精密に扱う場合のNodeです。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2136–2138で、Method、Source / Target Illuminant、Color Space / Gammaを確認しました。
