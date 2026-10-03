---
title: Classic 3D sceneを2Dへrenderする
description: Merge 3DでClassic Fusion 3D sceneをまとめ、Renderer 3Dで2D Imageへ変換する最小Recipe。
doc_type: recipe
verification: partial
aliases: [classic 3d render, Merge3D Renderer3D]
concepts: [classic-3d, data-domain]
patterns: [defer-domain-conversion]
nodes: [Merge 3D, Renderer 3D]
tasks: [3d, render-3d, convert-domain]
prerequisites: [data-domain]
level: intermediate
product_scope: fusion
---

# Classic 3D sceneを2Dへrenderする

## 作るもの

Classic Fusion 3D sceneを構成し、通常の2D 合成へ渡せるImageへrenderします。

## 必要なもの

- Classic 3D object / camera / light
- Merge 3D
- Renderer 3D

## 手順

1. Classic 3D objectを用意します。
2. Camera / Light等、必要な3D elementをMerge 3Dへまとめます。
3. Merge 3D outputをRenderer 3Dへ接続します。
4. Renderer 3Dの2D outputをViewerで確認します。
5. 通常の2D Image処理へ進む場合はRenderer 3D以降へMerge / Color / Blur等を接続します。

```text
3D object ─┐
Camera ────┼─ Merge 3D → Renderer 3D → 2D Image
Light ─────┘
```

## この構成で動く理由

Merge 3DはClassic 3D scene domainを維持し、Renderer 3Dが2D Imageへrasterizeします。

## 別の方法

- Image Plane 3Dをsceneへ追加する。
- Material / Textureを3D objectへ接続する。
- USDを使う場合はClassic 3D pipelineと混ぜず、u* toolsetへ分ける。

## うまくいかないとき

- Merge 3D outputを通常2D Mergeへ直接渡していないか。
- Renderer 3D前にClassic 3D sceneとして成立しているか。
- uMerge / uRendererと混同していないか。
- Renderer 3D outputをViewerで確認しているか。

## 関連パターン

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 関連Node

- [Merge 3D](../../nodes/3d/merge-3d)
- [Renderer 3D](../../nodes/3d/renderer-3d)
