---
title: Depth Blur (Deep Pixel)
description: Z channelまたは任意channelをpixelごとのblur量として使い、Focal Point / Depth of Fieldで2D depth-of-fieldを作るNode。
doc_type: node
term_id: depth-blur-deep-pixel
verification: partial
aliases: [Depth Blur, DBl, Depth Blur (Deep Pixel)]
concepts: [auxiliary-channels, image-data, depth]
nodes: [Depth Blur]
node_family: deep
controls: [Filter, Blur Channel, Lock X/Y, Blur Size, Focal Point, Depth of Field, Z Scale]
inputs: [image, image, mask]
outputs: [image]
tasks: [aov, depth-of-field, blur]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Depth Blur (Deep Pixel)

Depth Blurは、2D <Term id="image">Image</Term>に含まれるZ channelを使い、cameraからの距離ごとにblur量を変えるNodeです。

<Term id="deep-image">Deep Image</Term>をblurするNodeではなく、<Term id="auxiliary-channels">Auxiliary Channel</Term>付き2D Imageのpost-processです。

## 入力

### Input

必須の2D Imageです。Depth of Field用途ではZ channelを含む必要があります。

### Blur Image

任意の別Imageです。

このImageのchannelをblur mapとして使うと、Z以外のper-pixel blurも作れます。

### Effect Mask

最終的にDepth Blurを適用する範囲を限定します。

## Filter

ManualではBox / Soften / Super Softenを選べます。

qualityと計算量が異なるため、まず見た目とspeedの両方を比較します。

## Blur Channel

どのchannelをpixelごとのblur量に使うか選びます。

Blur Imageが接続されている場合、そのImage側channelがcontrol sourceになります。

## Blur Size

X / Y方向のblur strengthです。

Lock X/Yを外すとaxis別に設定できます。

## Focal Point

Blur Channel = Zのとき、focusが合うdepth位置を指定します。

Viewer sampleで対象位置のZを基準にする使い方ができます。

## Depth of Field

Focal Pointを中心に、どのdepth rangeをsharpに保つかを決めます。

range外へ離れるほどblurが増えます。

## Z Scale

Z値のrangeをscaleし、depth effectの強さを誇張 / 圧縮します。

source Zの数値scaleがshotに合わない場合に使います。

## 最小構成

```text
Renderer 3D (RGBA + Z) → Depth Blur → Output
```

Zが別Imageにある場合はChannel Booleans等でmain ImageのZへ組み込んでからDepth Blurへ渡す構成がManualで示されています。

## Defocusとの違い

- **Defocus** — Image全体をlens-likeにぼかす2D filter
- **Depth Blur** — Z / mapに応じてpixelごとにblur量を変える

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2259–2261で、3 inputs、Filter、Blur Channel、Focal Point、Depth of Field、Z Scaleを確認しました。
