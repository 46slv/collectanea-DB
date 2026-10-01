---
title: Connection / Data Types
description: Fusion Graphを流れるdata domainからConceptとReferenceを引くIndex。
doc_type: index
verification: partial
product_scope: fusion
tasks: [connect-nodes, debug]
---

# Connection / Data Types

| Data | Mental model | Current Reference |
|---|---|---|
| Resolve source / output boundary | [MediaIn / MediaOutの境界](../resolve-integration/media-in-out-boundary) | [MediaIn](../nodes/utility-io/media-in) → Fusion Flow → [MediaOut](../nodes/utility-io/media-out) |
| 2D Image | [Image / Mask / Data](../learn/02-data/image-mask-data) | [Background](../nodes/generators/background), [Merge](../nodes/compositing/merge), [Transform](../nodes/transform/transform) |
| Mask | [Image / Mask / Data](../learn/02-data/image-mask-data) | [Ellipse Mask](../nodes/masks/ellipse-mask), [Polygon Mask](../nodes/masks/polygon-mask) |
| Parameter / scalar / Point | [Expressions](../learn/05-time/expressions) | Node-specific controlsへ |
| Tracking data / transform | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [Tracker](../nodes/tracking/tracker), [Planar Tracker](../nodes/tracking/planar-tracker) → [Planar Transform](../nodes/tracking/planar-transform) |
| Shape | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [sEllipse](../nodes/shapes/s-ellipse) → [sRender](../nodes/shapes/s-render) |
| Particle set | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [pEmitter](../nodes/particles/p-emitter) → [pRender](../nodes/particles/p-render) |
| Classic 3D scene | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [Merge 3D](../nodes/3d/merge-3d) → [Renderer 3D](../nodes/3d/renderer-3d) |
| USD scene | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [uMerge](../nodes/usd/u-merge) → [uRenderer](../nodes/usd/u-renderer) |
| Deep image | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [dMerge](../nodes/deep/d-merge) → [Deep to Image](../nodes/deep/deep-to-image) |

共通Pattern:
[特殊domainのまま処理し、必要な境界で2Dへ戻す](../patterns/data-domain/defer-domain-conversion)

Shape / Particle / 3D / USD / Deepでは、変換Nodeが通常2D Image Flowへ戻る明示的な境界になります。
