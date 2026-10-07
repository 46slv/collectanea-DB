---
title: Camera Tracker
description: 2D footage内の多数のfeatureからlive-action cameraの3D motionを復元し、Camera 3DとPoint Cloudを生成するTracker。
doc_type: node
term_id: camera-tracker
term_short: Camera Trackerは、2D footageから3D camera motionとPoint Cloudを復元するNode。
verification: partial
aliases: [Camera Tracker, CTra]
concepts: [tracking-data, classic-3d]
nodes: [Camera Tracker]
node_family: tracking
controls: [Auto Track, Camera, Focal Length, Film Gate, Solve, Accept Solve Error, Auto Select Seed Frames, Refine Focal Length, Export, 3D Scene Transform]
inputs: [image, mask]
outputs: [tracking, 3d-scene]
tasks: [track-motion, camera-track, solve-camera, 3d-match-move]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Camera Tracker

Camera Trackerは、2D footage内の多数のfeatureを解析し、撮影cameraの3D movementを復元するNodeです。

結果としてvirtual Camera 3DとPoint Cloudを作り、live-action footageへ3D elementを合わせるために使います。

## 役割

Camera Trackerは2Dのfeature movementから3D sceneを再構成します。

```text
Footage
  ↓
Camera Tracker
  ↓ Track
  ↓ Solve
  ↓ Export
Camera 3D + Point Cloud + 3D scene
```

平面へ2D graphicを貼るだけならPlanar Trackerの方が直接的です。Camera Trackerは3D objectを実写sceneへ置く場合に使います。

## 入力

### Background

オレンジ色の入力です。camera movementを解析する2D Imageを接続します。

### Occlusion Mask

白色の任意入力です。

camera movementと無関係に動く領域など、analysisから除外したい範囲をMaskで指定します。白い領域はtracking対象から除外されます。

## Workflow

Camera TrackerはInspectorのtabをおおむね作業順に使います。

1. **Track** — footageのfeatureを解析
2. **Camera** — 実写cameraの基本情報を設定
3. **Solve** — feature movementから3D cameraとpoint位置を計算
4. **Export** — Camera 3D、Point Cloud等をNode Editorへ作成
5. **Options** — Viewer上のtrack表示を調整

## Track

### Auto Track

解析可能なfeatureを自動検出し、frame間で追跡します。

Detection ThresholdやMinimum Feature Separationで、検出するfeature数や分布を調整できます。

良いcamera solveでは、sceneに固定されているfeatureを使うことが重要です。camera movementとは別に動く領域やreflection等をtrackへ混ぜるとsolve精度が下がる場合があります。

## Camera tab

solverへ実写cameraの情報を与えます。

代表的な項目:

- **Focal Length**
- **Film Gate**
- **Aperture Width / Height**
- **Resolution Gate Fit**
- **Center Point**
- **Source Pixel Aspect**

撮影時のcamera / lens情報が分かる場合は、より正確な初期条件を与えられます。

## Solve

tracking dataからcamera pathと3D point cloudを計算します。

### Accept Solve Error

solverが許容するsolve errorの基準です。

solveが十分でない場合は、誤ったtrackを整理し、camera informationを見直して再Solveします。

### Auto Select Seed Frames

Solve開始の基準になる2 frameを自動選択します。

Manualでは、2 frameは共通するtrackが多く、同時にperspective差も十分あることが重要と説明されています。

### Refine Focal Length / Lens Parameters

solverにfocal lengthやlens distortion parameterの調整を許可できます。

known focal lengthを固定したい場合はCamera tab側の値を使い、solverに変更させる必要があるかを分けて考えます。

## Export

Solve後、Exportから3D match move用のNodeを生成します。

21.1 Manualでは代表的に次が作られます。

- Camera 3D
- Point Cloud 3D
- ground plane用Shape 3D
- Merge 3D
- Renderer 3D

Camera Tracker Node自体に大量の2D track dataを保持し続けるより、solve確定後にExportして通常の3D Nodeへ分ける方が軽く扱える場合があります。

## 3D Scene Transform

Solveしたcamera movementそのものを変えず、virtual 3D sceneのground plane、origin、scaleを実写sceneへ合わせます。

3D objectを置きやすくするためのscene alignmentです。

## 最小構成

```text
MediaIn → Camera Tracker
             ↓ Solve / Export
        Camera 3D
        Point Cloud 3D
        Merge 3D
        Renderer 3D
```

Export後はPoint Cloudを3D Viewerで見ながら、実写sceneに対応する位置へ3D elementを配置します。

## Planar Trackerとの違い

- **Tracker** — point / small featureの2D movement
- **Planar Tracker** — planeのperspective movement
- **Camera Tracker** — camera自身の3D movementとscene pointを復元

2D sign replacementにCamera Trackerを使う必要は通常ありません。camera movementと3D sceneの関係が必要なときに選びます。

## 関連する考え方

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## 関連Node

- [Tracker](./tracker)
- [Planar Tracker](./planar-tracker)
- [Merge 3D](../3d/merge-3d)
- [Renderer 3D](../3d/renderer-3d)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 119 pp.2803–2819とFusion Fundamentals Chapter 85で、2入力、Track / Camera / Solve / Export / Options、camera parameter、solver、Point Cloud、Export構成、3D Scene Transformを確認しました。

solver内部アルゴリズム、適切なerror値のshot別基準、実機性能、Edition差は未確認のため `verification: partial` としています。
