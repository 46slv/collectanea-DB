---
title: "sBSpline"
description: "B-SplineをShape domainへ生成。"
doc_type: node
term_id: "sbspline"
term_short: "sBSplineは、B-SplineをShape domainへ生成。"
verification: partial
aliases: ["sBSpline"]
concepts: ["shape-data"]
nodes: ["sBSpline"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
tasks: ["build-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# sBSpline

sBSplineは、少ないcontrol pointから滑らかな<Term id="shape-data">Shape</Term>を描くShape Generatorです。

sPolygonがBézier splineを使うのに対し、sBSplineは各pointがcurveを引っ張るB-Spline方式です。handleを個別に操作しなくても滑らかな輪郭を作れます。

## 入力と出力

Generatorなのでupstream Shape inputはありません。outputはShape dataで、sMerge / sDuplicate / sRender等へ接続します。

    sBSpline → sRender → Image

## pointを追加する

Viewerをclickするとpointが増え、各pointはcurveを直接通るのではなく、curveをその方向へ引っ張ります。

少ないpointで滑らかなorganic shapeを作りやすいのが特徴です。

## Animation

sBSplineはsPolygonと同様にauto-animateします。

Nodeを追加したcurrent frameにkeyframeが入り、別frameでshapeを変更すると新しいkeyframeが作られ、間がinterpolateされます。

## sPolygonとの違い

- **sBSpline** — 少ないpoint + smooth curve。handleなし
- **sPolygon** — Bézier handleで局所curveを細かく制御

## 運用例

柔らかいblob shapeやmotion graphicsのorganic outlineを作り、sDuplicate / sJitterで増やす場合に向きます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 117 pp.2732–2733で、B-Spline方式、control point、sPolygonとの違い、auto-animationを確認しました。
