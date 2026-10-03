---
title: Delta Keyer
description: green/blue screen等のキーイングでforeground matteを作る主要キーイング Node。
doc_type: node
term_id: delta-keyer
verification: unverified
aliases: [Delta Keyer]
concepts: [alpha, matte, keying]
nodes: [Delta Keyer]
node_family: matte-keying
inputs: [image]
outputs: [image]
tasks: [key, matte, green-screen, composite]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Delta Keyer

Fusionの主要なhigh-quality キーイング Toolとして使われるNodeです。

## 概要

- **分類（Family）**: Matte / キーイング
- **主入力（Primary input）**: 2D Image
- **主な結果（Primary result）**: 前景（Foreground）/ Alphaを含む2D Image
- **関連概念（Core concepts）**: matte、alpha、前景抽出（foreground extraction）
- **よく使う作業（Common tasks）**: green screen / blue screen キーイング、matte作成

## 入力

### Image

キーイング対象の2D Imageを受け取る系統として旧版のBlackmagic Design公式Fusion資料で確認されています。

Clean Plate等の補助入力、正確なPort構成は21.1 現在の資料または実機での確認待ちです。

## 出力

キーイング結果を含む2D Imageを返す用途です。正確な出力・補助出力は現在の 21.1で確認します。

## 主な設定項目

background color selection、matte refinement、fringe / spill 扱い等に関わるcontrolを持つ系統ですが、正確な tab / label / 初期値はここでは固定しません。

## 挙動と注意点

Keyerは「Mask Node」そのものではありません。

元画像（Source Image）から前景（Foreground）/ Matte情報を作り、後段合成で使う処理として読みます。

## 最小例

```text
Green-screen Image
  → Delta Keyer
  → Merge as Foreground
```

## 関連する考え方

- [Alpha](../../learn/04-compositing/alpha)
- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## 似たNode・関連Node

- Chroma Keyer
- Ultra Keyer
- Luma Keyer
- Matte Control

## バージョンと検証状況

Delta Keyerの存在と主要high-quality キーイング Toolという役割は旧版のBlackmagic Design公式Fusion資料で確認。Fusion 21.1での正確な設定項目 / portsは未検証です。
