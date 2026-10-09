---
title: Layerノード
description: Multilayer ImageのLayerを結合・正規表現で選別・削除・再構成するNodeを役割から探す入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, multilayer, exr]
updated: "2026-10-05"
---

# Layerノード

Layer Nodeは、multilayer EXR等に含まれる複数Layerを、Imageをflattenせずに整理するためのNodeです。

- [Layer Muxer](./layer-muxer) — 2 sourceのLayerを結合
- [Layer Regex](./layer-regex) — layer名をRegExで選別・rename
- [Layer Remover](./layer-remover) — 不要Layerを削除
- [Swizzler](../color/swizzler) — 複数sourceから新しいLayer構成を作る

## 使い分け

「Layerを足す」ならLayer Muxer、「名前ruleで残す / 消す / rename」ならLayer Regex、「既存Layerを単純に外す」ならLayer Removerです。

新しいcustom layerへchannelを割り当て直す場合はSwizzlerの方が直接的です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 106 pp.2440–2450を基に整理しています。
