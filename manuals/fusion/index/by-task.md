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
| 画像を2枚重ねる | [2つのImageを重ねる](../recipes/compositing/two-image-merge) | [Merge](../nodes/compositing/merge) |
| 多数のImageを1 Nodeで管理する | [複数ImageをMultiMergeでまとめる](../recipes/compositing/multi-merge-layers) | [MultiMerge](../nodes/compositing/multi-merge) |
| Merge chainとMultiMergeを選ぶ | [Merge chainとMultiMergeを選ぶ](../patterns/compositing/choose-merge-vs-multimerge) | [Merge](../nodes/compositing/merge) / [MultiMerge](../nodes/compositing/multi-merge) |
| Maskで範囲を限定する | [Maskで処理範囲を限定する](../patterns/masking/limit-effect-with-mask) | [Ellipse](../nodes/masks/ellipse-mask) / [Polygon](../nodes/masks/polygon-mask) |
| Textを画像へ重ねる | [Text+をImageへ重ねる](../recipes/text-graphics/text-over-image) | [Text+](../nodes/generators/text-plus) / [Merge](../nodes/compositing/merge) |
| 再利用可能なTitle構造を作る | [再利用可能なTitle構造を作る](../recipes/text-graphics/reusable-title-structure) | [Text+](../nodes/generators/text-plus) / [Transform](../nodes/transform/transform) |
| TransformをKeyframeで動かす | [TransformをKeyframeで動かす](../recipes/animation/animate-transform-center) | [Transform](../nodes/transform/transform) |
| 2つの位置を連動する | [2つのTransform位置を連動する](../recipes/automation/link-transform-centers) | [Transform](../nodes/transform/transform) |
| 複数要素を等間隔にする | [複数要素を等間隔に配置する考え方](../recipes/automation/equal-spacing-by-index) | [Transform](../nodes/transform/transform) |
| Imageを移動する | [TransformでImageを移動する](../recipes/layout/move-image-with-transform) | [Transform](../nodes/transform/transform) |
| Imageのresolutionを変える | [Resolution / Aspect](../learn/03-space/resolution-aspect) | [Resize](../nodes/transform/resize) |
| resolutionを跨いでlayoutを保つ | [Resolutionを跨いでも位置関係を保つ](../patterns/transform/resolution-aware-positioning) | [Transform](../nodes/transform/transform) / [Resize](../nodes/transform/resize) |
| Graphを再利用する | [再利用の境界を選ぶ](../patterns/reuse/choose-reuse-boundary) | [Reuse & Structure](../learn/06-reuse/instances) |
| channelを組み替える | [Alpha](../learn/04-compositing/alpha) | [Channel Boolean](../nodes/color/channel-boolean) |
| matteを後処理する | [Alpha](../learn/04-compositing/alpha) | [Matte Control](../nodes/matte-keying/matte-control) |
| 透明Edgeを保ってColor Correctする | [透明Edgeを保ってColor Correctする](../recipes/color/transparent-edge-color-correction) | [Alpha Divide](../nodes/matte-keying/alpha-divide) / [Color Corrector](../nodes/color/color-corrector) / [Alpha Multiply](../nodes/matte-keying/alpha-multiply) |
| green / blue screenをkeyする | [KeyしてBackgroundを置き換える](../recipes/matte-keying/key-and-replace-background) | [Delta Keyer](../nodes/matte-keying/delta-keyer) |
| pointをtrackする | [Trackを解いてから適用先を分ける](../patterns/tracking/solve-then-apply-track) | [Tracker](../nodes/tracking/tracker) |
| 平面をtrackする | [平面をtrackしてgraphicへ適用する](../recipes/tracking/planar-track-graphic) | [Planar Tracker](../nodes/tracking/planar-tracker) / [Planar Transform](../nodes/tracking/planar-transform) |
| Shapeを2Dへrenderする | [Shapeを2D Imageへrenderする](../recipes/shapes/basic-shape-render) | [sEllipse](../nodes/shapes/s-ellipse) / [sRender](../nodes/shapes/s-render) |
| particleを2Dへrenderする | [最小Particle chainを作る](../recipes/particles/basic-particle-chain) | [pEmitter](../nodes/particles/p-emitter) / [pRender](../nodes/particles/p-render) |
| Classic 3Dを2Dへrenderする | [Classic 3D sceneを2Dへrenderする](../recipes/3d/basic-classic-3d-render) | [Merge 3D](../nodes/3d/merge-3d) / [Renderer 3D](../nodes/3d/renderer-3d) |
| USDを2Dへrenderする | [USD sceneを2Dへrenderする](../recipes/usd/basic-usd-render) | [uMerge](../nodes/usd/u-merge) / [uRenderer](../nodes/usd/u-renderer) |
| Deepを2Dへflattenする | [Deep compositeを2Dへ戻す](../recipes/deep/deep-merge-to-image) | [dMerge](../nodes/deep/d-merge) / [Deep to Image](../nodes/deep/deep-to-image) |
| 特殊domainを2Dへ戻す | [特殊domainのまま処理し、必要な境界で2Dへ戻す](../patterns/data-domain/defer-domain-conversion) | [Connection / Data Types](./connection-data-types) |
| 問題箇所を切り分ける | [Last Good / First Bad](../patterns/debugging/last-good-first-bad) | [Troubleshooting](../troubleshooting/index) |
| Flowが重い / 遅い | [Flowが重い / 遅い](../troubleshooting/performance/graph-is-slow) | [Domain of Definition](../learn/03-space/domain-of-definition) |
