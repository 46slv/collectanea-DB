---
title: Troubleshooting
description: 症状から原因を切り分けるFusion診断入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [debug]
slug: /fusion/troubleshooting
---

# Troubleshooting

症状から原因候補と確認手順を探します。

## Viewer / Output

- [Viewerに何も表示されない](./troubleshooting/viewer/nothing-visible)

## Alpha / Mask

- [Maskを接続しても結果が変わらない](./troubleshooting/masking/mask-does-not-change-result)
- [透明Edgeの色や縁がおかしい](./troubleshooting/masking/alpha-edge-looks-wrong)

## Connections / Data Domain

- [Node同士を接続できない](./troubleshooting/connections/nodes-do-not-connect)
- [Shape / Particle / 3D / USD / DeepがImageとして見えない](./troubleshooting/connections/non-image-domain-not-visible)

## Position / Size / Resolution

- [Transform後にImageの端が消える](./troubleshooting/position-size-resolution/image-cut-off-after-transform)
- [Resolutionが合わない](./troubleshooting/position-size-resolution/resolution-does-not-match)

## Animation / Expression

- [Expressionが期待どおり更新されない](./troubleshooting/animation-automation/expression-does-not-update)
- [Keyframeを置いたのにAnimationしない](./troubleshooting/animation-automation/animation-does-not-move)
- [KeyframeとExpressionが競合している](./troubleshooting/animation-automation/keyframe-expression-conflict)
- [等間隔配置が崩れる](./troubleshooting/animation-automation/equal-spacing-breaks)

## Tracking

- [Tracking結果がずれる / driftする](./troubleshooting/tracking/track-drifts)

## Performance

- [Flowが重い / 遅い](./troubleshooting/performance/graph-is-slow)

## 診断の共通方針

1. 症状を具体化する。
2. Graphをbranch / stageへ分離する。
3. 1回に1つだけ条件を変える。
4. 最後に正常だった地点と、最初に壊れた地点を特定する。
5. 一般Conceptで説明できなければNode固有Referenceへ進む。

現在 **13 Diagnostic** です。
