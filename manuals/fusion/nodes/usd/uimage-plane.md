---
title: uImage Plane
description: 2D Imageをaspect比に合わせたplane geometryへ貼り、USD scene内のcardとして配置するNode。
doc_type: node
term_id: uimage-plane
verification: partial
aliases: [uImage Plane, uImagePlane, uIm]
concepts: [usd-scene, image-data, geometry]
nodes: [uImage Plane]
node_family: usd
controls: [Filename, Size, Transform]
inputs: [image]
outputs: [usd]
tasks: [usd, image-card, set-extension]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uImage Plane

uImage Planeは、2D <Term id="image">Image</Term>をplane geometryへ貼り、<Term id="usd-scene">USD scene</Term>内のcardとして使うNodeです。

入力Imageのaspect比がplaneへ反映されるため、matte painting、background plate、screen等を3Dへ置く用途に向きます。

## 入力

黄色のImage InputへMediaInやGenerator等の2D Imageを接続します。

Imageを直接pipeする代わりにFilenameからfileを読み込むこともできます。

## Size / Transform

Sizeでplane全体の大きさを調整し、共通Transform controlsでscene内位置・rotation・scaleを決めます。

## 最小構成

```text
MediaIn → uImage Plane ─┐
uCamera ────────────────┼─ uMerge → uRenderer
                        ┘
```

## Classic Image Plane 3Dとの違い

- **uImage Plane** — USD
- **Image Plane 3D** — Classic 3D

見た目は似てもscene domainが異なります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2901–2902で、Image Input、Filename、Size、input aspectをplaneへ反映することを確認しました。
