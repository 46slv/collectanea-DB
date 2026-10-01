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
| 再利用可能なTitle構造を作る | [再利用可能なTitle構造を作る](../recipes/text-graphics/reusable-title-structure) | [Text+](../nodes/generators/text-plus) / [Transform](../nodes/transform/transform) |
| Imageを移動する | [TransformでImageを移動する](../recipes/layout/move-image-with-transform) | [Transform](../nodes/transform/transform) |
| Imageのresolutionを変える | [Resolution / Aspect](../learn/03-space/resolution-aspect) | [Resize](../nodes/transform/resize) |
| resolutionを跨いでlayoutを保つ | [Resolutionを跨いでも位置関係を保つ](../patterns/transform/resolution-aware-positioning) | [Transform](../nodes/transform/transform) / [Resize](../nodes/transform/resize) |
| 複数要素の位置を連動する | [複数要素の位置関係を共有する](../patterns/transform/share-position-across-elements) | [Transform](../nodes/transform/transform) |
| 値を連動・自動化する | [Expressionで値の関係を保つ](../patterns/automation/link-values-with-expression) | [Expressions](../learn/05-time/expressions) |
| Graphを再利用する | [再利用の境界を選ぶ](../patterns/reuse/choose-reuse-boundary) | [Reuse & Structure](../learn/06-reuse/instances) |
| colorを調整する | [Premultiplication](../learn/04-compositing/premultiplication) | [Brightness Contrast](../nodes/color/brightness-contrast) / [Color Corrector](../nodes/color/color-corrector) |
| blurする | [Domain of Definition](../learn/03-space/domain-of-definition) | [Blur](../nodes/blur-filter/blur) |
| green / blue screenをkeyする | [KeyしてBackgroundを置き換える](../recipes/matte-keying/key-and-replace-background) | [Delta Keyer](../nodes/matte-keying/delta-keyer) / [Merge](../nodes/compositing/merge) |
| 平面をtrackする | [平面をtrackしてgraphicへ適用する](../recipes/tracking/planar-track-graphic) | [Planar Tracker](../nodes/tracking/planar-tracker) |
| Shapeを作って2Dへrenderする | [Shapeを2D Imageへrenderする](../recipes/shapes/basic-shape-render) | [sEllipse](../nodes/shapes/s-ellipse) / [sRender](../nodes/shapes/s-render) |
| particleを作る | [最小Particle chainを作る](../recipes/particles/basic-particle-chain) | [pEmitter](../nodes/particles/p-emitter) |
| particleを2Dへ戻す | [最小Particle chainを作る](../recipes/particles/basic-particle-chain) | [pRender](../nodes/particles/p-render) |
| Classic 3D sceneをまとめる | [Classic 3D sceneを2Dへrenderする](../recipes/3d/basic-classic-3d-render) | [Merge 3D](../nodes/3d/merge-3d) |
| Classic 3Dを2Dへ戻す | [Classic 3D sceneを2Dへrenderする](../recipes/3d/basic-classic-3d-render) | [Renderer 3D](../nodes/3d/renderer-3d) |
| USD sceneをまとめる | [USD sceneを2Dへrenderする](../recipes/usd/basic-usd-render) | [uMerge](../nodes/usd/u-merge) |
| USDを2Dへrenderする | [USD sceneを2Dへrenderする](../recipes/usd/basic-usd-render) | [uRenderer](../nodes/usd/u-renderer) |
| Deep imageをcompositeする | [Deep compositeを2Dへ戻す](../recipes/deep/deep-merge-to-image) | [dMerge](../nodes/deep/d-merge) |
| Deepを2Dへflattenする | [Deep compositeを2Dへ戻す](../recipes/deep/deep-merge-to-image) | [Deep to Image](../nodes/deep/deep-to-image) |
| 特殊domainを2Dへ戻す | [特殊domainのまま処理し、必要な境界で2Dへ戻す](../patterns/data-domain/defer-domain-conversion) | [Connection / Data Types](./connection-data-types) |
| 問題箇所を切り分ける | [Last Good / First Bad](../patterns/debugging/last-good-first-bad) | [Troubleshooting](../troubleshooting/index) |
| Flowが重い / 遅い | [Flowが重い / 遅い](../troubleshooting/performance/graph-is-slow) | [Domain of Definition](../learn/03-space/domain-of-definition) |
