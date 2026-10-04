---
title: Surface Tracker
description: clothやskinのように変形するsurfaceへmeshを作成してtrackingし、graphic・texture・effectをfoldやstretchに追従させるTracker。
doc_type: node
term_id: surface-tracker
verification: partial
aliases: [Surface Tracker, SFt]
concepts: [tracking, image-data, mask-data, mesh-warp]
nodes: [Surface Tracker]
node_family: tracking
controls: [Bounds, Mesh, Track, Result, Motion Range, Mesh Rigidity, Quality, Output, Overlay/Alpha Source, Contract/Expand, Softness, Motion Blur, Positioning, Composite Type, Opacity]
inputs: [image, image, mask, mask]
outputs: [image]
tasks: [surface-track, texture-attach, stabilize-surface]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Surface Tracker

Surface Trackerは、clothやskinのように**平面のままではなく曲がり・伸び・foldが変化するsurface**をmeshで追跡するNodeです。

Planar Trackerが1枚の平面変形を追うのに対し、Surface Trackerはmesh内部のpointごとに変形を追います。

## 入力

- Input — trackingするfootage
- Overlay — surfaceへ貼るstill / video / node result
- Occlusion Mask — tracking対象から除外する領域
- Effect Mask — 最終resultの適用範囲

## 4段階workflow

1. Bounds — trackingするsurface範囲を囲う
2. Mesh — fold / curveに沿うmesh pointを作る
3. Track — frame間のsurface変形を解析
4. Result — overlay / alpha / stabilize結果を出す

BoundsやMeshを変更すると既存tracking dataはresetされます。

## Tracking

Motion Rangeはmatch探索範囲、Mesh Rigidityはmeshの柔らかさ、Qualityは解析品質を調整します。

tracking途中でpointが外れた場合は、そのframeでmanual correctionしてから続行できます。

## Result

Manualでは代表的に:

- Warp Input 2 Onto 1
- Warp Input 2 Onto Blank
- Warp Input 1's Alpha
- Create Mesh Alpha Mask
- Stabilize-Warp Input 1
- Rewarp Stabilized Clip

を選べます。

Stabilize-Warpでsurfaceを一度止め、その間にpaint / retouchし、別Surface TrackerでRewarpするworkflowも可能です。

## Planar Trackerとの違い

- Planar Tracker — planeのperspective変化
- Surface Tracker — mesh内部のnon-rigid deformation

T-shirtのlogo replacementやskin tattoo等ではSurface Trackerが向きます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 119 pp.2830–2838で、4 inputs、Bounds / Mesh / Track / Result workflow、tracking controls、6 Result output、overlay placementを確認しました。
