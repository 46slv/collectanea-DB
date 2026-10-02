---
title: Nodeを読む
description: 初見Nodeを、名前ではなくdomain・input/output・controls・Graph責任から読む方法。
doc_type: start
verification: partial
aliases: [read a node, node anatomy]
tasks: [learn, inspect-node, lookup-node]
level: foundation
product_scope: fusion
---

# Nodeを読む

## What you will be able to do

初めて見るNodeでも、名前だけに頼らず

1. 何を受け取るか
2. 何を返すか
3. Graphの何を担当するか
4. どのcontrolがその責任を変えるか

を順番に読めるようになります。

## Do this

Nodeを見たら、次の順番で確認します。

### 1. Data domain

まずOutput / Inputが何のdataか確認します。

- 2D Image
- Mask
- Shape
- Particle set
- Classic 3D scene
- USD scene
- Deep image
- scalar / Point / text parameter

→ [接続できるdata / 接続できないdata](../learn/02-data/connection-compatibility)

### 2. Inputs / Outputs

「何本あるか」だけでなく、各InputのroleとOutput domainを読みます。

MergeならBackground / Foreground / Effect Maskのように役割が分かれます。

→ [Input / Output / Connection](../learn/01-flow/inputs-outputs-connections)

### 3. Viewerで前後を見る

Nodeの前後をViewerへ出し、何が変わったか確認します。

→ [中間結果をViewerで見る](../learn/01-flow/intermediate-results-viewer)

### 4. Controls

Inspectorを上から暗記せず、意味でgroup化します。

- position
- transform origin
- amount
- operation
- mask / alpha
- time / animation
- format / resolution

### 5. Graph responsibility

そのNodeが

- sourceを作る
- Imageを変える
- 複数dataをまとめる
- domainを変換する
- valueを供給する

のどれに近いかを1文で説明します。

## What to notice

同じ名前に近いNodeでもdomainが違う場合があります。

```text
Merge
Merge 3D
uMerge
dMerge
```

これらを「Mergeの種類」とだけまとめず、data domainから区別します。

また、exact parameter名・default・rangeはversion依存です。Referenceで確認できないものを推測で埋めません。

## Where to go next

Nodeの一覧:

→ [Node Reference](../nodes/)

data domain:

→ [Connection / Data Types](../index/connection-data-types)

Graph evaluation:

→ [Graphが評価される依存関係](../learn/01-flow/evaluation-dependency)

---

Verification note: このページはNode-specific仕様ではなく、Manual全体で使うlookup / diagnosis methodです。
