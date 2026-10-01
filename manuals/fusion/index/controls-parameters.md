---
title: Controls / Parameters
description: よく見るcontrol名・parameter名から、その役割を説明するConceptとNode Referenceへ進むIndex。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-control, inspect-controls]
---

# Controls / Parameters

exact label・default・rangeはNode/versionごとに異なるため、このIndexは**名前からcanonical ownerへ送る入口**だけを持ちます。

| Control / term | Concept | Current Node Reference |
|---|---|---|
| Angle | [Center / Pivot / Size / Angle](../learn/03-space/center-pivot-size-angle) | [Transform](../nodes/transform/transform) |
| Blend | [Blend / Operator](../learn/04-compositing/blend-operator) | [Merge](../nodes/compositing/merge) |
| Center | [Normalized Coordinates](../learn/03-space/normalized-coordinates) | [Transform](../nodes/transform/transform) |
| Color | [Image / Mask / Data](../learn/02-data/image-mask-data) | [Background](../nodes/generators/background) |
| Contrast | — | [Brightness Contrast](../nodes/color/brightness-contrast) |
| Foreground / Background | [Foreground / Background / Mask](../learn/04-compositing/foreground-background-mask) | [Merge](../nodes/compositing/merge) |
| Height / Width | [Resolution / Aspect](../learn/03-space/resolution-aspect) | [Resize](../nodes/transform/resize) |
| Operator / Apply Mode | [Blend / Operator](../learn/04-compositing/blend-operator) | [Merge](../nodes/compositing/merge) |
| Pivot | [Center / Pivot / Size / Angle](../learn/03-space/center-pivot-size-angle) | [Transform](../nodes/transform/transform) |
| Shading | — | [Text+](../nodes/generators/text-plus) |
| Size | [Center / Pivot / Size / Angle](../learn/03-space/center-pivot-size-angle) | [Transform](../nodes/transform/transform) |
| Styled Text | — | [Text+](../nodes/generators/text-plus) |

未検証のNode固有controlを、このIndexだけを根拠に存在確定しません。
