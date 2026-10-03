---
title: 画像（Image）
description: Fusionの2D Imageを、RGB・Alpha・resolution・domainを持つdataとして理解する。
doc_type: concept
term_id: image
term_short: RGB・Alpha・resolution・domainを持つ2D Image data。
verification: partial
aliases: [Image, 2D Image, RGBA]
concepts: [image-data, rgba, resolution]
tasks: [read-graph, composite, debug]
prerequisites: [typed-connections]
level: foundation
product_scope: fusion
---
# 画像（Image）

## このページで分かること

FusionでいうImageが何を含むデータなのかを整理します。

## 基本の考え方

2D Imageを、少なくとも次を持つdataとして考えます。

- RGB color channels
- <Term id="alpha">Alpha</Term>
- width / height
- image extent / <Term id="domain-of-definition">Domain of Definition</Term>
- time-dependent 結果
- 必要に応じたmetadata / auxiliary channels

Viewerに見える結果は、このImage dataの1つの観察方法です。

## 最小例

```text
Background → Transform → Merge
```

BackgroundはImageを生成し、TransformはImageを受け取ってImageを返し、Mergeは複数Imageを合成します。

## 共通ルール

- ImageとMaskを同じdataとして扱わない。
- Image AlphaとEffect Maskを同一視しない。
- resolutionと見た目のscaleを分ける。
- フレーム全体とDoDを分ける。
- Viewerに見えないこととImage dataが存在しないことを分ける。

## 1つずつ変えて確認する

同じImageをTransform前後でViewerへ出し、データ領域（data domain）はImageのまま、positionだけ変わることを観察します。

## 他のNodeにも応用する

### Generator

Background / Text+はImage 参照元を作ります。

### Effect

Transform / Blur / Color Corrector等はImageを受け取ってImageを返します。

### 合成

Merge / MultiMergeは複数Imageを1 Imageへまとめます。

## 初見のNodeを読む

初見NodeがImageを生成・加工・合成するどれかを、Input / Outputから予測できます。

## よくある誤解

**Viewerに見えるものはすべてImage domain**と考えること。

Maskやspecialized domainも可視化できる場合がありますが、Graph上のtypeは別です。

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## 関連Node

- [Background](../../nodes/generators/background)
- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## 次に読む

→ [マスク（Mask）](./mask)
