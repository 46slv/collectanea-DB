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
updated: "2026-10-22"
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

### Supersampling [HiQ] / Supersampling Mode [HiQ]

Supersamplingは、出力1画素を求める際のサンプル数です。21.1 Manualでは、通常の**1×1 Bilinear**で足りることが多い一方、強い歪みが出るレンズの画面端では、より多いサンプルとの差が見えると説明されています。サンプル数を増やすとrender時間も増えます。

Supersampling Modeはサンプルの取り方です。**Nearest**は輪郭がシャープですがaliasingが出やすく、**Bi-Linear**は比較的滑らかですがぼけが増えます。画面端の文字・建築物の線を見ながら、必要なshotでだけ品質を上げます。

### Load Distortion Data / Calibration

3D Equalizer等で作成したLens Distortion profileを読み込めます。

CalibrationではCalibrate Typeを**Checkerboard / Lines**、Calibrate Modeを**Auto / Manual**から選べます。Checkerboardは格子状のチャートがある撮影素材向けです。LinesはViewer上で本来直線のはずの線を指定し、その線が直線になるようにcalibrationを行います。Linesでは、現在の推定値を次の初期値として再解析するため、**Start Calibration**を繰り返すと結果が改善する場合があります。

Autoは現在の入力を基に自動追跡し、Manualは解析に使うフレームを選びます。Calibrationタブを使うには、Lens Distortion Modelで**Fusion Division RadialまたはFusion Radial**を選ぶ必要があります。

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

## 運用例：レンズデータがない撮影素材を合わせる

1. 撮影レンズの歪みを示す既存profileがあれば、まず**Load Distortion Data**で読み込みます。3D Equalizerなどで作成したデータを使う方法です。
2. profileがなく、撮影時のcheckerboardがあるなら、Lens Distortion ModelをFusion Division RadialまたはFusion Radialにして、Calibrationタブの**Checkerboard**を使います。
3. 格子チャートがなくても、建物の壁など本来直線のはずの線が明瞭なら、**Lines**を使って歪みを見積もる方法があります。歪んで見える線が直線になるか確認しながら調整します。
4. これらのデータが使えない場合は、**3DE Classic LD Model**の調整スライダーで手動の近似を試します。公式マニュアルも手動調整にはこのモデルが向く可能性を示しています。
5. 推定結果をUndistortで確認し、同じレンズ設定の別NodeをDistortにして往復させます。画面端の直線・切れ・CGとの位置関係を比較し、誤差が残れば設定を見直します。

キャリブレーションは「撮影レンズの真の光学情報」を自動復元する保証ではありません。素材内の参照線や格子が不十分な場合は、近似結果として扱います。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| UndistortからDistortへ戻すと画面端が欠ける | **Clipping Mode**がFrameで画素を破棄していないか。Domainとの違いを確認する。 |
| CGの直線と背景の曲がりが合わない | 前後のLens Distortで**Camera Settings / Lens Distortion Model**が一致し、Modeだけを切り替えているか。 |
| Calibrationタブが見つからない | Lens Distortion Modelが**Fusion Division Radial / Fusion Radial**か。 |
| 解析後も線が曲がる | 参照している線が本当に直線か、Linesの指定位置・Checkerboardの写り・使用フレームを見直す。 |
| 画面端がギザギザ／ぼける | **Supersampling [HiQ]**のサンプル数とNearest / Bi-Linearの違いを比較する。 |

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
