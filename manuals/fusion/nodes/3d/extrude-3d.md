---
title: Extrude 3D
description: FusionのShapeを奥行きのあるClassic 3D geometryへ変換するNode。ShapeとMaterial入力、Bevel、Custom Profileと具体的な合成例を解説。
doc_type: node
term_id: extrude-3d
term_short: Extrude 3Dは、平面Shapeの輪郭から厚みと面取りを持つ3D形状を作るNode。
verification: partial
aliases: [Extrude 3D, Extrude3D, 3Ex]
concepts: [shape-data, classic-3d, geometry]
nodes: [Extrude 3D]
node_family: 3d
controls: [Extrusion Style, Extrusion Depth, Extrusion Subdivisions, Bevel Depth, Bevel Width, Smoothing Angle, Bevel Front, Bevel Back, Extrusion Profile]
inputs: [shape, material, material]
outputs: [classic-3d]
tasks: [extrude-shape, build-3d-scene, bevel]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-09"
---

# Extrude 3D

Extrude 3D [3Ex]は、**平面の図形から奥行きのある3D形状を作る**Nodeです。図形の輪郭をZ方向へ押し出して側面を作り、縁には面取り（Bevel）を加えられます。

入力するのは、sRectangleやsTextが扱う<Term id="shape-data">Shape</Term>です。Shapeは、まだ画像のピクセルに変換していないベクター図形データを指します。2D ImageやMaskをShapeInputへそのまま入れるNodeではありません。出力は<Term id="classic-3d">Classic 3D scene</Term>なので、カメラ・ライトと組み合わせてRenderer 3Dで画像に変換できます。まず[Shapeの基礎](../../learn/02-data/shape.md)でデータの違いを確認できます。

厚みのある看板、縁に光が当たる立体ロゴ、段差のある図形の側面などを作る用途です。

## 入力と出力

21.1 Reference Manualは3本の入力を記載しています。

| 接続 | 受け取るデータ | 役割 |
| --- | --- | --- |
| **ShapeInput**（黄色） | Shape | 押し出す平面図形の輪郭を渡します。 |
| **MaterialInput**（緑） | 2D Imageまたは3D Material | 形状の表面材質を指定します。 |
| **BevelMaterialInput**（ピンク） | 2D Imageまたは3D Material | 面取り部分の材質を別に指定します。 |
| **出力** | Classic 3D | 厚みと面取りを持つ3D形状を後段へ渡します。 |

Material側へ**2D Image**をつないだ場合、その画像は対応するBasic Materialの**Diffuse Texture Map**として利用されます。**3D Material**をつないだ場合は、対応するBasic Materialタブが無効になり、接続先のMaterialが使われます。Material側の画像を押し出す図形として解釈するわけではありません。

~~~text
sRectangle ────────────────→ ShapeInput ┐
OpenPBR ───────────────────→ MaterialInput ├→ Extrude 3D → Merge 3D → Renderer 3D → Image
別のMaterial（任意）───────→ BevelMaterialInput ┘
~~~

ShapeInputに渡した輪郭が立体形状のもとになります。Material入力は、作られた面の色・光沢・模様などを設定する別の経路です。

## Inspector：押し出しと面取り

### Extrusion Style

**Classic**は、輪郭を均一な奥行きに押し出す方式です。平らな四角形を厚みのある板にする場合などに使います。

**Custom**は**Extrusion Profile**のグラフを使って押し出しの断面を編集します。グラフへ点を追加して形を変えると、奥行きの途中に張り出しや段差を作れます。Manualでは額縁や凹凸のあるつまみを例に挙げています。

Customにしても入力Shapeの輪郭自体が別の図形になるわけではありません。平面方向の輪郭はShape側、奥行き方向の断面はExtrude 3D側で編集します。

### Extrusion DepthとExtrusion Subdivisions

**Extrusion Depth**は押し出す奥行きを調整します。正面から見た画像では側面が目立たないことがあるため、厚みを評価するときはカメラを斜めに向けると分かりやすくなります。

**Extrusion Subdivisions**は、押し出し断面の**滑らかな部分に置く分割数**を指定します。Shape全体の画素解像度を上げる設定ではありません。Custom Profileで曲線状の断面を作り、その側面が角張って見える場合に確認する項目です。

### Bevel

Bevelは正面と側面の間に面取りを加える処理です。側面の角へライトが当たると、輪郭の立体感が見えやすくなります。

