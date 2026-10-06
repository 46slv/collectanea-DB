---
title: Data domainを辿って診断する
description: Node名ではなくImage・Mask・Shape・3D・Particle・Deepなどのデータ領域（data domain）を追って接続問題を切り分ける。
doc_type: concept
term_id: trace-data-domain
term_short: Image・Mask・Shape・3D等のdata domainを追って接続問題を診断する方法。
verification: partial
aliases: [data domain, typed data, 接続できない]
concepts: [data-domain, typed-connections, debugging]
tasks: [debug, connect-nodes, inspect-flow]
prerequisites: [image-data, node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---
# データ領域（data domain）を辿って診断する

## このページで分かること

Node名だけでは判断できない接続可否や結果の違いを、data domainを追って診断する方法を説明します。

## 基本の考え方

FusionのFlowには、同じ「Node」に見えても異なるデータ領域（data domain）が共存します。

代表例:

- 2D <Term id="image">Image</Term>
- <Term id="mask">Mask</Term>
- Shape
- Particle set
- Classic 3D scene
- USD scene
- Deep image
- scalar / vector / text control data

まずNode名ではなく、**何が出て、何を受け取るか**を読みます。

```text
Output domain
    ↓
compatible Input domain ?
    ↓
yes → behaviorへ進む
no  → converter / renderer /別構成を探す
```

## 最小例

Shape系Nodeの出力を普通の2D Imageと同じだと仮定せず、最終的にどのNodeでImageへ変換されるかを確認します。

同様にParticle setや3D sceneも、Image filterへ直接入れる前にdomainを確認します。

## 共通ルール

- 同じ名前のconceptでもデータ領域（data domain）が違えば別Node familyとして扱う。
- port colorだけで型を断定しない。
- 「Fusionで使える」と「2D Image Node」は同義ではない。
- renderer / converterが必要なdomainでは、その変換境界をGraph上で明示する。
- 接続問題をパラメータ調整で直そうとしない。

## 1つずつ変えて確認する

問題の接続1本だけを外し、upstream Outputとdownstream Inputのdomainを別々に確認します。

見た目やNode名を一旦無視し、data typeの関係だけを見ます。

## 他のNodeにも応用する

### Shape

Shape streamと2D Imageを分離して読みます。

### 3D

Classic 3D sceneと2D Imageの境界をRendererで意識します。

### Control data

Expression / Modifierが供給するscalarやPointはImageとは別のdataとして読みます。

## 初見のNodeを読む

初見Nodeでも、接続前に次を予測できます。

1. Outputは何のdomainか。
2. 次のInputは何を期待するか。
3. 変換Nodeが必要か。
4. 問題は接続型か、パラメータ値か。

## よくある誤解

**Node名が似ていれば接続可能だと思うこと。**

Merge、Merge3D、sMerge、dMergeのように、名前が似てもdomainが違うNodeがあります。

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連Node

Node Referenceでは今後、各Nodeのデータ領域（data domain） / input / outputを明示します。

## 次に読む

→ [分岐を分離して原因範囲を狭める](./isolate-branches)

---
検証メモ: Fusion 21系の公式資料を元に整理したデータ領域（data domain）分類を基準としています。Fusion 21.1での正確なRegistry / Port Typeは現在の ホスト上での確認を優先します。
