---
title: Text+
description: Styled Text・Layout・Shading等を持つFusionの2D text generator。
doc_type: node
verification: partial
aliases: [Text+, Text Plus, TXT+]
concepts: [image-data, parameter-data, keyframes]
nodes: [Text+]
node_family: generators
controls: [Styled Text, Layout, Shading, Follower]
outputs: [image]
tasks: [text, motion-graphics, title, animate]
level: foundation
product_scope: fusion
suite_surfaces: [fusion, edit]
---

# Text+

2D text Imageを生成するFusion Nodeです。

## At a Glance

- **Family**: Generators / Text
- **Primary output**: 2D Image
- **Core concepts**: Text generation、Layout、Shading、Animation
- **Common tasks**: title、lower third、motion graphics、template source

## Inputs

Text+はGeneratorとして扱います。primary Image inputを前提にしない構成が基本ですが、Effect Mask等を含むexact auxiliary inputsはFusion 21.1 runtime / manualで確認します。

## Output

textを描画した2D Imageを出力します。

## Controls

### Styled Text

表示する文字列を持つ主要controlです。

### Layout

textの配置・layoutに関わる領域です。exact mode / control名は21.1確認後に細分化します。

### Shading

文字の見た目を複数layerで構成する機能群です。layer数・option・defaultはcurrent manualで確認します。

### Follower

文字単位のanimationへ関係する機構としてlegacy Fusion referenceで確認されています。21.1のexact behaviorは今後の専用Reference対象です。

## Behavior / Notes

Text+を単なる「文字を出すNode」としてだけ扱わず、

- content
- layout
- visual styling
- animation

を分けて読むと、Template化したときに公開controlを選びやすくなります。

## Minimal Examples

### Text over image

```text
Text+ ──────┐
            ├─ Merge → Output
Image ──────┘
```

## Related Concepts

- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)
- [Keyframe / Spline / Time](../../learn/05-time/keyframes-spline-time)

## Related Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## Similar / Adjacent Nodes

- MultiText
- Text3D
- sText

これらはdata domainや用途が異なるため、Text+の単純な上位互換として扱いません。

## Version / Verification Notes

Text+の存在とStyled Text / Layout / Shading / Follower系の位置づけはBlackmagic Design公式Fusion系資料で確認済み。Fusion 21.1のexact ports、control defaults、rangeは未検証です。
