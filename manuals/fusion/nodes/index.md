---
title: ノードリファレンス（Node Reference）
description: Fusion 21系で参照するNode・Modifier・Paint要素を、役割・データ領域・用途・注意点から引くReference入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, inspect-controls]
---

# ノードリファレンス（Node Reference）

Fusionで使うノード（Node）と関連要素を、名前だけでなく、何を受け取り、何を返し、どの場面で使うかから確認するためのリファレンスです。

一覧から探す場合は [ノードA–Z（Node A–Z）](../index/node-a-z) を使ってください。一般的な仕組みは [Learn](../learn/) に、複数ノードへ再利用できる組み方は [Patterns](../patterns/) に分けています。

## 掲載範囲

現在は **359ページ** を収録しています。

- Fusion 21カタログ由来の357項目
- Resolve内Fusionの入出力境界となる `MediaIn` / `MediaOut`
- 通常のFlowノードだけでなく、ModifierとPaint内部要素も検索対象に含む
- 2D Image、Mask、Shape、Particle、Classic 3D、USD、Deep、Krokodoveを区別して記述

カタログ上で同名の `Offset` は、Modifier版とKrokodove版を別ページとして扱います。

## 各ページで確認できること

- ノードの役割
- 扱うデータ領域（Data Domain）
- 入力と出力の分類
- 主な用途
- 最小構成
- 似たノードや別領域との区別
- バージョンと検証状況

## 記述の境界

役割と系譜を確認できても、Fusion 21.1実機で端子名・Inspector項目・初期値・数値範囲を確認できていない項目は `partial` としています。

未確認の仕様は推測で埋めません。既存の代表ページは詳しい説明を維持し、新しく追加したページは、ノードを検索して選ぶために必要な役割・データ領域・用途・注意点を先に揃えています。
