---
title: 3D Material / Lightノード
description: Classic 3DのMaterial・Texture・Lightを、surfaceの見た目とscene lightingの役割から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, shade-3d, light-3d]
updated: "2026-10-04"
---

# 3D Material / Lightノード

このFamilyでは、Classic 3D sceneのsurface appearanceとlightingを扱います。

Geometryを作るNodeとは別に、**surfaceへ何を貼るか / どう反射させるか**をMaterialで決め、**どこからどんな光を当てるか**をLightで決めます。

## Materialを選ぶ

- [OpenPBR](./openpbr) — modern PBR material。Base / Specular / Transmission / Coat等を統合
- [Phong](./phong) — classic Phong shading
- [Blinn](./blinn) — Blinn shading
- [Cook Torrance](./cook-torrance) — microfacet系specular
- [Ward](./ward) — anisotropic highlight
- [Bumpmap](./bumpmap) — Imageからsurface normal perturbation
- [Reflect](./reflect) — reflection成分
- [Material Merge 3D](./material-merge-3d) — Material同士の合成
- [Texture](./texture) / [Texture Transform](./texture-transform) — texture mappingの制御

## Lightを選ぶ

| Light | 特徴 |
| --- | --- |
| [Ambient Light](./ambient-light) | scene全体へ方向のないbase illumination |
| [Directional Light](./directional-light) | 太陽のような平行光。positionよりrotationが重要 |
| [Point Light](./point-light) | 電球のように1点から全方向へ照射 |
| [Spot Light](./spot-light) | position / direction / coneを持つspotlight |
| Dome Light | HDR / SDR Imageでsceneを包むenvironment light |

## Lightingが見えないとき

3D ViewerではLighting / Shadows表示を有効にします。

Renderer 3DでもEnable Lighting / Enable Shadowsを確認します。Light Nodeがsceneへ接続されていても、この設定が無効なら最終renderへ反映されません。

## Lightのscope

Merge 3DのPass Through Lightsは、upstream Merge 3DにあるLightがdownstream objectへも作用するかを決めます。

```text
Object A + Light A → Merge 3D A
                        ↓
Object B ─────────→ Merge 3D B
```

Pass Through Lightsを使うと、Light AをObject Bまで届かせるかをScene hierarchyで分けられます。

## Material input

Shape 3DやImage Plane 3D等のMaterial inputは、2D Imageまたは3D Materialを受け取る場合があります。

2D Imageをつなぐとbuilt-in materialのdiffuse textureとして使い、専用Materialをつなぐとbuilt-in materialが置き換わるNodeがあります。

## 関連する考え方

- [Classic 3D scene](../../learn/02-data/classic-3d)
- [Classic 3Dノード](../3d/)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 89–90とFusion Fundamentals Chapter 84を基に整理しています。

Material modelごとの数式、Light shadow renderer差、GPU依存挙動は個別Referenceと実機確認へ分けます。
