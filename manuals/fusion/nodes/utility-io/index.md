---
title: I/O・Graph Utilityノード
description: Resolve / Fusion Studioのsource・output・file I/Oと、Group・Macro・Underlay等のGraph整理Nodeを役割から探す入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, io, graph-organization]
updated: "2026-10-05"
---

# I/O・Graph Utilityノード

## Imageを入れる

- [MediaIn](./media-in) — Resolve Timeline / Media PoolからFusionへ
- [Loader](./loader) — Fusion Studioのfile source。ResolveではEXR用途

## Imageを出す

- [MediaOut](./media-out) — Resolve Timeline / Color pageへ返す
- [Saver](./saver) — diskへfile render
- [External Matte Saver](./external-matte-saver) — 複数matteをEXR channelへまとめてColor pageへ渡す

## Graphを整理・再利用する

- [Group](./group) — 複数Nodeを1つの箱としてまとめる
- [Macro](./macro) — 選んだControlだけを公開した再利用Tool
- [Underlay](./underlay) — Node群の背景に視覚的なまとまりを作る
- [Sticky Note](./sticky-note) — Graph内の説明メモ
- [Pipe Router](./pipe-router) — connection lineの経路だけを整理
- [OGrafLoader](./ografloader) — OGRF graph / dataの読み込み用途

I/O Nodeはdataを処理するだけでなく、Resolve page boundaryやdisk boundaryを作ります。Graph UtilityはImage結果を変えず、構造・再利用・可読性を管理します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 104、Chapter 116、およびFusion FundamentalsのGroup / Macro / Node Editor説明を基に整理しています。
