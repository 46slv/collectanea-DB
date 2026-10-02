---
title: 接続できるdata / 接続できないdata
description: Image・Mask・Shape・Particle・3D・USD・Deep・パラメータのdomain compatibilityから接続可否を読む。
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

## このページで分かること（Question）

なぜ一部のNode同士は直接接続できず、rendererやconverterが必要なのでしょうか。

## 基本の考え方（Mental Model）

FusionではOutputとInputが受け渡す**データ領域（data domain）**がcompatibleである必要があります。

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
- scalar / Point / text パラメータ

## 最小例（Minimum Example）

Shape:

```text
sEllipse → sRender → Merge
```

sEllipseのShape streamを通常Mergeへ直接Imageとして渡すのではなく、sRenderで2D Imageへ変換します。

## 共通ルール（Invariants）

- Node名だけで接続可否を推測しない。
- port colorだけを型の唯一根拠にしない。
- specialized domainにはdomain-specific 処理がある。
- Renderer / Converterは、データ領域を切り替える明示的な境界です。
- conversion後に失われる情報を意識する。

## 1つだけ変えて確認する（Change One Thing）

接続できない2 Nodeについて、upstream Output domainとdownstream Input domainだけを書き出します。

## 他のNodeへ応用する（Transfer）

### Particle

pEmitter → particle 処理 → pRender → 2D。

### Classic 3D

Merge 3D → Renderer 3D → 2D。

### USD

uMerge → uRenderer → 2D / AOV。

### Deep

dMerge → Deep to Image → 2D。

## 初見Nodeで予測する（Predict）

初見Node同士を接続する前に「converterが必要か」を予測できます。

## よくある誤解（Common Misread）

**名前が似たMergeなら同じdomainを扱う**と考えること。

Merge / Merge 3D / uMerge / dMerge / sMergeは別domainです。

## 関連する再利用構成（Patterns）

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 関連Node

- [Connection / Data Types](../../index/connection-data-types)

## 次に読む

→ [正規化座標（Normalized Coordinates）](../03-space/normalized-coordinates)
