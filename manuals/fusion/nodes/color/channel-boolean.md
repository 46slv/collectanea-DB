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

## At a Glance

- **Family**: Color / Channel
- **Input domain**: 2D Image
- **Output domain**: 2D Image
- **Core concepts**: channels、alpha、channel routing
- **Common tasks**: channel copy / combine / matte construction

## Inputs

1つ以上のImageを使ってchannel関係を組み替える系統ですが、exact 21.1 input layoutは未検証です。

## Output

指定したchannel operationを反映した2D Imageを出力します。

## Controls

RGBA / Aux channelのsource selection、operator等を持つ系統ですが、exact 21.1 labels / available operators / defaultsはcurrent manual / hostで確認します。

## Behavior / Notes

Channel Booleanは「見た目を明るくするColor Node」ではなく、**どのchannelからどのchannelへ何を入れるか**を扱うutilityとして読む方が適切です。

Alphaを触る場合もEffect Maskとは責任が異なります。

## Minimal Examples

source Imageの特定channelを別channelへ移す／組み合わせる用途を想定します。

## Related Concepts

- [Alpha](../../learn/04-compositing/alpha)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## Related Patterns

Channel / Matte Patternは今後追加します。

## Similar / Adjacent Nodes

- Matte Control
- Color Matrix
- Copy Aux

## Version / Verification Notes

Channel BooleanのidentityとRGBA/Aux channelを演算・組み替える役割はlegacy-primary Fusion referenceで確認。21.1 exact controlsは未検証です。
