---
title: 接続できるdata / 接続できないdata
description: Image・Mask・Shape・Particle・3D・USD・Deep・parameterのdomain compatibilityから接続可否を読む。
doc_type: concept
verification: partial
aliases: [connection compatibility, port type, data type]
concepts: [data-domain, typed-connections]
tasks: [connect-nodes, debug, read-graph]
prerequisites: [image-data, mask-data, parameter-data]
level: foundation
product_scope: fusion
---

# 接続できるdata / 接続できないdata

## Question

なぜ一部のNode同士は直接接続できず、rendererやconverterが必要なのでしょうか。

## Mental Model

FusionではOutputとInputが受け渡す**data domain**がcompatibleである必要があります。

```text
Output domain
      ↓
compatible?
   yes / no
      ↓
Input domain
```

代表domain:

- 2D Image
- Mask
- Shape
- Particle set
- Classic 3D scene
- USD scene
- Deep image
- scalar / Point / text parameter

## Minimum Example

Shape:

```text
sEllipse → sRender → Merge
```

sEllipseのShape streamを通常Mergeへ直接Imageとして渡すのではなく、sRenderで2D Imageへ変換します。

## Invariants

- Node名だけで接続可否を推測しない。
- port colorだけを型の唯一根拠にしない。
- specialized domainにはdomain-specific processingがある。
- renderer / converterは明示的なdomain boundary。
- conversion後に失われる情報を意識する。

## Change One Thing

接続できない2 Nodeについて、upstream Output domainとdownstream Input domainだけを書き出します。

## Transfer

### Particle

pEmitter → particle processing → pRender → 2D。

### Classic 3D

Merge 3D → Renderer 3D → 2D。

### USD

uMerge → uRenderer → 2D / AOV。

### Deep

dMerge → Deep to Image → 2D。

## Predict

初見Node同士を接続する前に「converterが必要か」を予測できます。

## Common Misread

**名前が似たMergeなら同じdomainを扱う**と考えること。

Merge / Merge 3D / uMerge / dMerge / sMergeは別domainです。

## Related Patterns

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## Node Reference

- [Connection / Data Types](../../index/connection-data-types)

## Next

→ [Normalized Coordinates](../03-space/normalized-coordinates)
