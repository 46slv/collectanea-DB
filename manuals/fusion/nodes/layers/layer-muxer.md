---
title: Layer Muxer
description: 2つのmultilayer Imageを受け、Image 2から選んだLayerをImage 1へ追加して1つのmultilayer ImageへまとめるNode。
doc_type: node
term_id: layer-muxer
verification: partial
aliases: [Layer Muxer, LMx]
concepts: [image-data, multilayer]
nodes: [Layer Muxer]
node_family: layers
controls: [Layer, Conflicts]
inputs: [image, image]
outputs: [image]
tasks: [multilayer, combine-layers, exr]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Layer Muxer

Layer Muxerは、2つのmultilayer Imageを受け、Image 2側のLayerをImage 1へ追加して1つのmultilayer ImageへまとめるNodeです。

RGBAをMergeするNodeではなく、Layer構造を統合します。

## 入力

- Image 1: 統合先になるmultilayer Image
- Image 2: 追加するLayerを持つmultilayer Image

## Layer

Image 2からどのLayerを通すか選びます。

Default Layer、All Layers、Customから選べ、CustomではLayerごとにon/offできます。

## Conflicts

同じLayer名等が衝突したとき、Image 1 / Image 2のどちらをDefault / Main layerとして出すかを決めます。

## 最小構成

    Multilayer A ─┐
                  ├─ Layer Muxer → Saver / Swizzler
    Multilayer B ─┘

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 106 pp.2440–2441で、2 inputs、Layer、Conflictsを確認しました。
