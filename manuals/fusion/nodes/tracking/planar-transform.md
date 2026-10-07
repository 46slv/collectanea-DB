---
title: Planar Transform
description: Planar Trackerの解析結果をImageやMaskへ適用し、graphicやroto shapeを平面の動きへ合わせるNode。
doc_type: node
term_id: planar-transform
verification: partial
aliases: [Planar Transform, PXF]
concepts: [tracking, coordinate-space, parameter-data]
nodes: [Planar Transform]
node_family: tracking
controls: [Reference Time, Track Spline]
inputs: [image, mask]
outputs: [image]
tasks: [track, apply-track, attach-graphics, roto]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Planar Transform

Planar Transformは、[Planar Tracker](./planar-tracker)で解析した平面の動きを、別の2D <Term id="image">Image</Term>や<Term id="mask">Mask</Term>へ適用するNodeです。

Planar Trackerが解析を担当し、Planar Transformがその結果の再利用を担当します。

## 作成方法

Planar Trackerで解析した後、Inspectorの **Create Planar Transform** を押します。

作成されたPlanar TransformはPlanar TrackerのTrack splineを共有します。元のtrackを変更すると、Planar Transformにも反映されます。

## 入力

### Image Input

オレンジ色の入力です。平面の動きを適用したい2D Imageを接続します。

### Effect Mask

青色の任意入力です。Planar Transformのoutputを適用する範囲を限定します。

## 出力

Planar Trackerで得たperspective変化が適用された2D Imageを出力します。

## 主な設定項目

### Reference Time

Planar Trackerでpatternを取得した基準frameです。

### Track Spline

Planar Trackerが作ったperspective変化のdataです。Spline Editorでtracked frameの範囲を確認できます。

## Graphicへ使う

```text
Footage → Planar Tracker
               ↓ Create Planar Transform

Graphic → Planar Transform → Merge
```

Graphic固有の位置・大きさ調整と、平面のmovementを別段階にできます。

## Mask / Rotoへ使う

Polygon等のMaskへPlanar Transformを適用し、roughなmovementを先に合わせることもできます。

```text
Polygon Mask → Planar Transform → Effect Mask
```

対象が完全な平面でない場合は、Planar Transformだけで輪郭が完全に合うとは限りません。Manualでは、まずplanar movementを適用し、ずれるframeでpolylineを修正するworkflowが説明されています。

## Transformとの違い

- **Transform** — Center / Size / Angle等を手動またはanimationで指定
- **Planar Transform** — Planar Trackerの解析結果を使ってperspective変化を適用

## 関連する考え方

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)
- [トラッキング結果がずれる / driftする](../../troubleshooting/tracking/track-drifts)

## 関連Node

- [Planar Tracker](./planar-tracker)
- [Tracker](./tracker)
- [Transform](../transform/transform)
- [Polygon Mask](../masks/polygon-mask)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 120 pp.2870–2872とFusion Fundamentals Chapter 80 / 82で、Image / Effect Mask入力、Create Planar Transform、Reference Time、共有Track spline、Image / Maskへの適用を確認しました。

solver内部仕様、実機性能は未確認のため `verification: partial` としています。
