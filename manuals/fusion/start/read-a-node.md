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

### 2. Inputs

「何本あるか」だけでなく、各Inputのroleを読みます。

Mergeなら:

- Background
- Foreground
- Effect Mask

のように役割が分かれます。

### 3. Output

Imageを返すNodeなのか、特殊domainを返すNodeなのか確認します。

特殊domainなら、どのrenderer / converterで2Dへ戻るかも見ます。

### 4. Controls

Inspectorを上から暗記せず、意味でgroup化します。

例:

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

例:

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

初見NodeをGraph上で読む:

→ [Graphとして考える](../learn/01-flow/graph-as-flow)

---

Verification note: このページはNode-specific仕様ではなく、Manual全体で使うlookup / diagnosis methodです。
