---
title: Classic 3Dノード
description: Classic 3Dのデータとカメラの使い分け、Renderer 3Dへの接続、360°制作例を解説。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, build-3d-scene, render-3d]
updated: "2026-10-10"
---

# Classic 3Dノード

Classic 3Dは、Geometry・Camera・Lightを同じ<Term id="classic-3d">3D scene</Term>へまとめ、Renderer 3Dで2D Imageへ戻すFusion固有の3D pipelineです。

概念から確認する場合は[Classic 3D scene](../../learn/02-data/classic-3d)を参照してください。

## 最小構成

```text
Geometry ───┐
Camera 3D ──┼─ Merge 3D → Renderer 3D → Image
Light ──────┘
```

## 3Dシーンと2D画像

Shape 3DやText 3Dは、平面のピクセル画像ではなく**形状や位置を持つ3Dシーン**を作ります。Merge 3Dは物体、カメラ、ライトを同じ空間へまとめるNodeです。通常の2D Mergeは完成した画像を重ねるNodeなので、同じMergeという名前でもデータの種類が違います。

| Node | データ | 役割 |
| --- | --- | --- |
| Shape 3D / Text 3D | 3Dシーンを出力 | 立体を作る |
| Camera 3D / Spherical Camera | 3Dシーンを出力 | 見る位置・方向・画角を決める |
| Merge 3D | 3Dシーンを結合 | 物体・カメラ・ライトをまとめる |
| Renderer 3D | **3Dシーン → 2D画像** | 実際の画素を描く |
| 2D Merge / Blur | 2D画像を入力 | 出力したCGを実写と合成・補正する |

Renderer 3Dの**SceneInput**（オレンジ）は3Dシーンの必須入力、**EffectMask**（青）は出力を制限するための任意の2Dマスク入力です。EffectMaskへ3Dの形状を追加することはできません。

## 作る

- [Shape 3D](./shape-3d) — Plane / Cube / Sphere / Cylinder等のprimitive
- [Cube 3D](./cube-3d) — 6面へ個別textureを割り当てられるCube
- [Text 3D](./text-3d) — extrusion / bevelを持つ3D text
- [Image Plane 3D](./image-plane-3d) — 2D Imageを3D cardへする
- [Ribbon 3D](./ribbon-3d) — line/ribbon geometry
- [FBX Mesh 3D](./fbx-mesh-3d) / [Alembic Mesh 3D](./alembic-mesh-3d) — 外部geometry

## 変える

- [Transform 3D](./transform-3d) — scene / objectへ追加Transform
- [Duplicate 3D](./duplicate-3d) — 連続Transform付きで複製
- [Replicate 3D](./replicate-3d) — vertices等へobjectを配置
- [Bender 3D](./bender-3d) — geometryを曲げる
- [Displace 3D](./displace-3d) — Image channelでvertex displacement
- [Weld 3D](./weld-3d) — 近接position vertexをweld
- [UV Map 3D](./uv-map-3d) — UV mappingを調整

## Sceneを組む

- [Merge 3D](./merge-3d) — Geometry / Camera / Light / sceneを統合
- [Camera 3D](./camera-3d) — 3Dシーンを通常の画角で撮るカメラ
- [Spherical Camera](../immersive/spherical-camera.md) — 周囲全方向を撮る球面カメラ（3Dシーンを出力）
- [Projector 3D](./projector-3d) — Imageをscene geometryへprojection
- [Override 3D](./override-3d) — upstream objectのVisibility / Lighting / Matte等を一括override

## カメラの使い分け

通常の実写合成や3Dタイトルには[Camera 3D](./camera-3d.md)を使います。Perspective（遠近投影）やOrthographic（平行投影）を選び、焦点距離や撮像面の大きさで構図を調整できます。

CGの部屋を360°背景、スカイボックス、反射用画像として描画する場合は[Spherical Camera](../immersive/spherical-camera.md)を使います。LayoutでLatLong（2:1）、HCross／VCross、HStrip／VStrip、VR180などの配置形式を選びます。Spherical Cameraは**3Dカテゴリにあるカメラ**です。既存URLとの互換性のため個別記事はImmersive配下にありますが、2Dエフェクトではありません。撮影済みの球面画像を別形式に変換するだけなら[PanoMap](../immersive/panomap.md)を使います。

## Material / Light

- [OpenPBR](../materials-lights/openpbr) — PBR material
- [Directional Light](../materials-lights/directional-light) — 平行光
- [Point Light](../materials-lights/point-light) — 1点から全方向へ照射
- [Spot Light](../materials-lights/spot-light) — cone形状のlight
- [3D Material / Lightノード](../materials-lights/) — MaterialとLight全体

## 2Dへ戻す

- [Renderer 3D](./renderer-3d) — Classic 3D scene → 2D Image

3D sceneの途中で通常の2D BlurやMergeを使うのではなく、Renderer 3DでImageへ変換した後に使います。

## 具体的な接続例

### 3Dタイトルを実写に重ねる

~~~text
Text 3D ────┐
Camera 3D ──┼→ Merge 3D → Renderer 3D ─┐
Light ──────┘                           ├→ 2D Merge → 出力
実写映像 ───────────────────────────────┘
~~~

Renderer 3Dの画像を2D Mergeの**Foreground**へ、実写を**Background**へつなぎます。3Dシーンを2D Mergeに直接接続することはできません。

### CGから360°画像を作る

~~~text
Shape 3D（周囲の物体） ──┐
Spherical Camera ────────┼→ Merge 3D → Renderer 3D → LatLong画像
~~~

Spherical Cameraを空間の中心付近に配置し、LayoutをLatLongへ設定します。カメラが複数ある場合はRenderer 3Dの**Camera**でSpherical Cameraを選んでください。Defaultではシーンで最初に見つかったカメラが使われます。Cube系ではRenderer 3Dの**Image Width**は各正方形の面の幅を決めます。たとえばHStripの1面512pxなら、6面を並べた画像は3072×512pxになります。

これらはManualに基づく構成例であり、実機で出力を確認した結果ではありません。

## うまく接続できないとき

- **3Dシーンを2D Blurへつなげない**：Renderer 3Dで先に2D画像へ変換します。
- **レンダリングした構図が違う**：Renderer 3DのCamera設定を確認します。
- **球面画像にならない**：Spherical CameraのLayoutと、Renderer 3Dが使うカメラを確認します。
- **ライトを有効にすると物体が暗い**：シーン内のライトとLighting設定を確認します。

## 関連する考え方

- [Classic 3D scene](../../learn/02-data/classic-3d)
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 出典と確認範囲

接続と球面撮影については、DaVinci Resolve 21.1 Reference Manual、Chapter 88（Camera 3D pp.1919–1920／Renderer3D pp.1970–1971／Spherical Camera pp.1995–1996）およびChapter 122（Spherical Camera p.2955）を確認しました。

DaVinci Resolve 21.1 Reference Manual Chapter 88–90とFusion Fundamentals Chapter 84を基に整理しています。

個別Nodeの全Control、renderer差、外部file format制約は各Referenceへ分けます。
