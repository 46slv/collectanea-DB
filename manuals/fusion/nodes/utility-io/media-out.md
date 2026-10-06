---
title: MediaOut
description: Fusion Flowの最終2D ImageをResolve timeline / downstream 作業の流れへ返すResolve-integrated output Node。
doc_type: node
term_id: media-out
verification: partial
aliases: [MediaOut, Media Out]
concepts: [image-data, resolve-integration, output-boundary]
nodes: [MediaOut]
node_family: utility-io
inputs: [image]
tasks: [output, cross-page-workflow]
level: foundation
product_scope: resolve
suite_surfaces: [fusion, edit]
---
# MediaOut

MediaOutは、Fusion compositionの2D ImageをDaVinci ResolveのEdit / Cut / Color pipelineへ返すoutput Nodeです。

Resolve Fusion pageでは、最終compに少なくとも1つのMediaOutが必要です。

## 入力

orange Inputへ最終2D Imageを接続します。

    MediaIn → Node Graph → MediaOut

## MediaOut1

最初のMediaOutはFusion pageの最終ImageとしてEdit / Cut timelineへ戻ります。

Resolve Color Management / ACESを使うprojectでは、MediaOutでtimeline color spaceへのhandoffが行われます。

## 追加MediaOut

2つ目以降のMediaOutは、matteをColor pageへ渡す用途に使えます。

そのため「MediaOutは常に1個だけ」と考えず、beauty outputとmatte handoffを分けられます。

## Saverとの違い

- MediaOut — Resolve project内のpage間handoff
- Saver — disk fileへrender

Resolveで通常のtimeline outputを作る場合、SaverではなくMediaOutが正規の終端です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 104 pp.2419–2422で、必須output、Color page handoff、追加MediaOutによるmatte送出を確認しました。
