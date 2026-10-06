---
title: uCamera
description: USD sceneへvirtual cameraを追加または既存cameraをoverrideし、Perspective / Orthographic・Focal Length・Film Back・Depth of Fieldを設定するNode。
doc_type: node
term_id: ucamera
verification: partial
aliases: [uCamera, uCa]
concepts: [usd-scene, camera, scene-tree]
nodes: [uCamera]
node_family: usd
controls: [Override Selection, Projection Type, Near/Far Clip, Focal Length, Focal Distance, F Stop, Film Back, Aperture, Lens Shift, Shutter, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, camera, frame-scene]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uCamera

uCameraは、<Term id="usd-scene">USD scene</Term>へvirtual cameraを追加したり、import済みUSD内cameraをoverrideするNodeです。

## 入力 / 出力

黄色のScene InputへUSD sceneを接続できます。

uCamera単体をViewerへ出しても見る対象がないため、通常はuMergeへcameraを組み込み、uMerge以降をViewerで表示してcameraを選びます。

## Override Selection

PickからScene Treeを開き、import済みUSD内の特定cameraを選択して設定をoverrideできます。

## Projection Type

Perspective / Orthographicを選べます。

PerspectiveではFocal Length / Film Backがviewへ影響し、Orthographicではperspective distortionなしにsceneを見ます。

## Camera controls

- Near / Far Clip
- Focal Length
- Focal Distance
- F Stop
- Horizontal / Vertical Aperture
- Lens Shift
- Shutter Open / Close
- Stereo Role

を持ちます。

Focal Distance / F StopはDepth of Field計算に使われます。

## Viewerとrender frame

ViewerのaspectとcameraのFilm Backが一致しない場合があります。

Frame Aspect Guideを表示し、uRendererが実際にrenderする範囲を確認します。

## 最小構成

```text
uLoader ──┐
uCamera ──┼─ uMerge → uRenderer
          ┘
```

## Camera 3Dとの違い

- **uCamera** — USD
- **Camera 3D** — Classic 3D

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2889–2892で、Scene Input、Scene Tree override、Projection Type、clipping、Focal Length、Focal Distance、F Stop、Film Back等を確認しました。

21で追加されたprojection関連はuProjector / uCamera projection節と併せて扱います。
