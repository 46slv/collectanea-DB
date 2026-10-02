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

## このページでできるようになること

初めて見るNodeでも、名前だけに頼らず

1. 何を受け取るか
2. 何を返すか
3. Graphの何を担当するか
4. どのcontrolがその責任を変えるか

を順番に読めるようになります。

## まずやること

Nodeを見たら、次の順番で確認します。

### 1. データ領域（data domain）

まずOutput / Inputが何のdataか確認します。

- 2D Image
- Mask
- Shape
- Particle set
- Classic 3D scene
- USD scene
- Deep image
- scalar / Point / text パラメータ

→ [接続できるdata / 接続できないdata](../learn/02-data/connection-compatibility)

### 2. Inputs / Outputs

「何本あるか」だけでなく、各Inputの役割とOutput domainを読みます。

Mergeなら背景（Background）/ 前景（Foreground）/ Effect Maskのように役割が分かれます。

→ [Input / Output / Connection](../learn/01-flow/inputs-outputs-connections)

### 3. Viewerで前後を見る

Nodeの前後をViewerへ出し、何が変わったか確認します。

→ [中間結果をViewerで見る](../learn/01-flow/intermediate-results-viewer)

### 4. Controls

Inspectorを上から暗記せず、意味でgroup化します。

- position
- transform origin
- amount
- 演算（Operation）
- mask / alpha
- time / アニメーション
- format / resolution

### 5. Graph 役割

そのNodeが

- 参照元を作る
- Imageを変える
- 複数dataをまとめる
- domainを変換する
- 値を供給する

のどれに近いかを1文で説明します。

## 見るポイント

同じ名前に近いNodeでもdomainが違う場合があります。

```text
Merge
Merge 3D
uMerge
dMerge
```

これらを「Mergeの種類」とだけまとめず、データ領域（data domain）から区別します。

また、正確な パラメータ名・初期値・範囲はversion依存です。Referenceで確認できないものを推測で埋めません。

## 次に読む

Nodeの一覧:

→ [Node Reference](../nodes/)

データ領域（data domain）:

→ [Connection / Data Types](../index/connection-data-types)

Graph 評価:

→ [Graphが評価される依存関係](../learn/01-flow/evaluation-dependency)

---

検証メモ: このページはNode-specific仕様ではなく、Manual全体で使うlookup / diagnosis methodです。
