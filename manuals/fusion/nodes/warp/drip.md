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
updated: "2026-10-22"
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

Centerで波紋の発生位置を決めます。AspectはShapeの縦横比を変えます。**1.0なら対称**で、小さくすると縦長、大きくすると横長になります。

### Amplitude / Dampening

**Amplitude**は波紋の変形量を決めます。**0.0では波紋による変形がなくなります**。値を上げるほど元画像の画素を大きくずらします。

**Dampening**は中心から離れるにつれてAmplitudeを弱める設定です。遠くまで歪みが広がる場合に見直します。効果を特定の範囲へ明確に限定したいときの**Effect Mask**とは役割が異なります。

### Frequency / Phase

**Frequency**は中心から広がる波紋の数を調整します。**0.0では波紋がなくなります**。Frequencyを大きくすると、より細かい波が並びます。

**Phase**は波の山・谷の位置をずらす設定です。Phaseを時間とともに変えると、波紋が中心から外側へ進むように見えます。Amplitudeは変形の強さ、Frequencyは波の密度、Phaseは波の進行と分けて調整します。

## 主な用途

- 水面へ落ちた滴のような円形rippleを作る
- Horizontal / Verticalで一方向へ流れる波状distortionを作る
- StarやRadialで幾何学的なmotion graphicsを作る
- RandomでImage全体へ不規則な揺れを加える

## 最小構成

    MediaIn → Drip → MediaOut

Circularを選び、Centerを波紋の発生位置へ合わせます。Amplitudeを小さく設定し、Frequencyで波の密度を決め、Phaseをanimationして動きを確認します。

## 運用例：水面に落ちた滴から波紋を広げる

池の水面を撮影した動画へ、滴が落ちた場所を中心に波が伝わるような**画素の変形**を加える例です。波紋の画像を重ねるのではなく、元映像に写る反射や模様の参照位置を動かします。

1. 水面の動画を**MediaIn → Drip → MediaOut**へ接続し、Dripの**ShapeをCircular**にします。
2. **Center X/Y**を滴が落ちた場所へ合わせます。**Aspect = 1.0**から始め、映像上の波が楕円形に見える場合だけ縦横比を変えます。
3. **Amplitude**を小さくした状態で**Frequency**を調整し、反射の線が何本の波で曲がるか確認します。Amplitudeが0、Frequencyが0の場合は波紋が見えません。
4. **Dampening**で中心から離れた部分の変形を抑えます。水面以外の岸や人物まで歪む場合は、必要に応じて**EllipseなどのMask**をDripの青いEffect Maskへ接続し、効果範囲を限定します。
5. 波紋が発生してから広がる区間で**Phaseをキーフレーム**にし、数フレーム進めて水面の模様が中心から外側へ動いて見えるか確認します。

Dripが生成するのは画像の歪みです。滴の飛沫、立体的な水面、反射の物理挙動を自動生成するものではありません。必要なら別素材の合成と組み合わせます。

## Coordinate Spaceと組み合わせる

21.1 Manualでは、2つのCoordinate Spaceを異なるShape設定で置き、その間にDripまたはTransformを入れる使い方も示されています。

    Image → Coordinate Space → Drip → Coordinate Space → Result

一度別の座標系へ変換してからDripを適用し、最後に座標系を戻すことで、通常とは異なる方向へrippleを変形できます。

## Dent / Vortexとの違い

- **Drip** — 複数のrippleを周期的に並べ、Frequency / Phaseで動きを作る
- **Dent** — 中心の周囲を単発の膨らみ・凹みとして変形する
- **Vortex** — 中心の周囲を渦状に回転させる

## うまく変形しないとき

| 症状 | 確認すること |
| --- | --- |
| Phaseを動かしても波が見えない | **AmplitudeとFrequencyが0になっていないか**、Effect Maskが全黒ではないかを確認する。 |
| 画面全体が揺れてしまう | **Dampening**で中心から離れた領域を抑え、必要なら**Effect Mask**で範囲を限定する。 |
| 波紋が縦長・横長すぎる | **Aspect**を1.0へ戻し、必要な比率へ調整する。 |
| 動かしたい場所と中心が合わない | **Center X/Y**の位置を確認する。これは動きを自動追跡する設定ではない。 |

## 関連Node

- [Coordinate Space](./coordinate-space)
- [Dent](./dent)
- [Vortex](./vortex)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2969–2971で、Input / Effect Mask、8種類のShape、Center、Aspect（1.0で対称）、Amplitude（0.0で変形なし）、Dampening、Frequency（0.0で波紋なし）、Phase、MediaInを使うBasic Node Setupを確認しました。Coordinate Spaceとの組み合わせは同章p.2962で確認しています。

全既定値・内部REGID・実機performanceは未確認です。
