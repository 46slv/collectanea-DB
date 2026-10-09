---
title: "Image Plane 3D"
description: "動画や静止画を3D空間の平面へ配置するClassic 3Dノード。接続した画像の縦横比を平面に反映する。"
doc_type: node
term_id: "image-plane-3d"
term_short: "Image Plane 3Dは、2D画像や動画を3D空間に置ける平面へ変換するノード。画像の縦横比が平面の形に反映される。"
verification: partial
aliases: ["Image Plane 3D", "ImagePlane3D", "3Im"]
concepts: ["classic-3d", "image-data", "material"]
nodes: ["Image Plane 3D"]
node_family: "3d"
controls: ["Lock Width/Height", "Subdivision Level", "Wireframe", "Materials", "Transform"]
inputs: ["classic-3d", "image", "material"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "image-card", "texture"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Image Plane 3D

Image Plane 3D [3Im]は、**2D画像や動画を、3D空間に置ける平らな長方形へ変換する**ノードです。Fusionではこうした平面を「カード」と呼ぶことがあります。映像の看板、写真を置いた背景、複数のイラストを前後に並べる2.5D合成などに使います。

このノードが作るのは<Term id="classic-3d">Classic 3D scene</Term>の一部となる**平面ジオメトリ**です。元の2D画像そのものを変形した画像として出力するのではありません。最終的な2D映像へ戻すには[Renderer 3D](./renderer-3d.md)を使います。

## 入力と出力

Node Editorに表示される入力は2本です。

- **SceneInput（オレンジ、任意）**：ほかの3Dオブジェクトや3Dシーンを受け取ります。平面はこの入力が空でも生成されます。
- **MaterialInput（緑）**：平面に表示する**2D Imageまたは3D Material**を受け取ります。MediaInやLoaderの出力をつなぐ場合は、この緑の入力を使います。
- **出力（Classic 3D scene）**：作成した平面と、SceneInputで受け取ったシーンを3Dデータとして出力します。

MaterialInputに**2D Image**を接続すると、その画像が標準MaterialのDiffuse Texture（表面の色に使う画像）として扱われます。さらに、画像の縦横比が平面の形へ反映されます。たとえば横長の映像は横長のカードになります。これは単に画像を引き伸ばして正方形へ貼る動作とは異なります。

一方、**3D Material**を接続すると、Image Plane 3Dに内蔵された基本Materialタブは無効になります。Material側で色や質感を設定するためです。外部Materialを接続した場合の縦横比については、2D Image接続時と同じ動作だと決めつけず、結果をViewerで確認してください。

## 最初の接続例：映像を3D空間に置く

```text
MediaIn（動画） ─→ Image Plane 3D ─┐
Camera 3D ───────────────────────┼→ Merge 3D → Renderer 3D → MediaOut
Light ──────────────────────────┘
```

1. MediaInをImage Plane 3Dの**緑のMaterialInput**へつなぎます。オレンジのSceneInputへ接続するわけではありません。
2. Image Plane 3Dを[Merge 3D](./merge-3d.md)につなぎ、[Camera 3D](./camera-3d.md)を加えます。必要に応じてLightも追加します。
3. Image Plane 3DのTransformで平面の位置・回転・大きさを調整します。
4. Merge 3Dの出力をRenderer 3Dへ渡して画像化し、MediaOutで結果を確認します。

Merge 3Dの段階では、カードやCameraなどはまだ3Dデータです。通常の2D Merge・Blur・Color調整を後段で使う場合は、Renderer 3Dの後に置きます。

## 画像の縦横比とShape 3DのPlane

Image Plane 3Dは、接続した2D画像の比率に合わせてカードの形を決めるため、**映像や写真をそのまま3D空間に配置する用途**に向いています。

たとえば16:9の動画を読み込むと、画像の横と縦の比率がカードの形に反映されます。これに対し、[Shape 3D](./shape-3d.md)でPlaneを作る方法では、画像の比率とは独立してジオメトリを作れます。

既存の画像を自然な比率で配置したいならImage Plane 3D、画像の比率に左右されない寸法でPlaneを設計したいならShape 3Dが候補です。

## Inspector：平面の分割と描画

### Lock Width/Height

**名前にWidth/Heightとありますが、この設定が固定するのは平面の実寸ではなく、分割数のX/Y方向の関係です。**

- **有効**：Subdivision LevelでX方向とY方向の分割を揃えて調整します。
- **無効**：X方向とY方向のSubdivisionを別々のスライダーで調整できます。

DaVinci Resolve 21.1 Reference Manualでは既定で有効と記載されています。カードの横幅と高さを同じ値へ揃える設定として解釈しないでください。

### Subdivision Level

平面を構成する細かな多角形の**分割数**を変えます。分割を増やすと頂点が増えますが、読み込んだ画像の画素数が増えるわけではありません。

OpenGL Viewer / RendererでVertex Lightingを使う場合、照明の計算点が増えるため、Lightingの見え方を細かくできます。また、後段の[Displace 3D](./displace-3d.md)で頂点を動かす場合にも、変形できる点が増えます。平らなカードとして使うだけなら、過度な分割は必要ありません。

### Wireframe

**OpenGL Renderer**で平面の面を塗りつぶさず、頂点を結ぶ線として描画する設定です。分割の状態を確認する用途にも使えます。ほかのRendererで同じ見え方が得られるとは限りません。

Visibility、Lighting、Matte、Blend Mode、Normals/Tangents、Object IDやMaterials・Transform・Settingsは、複数のClassic 3Dノードと共通のControlです。

## 運用例：写真を前後に並べて2.5Dパララックスを作る

一枚の背景画をそのまま左右へ動かしても、奥行きによる見え方の差は生まれません。前景・中景・背景を別々の画像にして、3D空間の異なる奥行きへ置くと、Camera 3Dの移動に応じてそれぞれの画面上の動き方が変わります。

```text
前景画像 → Image Plane 3D（手前） ─┐
中景画像 → Image Plane 3D（中間） ─┼→ Merge 3D ← Camera 3D
背景画像 → Image Plane 3D（奥） ──┘        ↓
                                      Renderer 3D
```

各Image Plane 3DのTransformで奥行きと大きさを調整し、Camera 3Dを少し移動して前景と背景の見え方の差を確認します。画像が途中で途切れないよう、カメラ移動後もカードが必要な範囲を覆っているか確認してください。

この例では、**画像を奥行きごとに切り分けること**と、**Cameraを動かすこと**が効果の中心です。Image Plane 3D自体が画像から深度を自動推定するわけではありません。

## 関連ノードと注意点

- [Classic 3Dの基礎](../../learn/02-data/classic-3d.md)：2D Image・Material・3D sceneのデータの違い。
- [Shape 3D](./shape-3d.md)：画像の縦横比から独立して平面や立体を生成する。
- [Merge 3D](./merge-3d.md)：複数のカードとCamera・Lightを同じ3Dシーンにまとめる。
- [Displace 3D](./displace-3d.md)：十分な分割がある平面の頂点を画像で変形する。
- [Renderer 3D](./renderer-3d.md)：3Dシーンを通常の2D画像へ変換する。

## 出典と検証範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」、**Image Plane 3D [3Im]（pp.1953–1954）**。2本の入力、2D Image接続時の縦横比、3D Material接続時の基本Material無効化、Lock Width/Height、Subdivision Level、Wireframe、OpenGL描画条件を確認しました。

**未検証**：実機の内部REGID、Subdivisionの正確な設定可能範囲、Renderer間の描画差、Edition差、各種Materialの縦横比挙動。これらは確認済みとして補わず、`verification: partial`を維持します。
