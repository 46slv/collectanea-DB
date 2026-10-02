---
title: Data domainを辿って診断する
description: Node名ではなくImage・Mask・Shape・3D・Particle・Deepなどのdata domainを追って接続問題を切り分ける。
doc_type: concept
verification: partial
aliases: [data domain, typed data, 接続できない]
concepts: [data-domain, typed-connections, debugging]
tasks: [debug, connect-nodes, inspect-flow]
prerequisites: [image-data, node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Data domainを辿って診断する

## Question

Node名だけを見ると接続できそうなのに、なぜ繋がらない／期待した結果にならないのでしょうか。

## Mental Model

FusionのFlowには、同じ「Node」に見えても異なるdata domainが共存します。

代表例:

- 2D Image
- Mask
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

## Minimum Example

Shape系Nodeの出力を普通の2D Imageと同じだと仮定せず、最終的にどのNodeでImageへ変換されるかを確認します。

同様にParticle setや3D sceneも、Image filterへ直接入れる前にdomainを確認します。

## Invariants

- 同じ名前のconceptでもdata domainが違えば別Node familyとして扱う。
- port colorだけで型を断定しない。
- 「Fusionで使える」と「2D Image Node」は同義ではない。
- renderer / converterが必要なdomainでは、その変換境界をGraph上で明示する。
- 接続問題をparameter調整で直そうとしない。

## Change One Thing

問題の接続1本だけを外し、upstream Outputとdownstream Inputのdomainを別々に確認します。

見た目やNode名を一旦無視し、data typeの関係だけを見ます。

## Transfer

### Shape

Shape streamと2D Imageを分離して読みます。

### 3D

Classic 3D sceneと2D Imageの境界をRendererで意識します。

### Control data

Expression / Modifierが供給するscalarやPointはImageとは別のdataとして読みます。

## Predict

初見Nodeでも、接続前に次を予測できます。

1. Outputは何のdomainか。
2. 次のInputは何を期待するか。
3. 変換Nodeが必要か。
4. 問題は接続型か、parameter値か。

## Common Misread

**Node名が似ていれば接続可能だと思うこと。**

Merge、Merge3D、sMerge、dMergeのように、名前が似てもdomainが違うNodeがあります。

## Related Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Node Reference

Node Referenceでは今後、各Nodeのdata domain / input / outputを明示します。

## Next

→ [Branchを分離して原因範囲を狭める](./isolate-branches)

---

Verification note: Fusion 21系の公式資料を元に整理したdata domain分類を基準としています。21.1 exact registry / port typeはcurrent host verificationを優先します。
