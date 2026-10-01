---
title: Image / Mask / Dataを分ける
description: Fusionで扱う画像、Mask、parameter dataを役割ごとに分けてGraphを読む。
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

Fusionでは、少なくとも次の役割を分けて考えるとGraphを読みやすくなります。

- **Image**: Viewerで見る画像の流れ。
- **Mask**: effectや合成を適用する範囲を制限する流れ。
- **Parameter / Data**: Center、Blend、Sizeなど、Nodeの挙動を決める値。

この3つを同じ「線」や「値」として扱わないことが重要です。

## Minimum Example

```text
Background1 ───────────────┐
                          ├─ Merge1 → Output
Background2 ───────────────┘
Ellipse1 ───── Mask ───────↑
```

ここでは2枚のImageをMergeへ渡し、EllipseのMaskで処理範囲を制限します。

一方、MergeのBlendやTransformのCenterは、Graphを流れる画像そのものではなく、Nodeのparameterです。

## Invariants

### Image

画像を受け取り、加工し、次へ渡すNodeでは、upstream / downstreamの画像関係を追います。

### Mask

Maskは「別の画像を上に重ねる」ものではなく、**処理をどこへ効かせるか**を限定する役割として読みます。Blackmagic Designの現行Fusion紹介でも、Maskはeffectの対象領域を定義し、青いMask inputへ接続する形で説明されています。

### Parameter / Data

InspectorのcontrolはNodeの挙動を決める値です。Keyframe、Modifier、Expressionなどで時間変化・参照・計算を持たせられる場合があります。

## Change One Thing

同じMerge構成で、Mask接続だけを外して比較します。

Imageの接続を変えず、Maskの有無だけを変えることで、「画像の内容」と「処理範囲」が別の責任であることを観察できます。

## Transfer

### Merge

Image入力の役割とEffect Maskを分けて考えます。

### Background

BackgroundはImageを生成します。Maskを併用する場合でも、「色を作る責任」と「範囲を決める責任」を分けて読めます。

### Transform

TransformはImageを受け取って変形します。CenterやSizeはImageとは別のparameterとして扱います。

## Predict

初見Nodeで接続に迷ったら、先に次を問います。

- これは画像そのものか。
- 処理範囲を指定するMaskか。
- Inspectorの値として参照・計算するparameterか。

役割を特定してから接続先を探す方が、Node名だけで推測するより安定します。

## Common Misread

**Maskを「白黒の画像だから普通のImageと同じ」とだけ捉えること。**

見た目としてViewerで確認できる場合があっても、Graph上での責任は「どこへ処理を適用するか」です。

## Related Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## Node Reference

- [Merge](../../nodes/compositing/merge)
- [Background](../../nodes/generators/background)
- [Transform](../../nodes/transform/transform)

## Next

→ [Normalized Coordinates](../03-space/normalized-coordinates)

---

Verification note: Image接続、Maskの役割、Inspector / animation controlsの一般像は2026-10-02時点のBlackmagic Design公式Fusion紹介と照合済み。parameter typeや接続可能型の網羅表は今後のReference検証対象です。
