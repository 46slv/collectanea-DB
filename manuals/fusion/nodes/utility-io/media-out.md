---
title: MediaOut
description: Fusion Flowの最終2D ImageをResolve timeline / downstream 作業の流れへ返すResolve-integrated output Node。
doc_type: node
verification: partial
aliases: [MediaOut, Media Out]
concepts: [image-data, resolve-integration, output-boundary]
nodes: [MediaOut]
node_family: utility-io
inputs: [image]
tasks: [output, cross-page-workflow]
level: foundation
product_scope: resolve
suite_surfaces: [fusion, edit]
---

# MediaOut

Fusion Flowの最終ImageをResolve側へ返すoutput Nodeです。

## 概要

- **分類（Family）**: Utility / I/O
- **入力データ（Input domain）**: 2D Image
- **関連概念（Core concepts）**: Resolve integration、output boundary
- **よく使う作業（Common tasks）**: Fusion 結果をtimelineへ返す

## 入力

### Image

Fusion compositionの最終結果としてResolve側へ返す2D Imageを受け取ります。

## 出力

Flow上の通常Image outputを下流Nodeへ渡すためのNodeというより、Resolve hostへ結果を返すboundaryとして扱います。

## 主な設定項目

Resolve側と連携する正確な設定項目は現在の Resolve / Fusion contextで確認します。

## 挙動と注意点

Resolve 20 VFX Guideでは、MediaOutはfinal Fusion 結果をEdit timelineへ送るoutputとして説明されています。

```text
MediaIn
  ↓
Fusion processing
  ↓
MediaOut
  ↓
Resolve Timeline
```

MediaOutを外した状態でViewerにImageが見えていても、それだけでtimelineへ正しく結果が返っているとは限りません。

## 最小例

```text
MediaIn → Transform → MediaOut
```

## 関連する考え方

- [Graphとして考える](../../learn/01-flow/graph-as-flow)

## 関連パターン

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 似たNode・関連Node

- Saver — file/sequence output系
- MediaIn — ResolveからFusionへのinput boundary

## バージョンと検証状況

MediaOutがFusion 結果をResolve timelineへ返すboundaryであることはBlackmagic Design公式Resolve 20 VFX Guideで確認。21.1 host-specific controlsは未固定です。
