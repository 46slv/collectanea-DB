---
title: Text+をImageへ重ねる
description: Text+で文字Imageを作り、MergeのForegroundとして映像へ重ねる最小Recipe。
doc_type: recipe
verification: partial
aliases: [text over image, title overlay]
concepts: [foreground-background, compositing]
patterns: [stack-images-with-merge]
nodes: [Text+, Merge]
tasks: [text, title, composite]
prerequisites: [foreground-background]
level: foundation
product_scope: fusion
---

# Text+をImageへ重ねる

## Result

Text+で生成した文字を、背景Imageの上へ合成します。

## Requirements

- 背景にするImage
- Text+
- Merge

## Steps

1. Text+を作成し、必要な文字列を入力します。
2. 背景ImageをMergeのBackgroundへ接続します。
3. Text+をMergeのForegroundへ接続します。
4. Merge outputをViewerで確認します。
5. 位置調整が必要な場合は、どのNodeへlayout責任を持たせるかを決めてから調整します。

```text
Text+ ──────┐
            ├─ Merge → Output
Image ──────┘
```

## Why This Works

Text+は2D text Imageを生成し、MergeはForeground ImageをBackground Imageへ合成します。

→ [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)

## Variants / Alternatives

- Text+側でlayoutを持つ。
- Transformを追加して配置責任を独立させる。
- 再利用する場合はMacro / Templateへ発展させる。

## Failure Checks

- Text+単体はViewerで見えるか。
- Foreground / Backgroundを逆にしていないか。
- Textのalphaが存在するか。
- layoutを複数Nodeで二重管理していないか。

## Related Pattern

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## Related Nodes

- [Text+](../../nodes/generators/text-plus)
- [Merge](../../nodes/compositing/merge)
