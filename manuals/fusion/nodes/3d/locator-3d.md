---
title: Locator 3D
description: Classic 3D scene内のpointをcamera viewの2D screen coordinateへ変換し、Mask Center等のControlへ接続できる位置dataを公開するNode。
doc_type: node
term_id: locator-3d
term_short: Locator 3Dは、3D位置をcamera viewの2D座標へ変換して他Controlから使えるようにするNode。
verification: partial
aliases: [Locator 3D, 3Lo]
concepts: [classic-3d, parameter-data, coordinate-space]
nodes: [Locator 3D]
node_family: 3d
controls: [Size, Color, Sub ID, Make Renderable, Camera, Use Frame Format Settings, Width, Height, Pixel Aspect]
inputs: [classic-3d, classic-3d]
outputs: [classic-3d, parameter]
tasks: [3d-to-2d-position, connect-to, track-3d]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Locator 3D

Locator 3Dは、<Term id="classic-3d">Classic 3D scene</Term>内のpointを、指定Cameraから見た2D screen coordinateへ変換するNodeです。

変換したPositionはparameter outputとして公開され、Ellipse MaskのCenterやTextのposition等へConnect Toできます。

## 入力

### Scene Input

必須の3D scene入力です。projectionに使うCameraもこのscene内に含めます。

### Target

任意の3D scene / object入力です。接続するとTarget objectのtransform centerをLocator位置として使い、LocatorのTransform値はそのoffsetになります。

## 2D Positionを使う

たとえばEllipse MaskのCenterをConnect To > Locator 3D > Positionへ接続すると、3D object位置に2D Maskを追従できます。

## 主な設定

### Camera

3D→2D座標変換に使うCameraをscene内から選びます。

### Width / Height / Pixel Aspect

2D座標へ変換するframe dimensionsです。Renderer 3Dが出力するImageと同じformatに合わせます。

Use Frame Format Settingsを有効にするとcomposition設定を使います。

### Sub ID

Text 3Dの特定characterやDuplicate 3Dの特定copy等、object内部のsub-elementを選ぶ用途があります。

### Make Renderable

Locatorのcrosshair自体をOpenGL renderへ含めるかを決めます。通常はposition data取得が主目的です。

## 最小構成

Object / Camera → Merge 3D → Locator 3D
                           └ Position → 2D Control

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1955–1956で、Scene / Target input、3D→2D conversion、Camera / frame format、published Positionを確認しました。
