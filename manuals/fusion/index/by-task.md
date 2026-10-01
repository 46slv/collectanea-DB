---
title: By Task
description: やりたいことからConcept・Pattern・Recipe・Nodeへ進むFusion Index。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-task]
---

# By Task

| Task | First destination | Reference |
|---|---|---|
| 画像を重ねる | [2つのImageを重ねる](../recipes/compositing/two-image-merge) | [Merge](../nodes/compositing/merge) |
| 3枚以上を段階的に重ねる | [画像を段階的に重ねる](../patterns/compositing/stack-images-with-merge) | [Merge](../nodes/compositing/merge) |
| Maskで範囲を限定する | [Maskで処理範囲を限定する](../patterns/masking/limit-effect-with-mask) | [Ellipse](../nodes/masks/ellipse-mask) / [Polygon](../nodes/masks/polygon-mask) |
| Textを画像へ重ねる | [Text+をImageへ重ねる](../recipes/text-graphics/text-over-image) | [Text+](../nodes/generators/text-plus) / [Merge](../nodes/compositing/merge) |
| Imageを移動する | [TransformでImageを移動する](../recipes/layout/move-image-with-transform) | [Transform](../nodes/transform/transform) |
| 複数要素の位置を連動する | [複数要素の位置関係を共有する](../patterns/transform/share-position-across-elements) | [Transform](../nodes/transform/transform) |
| 値を連動・自動化する | [Expressionで値の関係を保つ](../patterns/automation/link-values-with-expression) | [Expressions](../learn/05-time/expressions) |
| Graphを再利用する | [再利用の境界を選ぶ](../patterns/reuse/choose-reuse-boundary) | [Reuse & Structure](../learn/06-reuse/instances) |
| Imageのresolutionを変える | [Resolution / DoD](../learn/07-debugging/resolution-domain-of-definition) | [Resize](../nodes/transform/resize) |
| colorを調整する | [AlphaとMaskを分けて診断する](../learn/07-debugging/alpha-vs-mask) | [Brightness Contrast](../nodes/color/brightness-contrast) / [Color Corrector](../nodes/color/color-corrector) |
| blurする | [DoDを確認する](../learn/07-debugging/resolution-domain-of-definition) | [Blur](../nodes/blur-filter/blur) |
| 問題箇所を切り分ける | [Last Good / First Bad](../patterns/debugging/last-good-first-bad) | [Troubleshooting](../troubleshooting) |
