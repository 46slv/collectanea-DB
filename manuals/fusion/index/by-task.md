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
| Imageのresolutionを変える | [Resolution / Aspect](../learn/03-space/resolution-aspect) | [Resize](../nodes/transform/resize) |
| 複数要素の位置を連動する | [複数要素の位置関係を共有する](../patterns/transform/share-position-across-elements) | [Transform](../nodes/transform/transform) |
| 値を連動・自動化する | [Expressionで値の関係を保つ](../patterns/automation/link-values-with-expression) | [Expressions](../learn/05-time/expressions) |
| Graphを再利用する | [再利用の境界を選ぶ](../patterns/reuse/choose-reuse-boundary) | [Reuse & Structure](../learn/06-reuse/instances) |
| colorを調整する | [Alpha / Premultiplication](../learn/04-compositing/premultiplication) | [Brightness Contrast](../nodes/color/brightness-contrast) / [Color Corrector](../nodes/color/color-corrector) |
| blurする | [Domain of Definition](../learn/03-space/domain-of-definition) | [Blur](../nodes/blur-filter/blur) |
| green / blue screenをkeyする | [Alpha](../learn/04-compositing/alpha) | [Delta Keyer](../nodes/matte-keying/delta-keyer) |
| 平面をtrackする | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [Planar Tracker](../nodes/tracking/planar-tracker) |
| Classic 3D sceneをまとめる | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [Merge 3D](../nodes/3d/merge-3d) |
| 3D sceneを2Dへ戻す | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [Renderer 3D](../nodes/3d/renderer-3d) |
| particleを作る | [Frame Evaluation](../learn/05-time/frame-evaluation) | [pEmitter](../nodes/particles/p-emitter) |
| particleを2Dへ戻す | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [pRender](../nodes/particles/p-render) |
| 問題箇所を切り分ける | [Last Good / First Bad](../patterns/debugging/last-good-first-bad) | [Troubleshooting](../troubleshooting/index) |