- **Bevel Depth**：0より大きくすると面取りが追加されます。
- **Bevel Width**：面取り部分の幅を調整します。
- **Smoothing Angle**：面取りの縁に適用する法線のスムージング角度を調整します。陰影の見え方に影響します。
- **Bevel Front / Bevel Back**：正面と背面の面取りを個別に有効にします。

DepthとWidthは同じ項目ではありません。Bevelを大きくしたのに縁が目立たないときは、面取りの寸法だけでなく**カメラ角度、材質、ライト位置**も確認します。

InspectorのMaterials・Transform・Settingsタブは、他の3D Nodeにもある共通設定です。Extrude 3D固有のControlsと区別してください。

## 具体例1：平面の図形を厚みのある看板にする

~~~text
sRectangle → Extrude 3D ──┐
Camera 3D ────────────────┼→ Merge 3D → Renderer 3D → Image
Light ────────────────────┘
~~~

1. [sRectangle](../shapes/srectangle.md)で四角形を作り、Extrude 3Dの黄色いShapeInputへ接続します。
2. Extrusion StyleをClassicにして、Extrusion Depthで看板の厚みを設定します。
3. Bevel Depthを0より大きくし、Bevel Widthを調整して縁の面取りを作ります。
4. Extrude 3DとCamera 3D、Lightを[Merge 3D](./merge-3d.md)へ入れます。カメラを少し斜めにして側面を確認します。
5. [Renderer 3D](./renderer-3d.md)で2D Imageに変換します。実写映像に重ねる場合は、この出力を通常の2D MergeのForegroundへ、実写をBackgroundへつなぎます。

表面と面取り部分で外観を変える場合は、[OpenPBR](../materials-lights/openpbr.md)などの3D MaterialをMaterialInputに、別のMaterialをBevelMaterialInputに接続します。これで、同じ形状の正面・側面と縁を異なる材質で表現できます。

sRectangle → Extrude 3D → Merge 3DはManualにある基本構成です。カメラ・ライト・2D合成は、Nodeの役割を組み合わせた運用例であり、特定のInspector数値をManualの既定値として提示しているわけではありません。

## 具体例2：側面に段差を付ける

均一な板ではなく、奥行きの途中で側面が張り出す枠を作ります。

1. まずClassicでShapeを押し出し、輪郭と奥行きの関係を確認します。
2. Extrusion StyleをCustomへ切り替え、Extrusion Profileに点を追加します。
3. Profileを編集して奥行き方向の断面に張り出しや段差を作ります。
4. 曲線部分が角張って見える場合はExtrusion Subdivisionsを調整します。
5. カメラを斜めにして、側面の形と陰影を確認します。

**入力Shapeの平面輪郭**と**Custom Profileによる側面の断面**は別々の編集対象です。たとえば四角形の四辺そのものを曲線にしたいなら、その処理はExtrude 3Dではなく前段のShape側で行います。

## 似たNodeとの違いと注意点

- **[Text 3D](./text-3d.md)**は文字列、フォント、配置、厚みと面取りを一つのNodeで扱います。すでにShapeデータとして用意した輪郭を押し出すならExtrude 3Dを使います。
- **[Shape 3D](./shape-3d.md)**は球・立方体などの基本3D形状を作るNodeで、入力Shapeの輪郭を押し出すNodeではありません。
- **sRender**はShapeを2D Imageへ変換します。Extrude 3Dへ渡すShapeを、先にsRenderで画像化する必要はありません。
- **KrokodoveのsExtrude**は名前が似ていますが、KrokodoveのShape系ToolとClassic 3DのExtrude 3Dは区別してください。端子や対応機能の一致は未確認です。

Material用の画像入力と黄色いShapeInputを取り違えたり、3Dの出力を通常の2D Mergeへ直接渡したりしないでください。接続を理解する際は、**Shape → Classic 3D → 2D Image**の順序を意識します。

## 出典と確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 88「3D Nodes」、**Extrude 3D [3Ex]（pp.1942–1944）**。ShapeInput・MaterialInput・BevelMaterialInput、2D画像と3D Materialの扱い、Classic / Custom、Depth、Subdivision、Bevel、共通タブを確認しました。

作例のカメラ・ライト配置と実写合成は確認済みのNode機能を組み合わせた説明です。21.1実機の内部REGID、Inspectorの既定値・数値範囲、Edition差、各種Shapeでの描画結果は未確認のため、verificationはpartialとしています。
