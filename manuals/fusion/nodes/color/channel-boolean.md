---
title: Channel Booleans
description: Background / Foreground / MatteのchannelをCopy・Add・Multiply等で組み替え、RGBAやauxiliary channelを作り直す2D Channel Node。
doc_type: node
term_id: channel-boolean
term_short: 複数ImageのRGBAや補助channelを数式・論理演算で組み替えるNode。
verification: partial
aliases: [Channel Booleans, Bol]
concepts: [image-data, auxiliary-channels, alpha]
nodes: [Channel Booleans]
node_family: color
controls: [Operation, To Red, To Green, To Blue, To Alpha, Enable Extra Channels]
inputs: [image, image, mask, mask]
outputs: [image]
tasks: [channel-remap, alpha, auxiliary-channels]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Channel Booleans

Channel Booleansは、2つの2D Imageと任意Matteを使い、RGBAや<Term id="auxiliary-channels">補助Channel</Term>を別channelへCopyしたり、Add / Multiply / Difference等の演算で組み替えるNodeです。

「画像を重ねる」Mergeとは違い、**channelそのものを配線し直す**用途です。

## 入力

- **Background** — 出力の土台になる必須Image
- **Foreground** — 別channelのsourceに使う任意Image
- **Matte** — channel演算へ使う外部matte
- **Effect Mask** — Nodeの結果を適用する画面範囲

Foreground未接続でFG channelを選ぶと、Background側channelが代わりに使われます。

## Operation

Copy、Add、Subtract、And、Or、Exclusive Or、Multiply、Divide、Maximum、Minimum、Negative、Solid、Clear、Difference、Signed Add等から演算を選びます。

たとえば「ForegroundのAlphaをBackgroundのAlphaへ入れ替える」なら、To AlphaへAlpha FGを選び、OperationをCopyにします。

## To Red / Green / Blue / Alpha

各出力channelへ、Background / ForegroundのRGBA、Z、Luminance、Hue等のどのchannelを送るか選びます。

これにより、RedをAlphaへ移す、ZをRGBへ見える形でコピーする、といったchannel remapができます。

## Auxiliary Channel

Enable Extra Channelsを有効にすると、RGBA以外の補助channelも出力へ保持・コピーできます。

Z、Normal、Vector等を途中で失わずに扱う場合はAux tabも確認します。

## 3D版との違い

[Channel Boolean Material](../materials-lights/channel-boolean-material)は3D Material用です。2D ImageのRGBA / Auxを組み替える場合はこのChannel Booleansを使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2154–2156で、4入力、Operation、To RGBA、Aux Channelを確認しました。全Operationの数式的edge caseは実機未確認です。
