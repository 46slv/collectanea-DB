---
title: Image / Mask / Dataを分ける
description: Fusionで扱うImage・Mask・parameter dataを役割ごとに分けてGraphを読む。
doc_type: concept
verification: partial
aliases: [Image, Mask, Data, データ型]
concepts: [image-data, mask-data, parameter-data]
nodes: [Merge, Background, Transform]
tasks: [connect-nodes, mask, automate, debug]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Image / Mask / Dataを分ける

## Question

「線をつなげば動く」だけではなく、**何を何へつないでいるのか**をどう区別すればよいでしょうか。

## Mental Model

まず3つの責任へ分けます。

| Data | Primary job | Read next |
|---|---|---|
| Image | 見た目となる2D image dataを流す | [Image](./image) |
| Mask | effect / compositeの適用範囲を持つ | [Mask](./mask) |
| Parameter / Data | Node behaviorを決めるvalue | [Parameter / Data](./parameter-data) |

この3つを同じ「線」や「値」として扱わないことが重要です。

## Minimum Example

```text
Image A ──────────────────┐
                         ├─ Merge → Output Image
Image B ──────────────────┘
Mask ─────────────────────↑

Parameter:
Merge.Blend / Transform.Center / ...
```

Image connection、Mask connection、Inspector parameterは別の責任です。

## Invariants

- ImageはImageとして追う。
- Maskはeffect範囲として追う。
- ParameterはNode behaviorのvalueとして追う。
- 同じViewer表示ができてもdata domainを同一視しない。
- 接続できない場合は、まずOutput / Input domainを確認する。

## Change One Thing

Mask connectionだけを外し、Image branchとparameterは固定したまま結果を比較します。

## Transfer

### Merge

Foreground / BackgroundはImage、Effect MaskはMask、Blendはparameterです。

### Transform

Imageを受け取り、Center / Size等のparameterでbehaviorを決めます。

### Specialized domain

Shape / Particle / 3D / USD / Deepは、Image / Mask / parameter以外にも別domainがあることを示します。

## Predict

初見Nodeで、まず「これはImage / Mask / parameter / その他domainのどれか」を分類できます。

## Common Misread

**Viewerに見えるものは全部Image、Inspectorにあるものは全部同じ型の数値**と考えること。

data domainとparameter typeを分けて読みます。

## Related Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)
- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## Node Reference

- [Merge](../../nodes/compositing/merge)
- [Transform](../../nodes/transform/transform)

## Next

→ [Image](./image)

---

Verification note: Image connection、Mask role、Inspector parameterの分離は現行Blackmagic Design Fusion資料とFusion 21 semantic baselineに基づきます。
