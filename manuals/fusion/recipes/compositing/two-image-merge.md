---
title: 2つのImageを重ねる
description: Mergeを使ってForeground ImageをBackground Imageへ重ねる最小Recipe。
doc_type: recipe
verification: partial
aliases: [two image composite, 画像を重ねる]
concepts: [foreground-background, compositing]
patterns: [stack-images-with-merge]
nodes: [Merge]
tasks: [composite, layer]
prerequisites: [foreground-background]
level: foundation
product_scope: fusion
---

# 2つのImageを重ねる

## Result

2つのImageを1つのMergeへ接続し、ForegroundをBackgroundへ重ねたOutputを作ります。

## Requirements

- BackgroundにするImage
- ForegroundにするImage
- Merge Node

## Steps

1. BackgroundにしたいImageをMergeのBackground inputへ接続します。
2. ForegroundにしたいImageをMergeのForeground inputへ接続します。
3. MergeのOutputをViewerで確認します。
4. 想定と違う場合は、まずForeground / Backgroundの接続が逆になっていないか確認します。

Blackmagic Designの現行Fusion紹介では、Mergeの黄色inputがBackground、緑inputがForegroundとして案内されています。

## Why This Works

Mergeは2つのImageに異なる役割を与えて合成します。

役割の一般則は [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask) を参照してください。

## Variants / Alternatives

- 3枚以上を重ねる場合は、1段ずつMergeを追加します。
- 特定範囲だけ合成する場合はMask branchを追加します。
- Apply Mode等の演算合成は、21.1でcontrol-level検証後に別Recipe / Referenceへ分離します。

## Failure Checks

- Background / Foregroundが逆ではないか。
- MergeのOutputを見ているか。
- upstreamの各Imageは単体でViewerへ出るか。
- Maskが意図せず接続されていないか。

## Related Pattern

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## Related Nodes

- [Merge](../../nodes/compositing/merge)
