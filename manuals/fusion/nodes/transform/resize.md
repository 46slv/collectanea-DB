---
title: Resize
description: 2D Imageの出力resolutionを変更するTransform系Node。
doc_type: node
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

2D Imageのoutput resolutionを変更するNodeです。

## At a Glance

- **Family**: Transform / Format
- **Primary input**: 2D Image
- **Output**: 2D Image
- **Core concepts**: resolution、image extent、sampling
- **Common tasks**: output size変更、resolution変換

## Inputs

### Image

resolutionを変更する2D Imageを受け取ります。

## Output

指定したresolutionへ変換された2D Imageを出力します。

## Controls

Width / Height、format、sampling / scaling behaviorに関わるcontrolがある系統ですが、exact 21.1 UI・default・filter optionは未検証です。

## Behavior / Notes

ResizeとTransformのSizeは同じ目的ではありません。

- **Transform / Size**: Imageをcanvas内でscaleする考え方。
- **Resize**: output Imageのresolution自体を変える考え方。

見た目が同程度に小さくなっても、後段のresolution contractは異なります。

## Minimal Examples

```text
Image → Resize → Output
```

Resize前後でViewerの見た目だけでなく、Imageのwidth / heightがどう変わるかを確認します。

## Related Concepts

- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)
- [Normalized Coordinates](../../learn/03-space/normalized-coordinates)

## Related Patterns

resolution-aware layout Patternは今後追加します。

## Similar / Adjacent Nodes

- Transform
- Scale
- Crop
- Letterbox

## Version / Verification Notes

Resizeのidentityと「output resolutionを変更する」という役割はlegacy-primary Fusion referenceで確認。21.1 exact resolution controls / sampling optionは未検証です。
