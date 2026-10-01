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

- [Viewerに何も表示されない](./viewer/nothing-visible)

## Alpha / Mask

- [Maskを接続しても結果が変わらない](./masking/mask-does-not-change-result)
- [透明Edgeの色や縁がおかしい](./masking/alpha-edge-looks-wrong)

## Connections / Data Domain

- [Node同士を接続できない](./connections/nodes-do-not-connect)
- [Shape / Particle / 3D / USD / DeepがImageとして見えない](./connections/non-image-domain-not-visible)

## Position / Size / Resolution

- [Transform後にImageの端が消える](./position-size-resolution/image-cut-off-after-transform)
- [Resolutionが合わない](./position-size-resolution/resolution-does-not-match)

## Animation / Expression

- [Expressionが期待どおり更新されない](./animation-automation/expression-does-not-update)
- [Keyframeを置いたのにAnimationしない](./animation-automation/animation-does-not-move)

## 診断の共通方針

1. 症状を具体化する。
2. Graphをbranch / stageへ分離する。
3. 1回に1つだけ条件を変える。
4. 最後に正常だった地点と、最初に壊れた地点を特定する。
5. 一般Conceptで説明できなければNode固有Referenceへ進む。

現在 **9 Diagnostic** です。
