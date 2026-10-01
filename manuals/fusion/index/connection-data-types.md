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
| 2D Image | [Image / Mask / Data](../learn/02-data/image-mask-data) | [Background](../nodes/generators/background), [Merge](../nodes/compositing/merge), [Transform](../nodes/transform/transform) |
| Mask | [Image / Mask / Data](../learn/02-data/image-mask-data) | [Ellipse Mask](../nodes/masks/ellipse-mask), [Polygon Mask](../nodes/masks/polygon-mask) |
| Parameter / scalar / Point | [Expressions](../learn/05-time/expressions) | Node-specific controlsへ |
| Tracking data / transform | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [Planar Tracker](../nodes/tracking/planar-tracker) |
| Particle set | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [pEmitter](../nodes/particles/p-emitter) → [pRender](../nodes/particles/p-render) |
| Classic 3D scene | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | [Merge 3D](../nodes/3d/merge-3d) → [Renderer 3D](../nodes/3d/renderer-3d) |
| Shape | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | Reference coverage pending |
| USD scene | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | Reference coverage pending |
| Deep image | [Data domainを辿る](../learn/07-debugging/trace-data-domain) | Reference coverage pending |

Renderer 3D / pRenderのようなNodeは、別domainを通常の2D Imageへ戻す**変換境界**として引けます。
