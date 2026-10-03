---
title: Resize
description: 2D Imageの出力resolutionを変更するTransform系Node。
doc_type: node
term_id: resize
verification: unverified
aliases: [Resize, RSZ]
concepts: [resolution, image-extent, domain-of-definition]
nodes: [Resize]
node_family: transform
inputs: [image]
outputs: [image]
tasks: [resize, resolution, format]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Resize

2D Imageの出力解像度（Output Resolution）を変更するNodeです。

## 概要

- **分類（Family）**: Transform / Format
- **主入力（Primary input）**: 2D Image
- **出力（Output）**: 2D Image
- **関連概念（Core concepts）**: resolution、image extent、sampling
- **よく使う作業（Common tasks）**: output size変更、resolution変換

## 入力

### Image

resolutionを変更する2D Imageを受け取ります。

## 出力

指定したresolutionへ変換された2D Imageを出力します。

## 主な設定項目

Width / Height、format、sampling / scaling 挙動に関わるcontrolがある系統ですが、正確な 21.1 UI・初期値・filter 設定は未検証です。

## 挙動と注意点

ResizeとTransformのSizeは同じ目的ではありません。

- **Transform / Size**: Imageをcanvas内でscaleする考え方。
- **Resize**: output Imageのresolution自体を変える考え方。

見た目が同程度に小さくなっても、後段のresolution contractは異なります。

## 最小例

```text
Image → Resize → Output
```

Resize前後でViewerの見た目だけでなく、Imageのwidth / heightがどう変わるかを確認します。

## 関連する考え方

- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)

## 関連パターン

resolution-aware 配置 Patternは今後追加します。

## 似たNode・関連Node

- Transform
- Scale
- Crop
- Letterbox

## バージョンと検証状況

Resizeの存在と「出力解像度（Output Resolution）を変更する」という役割は旧版のBlackmagic Design公式Fusion資料で確認。21.1 正確な resolution controls / sampling 設定は未検証です。
