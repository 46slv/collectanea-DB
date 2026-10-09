---
title: Swizzler
description: 複数ImageのLayer / RGBA / Aux channelをsourceとして選び、新しいmultilayer Imageやcustom layerを組み立てるLayer Node。
doc_type: node
term_id: swizzler
term_short: 複数sourceのLayer / channelを組み替えてmultilayer Imageを作るNode。
verification: partial
aliases: [Swizzler, Swz]
concepts: [image-data, auxiliary-channels, multilayer]
nodes: [Swizzler]
node_family: color
controls: [Layer List, Add Layer, Keep Main Input Layers, Channels, Source, Source Layer, Source Channels]
inputs: [image]
outputs: [image]
tasks: [multilayer, auxiliary-channels, channel-remap]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Swizzler

Swizzlerは、複数ImageのLayerやchannelを材料にして、新しいcustom layer / multilayer Imageを組み立てるNodeです。

Channel Booleansが主に1枚のImage内のchannel演算を行うのに対し、Swizzlerは**Layerを作る・残す・別inputからchannelを割り当てる**ことに重点があります。

## 入力

Input 1がmain source、追加の白inputへ別Imageを接続します。必要なだけsourceを増やして、新しいLayerへ割り当てます。

## Layer List / Add Layer

Layer Listでoutputに作るcustom layerを管理します。

Add Layerで新しいLayerを作り、renameして用途が分かる名前にできます。

## Keep Main Input Layers

Input 1にもともとあるLayerを保持したまま、新しいLayerを追加します。

既存multilayer EXRへAOVを追加したい場合に使えます。

## Channels / Source / Source Layer

ChannelsでRGBA / Aux / individual channelの粒度を選び、Sourceでどのinputから取るかを指定します。

multilayer sourceの場合はSource Layerで元Layerも選べます。

たとえば別々のRGB passをNormal / UV等のAux channelとして1つのLayerへまとめたり、各passを独立Layerとして1つのmultilayer Imageへ束ねられます。

## Channel Booleansとの違い

- **Channel Booleans** — channel演算・copyが中心
- **Swizzler** — Layer構造の作成・保持・source割り当てが中心

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 106 pp.2445–2450で、multiple inputs、Layer List、Add Layer、Keep Main Input Layers、Channels / Source / Source Layerを確認しました。
