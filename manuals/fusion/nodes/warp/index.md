---
title: Warp / Distortノード
description: displacement・grid・lens・perspective・vector fieldなどで2D Imageの座標を変形するNodeを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, warp-image, distort]
updated: "2026-10-05"
---

# Warp / Distortノード

Warp系Nodeは、2D Imageの**pixelをどこからsampleしてどこへ置くか**を変えるNodeです。

## まず選ぶ

- Displace — 別Imageを変位mapとして使う
- Grid Warp — mesh / gridを直接変形
- Lens Distort — lens distortion / undistortion
- Corner Positioner — 4 cornerでImageを合わせる
- Perspective Positioner — perspective controlで平面を合わせる
- Vector Warp / Vector Distortion / Vector Transform — vector dataでwarp
- Dent / Drip / Vortex — 特定形状のprocedural distortion
- Coordinate Space — coordinate transformを組み替える

## Map-drivenとmanual warp

Displace / Vector系は別Imageやvector dataをcontrol sourceに使います。Grid Warp / Corner PositionerはViewer上のcontrolを直接動かす用途です。

## Trackingとの関係

screen replacement等で平面の動きを追う場合、Planar Tracker / Planar Transformでmotionを解き、必要ならWarp系を追加します。warpとtrackを同じ調整に混ぜない方が原因を追いやすくなります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference ManualのWarp / Distort sectionと旧Fusion Tool Referenceを基に整理します。
