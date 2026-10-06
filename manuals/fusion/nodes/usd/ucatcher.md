---
title: uCatcher
description: uProjector / uCameraのTexture-mode projectionを受け、Alphaを含むtextureとしてUSD geometryへ適用するCatcher Node。
doc_type: node
term_id: ucatcher
verification: partial
aliases: [uCatcher]
concepts: [usd-scene, projection, alpha]
nodes: [uCatcher]
node_family: usd
controls: [Color Mode, Alpha Mode, Threshold, Restrict by Projector ID]
inputs: [usd]
outputs: [usd]
tasks: [usd, projection, texture-projection]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uCatcher

uCatcherは、uProjectorまたはuCameraの**Texture mode projection**を受け、その投影結果をtextureとしてUSD geometryへ適用するNodeです。

Light mode projectionと違い、投影ImageのAlphaを使って透明部分を保てます。

## 入力

黄色のScene Inputへ投影を受けるUSD geometryを接続します。

uCatcher単体でImageを投影するわけではなく、scene内にTexture modeのuProjector / uCameraが必要です。

## Light modeとの違い

Light projectionではImageのRGBがlightingとしてsurfaceへ加算され、Alphaでgeometryをclipできません。

Texture mode + uCatcherではprojectionをtexture mapとして受けるため、Alphaを利用できます。またlightingを有効にしなくても使えます。

## 主な設定

- Color Mode — 複数projectorのcolorをどう蓄積するか
- Alpha Mode — 複数projectorのAlphaをどう組み合わせるか
- Threshold — accumulationから除外する低値threshold
- Restrict by Projector ID — 特定Projector IDだけを受ける

## 最小構成

```text
Image → uProjector (Texture)
             ↓
uShape → uCatcher → uMerge → uRenderer
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2892–2894で、Texture-mode projection、Alpha、Scene Input、Color / Alpha Mode、Threshold、Projector IDを確認しました。
