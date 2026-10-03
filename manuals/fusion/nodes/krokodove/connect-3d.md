---
title: Connect 3D
description: 3Dの頂点間に接続を作る。公式21.1発表で確認できるが、添付Manualの本文には詳細がない。
doc_type: node
term_id: connect-3d
term_short: 頂点間の接続を作る3Dツール。現在は公式発表に基づく役割確認まで。
verification: partial
aliases: [Connect 3D]
nodes: [Connect 3D]
node_family: krokodove
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# Connect 3D

3Dの頂点間に接続を作るツールです。Blackmagic Designの21.1公式発表で名称と役割が説明されています。

## 現在確認できること

確認できるのはvertex connectionsを作るという役割です。どの頂点同士を選ぶか、距離で接続を制限できるか、接続が線・管・別の形状のどれとして出力されるかは、発表文からは分かりません。

入力・出力の正式な型と端子数を推測で登録していません。

## 2DのConnectとの違い

[Connect](./connect)は21.1 ManualのImage Toolsに載っている別項目です。こちらは個別に配置した点を連続した線でつなぐと説明されています。名前の近さを理由に、2D版の端子・設定をConnect 3Dへ転記しません。

## Manualとの照合

今回提供されたSeptember 2026版の全4,351ページの抽出テキストを、`Connect 3D`と`Connect3D`で検索しましたが一致はありませんでした。これは当該PDFの検索結果であり、実機に存在しないという意味ではありません。画像にのみ載る記述の完全不在も、この検索だけでは証明できません。

## 出典と次の確認

- Blackmagic Design, [Blackmagic Design Announces DaVinci Resolve 21.1](https://www.blackmagicdesign.com/media/partial/release/20260908-03), 2026-09-08。名称・頂点接続の役割。
- DaVinci Resolve 21.1 Reference Manual、Chapter 105、p.2434。2D Connectとの区別。

確認日: 2026-10-03。次は実機の表示名・REGID・入出力・接続条件を確認する必要があります。本ページは操作手順の完成版ではありません。
