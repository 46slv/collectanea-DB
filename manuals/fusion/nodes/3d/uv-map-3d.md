---
title: "UV Map 3D"
description: "Classic 3DのmeshへUV/UVW texture座標を作り直し、平面・円柱・球・Cube・Cameraによるmappingを設定するNode。"
doc_type: node
term_id: "uv-map-3d"
term_short: "UV Map 3Dは、3D geometryの各頂点にtextureを貼る位置（UV/UVW座標）を設定し直すNode。画像やMaterialそのものは貼りません。"
verification: partial
aliases: ["UV Map 3D", "3UV"]
concepts: ["classic-3d"]
nodes: ["UV Map 3D"]
node_family: "3d"
controls: ["Map Mode", "Orientation X/Y/Z", "Fit", "Center", "Lock UVs on Animated Objects", "Ref Time", "Size X/Y/Z", "Center X/Y/Z", "Rotation/Rotation Order", "Tile U/V/W", "Flip U/V/W", "Flip Faces"]
inputs: ["classic-3d", "camera"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "projection"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# UV Map 3D

UV Map 3D [3UV]は、**3D objectの表面のどこにtexture画像のどの位置を対応させるか**を決めるNodeです。<Term id="classic-3d">Classic 3D scene</Term>のmeshが持つUV/UVW座標を作り直します。

UVは、3D表面を2D画像へ対応づけるための座標です。たとえば円柱の周囲にラベルを巻く場合、円周方向に画像の横幅、円柱の高さ方向に画像の縦幅を対応させます。元のmodelのUVが合わないときや、別の方法で貼り直したいときにUV Map 3Dを使います。

**このNodeは画像やMaterialを貼りません。** 入力されたgeometryのtexture座標を変更するだけです。実際の色や模様は、[Shape 3D](./shape-3d.md)などへ接続したMaterialがその座標を参照して表示します。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、次の入力が説明されています。

- **Scene Input**（orange、必須）: UVを設定し直す3D objectまたはsceneを受け取ります。
- **CameraInput**（任意）: [Camera 3D](./camera-3d.md)の出力を受け取ります。**Map ModeをCameraにした場合だけ**表示されます。
- **Output**: UV/UVW座標を変更したClassic 3D object / sceneを返します。2D Imageを出力するNodeではありません。

UV Map 3Dへ2D画像を直接接続する入力はありません。CameraInputも「投影する画像」ではなく、座標を決めるためのcameraを渡す入力です。

## Map Mode：UVをどの形で割り当てるか

**Map Mode**は、3D geometryへ仮想的な投影形状を当てはめ、各頂点のtexture座標を計算する方法です。

| Mode | UV/UVWの作り方 | 使いどころ |
| --- | --- | --- |
| **Planar** | 平面から座標を割り当てる | 壁、床、正面を向く板など |
| **Cylindrical** | 円柱を基準に座標を割り当てる | 缶や柱の周囲へ模様を回す |
| **Spherical** | 球を基準に座標を割り当てる | 球体を包むように模様を置く |
| **XYZ to UVW** | 頂点の位置座標をそのままUVWに変換する | 座標を利用するprocedural texture |
| **CubeMap** | 立方体を基準に座標を割り当てる | 箱の各面に対応するmapping |
| **Camera** | Camera 3Dから見た投影を基準に座標を割り当てる | 特定の視点に合わせて写真を3D表面へ配置する |

ここで変わるのはtexture座標で、3D objectの頂点位置や形そのものではありません。個々の頂点UVをViewer上でつかんで直接編集する機能もありません。Viewerのmapping表示は参照用です。

## Mappingの位置・向き・繰り返し

Inspectorの**Controls**には、選んだMap Modeの投影範囲を調整する項目があります。

- **Orientation X/Y/Z**: mappingを揃える基準軸を選びます。
- **Fit**: 入力sceneのbounding box（objectの外接範囲）へmappingを合わせます。
- **Center**: mappingの中心を入力sceneのbounding boxの中心へ移します。
- **Size X/Y/Z**: 投影に使う仮想形状の大きさを調整します。
- **Center X/Y/Z**: その仮想形状の位置を調整します。
- **Rotation X/Y/Z、Rotation Order**: 向きと回転順序を調整します。
- **Tile U/V/W**: 対応する方向でtexture座標の繰り返し量を調整します。画像そのものを複製するのではなく、UV/UVWの値を変えます。
- **Flip U/V/W**: 対応する座標方向を反転します。
- **Flip Faces**: **CubeMap Mode専用**。Cubeの各面のtexture座標を反転します。

元のtextureが横に引き伸ばされる場合はSizeやTileを、向きが違う場合はOrientationやRotationを確認します。**Settings**タブは他の3D Nodeと共通です。

## 運用例1：円柱にラベルを巻く

1. [Shape 3D](./shape-3d.md)でCylinderを作ります。ラベル画像は2D Imageとして読み込み、Shape 3DのMaterialへ渡します。
2. Shape 3Dの後ろへUV Map 3Dを置き、**Map Mode = Cylindrical**にします。
3. OrientationとSizeでラベルの向き・縦横の対応を合わせ、Tileで繰り返しを調整します。
4. 後段の[Transform 3D](./transform-3d.md)でCylinderを配置し、[Renderer 3D](./renderer-3d.md)で2D Imageにします。

```text
画像 ──────────────→ Shape 3D（Cylinder / Material）
                         ↓
                    UV Map 3D（Cylindrical）
                         ↓
                    Transform 3D → Renderer 3D → Image
```

UV Map 3Dを通してもラベル画像が自動生成されるわけではありません。画像はGeometry側のMaterialに与え、**UV Map 3Dは貼り方だけを変えます**。

## 運用例2：Cameraの視点から写真を合わせる

写真を建物の壁などへ合わせる場合は、**Map Mode = Camera**を選びます。

1. 写真を、対象meshに割り当てるMaterialの**diffuse texture**へ接続します。
2. そのMaterialを持つmesh（必要なら[Merge 3D](./merge-3d.md)後のscene）をUV Map 3DのScene Inputへ接続します。
3. UV Map 3Dを**Camera**に切り替え、表示されたCameraInputへ[Camera 3D](./camera-3d.md)を接続します。
4. Camera位置・画角を調整し、Viewer上で写真とgeometryが合うようにします。

```text
写真 → Materialのdiffuse texture → 3D mesh ──→ UV Map 3D → Renderer 3D
                                              ↑
                                    Camera 3D（CameraInput）
```

**CameraInputは写真の入力先ではありません。** 写真はMaterialに割り当て、CameraはUV座標の計算に使います。これはLightで画像を照らす投影とは異なり、textureのAlphaがgeometryの不透明度にも反映されます。光としての投影など、別の目的なら[Projector 3D](./projector-3d.md)やCamera 3D側のprojection機能も比較します。

## 動くobjectでtextureが滑るとき

**Lock UVs on Animated Objects**を使うと、**Ref Time**で指定したframeの対応関係を基準にUVを保持できます。animationでsurface上の模様がずれて見える場合に使います。

ただし、FusionはRef Timeと現在frameの頂点を対応づける必要があります。その間で**頂点数が変わる、頂点が増減する、頂点の並び順が変わる**geometryでは正しくlockできません。Manualではparticle、Subdivision数が変化するprimitive、Time Offsetを使ったDuplicateの一部を不適例として挙げています。

また、Manualは通常のNode順序として次を推奨しています。

```text
Shape 3D（元のTransformは基本値のまま）
    ↓
UV Map 3D
    ↓
Transform 3D（移動・回転・拡大縮小）
```

Shape 3D自身のTransformを先にanimationさせると、mappingに対して形状が動き、textureが滑る原因になることがあります。UVを計算してから後段のTransform 3Dでscene内へ配置する構成を先に試します。

## 注意点・関連Node

UV Map 3Dは**頂点単位**でtexture座標を変更します。頂点が少ないmeshでは投影が粗くなり、mappingに不自然な歪みが出ることがあります。必要な場合はmappingより前段でmeshの分割密度を確認します。

- [Classic 3Dの概要](./index.md)：3D object・Camera・LightとRenderer 3Dの接続関係。
- [Shape 3D](./shape-3d.md)：基本geometryの生成とMaterialの割り当て。
- [Transform 3D](./transform-3d.md)：UV設定後のobject配置。
- [Camera 3D](./camera-3d.md)：Camera Modeで座標を決める視点。
- [Projector 3D](./projector-3d.md)：UVで貼る方法とは異なる画像投影を比較する候補。
- [Triangulate 3D](./triangulate-3d.md)：polygonを三角形面へ分ける処理。頂点数を増やすSubdivisionとは異なります。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」、**UV Map 3D [3UV]（pp.2011–2014）**に基づきます。入力、Map Mode、InspectorのControls、Camera投影、UV lockの制限、頂点単位の座標変更を確認しています。

Effects Library上の現在の表記、内部REGID、edition差、各Controlの既定値・数値範囲は21.1実機では検証していないため、`verification: partial`を維持しています。
