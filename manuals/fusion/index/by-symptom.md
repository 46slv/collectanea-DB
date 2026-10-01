---
title: By Symptom
description: 見えている症状からFusion diagnosticへ進むIndex。
doc_type: index
verification: partial
product_scope: fusion
tasks: [debug, lookup-symptom]
---

# By Symptom

| Symptom | Diagnostic | Related Concept |
|---|---|---|
| 何も表示されない | [Viewerに何も表示されない](../troubleshooting/viewer/nothing-visible) | [Graphとして考える](../learn/01-flow/graph-as-flow) |
| Maskが効かない | [Maskを接続しても結果が変わらない](../troubleshooting/masking/mask-does-not-change-result) | [Image / Mask / Data](../learn/02-data/image-mask-data) |
| 透明Edgeに黒縁・白縁が出る | [透明Edgeの色や縁がおかしい](../troubleshooting/masking/alpha-edge-looks-wrong) | [Premultiplication](../learn/04-compositing/premultiplication) |
| Node同士を接続できない | [Node同士を接続できない](../troubleshooting/connections/nodes-do-not-connect) | [Data domainを辿る](../learn/07-debugging/trace-data-domain) |
| Shape / Particle / 3D / USD / DeepがImageにならない | [特殊domainがImageとして見えない](../troubleshooting/connections/non-image-domain-not-visible) | [特殊domainのまま処理し、必要な境界で2Dへ戻す](../patterns/data-domain/defer-domain-conversion) |
| Transform後に端が消える | [Transform後にImageの端が消える](../troubleshooting/position-size-resolution/image-cut-off-after-transform) | [Domain of Definition](../learn/03-space/domain-of-definition) |
| Resolutionが合わない | [Resolutionが合わない](../troubleshooting/position-size-resolution/resolution-does-not-match) | [Resolution / Aspect](../learn/03-space/resolution-aspect) |
| Expressionが更新されない | [Expressionが期待どおり更新されない](../troubleshooting/animation-automation/expression-does-not-update) | [Modifier / Parameter Sources](../learn/05-time/modifier-parameter-sources) |
| Keyframeを置いたのに動かない | [Keyframeを置いたのにAnimationしない](../troubleshooting/animation-automation/animation-does-not-move) | [Frame Evaluation](../learn/05-time/frame-evaluation) |
| Trackingがずれる / driftする | [Tracking結果がずれる / driftする](../troubleshooting/tracking/track-drifts) | [Trackを解いてから適用先を分ける](../patterns/tracking/solve-then-apply-track) |
| Flowが重い / 遅い | [Flowが重い / 遅い](../troubleshooting/performance/graph-is-slow) | [Domain of Definition](../learn/03-space/domain-of-definition) |
