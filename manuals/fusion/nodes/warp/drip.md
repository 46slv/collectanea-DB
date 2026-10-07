---
title: "Drip"
description: "中心から広がるripple patternで2D Imageを歪ませ、水面の波紋や周期的なmotion graphicsを作るNode。"
doc_type: node
term_id: "drip"
term_short: "Dripは、中心から広がるripple patternでImageを歪ませるNode。"
verification: partial
aliases: ["Drip", "DRP"]
concepts: ["image-data"]
nodes: ["Drip"]
node_family: "warp"
controls: ["Shape", "Center", "Aspect", "Amplitude", "Dampening", "Frequency", "Phase"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["warp-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Drip

Dripは、中心から広がる波紋の形で2D Imageを歪ませるNodeです。水面のrippleのような円形波だけでなく、四角、水平・垂直波、星形など複数のShapeを選べます。Phaseをanimationすると、波紋が中心から外側へ進むような動きを作れます。

## 入力と出力

オレンジ色のInputへ歪ませたい2D Imageを接続します。青色のEffect MaskへMaskを接続すると、効果を必要な領域だけに限定できます。出力は波紋patternに従って変形された2D Imageです。

## 主な設定項目

### Shape

21.1 Manualでは8種類のShapeが説明されています。

- **Circular** — 円形の波紋
- **Square** — 四辺を持つ波紋
- **Random** — 不規則なnoise状の歪み
- **Horizontal** — 横方向へ進む波
- **Vertical** — 縦方向へ進む波
- **Exponential** — 内側へ曲がった菱形に近い波形
- **Star** — 8方向対称の星形
- **Radial** — 固定patternから放射する星形ripple

### Center / Aspect

Centerで波紋の発生位置を決めます。AspectはShapeの縦横比を変えます。

### Amplitude / Dampening

Amplitudeは歪みの強さ、Dampeningは中心から離れるにつれてAmplitudeをどの程度弱めるかを調整します。

### Frequency / Phase

Frequencyはrippleの数・密度を調整します。Phaseはpatternの位相をずらし、animationすると波紋が中心から外側へ進むように見えます。

## 主な用途

- 水面へ落ちた滴のような円形rippleを作る
- Horizontal / Verticalで一方向へ流れる波状distortionを作る
- StarやRadialで幾何学的なmotion graphicsを作る
- RandomでImage全体へ不規則な揺れを加える

## 最小構成

    MediaIn → Drip → MediaOut

Circularを選び、Centerを波紋の発生位置へ合わせます。Amplitudeを小さく設定し、Frequencyで波の密度を決め、Phaseをanimationして動きを確認します。

## Coordinate Spaceと組み合わせる

21.1 Manualでは、2つのCoordinate Spaceを異なるShape設定で置き、その間にDripまたはTransformを入れる使い方も示されています。

    Image → Coordinate Space → Drip → Coordinate Space → Result

一度別の座標系へ変換してからDripを適用し、最後に座標系を戻すことで、通常とは異なる方向へrippleを変形できます。

## Dent / Vortexとの違い

- **Drip** — 複数のrippleを周期的に並べ、Frequency / Phaseで動きを作る
- **Dent** — 中心の周囲を単発の膨らみ・凹みとして変形する
- **Vortex** — 中心の周囲を渦状に回転させる

## 関連Node

- [Coordinate Space](./coordinate-space)
- [Dent](./dent)
- [Vortex](./vortex)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2969–2971で、Input / Effect Mask、8種類のShape、Center、Aspect、Amplitude、Dampening、Frequency、Phase、MediaInを使うBasic Node Setupを確認しました。Coordinate Spaceとの組み合わせは同章p.2962で確認しています。

全既定値・内部REGID・実機performanceは未確認です。
