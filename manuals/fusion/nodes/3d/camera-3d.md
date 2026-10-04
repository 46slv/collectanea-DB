---
title: Camera 3D
description: Classic 3D sceneのviewpointを定義し、Perspective / Orthographic、lens、clip plane、stereo、camera projectionを扱うNode。
doc_type: node
term_id: camera-3d
term_short: Camera 3Dは、Fusion Classic 3D sceneをどこからどう見るかを定義するvirtual camera。
verification: partial
aliases: [Camera 3D, Camera3D, 3Cm]
concepts: [classic-3d, camera, projection]
nodes: [Camera 3D]
node_family: 3d
controls: [Projection Type, Near/Far Clip, Adaptive Near/Far Clip, Viewing Volume Size, Angle of View, Focal Length, Plane of Focus, Stereo, Eye Separation, Convergence Distance, Film Gate, Resolution Gate Fit]
inputs: [classic-3d, image, camera]
outputs: [classic-3d]
tasks: [camera-3d, frame-scene, projection, stereo]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Camera 3D

Camera 3Dは、<Term id="classic-3d">Classic 3D scene</Term>をどこから、どのlens / field of viewで見るかを定義するvirtual cameraです。

camera movementのanimation、Perspective / Orthographic切り替え、depth of field用focus、stereoscopic setup、2D Imageのcamera projectionも扱います。

## 入力

### Scene Input

オレンジ色の任意入力です。3D geometryをcameraへparentする、またはprojection対象sceneとして扱います。

### Image Input

magentaの任意入力です。2D Imageをcamera image planeまたはcamera projectionへ使います。接続するとImage Plane / Projection / Materials系tabが現れます。

### Right Stereo Camera

緑色の任意入力です。stereo renderでright eye用cameraを外部Camera 3Dへ置き換えます。

## 主な設定

### Projection Type

- Perspective — 実写cameraに近いperspective projection
- Orthographic — distanceでobject sizeが変わらないparallel projection

### Near / Far Clip

cameraから近すぎる / 遠すぎるgeometryをrender対象外にします。

Adaptive Near/Far Clipが有効な場合、scene範囲に合わせて自動調整されます。

### Angle of View / Focal Length

lensの広角・望遠を決めます。両者は連動し、短いfocal lengthほど広いangle of viewになります。

### Plane of Focus

Renderer 3Dのdepth of fieldでfocus distanceを決めます。

### Stereo

Eye Separation、Convergence Distance、stereo method等を設定します。

## Camera Projection

Image Inputへ2D Imageを接続すると、camera viewに一致したImage Planeとして使うか、scene geometryへprojectionできます。

Projector 3Dよりもcamera自身とprojectionが厳密に一致する構成が必要な場合に使えます。

## 基本構成

Shape 3D / Light / Camera 3D → Merge 3D → Renderer 3D

Camera単体をViewerへ出してもscene objectは見えません。Cameraを含むMerge 3D以降をViewerへ出し、ViewerのCamera menuからcamera viewを選びます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1919–1927で、3入力、Perspective / Orthographic、clip plane、Focal Length / Angle of View、focus、stereo、camera projectionを確認しました。

renderer別DOF品質や実機performanceは未確認です。
