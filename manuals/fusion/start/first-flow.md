---
title: 最初のFlow
description: Source → Transform → Merge → Outputの最小構造を使ってFusion Flowの読み方を体験する。
doc_type: start
verification: partial
aliases: [first flow, 最初のノード]
tasks: [learn, build-first-flow, inspect-flow]
level: foundation
product_scope: fusion
---

# 最初のFlow

## What you will be able to do

Nodeを追加することより先に、

- どこからImageが来るか
- どこで処理が変わるか
- どこで合成するか
- どのNodeをViewerで見ているか

をFlowとして読めるようになります。

## Do this

最小構造を次のように考えます。

```text
Source A ───────┐
                ├─ Merge → Output
Source B → XF ──┘
```

1. まずSource AをViewerで確認します。
2. Source BをViewerで確認します。
3. Source BをTransformへ通し、Transform outputを確認します。
4. Mergeで2つを合成します。
5. Merge outputを確認します。
6. 各Nodeを順番にViewerへ出し、どこで見た目が変わるか確認します。

Resolve内Fusionでは、timeline clipがMediaInとしてFlowへ入る構成が代表的です。

## What to notice

### Node配置ではなく接続を見る

Nodeが左や右にあることより、OutputがどのInputへ繋がっているかを見ます。

### Mergeにはroleがある

2つのImage inputを「上・下」だけで覚えず、Foreground / Backgroundという役割で読みます。

### 中間結果をViewerで見る

最終Outputだけを見るより、途中NodeをViewerへ出す方が問題箇所を特定しやすくなります。

### 1回に1つだけ変える

Center、Mask、Blend等を同時に変えず、変化と原因の対応を保ちます。

## Where to go next

Flowの一般則:

→ [Graphとして考える](../learn/01-flow/graph-as-flow)

Image / Mask / parameterの違い:

→ [Image / Mask / Dataを分ける](../learn/02-data/image-mask-data)

Mergeを詳しく引く:

→ [Merge](../nodes/compositing/merge)

---

Verification note: Node tree / Viewer / Mergeの基本roleは現行Blackmagic Design Fusion資料とcanonical Fusion pagesに基づきます。
