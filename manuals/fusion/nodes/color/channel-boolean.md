---
title: Channel Boolean
description: RGBAやAux channelを演算・組み替えするchannel utility Node。
doc_type: node
verification: unverified
aliases: [Channel Boolean, BOL]
concepts: [channels, alpha, image-data]
nodes: [Channel Boolean]
node_family: color
inputs: [image]
outputs: [image]
tasks: [channels, alpha, composite, matte]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Channel Boolean

RGBA / Auxiliary channel間を演算・組み替えするNodeです。

## 概要

- **分類（Family）**: Color / Channel
- **入力データ（Input domain）**: 2D Image
- **出力データ（Output domain）**: 2D Image
- **関連概念（Core concepts）**: channels、alpha、channel routing
- **よく使う作業（Common tasks）**: channel copy / combine / matte construction

## 入力

1つ以上のImageを使ってchannel関係を組み替える系統ですが、正確な 21.1 input 配置は未検証です。

## 出力

指定したchannel operationを反映した2D Imageを出力します。

## 主な設定項目

RGBA / Aux channelの参照元 selection、operator等を持つ系統ですが、正確な 21.1 labels / available operators / defaultsは現在の manual / 実機で確認します。

## 挙動と注意点

Channel Booleanは「見た目を明るくするColor Node」ではなく、**どのchannelからどのchannelへ何を入れるか**を扱うutilityとして読む方が適切です。

Alphaを触る場合もEffect Maskとは責任が異なります。

## 最小例

元画像（Source Image）の特定channelを別channelへ移す／組み合わせる用途を想定します。

## 関連する考え方

- [Alpha](../../learn/04-compositing/alpha)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## 関連パターン

Channel / Matte Patternは今後追加します。

## 似たNode・関連Node

- Matte Control
- Color Matrix
- Copy Aux

## バージョンと検証状況

Channel Booleanの存在とRGBA/Aux channelを演算・組み替える役割は旧版のBlackmagic Design公式Fusion資料で確認。Fusion 21.1での正確な設定項目は未検証です。
