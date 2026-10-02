---
title: KeyとCompositeを分ける
description: foreground extractionとbackgroundへの合成を別stageにし、matte問題とMerge問題を切り分けるPattern。
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

# KeyとCompositeを分ける

## Problem Family

green / blue screenを抜いた後の問題が、Keyer由来なのかMerge由来なのか分からない状態です。

## Concepts

- [Alpha](../../learn/04-compositing/alpha)
- [Premultiplication](../../learn/04-compositing/premultiplication)
- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)

## Generic Graph

```text
source
  ↓
Keyer
  ↓
keyed foreground ───┐
                    ├─ Merge → Output
new background ─────┘
```

foreground extractionとcompositingを別stageとして観察します。

## Invariant

- Keyer outputを単体で確認する。
- matte edgeとbackground compositeを同時に直さない。
- source RGB / alpha relationを確認する。
- Merge input roleをkeying問題と混ぜない。

## Variants

### Clean key first

まずkeyed foregroundのmatteを作り、その後backgroundへ合成します。

### Edge repair stage

KeyerとMergeの間にedge / spill / matte処理を置く場合も、各stageを独立してViewerで確認します。

## Node Choices

Delta Keyerは主要Keyer候補、Mergeは2D composite ownerです。

## Failure Modes

- Merge結果だけ見てKeyerを調整する。
- Effect Maskとmatte alphaを混同する。
- premultiplication問題をkey thresholdで直そうとする。

## Recipes Using This Pattern

- [KeyしてBackgroundを置き換える](../../recipes/matte-keying/key-and-replace-background)

## Related Node Reference

- [Delta Keyer](../../nodes/matte-keying/delta-keyer)
- [Merge](../../nodes/compositing/merge)
