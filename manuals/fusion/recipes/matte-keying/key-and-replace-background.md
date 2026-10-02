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

## 作るもの（Result）

green / blue screen等の参照元からforegroundを抽出し、新しいBackgroundへ合成する基本構造を作ります。

## 必要なもの（Requirements）

- キーイング対象参照元
- Keyer（このsampleではDelta Keyer）
- 新しいBackground Image
- Merge

## 手順（Steps）

1. 参照元をDelta Keyerへ入れます。
2. Keyer outputを単体でViewerへ表示し、前景（Foreground）/ Matteを確認します。
3. 新しいBackgroundをMergeのBackgroundへ接続します。
4. keyed foregroundをMergeのForegroundへ接続します。
5. Merge outputを確認します。
6. edge問題があれば、まずKeyer output単体で再確認します。

```text
Source → Delta Keyer ─┐
                      ├─ Merge → Output
New Background ───────┘
```

## なぜこの構成で動くか（Why This Works）

Keyerが前景抽出（foreground extraction）を、Mergeがbackgroundとの合成を所有するため、問題を段階ごとに分離できます。

## 別の方法（Variants / Alternatives）

- 別Keyerを使う。
- KeyerとMergeの間にmatte / edge cleanupを入れる。
- トラッキングが必要なら、トラッキング責任を別段階に置く。

## うまくいかないときの確認（Failure Checks）

- Keyer output単体でmatteは成立しているか。
- Foreground / Backgroundは逆でないか。
- エッジの乱れ（artifact）はMerge前から存在するか。
- Alpha / premultiplication問題をMaskだけで直そうとしていないか。

## 関連パターン（Related Pattern）

- [Keyと合成を分ける](../../patterns/matte-keying/key-then-composite)

## 関連ノード（Related Nodes）

- [Delta Keyer](../../nodes/matte-keying/delta-keyer)
- [Merge](../../nodes/compositing/merge)

---

検証メモ（Verification note）: Graph 構造はcanonical conceptsとNode rolesに基づく。Delta Keyerの21.1 正確な キーイング controlsはこのRecipeでは断定しません。
