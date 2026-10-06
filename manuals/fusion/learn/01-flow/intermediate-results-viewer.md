---
title: 中間結果をViewerで見る
description: 最終OutputだけでなくGraph途中のNodeをViewerへ出し、処理境界を観察する。
doc_type: concept
term_id: intermediate-results-viewer
term_short: Graph途中の結果をViewerへ出して処理境界を確認する方法。
verification: partial
aliases: [Viewer, intermediate result, node preview]
concepts: [viewer, observation, debugging]
tasks: [inspect-output, debug, read-graph]
prerequisites: [node-graph, typed-connections]
level: foundation
product_scope: fusion
---
# 中間結果をViewerで見る

## このページで分かること

最終結果がおかしいときに、どのNodeで結果が変わったかを確かめる方法を説明します。

## 基本の考え方

Viewerは最終Output専用ではなく、**Graphの任意地点を観察するprobe**として使います。

```text
source → A → B → C → output
         ↑    ↑
       Viewer candidates
```

「最後に正常だった地点」と「最初に期待から外れた地点」を作ります。

## 最小例

```text
MediaIn → Transform → Blur → MediaOut
```

1. <Term id="media-in">MediaIn</Term>をViewerへ出す。
2. <Term id="transform">Transform</Term>をViewerへ出す。
3. BlurをViewerへ出す。
4. どこで期待と差が生まれるか確認する。

## 共通ルール

- どのNodeをViewerで見ているか明示する。
- 1回に1 段階ずつ進む。
- upstreamが壊れているならdownstreamを調整しない。
- Viewerに見えないこととdataが存在しないことを分ける。
- specialized domainは通常2D Imageと同じViewer結果を期待しない。

## 1つずつ変えて確認する

問題Nodeの前後だけをViewerへ切り替え、パラメータは変えずに差を観察します。

## 他のNodeにも応用する

### Merge chain

各Merge 段階を順に確認できます。

### Mask 分岐

Image 分岐とMask 分岐を独立して確認できます。

### Group / Macro

外部input → internal 段階 → outputの順に観察します。

## 初見のNodeを読む

最終症状を見ても、次に「どの地点をViewerで観察すべきか」を決められます。

## よくある誤解

**Viewerに出したNode = 最終Outputへ使われているNode**と考えること。

Viewerで観察していることと、Graph上でMediaOutへ接続されていることは別です。

## 関連パターン

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 関連Node

- [MediaIn](../../nodes/utility-io/media-in)
- [MediaOut](../../nodes/utility-io/media-out)

## 次に読む

→ [Graphが評価される依存関係](./evaluation-dependency)
