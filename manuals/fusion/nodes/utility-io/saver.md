---
title: "Saver"
description: "Fusion Studioでファイル/連番を書き出す。Resolve内ではMediaOut/Deliverとの境界に注意。"
doc_type: node
term_id: "saver"
term_short: "Saverは、Fusion Studioでファイル/連番を書き出す。Resolve内ではMediaOut/Deliverとの境界に注意。"
verification: partial
aliases: ["Saver", "SV"]
concepts: ["image-data"]
nodes: ["Saver"]
node_family: "utility-io"
inputs: ["image"]
outputs: ["image"]
tasks: ["route-data"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Saver

Saverは、Fusion Studioのcompositionや中間branchをdiskへrenderするI/O Nodeです。

Resolveでは通常のtimeline deliveryに使うNodeではなく、SaverはEXR export用途に限定されます。

## 入力

orange Image Inputへ書き出したい2D Imageを接続します。

複数Saverを別branchへ置き、同じcompから異なるformat / intermediate resultを同時に定義できます。

## Filename / Output Format

Filenameでpathとfile名を指定し、Output Formatでformatを選びます。

sequence formatではframe numberが自動追加されます。extensionはOutput Format変更に合わせて自動変更されないため、file名側も一致させます。

## Save Frames

- Full Renders Only — final render時だけ保存
- High Quality Interactive — interactive processingでframeが計算されるたびに保存

paint / roto workflowでは後者をcache-likeに使える場合があります。

## Clipping Mode

Frame / None等でDoD外の扱いを決めます。

Noneでは非常に大きいImageを書き出す可能性があるため、必要な場合だけ使います。

## Color Space / Gamma

Saverは保存時だけColor Space / Gamma変換を適用できます。

comp内部dataを変えず、linear EXRとRec.709 delivery等を別Saverから出す構成が可能です。

## LoaderとのPath Map

Fusion Studioでは `Comp:\` path mapを使い、composition fileに対するrelative pathとしてLoader / Saverのlocationを持てます。

## MediaOutとの違い

- Saver — diskへfile render
- MediaOut — Resolve page / timelineへhandoff

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 104 pp.2423–2430で、Image Input、Filename、Output Format、Save Frames、Clipping Mode、Color Space / Gamma、multiple Saverを確認しました。
