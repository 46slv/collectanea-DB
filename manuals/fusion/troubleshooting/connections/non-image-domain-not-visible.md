---
title: Shape / Particle / 3D / USD / DeepがImageとして見えない
description: 特殊domainを通常2D Imageと誤認している場合に、必要なrenderer / converter境界を診断する。
doc_type: diagnostic
verification: partial
aliases: [Shapeが見えない, Particleが見えない, 3Dが見えない, Deepが見えない]
concepts: [data-domain, conversion]
patterns: [defer-domain-conversion]
tasks: [debug, connect-nodes, convert-domain]
symptoms: [non-image-not-visible, wrong-data-domain]
prerequisites: [data-domain]
level: intermediate
product_scope: fusion
---

# Shape / Particle / 3D / USD / DeepがImageとして見えない

## まず確認すること（Fast Checks）

1. 現在のOutputは2D Imageか、それとも特殊domainか。
2. Viewer / downstream Nodeがそのdomainを直接扱えるか。
3. domain固有のrenderer / converterを通しているか。
4. 似た名前の別domain Nodeを選んでいないか。

## 原因を切り分ける（Isolate）

現在の分岐を、domain 参照元から2D conversion boundaryまでに縮めます。

```text
specialized source
      ↓
domain-specific processing
      ↓
conversion node
      ↓
2D Image
```

代表的なboundary:

- Shape → sRender
- Particle set → pRender
- Classic 3D → Renderer 3D
- USD scene → uRenderer
- Deep image → Deep to Image

## 主な原因（Likely Causes）

### 特殊domainを2D Imageだと思っている

Shape / Particle / scene / Deepは通常のImage Nodeと同じdataではありません。

### Renderer / converterがない

domainを通常2D Flowへ戻す境界が不足しています。

### 別pipelineを混ぜている

Classic 3DとUSD、通常MergeとdMerge等を混同している可能性があります。

### Conversion前のdomainが壊れている

rendererを追加する前に、upstream specialized domainが成立しているか確認します。

## 修正方法（Fix）

1. 現在の Output domainを特定する。
2. domain内で必要な処理を完了する。
3. 適切なrenderer / converterを追加する。
4. conversion outputをViewerで確認する。
5. その後2D 処理へ進む。

## なぜ起きるか（Why）

FusionではNode名ではなくtyped dataがconnectionの意味を決めます。

→ [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## バージョン・例外（Version / Exception Notes）

正確な Input/Output portは現在の Fusion 21.1 manual / runtime evidenceを優先します。

## 関連する症状（Related Symptoms）

- [Node同士を接続できない](./nodes-do-not-connect)
- Viewerへ出しても期待したImageにならない
- Mergeへ繋げない
