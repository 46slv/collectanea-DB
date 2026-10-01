---
sidebar_position: 2
title: Concepts
---

# Fusionの基本概念

操作手順とは分けて、Flowを読むための前提を整理します。

## Image / Mask / Data

Fusionの接続はすべて同じ種類ではありません。画像、Mask、数値や座標などのDataを区別すると、接続できない理由やExpressionの役割を理解しやすくなります。

### Image

RGBAを持つ画像ストリームです。多くの2Dノードは画像を入力し、処理後の画像を出力します。

### Mask

処理範囲を0〜1で表すデータです。青い入力へ接続することが多く、画像そのものとは役割が異なります。

### Data

Center、Width、Blendなどの値です。ExpressionやLinkで別ノードから参照できます。

## Alphaと合成

Alphaは単なる透明度だけでなく、RGBとの関係を含みます。MergeやKeyingの結果が想定と違う場合は、premultiplicationと入力順を確認します。

### Foreground / Background

MergeではForegroundをBackgroundへ重ねます。接続を逆にすると、見た目とalpha処理の意味が変わります。

## 座標とCenter

Fusionの2D座標は、一般に0〜1へ正規化されています。Center 0.5 / 0.5が画面中央です。

### Width / Height

Ellipseなどでは、Width / Heightが画面サイズに対する比率として働きます。正円を維持する場合はpixel aspectやframe aspectも確認します。

## Domain of Definition

ノードが実際に画像を持つ範囲です。Frame全体とは一致しない場合があり、Blur、Transform、Mergeの計算範囲や性能へ影響します。

## Time and Frame

Fusionはframe単位で評価されます。Keyframe、Expression、Modifierは現在frameに応じて値を返します。
