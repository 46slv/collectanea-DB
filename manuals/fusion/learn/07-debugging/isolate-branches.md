---
title: 分岐を分離して原因範囲を狭める
description: Graph全体を一度に触らず、Image・Mask・effect 分岐を独立して確認する診断方法。
doc_type: concept
verification: partial
aliases: [branch isolation, binary search, 切り分け]
concepts: [branch-isolation, debugging, node-graph]
tasks: [debug, isolate, inspect-output]
prerequisites: [node-graph, data-domain]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# 分岐を分離して原因範囲を狭める

## このページで分かること

複雑なFlowで結果がおかしいときに、問題のある範囲を切り分ける方法を説明します。

## 基本の考え方

Graph全体を同時に調整せず、**独立して確認できる分岐へ分け、最後に正常だった地点と最初に壊れた地点を探す**と考えます。

```text
source
  ↓
stage A   ← good
  ↓
stage B   ← bad
  ↓
stage C

problem scope = A → B
```

Viewerは、Graphの各地点を観察するprobeとして使います。

## 最小例

Masked Mergeなら次の3つを別々に確認します。

```text
Background branch ─┐
                   ├─ Merge → Output
Foreground branch ─┘
                    ↑
Mask branch ─────────
```

1. Background単体。
2. Foreground単体。
3. MaskなしMerge。
4. Mask単体。
5. MaskありMerge。

順番に足すことで、どの分岐で問題が入ったかを絞れます。

## 共通ルール

- 一度に1つだけ条件を増減する。
- upstreamが壊れているならdownstreamを調整しない。
- effect 分岐とMask 分岐を混ぜて診断しない。
- Viewerに出しているNodeを毎回確認する。
- temporary bypass / disconnectをしたら元構造へ戻す。

## 1つずつ変えて確認する

問題NodeをPass Through / bypassできる場合、1 Nodeだけ無効化して結果を比較します。

改善した場合でも「そのNode自体が壊れている」と即断せず、input dataやパラメータも確認します。

## 他のNodeにも応用する

### Long 合成 chains

Mergeを1段ずつ確認します。

### Mask-heavy graphs

Mask 分岐をImage 分岐から独立させます。

### Reusable groups

Groupの外→内→外という境界で同じ方法を使います。

## 初見のNodeを読む

複雑なGraphでも、次に見るべき地点を決められます。

- last known good
- first known bad
- 分岐の境界
- データ領域を変換する境界

## よくある誤解

**症状に関係ありそうなパラメータを片端から触ること。**

値を変える前に、問題の存在するGraph範囲を小さくした方が、修正理由を説明できます。

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連Node

- [Merge](../../nodes/compositing/merge)

## 次に読む

→ [AlphaとMaskを分けて診断する](./alpha-vs-mask)

---

検証メモ: Viewerで各Nodeの中間結果を確認する基本操作はBlackmagic Design現行Fusionページで確認済み。診断手順自体はこのManualの再利用可能なmethodです。
