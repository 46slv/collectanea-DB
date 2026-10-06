---
title: Camera 3D
description: Classic 3D sceneのviewpointを決め、Perspective / Orthographic、Focal Length、Film Gate、Depth of Field、Camera Projectionを扱うvirtual camera。
doc_type: node
term_id: camera-3d
verification: partial
aliases: [Camera 3D, Camera3D, 3Cm]
concepts: [classic-3d, camera, projection]
nodes: [Camera 3D]
node_family: 3d
controls: [Projection Type, Near/Far Clip, Adaptive Near/Far Clip, Viewing Volume Size, Angle of View, Focal Length, Film Gate, Plane of Focus, Stereo Method, Eye Separation, Convergence Distance, Camera Projection]
inputs: [classic-3d, image, camera]
outputs: [classic-3d]
tasks: [build-3d-scene, camera, projection, stereo]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Camera 3D

Camera 3Dは、<Term id="classic-3d">Classic 3D scene</Term>をどこから見るかを決めるvirtual cameraです。

実写cameraに近いFocal Length / Film Gate / clipping設定を持ち、camera animation、stereo、2D Imageのcamera projectionにも使えます。

## 入力

### Scene Input

オレンジ色の任意inputです。3D scene / objectをcameraと同じoutputへまとめます。

### Image Input

magentaの任意inputです。2D Imageをcamera image planeやprojection sourceとして使います。

Imageを接続するとImage Plane / Projection関連tabが表示されます。

### Right Stereo Camera

緑色の任意inputです。stereo renderでright-eye cameraを別Camera 3Dから与える場合に使います。

## Projection Type

### Perspective

通常のreal cameraに近いperspective projectionです。

近いobjectは大きく、遠いobjectは小さく見えます。

### Orthographic

perspective distortionのないparallel projectionです。

cameraからのZ距離ではobject sizeが変わらず、Viewing Volume Sizeで見える範囲を決めます。

## Focal Length / Angle of View

Focal LengthとAngle of Viewは連動します。

短いFocal Lengthでは広角になり、長いFocal Lengthでは狭いviewになります。

実写footageへ3Dを合わせる場合は、撮影cameraのFocal LengthとFilm Gateをできるだけ合わせます。

## Near / Far Clip

cameraから近すぎる / 遠すぎるgeometryをrender対象から外します。

NearとFarのrangeを必要以上に広くするとdepth precisionが下がるため、artifactが出る場合はclipping rangeも確認します。

Adaptive Near/Far Clipを使うとscene boundsから自動調整できます。

## Plane of Focus

OpenGL rendererのDepth of Fieldで焦点距離を決めます。

3D ViewerでFocal Plane表示を有効にすると、どこへfocusがあるか確認できます。

## Camera Projection

Image Inputへ2D Imageを接続すると、cameraからgeometryへImageをprojectionできます。

Projection ModeにはLight / Ambient Light / Texture等があり、projectionをlightingとして使うかtextureとして使うかを選べます。

Texture modeではCatcher material等、別のMaterial構成が必要になります。

## 最小構成

```text
Shape 3D ──┐
Camera 3D ─┼─ Merge 3D → Renderer 3D
           ┘
```

ViewerでMerge 3Dを表示し、Camera submenuからCamera 3Dを選ぶとcamera viewpointを確認できます。

## Camera Trackerとの関係

Camera Trackerで3D solveした場合、ExportされたCamera 3DをClassic 3D sceneへ使います。

Camera Trackerはcamera motionを解析するNode、Camera 3Dは解析結果や手動animationを使ってsceneをframingするNodeです。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1918–1927とFusion Fundamentals Chapter 84で、3 input、Projection Type、Near/Far Clip、Focal Length / Angle of View、Film Gate、Plane of Focus、stereo、Camera Projectionを確認しました。

実機のcamera import互換性、rendererごとのDoF差、stereo deliveryは未確認です。
