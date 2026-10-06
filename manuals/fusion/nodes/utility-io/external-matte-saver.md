---
title: External Matte Saver
description: 複数のmatteをEXRの個別channelへまとめて書き出し、Resolve Color pageへ効率よく渡すFusion Studio専用I/O Node。
doc_type: node
term_id: external-matte-saver
verification: partial
aliases: [External Matte Saver, EMS]
concepts: [image-data, multilayer, file-io]
nodes: [External Matte Saver]
node_family: utility-io
controls: [Filename, Channels, Channels Name, Node Name, Add]
inputs: [image]
outputs: []
tasks: [save-mattes, exr, resolve-connect]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# External Matte Saver

External Matte Saverは、複数matteを1つのEXR file内の別channelとして保存し、Resolve Color pageへ渡すためのFusion Studio専用Nodeです。

通常Saver + Channel Booleansでchannelを組む作業を、matte専用workflowとして簡略化します。

## 入力

初期状態では1つの2D Image inputがあります。

Mattes tabのAddを押すたびに新しいinputが増え、複数matteを同じEXRへまとめられます。

## Filename

保存するEXR file名とpathを指定します。

## Mattes tab

各inputごとに:

- Channels — Alpha / RGB / RGBAのどれを保存するか
- Channels Name — Resolve Color pageで見えるmatte channel名
- Node Name — 接続元Node名
- Add — 新しいmatte inputを追加

を設定します。

## 最小構成

    Delta Keyer ─────┐
    Polygon Mask ────┼─ External Matte Saver → mattes.exr
    Magic Mask ──────┘

## Saverとの違い

External Matte Saverはmultiple matte channel exportに特化しています。beauty Imageや一般formatを書き出す場合はSaverを使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 116 pp.2723–2724で、Fusion Studio限定、dynamic matte inputs、EXR、Filename、Channels / Name / Addを確認しました。
