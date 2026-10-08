---
title: "Cube 3D"
description: "六面に別々の画像やマテリアルを設定できる立方体を作る、FusionのClassic 3Dノード。"
doc_type: node
term_id: "cube-3d"
term_short: "Cube 3Dは、六面それぞれへ画像やマテリアルを設定できる立方体の3Dジオメトリを作るノード。"
verification: partial
aliases: ["Cube 3D", "Cube3D", "3Cb"]
concepts: ["classic-3d", "geometry", "material"]
nodes: ["Cube 3D"]
node_family: "3d"
controls: ["Lock Width/Height/Depth", "Size", "Width", "Height", "Depth", "Subdivision Level", "Cube Mapping", "Wireframe"]
inputs: ["classic-3d", "image", "material"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Cube 3D

Cube 3D [3Cb]は、**六つの面を持つ立方体を生成し、面ごとに異なる画像やマテリアルを割り当てられる**ノードです。箱の模型、仮の建物、影を落とす物体、六面に異なる写真を貼る表現などに使えます。

出力は<Term id="classic-3d">Classic 3D scene</Term>です。2D画像を直接生成するわけではないため、映像として使う場合は[Renderer 3D](./renderer-3d.md)で描画します。

## 入力と出力

Cube 3Dは**入力を何も接続しなくても立方体を生成**します。入力端子はすべて任意です。

- **SceneInput（オレンジ）**：別の3D objectや3D sceneを接続します。そのsceneにCube 3Dの立方体が追加され、まとめて出力されます。立方体の形を作るために別の3D Sourceを接続する必要はありません。
- **六つの面用Material入力**：立方体の各面へ、2D Imageまたは3D Materialを接続します。たとえば面ごとに違う写真を貼った箱を作れます。接続した画像やMaterialは**Cube 3D自身の面に適用**され、SceneInputから加えた別の3D objectには適用されません。
- **出力**：立方体と、SceneInputから受け取った内容を含むClassic 3D sceneです。[Merge 3D](./merge-3d.md)でCameraやLightと組み合わせるほか、Renderer 3Dへ渡して2D Imageへ変換できます。

公式Manualは六つの面用端子をまとめて説明しています。面の向きと端子の対応は、接続した画像を3D Viewerで確認してから確定してください。

## 使い方1：六面に別々の画像を貼った箱

```text
MediaIn（画像A） ─→ 面1 ─┐
MediaIn（画像B） ─→ 面2 ─┼→ Cube 3D ─┐
                             Camera 3D ─┼→ Merge 3D → Renderer 3D → MediaOut
                             Light ─────┘
```

1. Cube 3Dを追加します。Cube 3D単体で立方体が作られるので、ほかのGeometryノードは不要です。
2. 画像Aと画像Bを異なる面のMaterial入力に接続します。別の面にも画像を使いたければ、残りの入力へそれぞれ接続します。
3. Cube 3DをMerge 3Dへつなぎ、[Camera 3D](./camera-3d.md)とLightを加えます。Renderer 3Dで最終的な画像を確認します。
4. Cube 3DのTransformタブで向きを変え、どの面にどの画像が貼られたか確認します。

この方法では、六面の画像を個別に差し替えられます。写真を貼った製品箱や、面ごとに違う表示を持つ簡易3Dモックに向いています。単色の箱を作るだけなら、同じ立方体を作れる[Shape 3D](./shape-3d.md)でも構いません。

## 使い方2：3Dトラッキング後の仮ジオメトリ

Camera Trackerで実写に合わせた3D sceneを作った際、実物の3D modelがまだ用意できていなければ、Cube 3Dを代わりに配置できます。

たとえば机上の直方体を仮置きする場合、Cube 3Dの幅・高さ・奥行きとTransformを調整して実写上の位置や大きさに合わせます。Camera Trackerから得たCameraなどとMerge 3Dで組み合わせ、Renderer 3Dで画面に重ねて確認します。後から本番用modelへ差し替える前に、配置や影の見え方を検討できます。

## Inspector：立方体の形と表示

### Lock Width/Height/Depth、Size、Width/Height/Depth

**Lock Width/Height/Depth**を有効にすると、三方向の寸法をまとめて**Size**で調整します。解除すると、**Width・Height・Depth**が個別に表示されます。立方体を直方体に変えて、壁や建物の仮モデルにする場合はLockを外します。

Manualによると、SizeとWidthは同じ内部Controlの表示名を切り替えたものです。Sizeに設定したAnimationは、Lock解除後のWidthにも引き継がれます。

### Subdivision Level

立方体表面の分割数を変更します。分割を増やすと頂点が増え、頂点で計算したLighting結果を補間する際の細かさが変わります。Lightingや後段の頂点処理が必要な場合は調整します。

分割数を増やすだけで箱の角が丸くなるわけではありません。単純な箱なら不要に増やす必要はありません。

### Cube Mapping

有効にすると、**最初のTextureを六面全体へ展開**する方式に切り替わります。Manualでは、十字形に並べた六面の画像を一枚にまとめたTextureを想定しています。

六つの面へ独立した画像を接続する方法とは用途が異なります。面ごとに別々の画像を編集したいなら、六つのMaterial入力を使います。一枚の十字形Textureとして管理したいならCube Mappingを検討します。

### Wireframe

立方体の表面を塗りつぶす代わりに、辺・分割線だけを描く設定です。**Renderer 3DのOpenGL rendererで描画するとき**に有効になる機能としてManualに説明されています。ほかのrendererでも同じ結果になるとは限りません。

Visibility、Lighting、Matte、Normals/Tangents、Object ID、Materials、Transform、Settingsなどは、複数の3Dノードで共通するControlです。

## Shape 3Dとの違い・注意点

- **Cube 3D**：箱専用のGeometryです。**各面に異なる画像・Materialを接続**する設計を重視する場合に向いています。
- **[Shape 3D](./shape-3d.md)**：Cube以外にPlane、Sphere、Cylinderなども生成できます。形を切り替えたい場合や、一般的なPrimitiveを使う場合に向いています。
- **[Duplicate 3D](./duplicate-3d.md)**：Cube 3Dで作った箱を複数並べたい場合に後段へ接続します。Cube 3D自身が複製数を設定するノードではありません。

Cube 3Dの入力は、通常の2D合成で使うForeground/Backgroundではありません。**3D scene**と、面に貼る**2D Image / 3D Material**を区別してください。CameraやLightのない構成でもGeometry自体は作れますが、最終画像で意図した見え方にするにはRenderer 3D側の描画設定も確認します。

## 関連と出典

- [Classic 3Dノード一覧](./index.md) / [Classic 3D sceneの基礎](../../learn/02-data/classic-3d.md)
- [Shape 3D](./shape-3d.md) / [Merge 3D](./merge-3d.md) / [Renderer 3D](./renderer-3d.md) / [Duplicate 3D](./duplicate-3d.md)
- **一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*、Chapter 88「3D Nodes」、pp.1928–1930「Cube 3D [3Cb]」。SceneInput、六つの面用Material入力、Controls、Cube Mapping、Wireframeの説明を確認しました。Chapter 84「3D Compositing Basics」p.1859にもGeometryの用途が記載されています。
- **未検証**：実機での各面入力の表示名・面との向きの対応、REGID、既定値・数値範囲、edition差。Manualに記載がない動作を確定扱いしないため、`verification: partial`を維持しています。
