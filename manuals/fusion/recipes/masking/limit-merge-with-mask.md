---
title: Mergeの適用範囲をMaskで限定する
description: MergeのImage構成を保ったまま、Mask branchで合成範囲だけを制限するRecipe。
doc_type: recipe
verification: partial
aliases: [masked merge, Effect Mask]
concepts: [mask-data, effect-mask, foreground-background]
patterns: [limit-effect-with-mask]
nodes: [Merge]
tasks: [mask, composite]
prerequisites: [foreground-background, mask-data]
level: foundation
product_scope: fusion
---

# Mergeの適用範囲をMaskで限定する

## Result

Foreground / Backgroundの接続はそのままに、Maskで合成を適用する範囲だけを限定します。

## Requirements

- Background Image
- Foreground Image
- Merge
- Mask source

## Steps

1. まずMaskなしで2枚のImageがMergeできていることを確認します。
2. Mask sourceを用意します。
3. MaskをMergeのMask inputへ接続します。
4. MergeのOutputをViewerで確認します。
5. Maskを一時的に外し、Image側とMask側のどちらに問題があるか切り分けられる状態を保ちます。

Blackmagic Designの現行Fusion紹介では、Maskはeffectの対象領域を定義し、青いMask inputへ接続する形で案内されています。

## Why This Works

Image branchが「何を合成するか」、Mask branchが「どこへ合成するか」を別々に持つためです。

→ [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## Variants / Alternatives

- Mask sourceをanimationさせる。
- 複数Maskを組み合わせる。
- 別effect NodeのEffect Maskへ同じ考え方を転用する。

Node固有のcombine / invert等は、exact behaviorを検証してから個別Referenceへ置きます。

## Failure Checks

- Maskを外すとMerge自体は正しく見えるか。
- Mask source単体は意図した範囲になっているか。
- Image inputとMask inputを取り違えていないか。
- 問題がImage branchかMask branchかを同時に変更せず切り分けたか。

## Related Pattern

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Related Nodes

- [Merge](../../nodes/compositing/merge)
