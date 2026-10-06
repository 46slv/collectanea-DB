---
title: Text 3D
description: Text+に近いtext controlsへExtrusion・Bevel・3D Transform・Materialを加え、Classic 3D text geometryを生成するNode。
doc_type: node
term_id: text-3d
verification: partial
aliases: [Text 3D, Text3D, 3Txt]
concepts: [classic-3d, text, material]
nodes: [Text 3D]
node_family: 3d
controls: [Styled Text, Font, Size, Tracking, Write On, Extrusion Depth, Bevel Depth, Bevel Width, Custom Extrusion, Layout, Transform, Shading, Material]
inputs: [classic-3d, image, image]
outputs: [classic-3d]
tasks: [build-3d-scene, text-3d, title]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Text 3D

Text 3Dは、文字を<Term id="classic-3d">Classic 3D geometry</Term>として生成するNodeです。

Styled Text、Font、Layout等はText+に近く、さらにExtrusionとBevelで文字へ奥行きを持たせられます。

## 入力

### Scene Input

オレンジ色の任意inputです。別3D sceneをText 3D outputへ加えます。

### Color Image

ShadingでImage materialを使う場合に現れる2D Image inputです。文字のsurface textureとして使います。

### Bevel Texture

bevelへ別Image textureを使う場合に現れます。

Text 3Dは一般的なMaterial inputを持たないため、より高度なMaterialへ置き換える場合はReplace Material 3Dを後段に使います。

## Styled Text

表示する文字列を入力します。

Font、Size、Tracking、Line Spacing、Direction、Write On等、2D Text+と共通する考え方が多くあります。

Text 3DはCharacter Level Stylingを直接持たないため、必要な場合はText+側でmodifierを作って接続 / settings transferする方法がManualで説明されています。

## Extrusion

### Extrusion Depth

0ではflat text、0より大きくするとZ方向へ厚みを作ります。

### Bevel Depth / Width

extruded textのfront / back edgeへbevelを付けます。

bevelはExtrusion Depthが0では効果を持ちません。

### Custom Extrusion

profile splineでextrusion shapeを設計します。

均一な厚みだけでなく、picture frameのような断面を作れます。

## Layout / Sub Transform

LayoutではPoint / Frame / Circle / Path等のtext配置を扱います。

Sub TransformではCharacters / Words / Lines単位のrotation、spacing、size等を変えられます。

Scene内でText 3D object全体を動かすTransform tabとは別です。

## Shading

Text 3Dはbuilt-in materialを持ち、Diffuse / Specular / Opacity等を調整できます。

より複雑なOpenPBR等へ置き換えたい場合はReplace Material 3Dを使います。

## 最小構成

```text
Text 3D → Renderer 3D → Image
```

lighting / cameraを使う場合:

```text
Text 3D ───┐
Camera 3D ─┼─ Merge 3D → Renderer 3D
Spot Light ┘
```

## Text+ / sTextとの違い

- **Text+** — 2D Image text
- **Text 3D** — Classic 3D geometry
- **sText** — Shape domainのvector text

最終的にどのdata domainで加工したいかで選びます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1997–2006とFusion Fundamentals Chapter 84で、inputs、Styled Text、Write On、Extrusion / Bevel、Layout、Sub Transform、Shading、Material制約を確認しました。

font互換性、network render環境、全modifierの実機差は未確認です。
