---
title: MediaIn
description: Resolve timeline / Media Pool側の参照元をFusion Flowへ渡すResolve-integrated input Node。
doc_type: node
verification: partial
aliases: [MediaIn, Media In]
concepts: [image-data, resolve-integration, source-boundary]
nodes: [MediaIn]
node_family: utility-io
outputs: [image]
tasks: [source, import, cross-page-workflow]
level: foundation
product_scope: resolve
suite_surfaces: [edit, fusion]
---

# MediaIn

Resolve側のmedia / timeline clipをFusion Flowへ渡すinput Nodeです。

## 概要

- **分類（Family）**: Utility / I/O
- **出力データ（Output domain）**: 2D Image / 参照元 media 結果
- **関連概念（Core concepts）**: Resolve integration、参照元 boundary
- **よく使う作業（Common tasks）**: timeline clipをFusionで処理する入口

## 入力

通常はResolve側のclip / media contextから供給されるため、Fusion Flow上で別Imageをprimary inputへ接続する参照元 Nodeとしては扱いません。

Resolve側から生成される正確な設定項目は現在の Resolve / Fusion contextを確認します。

## 出力

Fusion Flowで処理するImage 参照元を出力します。

## 主な設定項目

clip / media / trim / global in-out等に関するhost-linked surfaceがありますが、正確な 21.1 Inspector / control availabilityはcontext依存として扱います。

## 挙動と注意点

Blackmagic Designの現行Fusion 資料では、MediaInはEdit Page timeline上のclipを表す入口として説明されています。

```text
Edit Timeline Clip
      ↓
   MediaIn
      ↓
 Fusion Flow
```

Fusion StudioのLoaderと、Resolve-integrated MediaInを同一Nodeとして扱いません。

## 最小例

```text
MediaIn → Transform → MediaOut
```

## 関連する考え方

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## 関連パターン

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 似たNode・関連Node

- Loader — Fusion Studio / file 参照元系
- MediaOut — Resolveへのoutput boundary

## バージョンと検証状況

MediaInがEdit timeline clipをFusionへ渡すboundaryであることはBlackmagic Design現行Fusion 資料で確認。正確な 21.1 host controlsはproject/context依存として未固定です。
