---
title: Lens Distort
description: 撮影レンズ由来の歪みをUndistortで外し、合成後にDistortで戻すVFX往復やlens calibrationを行うNode。
doc_type: node
term_id: lens-distort
term_short: "Lens Distortは、撮影レンズの歪みを除去・再付与して合成を合わせるNode。"
verification: partial
aliases: [Lens Distort, Lens]
concepts: [image-data]
nodes: [Lens Distort]
node_family: warp
controls: [Mode, Edges, Clipping Mode, Output Distortion Map, Camera Settings, Lens Distortion Model, Supersampling, Supersampling Mode, Load Distortion Data, Calibrate Type, Calibrate Mode]
inputs: [image, mask]
outputs: [image]
tasks: [warp-image]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Lens Distort

Lens Distortは、実写素材に含まれる**レンズ由来の曲がり**を取り除いたり、同じ歪みを後から戻したりするNodeです。

VFXでは、実写をUndistortして平坦な状態で3Dやgraphicsを合成し、最後に同じ設定でDistortして撮影時のlens distortionを戻す使い方が基本です。

## 役割

```text
Live action
  ↓
Lens Distort [Undistort]
  ↓
3D / graphics composite
  ↓
Lens Distort [Distort]
  ↓
final Image
```

歪んだ実写へ歪みのないCGをそのまま重ねると、画面端の直線や位置関係が合いません。Lens Distortは、実写と追加要素を同じ幾何状態で扱うための往復を担当します。

## 入力

### Input

オレンジ色のInputへ、歪みを除去または付与したい2D Imageを接続します。

### Effect Mask

青色のEffect MaskへMaskを接続すると、効果を必要な領域だけに限定できます。MaskはNodeの処理後に適用されます。

## 出力

通常はUndistortまたはDistortされた2D Imageを出力します。

**Output Distortion Map**を有効にすると、各pixelの移動先を表すwarped screen-coordinate mapを出力します。

## 主な設定項目

### Mode

- **Undistort** — 元映像にあるlens distortionを取り除く
- **Distort** — lens distortionをImageへ付ける、またはUndistort前の見た目へ戻す

前段と後段で同じlens設定を使い、Modeだけを切り替えることで往復できます。

### Edges

frame外をsampleするときの扱いを選びます。

- **Canvas** — frame外をcanvas colorで埋める
- **Duplicate** — edge pixelを複製して外側へ伸ばす

### Clipping Mode

- **Domain** — 後で再Distortする可能性があるframe外pixelを保持する
- **Frame** — frame外へ移動したpixelを破棄する

Undistort → 合成 → Distortの往復では、途中で必要なpixelを失わないようDomain / Frameの意味を確認します。

### Camera Settings

Camera 3Dと同系統のcamera settingsを持ち、手動入力だけでなく既存のCamera 3Dへ接続できます。

### Lens Distortion Model

21.1 Manualでは3DE Classic Model、3DE4 Anamorphic、3DE4 Radial Fisheye、3DE4 Radialが示されています。

Fusion Division RadialまたはFusion Radialを選ぶとCalibration tabが現れ、checkerboard等から歪みを解析できます。

### Supersampling

強いlens distortionでは画面端のsampling差が見えやすくなります。Supersamplingを上げると品質を上げられる代わりにrender時間も増えます。ModeはNearest / Bi-Linearを選べます。

### Load Distortion Data / Calibration

3D Equalizer等で作成したLens Distortion profileを読み込めます。

CalibrationではCalibrate TypeをCheckerboard / Lines、Calibrate ModeをAuto / Manualから選べます。lens parameterがないshotでは、checkerboardや本来直線であるべき線を基準に歪みを推定できます。

## 主な用途

- wide-angle lensで曲がった実写を平坦化し、CGを正しい直線・位置関係で合成する
- Undistortした実写へ3D elementを合成し、最後に同じ歪みを戻す
- 3D Equalizer等のlens profileを読み込み、shot間で同じlens modelを使う
- checkerboardや画面内の直線からlens distortionをcalibrationする

## 最小構成

```text
MediaIn
  ↓
Lens Distort 1 [Undistort]
  ↓
Merge / 3D composite
  ↓
Lens Distort 2 [Distort]
  ↓
MediaOut
```

前段と後段でlens model・camera settingsを揃え、ModeだけをUndistort / Distortへ分けます。

## 運用例

実写の壁へCG signを合成する場合、まず実写をUndistortし、平坦化したImage上でtracking・3D・Mergeを行います。合成結果の後段へ同設定のLens Distortを置いてDistortへ戻し、特に画面端で元実写と同じ曲がりになっているか確認します。

21.1 Manualでも、live-action layerをUndistortして3D elementsを合成し、最後に同設定をDistort modeで再適用する構成が示されています。

## Grid Warp / Displaceとの違い

- **Lens Distort** — lens modelやcalibrationに基づいて撮影レンズ由来の歪みを扱う
- **Grid Warp** — meshを手で動かして局所変形を作る
- **Displace** — 別Imageのchannel値を変位mapとして使う

## 挙動と注意点

Undistortでframe外へ押し出されたpixelを途中で破棄すると、Distortへ戻したときに必要な画素が欠ける場合があります。往復ではClipping Modeを確認します。

FusionのLens Distort Nodeと、Edit / Media InspectorのLens Correctionは別のcontrol surfaceです。

## 関連Node

- [Camera 3D](../3d/camera-3d)
- [Grid Warp](./grid-warp)
- [Displace](./displace)
- [Corner Positioner](./corner-positioner)
- [Perspective Positioner](./perspective-positioner)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2979–2981で、2入力、Undistort / Distort、Edges、Clipping Mode、Output Distortion Map、Camera Settings、Lens Distortion Model、Supersampling、Load Distortion Data、Calibrationを確認しました。

Edit / Media InspectorのLens Correctionが別機能であることは同Manual Chapter 19 p.431等でも確認しています。

全lens modelの数式、全既定値・数値範囲、内部REGID、実機performanceは未確認です。
