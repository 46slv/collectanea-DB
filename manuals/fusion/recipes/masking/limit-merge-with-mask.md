---
title: Mergeの適用範囲をMaskで限定する
description: MergeのImage構成を保ったまま、Mask 分岐で合成範囲だけを制限するRecipe。
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

## できあがるもの（Result）

Foreground / Backgroundの接続はそのままに、Maskで合成を適用する範囲だけを限定します。

## 必要なもの（Requirements）

- Background Image
- Foreground Image
- Merge
- Mask 参照元

## 手順（Steps）

1. まずMaskなしで2枚のImageがMergeできていることを確認します。
2. Mask 参照元を用意します。
3. MaskをMergeのMask inputへ接続します。
4. MergeのOutputをViewerで確認します。
5. Maskを一時的に外し、Image側とMask側のどちらに問題があるか切り分けられる状態を保ちます。

Blackmagic Designの現行Fusion紹介では、Maskはeffectの対象領域を定義し、青いMask inputへ接続する形で案内されています。

## なぜこの構成にするか（Why This Works）

Image 分岐が「何を合成するか」、Mask 分岐が「どこへ合成するか」を別々に持つためです。

→ [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## 別のやり方（Variants / Alternatives）

- Mask 参照元をアニメーションさせる。
- 複数Maskを組み合わせる。
- 別effect NodeのEffect Maskへ同じ考え方を転用する。

Node固有のcombine / invert等は、正確な 挙動を検証してから個別Referenceへ置きます。

## うまくいかないときの確認（Failure Checks）

- Maskを外すとMerge自体は正しく見えるか。
- Mask 参照元単体は意図した範囲になっているか。
- Image inputとMask inputを取り違えていないか。
- 問題がImage 分岐かMask 分岐かを同時に変更せず切り分けたか。

## 関連する再利用構成（Pattern）

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連Node

- [Merge](../../nodes/compositing/merge)
