---
title: Node同士を接続できない
description: Node名ではなくOutput/Inputのdata domainから接続可否を切り分ける。
doc_type: diagnostic
verification: partial
aliases: [接続できない, cannot connect nodes]
concepts: [data-domain, typed-connections]
tasks: [debug, connect-nodes]
symptoms: [cannot-connect, incompatible-input]
prerequisites: [data-domain]
level: foundation
product_scope: fusion
---

# Node同士を接続できない

## Fast Checks

1. upstream NodeのOutputは何のdata domainか。
2. downstream Inputは何を受け取るか。
3. 2D Image / Mask / Shape / 3D / Particle / Deepを混同していないか。
4. 同名に近い別domain Nodeを選んでいないか。

## Isolate

接続したい2 Nodeだけを取り出して考えます。

```text
Node A Output: ?
        ↓
Node B Input: ?
```

parameterや見た目を調整する前に、data typeが互換かを確認します。

## Likely Causes

### Data domainが違う

ShapeをImage inputへ、3D sceneを2D filterへ、といったdomain mismatchです。

### 変換境界が必要

Shape render、3D render、Deep to Image等、別domainを2D Imageへ変換する工程が必要な場合があります。

### 似た名前の別Nodeを使っている

Merge / Merge3D / sMerge / dMergeなど、名前が似てもdomainが異なります。

## Fix

1. upstream output domainを確定する。
2. downstream input domainを確定する。
3. compatibleなら接続方法を確認する。
4. incompatibleなら必要なrenderer / converter /別構成を探す。

## Why

FusionのGraphはtyped dataの依存関係です。

→ [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Version / Exception Notes

exact port typesはcurrent 21.1 Node Reference / runtime evidenceを優先します。port colorだけで型を断定しません。

## Related Symptoms

- Viewerに何も表示されない
- Nodeを追加するとoutputが消える
- Shape / 3D / ParticleをImage effectへ渡せない
