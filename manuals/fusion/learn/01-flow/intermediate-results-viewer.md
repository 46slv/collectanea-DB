---
title: 中間結果をViewerで見る
description: 最終OutputだけでなくGraph途中のNodeをViewerへ出し、処理境界を観察する。
doc_type: concept
verification: partial
aliases: [Viewer, intermediate result, node preview]
concepts: [viewer, observation, debugging]
tasks: [inspect-output, debug, read-graph]
prerequisites: [node-graph, typed-connections]
level: foundation
product_scope: fusion
---

# 中間結果をViewerで見る

## Question

最終結果がおかしいとき、どのNodeが原因かをどう確かめればよいでしょうか。

## Mental Model

Viewerは最終Output専用ではなく、**Graphの任意地点を観察するprobe**として使います。

```text
source → A → B → C → output
         ↑    ↑
       Viewer candidates
```

「最後に正常だった地点」と「最初に期待から外れた地点」を作ります。

## Minimum Example

```text
MediaIn → Transform → Blur → MediaOut
```

1. MediaInをViewerへ出す。
2. TransformをViewerへ出す。
3. BlurをViewerへ出す。
4. どこで期待と差が生まれるか確認する。

## Invariants

- どのNodeをViewerで見ているか明示する。
- 1回に1 stageずつ進む。
- upstreamが壊れているならdownstreamを調整しない。
- Viewerに見えないこととdataが存在しないことを分ける。
- specialized domainは通常2D Imageと同じViewer結果を期待しない。

## Change One Thing

問題Nodeの前後だけをViewerへ切り替え、parameterは変えずに差を観察します。

## Transfer

### Merge chain

各Merge stageを順に確認できます。

### Mask branch

Image branchとMask branchを独立して確認できます。

### Group / Macro

外部input → internal stage → outputの順に観察します。

## Predict

最終症状を見ても、次に「どの地点をViewerで観察すべきか」を決められます。

## Common Misread

**Viewerに出したNode = 最終Outputへ使われているNode**と考えること。

Viewerで観察していることと、Graph上でMediaOutへ接続されていることは別です。

## Related Patterns

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## Node Reference

- [MediaIn](../../nodes/utility-io/media-in)
- [MediaOut](../../nodes/utility-io/media-out)

## Next

→ [Graphが評価される依存関係](./evaluation-dependency)
