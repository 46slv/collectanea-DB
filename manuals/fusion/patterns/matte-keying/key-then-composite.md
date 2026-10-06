---
title: Keyと合成を分ける
description: 前景抽出（foreground extraction）とbackgroundへの合成を別段階にし、matte問題とMerge問題を切り分けるPattern。
doc_type: pattern
verification: partial
aliases: [key then composite, keying pipeline]
concepts: [alpha, matte, foreground-background, premultiplication]
patterns: [key-then-composite]
nodes: [Delta Keyer, Merge]
tasks: [key, matte, composite, debug]
level: intermediate
product_scope: fusion
---

# Keyと合成を分ける

## 使う場面

green / blue screenを抜いた後の問題が、Keyer由来なのかMerge由来なのか分からない状態です。

## 前提となる考え方

- [Alpha](../../learn/04-compositing/alpha)
- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)
- [前景（Foreground）/ 背景（Background）/ マスク（Mask）](../../learn/04-compositing/foreground-background-mask)

## 基本構成

```text
source
  ↓
Keyer
  ↓
keyed foreground ───┐
                    ├─ Merge → Output
new background ─────┘
```

前景抽出（foreground extraction）と合成を別段階として観察します。

## 保つべき条件

- Keyer outputを単体で確認する。
- matte edgeとbackground 合成を同時に直さない。
- 参照元 RGB / alpha 関係を確認する。
- Merge input 役割をキーイング問題と混ぜない。

## バリエーション

### Clean key first

まずkeyed foregroundのmatteを作り、その後backgroundへ合成します。

### エッジ修復の段階

KeyerとMergeの間にedge / spill / matte処理を置く場合も、各段階を独立してViewerで確認します。

## Nodeの選び方

Delta Keyerは主要Keyer候補、Mergeは2D 合成 管理元です。

## 失敗しやすい点

- Merge結果だけ見てKeyerを調整する。
- Effect Maskとmatte alphaを混同する。
- premultiplication問題をkey thresholdで直そうとする。

## この構成を使う手順

- [KeyしてBackgroundを置き換える](../../recipes/matte-keying/key-and-replace-background)

## 関連Node

- [Delta Keyer](../../nodes/matte-keying/delta-keyer)
- [Merge](../../nodes/compositing/merge)
