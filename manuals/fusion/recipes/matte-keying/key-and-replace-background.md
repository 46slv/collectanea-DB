---
title: KeyしてBackgroundを置き換える
description: Keyerでforegroundを抽出し、Mergeで新しいBackgroundへ合成する最小構造。
doc_type: recipe
verification: partial
aliases: [green screen composite, background replacement]
concepts: [alpha, matte, foreground-background]
patterns: [key-then-composite]
nodes: [Delta Keyer, Merge]
tasks: [key, replace-background, composite]
prerequisites: [alpha, foreground-background]
level: intermediate
product_scope: fusion
---

# KeyしてBackgroundを置き換える

## Result

green / blue screen等のsourceからforegroundを抽出し、新しいBackgroundへ合成する基本構造を作ります。

## Requirements

- keying対象source
- Keyer（このsampleではDelta Keyer）
- 新しいBackground Image
- Merge

## Steps

1. sourceをDelta Keyerへ入れます。
2. Keyer outputを単体でViewerへ表示し、foreground / matteを確認します。
3. 新しいBackgroundをMergeのBackgroundへ接続します。
4. keyed foregroundをMergeのForegroundへ接続します。
5. Merge outputを確認します。
6. edge問題があれば、まずKeyer output単体で再確認します。

```text
Source → Delta Keyer ─┐
                      ├─ Merge → Output
New Background ───────┘
```

## Why This Works

Keyerがforeground extractionを、Mergeがbackgroundとのcompositingを所有するため、問題をstageごとに分離できます。

## Variants / Alternatives

-別Keyerを使う。
- KeyerとMergeの間にmatte / edge cleanupを入れる。
- trackingが必要なら、tracking責任を別stageに置く。

## Failure Checks

- Keyer output単体でmatteは成立しているか。
- Foreground / Backgroundは逆でないか。
- edge artifactはMerge前から存在するか。
- Alpha / premultiplication問題をMaskだけで直そうとしていないか。

## Related Pattern

- [KeyとCompositeを分ける](../../patterns/matte-keying/key-then-composite)

## Related Nodes

- [Delta Keyer](../../nodes/matte-keying/delta-keyer)
- [Merge](../../nodes/compositing/merge)

---

Verification note: Graph structureはcanonical conceptsとNode rolesに基づく。Delta Keyerの21.1 exact keying controlsはこのRecipeでは断定しません。
