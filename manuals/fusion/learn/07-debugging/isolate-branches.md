---
title: Branchを分離して原因範囲を狭める
description: Graph全体を一度に触らず、Image・Mask・effect branchを独立して確認する診断方法。
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

# Branchを分離して原因範囲を狭める

## Question

複雑なFlowで結果がおかしいとき、どこから直せばよいでしょうか。

## Mental Model

Graph全体を同時に調整せず、**独立して確認できるbranchへ分け、最後に正常だった地点と最初に壊れた地点を探す**と考えます。

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

## Minimum Example

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

順番に足すことで、どのbranchで問題が入ったかを絞れます。

## Invariants

- 一度に1つだけ条件を増減する。
- upstreamが壊れているならdownstreamを調整しない。
- effect branchとMask branchを混ぜて診断しない。
- Viewerに出しているNodeを毎回確認する。
- temporary bypass / disconnectをしたら元構造へ戻す。

## Change One Thing

問題NodeをPass Through / bypassできる場合、1 Nodeだけ無効化して結果を比較します。

改善した場合でも「そのNode自体が壊れている」と即断せず、input dataやparameterも確認します。

## Transfer

### Long compositing chains

Mergeを1段ずつ確認します。

### Mask-heavy graphs

Mask branchをImage branchから独立させます。

### Reusable groups

Groupの外→内→外という境界で同じ方法を使います。

## Predict

複雑なGraphでも、次に見るべき地点を決められます。

- last known good
- first known bad
- branch boundary
- data-domain conversion boundary

## Common Misread

**症状に関係ありそうなparameterを片端から触ること。**

値を変える前に、問題の存在するGraph範囲を小さくした方が、修正理由を説明できます。

## Related Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Node Reference

- [Merge](../../nodes/compositing/merge)

## Next

→ [AlphaとMaskを分けて診断する](./alpha-vs-mask)

---

Verification note: Viewerで各Nodeの中間結果を確認する基本操作はBlackmagic Design現行Fusionページで確認済み。診断手順自体はこのManualの再利用可能なmethodです。
