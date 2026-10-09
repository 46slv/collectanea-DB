---
title: Shape 3D
description: "Plane・Cube・Sphereなどの基本的な3D形状を作り、画像や3D Materialを割り当てるClassic 3D Node。"
doc_type: node
term_id: shape-3d
term_short: "Shape 3Dは、平面・箱・球などの基本形状を3D空間に作るNode。画像やMaterialを与え、Renderer 3Dで描画できる。"
verification: partial
aliases: [Shape 3D, Shape3D, 3Sh]
concepts: [classic-3d, geometry, material]
nodes: [Shape 3D]
node_family: 3d
controls: [Shape, Lock Width/Height/Depth, Size Width/Height/Depth, Radius, Top Radius, Start/End Angle, Start/End Latitude, Bottom/Top Cap, Section, Subdivision Level/Base/Height, Wireframe]
inputs: [classic-3d, image, material]
outputs: [classic-3d]
tasks: [build-3d-scene, primitive, geometry]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-08"
---

# Shape 3D

Shape 3D [3Sh]は、床に使う平面、箱、球、円柱などの**基本的な3D形状を新しく作る**Nodeです。外部の3Dモデルを読み込まなくても、簡単なセットや投影先の面を組み立てられます。

こうした基本形状を**プリミティブ（primitive）**と呼びます。Shape 3Dが作るのは2D画像ではなく、頂点と面を持つ<Term id="classic-3d">Classic 3Dのジオメトリ</Term>です。ジオメトリは「どこに、どんな形の面があるか」という情報で、色や模様を与えるMaterial、見る位置を決めるCamera、照明を組み合わせて初めて映像として描画できます。

## 入力と出力

Shape 3Dは入力がなくても形状を作れます。DaVinci Resolve 21.1 Reference Manualには、次の2つの**任意入力**が記載されています。

- **SceneInput（オレンジ）**：別の3Dジオメトリやシーンを受け取り、Shape 3Dが作る形状と同じ3D出力に含めます。形状を新しく作るだけなら接続は不要です。
- **MaterialInput（緑）**：2D画像、または3D Materialを受け取ります。2D画像を接続すると、Shape 3Dに内蔵されている基本Materialの**Diffuse Texture（表面の色模様）**として使われます。3D Materialを接続した場合は、内蔵Materialの代わりにそのMaterialを使用します。
- **出力（Classic 3D）**：生成した形状と、SceneInputに接続した3Dシーンを渡します。2DのMergeやBlurへ直接つなぐ画像出力ではありません。

画像をMaterialInputに接続しても、画像全体が自動的に3D空間へ変換されるわけではありません。形状の表面に画像の色を貼るための接続です。2D映像へ戻すには[Renderer 3D](./renderer-3d.md)を使います。

## Shapeを選ぶ

Inspectorの**Controls > Shape**で形状を選びます。選んだ形によって表示される設定も変わります。

| Shape | 作られる形 | 用途の例 |
| --- | --- | --- |
| Plane | 厚みのない平面 | 床、壁、投影用の板 |
| Cube | 箱状の形 | 建物の仮組み、小道具 |
| Sphere | 球 | 惑星、光る球、球状の投影面 |
| Cylinder | 円柱 | 柱、缶、円筒型ディスプレイ |
| Cone | 円錐 | 尖ったオブジェクト、先端を切った円錐 |
| Torus | 中央に穴のある輪 | リング、円環状のオブジェクト |

これはShape 3Dの1つのNodeで切り替える形状の種類です。PlaneやSphereごとに別のNodeがあるわけではありません。

## 形の大きさと切り取り方

### SizeとLock Width/Height/Depth

**Plane / Cube**では、**Size Width / Height / Depth**が形状の大きさを決めます。**Lock Width/Height/Depth**が有効なら大きさをまとめて変え、外すと軸ごとに調整できます。

たとえばCubeのWidthを広く、Heightを低くすると、正方形の箱ではなく横長の台になります。平面をスクリーンとして使う場合は、PlaneのWidthとHeightを表示したい縦横比に合わせて調整します。

### Radius / Top Radius / Section

**Sphere / Cylinder / Cone / Torus**では、**Radius**で半径を調整します。

- **Top Radius（Cone）**：円錐の上端の半径です。下から先端まで尖らせるだけでなく、先端を切り落とした形にもできます。
- **Section（Torus）**：輪そのものを構成する管の太さです。大きな輪を作るRadiusとは役割が異なります。

### Start/End Angle・Latitude・Cap

**Start/End Angle**は、Sphere / Cylinder / Cone / Torusで、円周のどこからどこまでを作るかを指定します。全周を作らず、一部だけを残したいときに使います。

**Start/End Latitude**はSphere / Torusの上下方向の範囲を切り取ります。たとえばSphereの一部を取り除き、半球や球の帯状の部分を作る用途です。

**Bottom Cap / Top Cap**はCylinder / Coneの端をふさぐ面を作るかどうかの設定です。両端を開いた筒にしたいときは、必要な側のCapを無効にします。AngleやLatitudeで切った部分を自動的に閉じる設定とは別です。

## SubdivisionとWireframe

**Subdivision Level / Base / Height**は形状を構成する面の分割数を調整します。分割数を増やすと頂点が増え、曲面をより細かい面で表せるようになります。

頂点とは、3D形状の表面を構成する点です。たとえばPlaneを[Displace 3D](./displace-3d.md)で波打たせる場合、動かせるのは元からある頂点だけです。分割数が少ないと画像に細かい模様があっても粗い変形になり、分割数を増やせば細部を作れる余地が増えます。ただし頂点数も増えるため、必要な細かさに合わせて調整します。

**Wireframe**を有効にすると、面を塗りつぶす代わりに形状の線構造を描画します。分割数を変えたときのメッシュの構成を見比べるのにも使えます。これはViewerの表示補助だけではなく、形状の描画方法を変える設定です。

## 具体例：簡単な3Dセットを作る

まずShape 3Dを3つ用意し、それぞれのShapeをPlane（床）、Cube（台）、Sphere（置物）にします。

```text
Shape 3D（Plane：床） ──┐
Shape 3D（Cube：台） ───┤
Shape 3D（Sphere：球） ─┼→ Merge 3D → Renderer 3D → 2D Image
Camera 3D ──────────────┤
Light ──────────────────┘
```

CubeとSphereは、それぞれの**Transform**設定で位置を変え、床の上に見えるよう配置します。複数形状とCamera、Lightは[Merge 3D](./merge-3d.md)で同じシーンにまとめます。Renderer 3DをViewerへ表示すると、3Dの配置を2D画像として確認できます。

SceneInputを使って別のShape 3Dの出力を受けることもできますが、CameraやLightを含む構成全体を見渡すときはMerge 3Dにまとめる方が接続を追いやすくなります。これはGraphの整理方法であり、SceneInputが必須という意味ではありません。

## 具体例：円柱にラベル画像を貼る

ShapeをCylinderに変更し、ラベル用の2D画像をMaterialInputへ接続します。画像は円柱の表面模様として使われます。Radiusで円柱の太さを変え、必要に応じてCapsを切り替えます。

画像の位置や伸び方が意図と異なる場合は、単純に画像を拡大する前に**テクスチャ座標（UV）**を確認します。UVは、3D形状の表面の各位置が、2D画像のどの場所に対応するかを表す座標です。別の投影方法を使いたいときは[UV Map 3D](./uv-map-3d.md)で座標を作り直せます。

Sphereへ緯度経度形式（LatLong）の画像を直接接続する場合にも注意が必要です。21.1 Manualでは、SphereをAngleやLatitudeで部分的に切ると、直接接続した画像は切り取られずに残った面へ押し縮められる一方、[Sphere Map](../materials-lights/sphere-map.md)を使う経路では画像が切り取られると説明されています。また直接接続時には水平反転が起き、前段のTransformで調整できると記載されています。見た目の違いを確認してから方法を選びます。

## 似たNodeとの選び分け

**[Image Plane 3D](./image-plane-3d.md)**は、画像を貼るための平面を作るNodeです。接続した画像の縦横比を平面の形へ反映します。画像の縦横比と関係なく自分で平面の大きさを決めたい場合は、Shape 3DのPlaneが適しています。

**[Cube 3D](./cube-3d.md)**は、箱の6面へ個別に画像やMaterialを与えたい場合に向いています。Shape 3DのCubeは1つのMaterialInputを使い、接続した2D画像にはCube Mappingが適用されます。異なる模様を面ごとに配置したい場合はCube 3Dを検討します。

**[Transform 3D](./transform-3d.md)**は既存形状やシーンの位置・回転・拡大率を変更するためのNodeです。Shape 3Dは形を新しく作り、Transform 3Dはその配置を変えるという違いがあります。

## 関連

- [Classic 3Dノード一覧](./index.md)：3Dを作る、組む、描画するNodeの全体像。
- [Classic 3D sceneの基礎](../../learn/02-data/classic-3d.md)：3Dデータと2D画像の違い。
- [Displace 3D](./displace-3d.md)：画像の値に応じて頂点を動かす。
- [Renderer 3D](./renderer-3d.md)：3Dシーンを2D画像として描画する。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」、**Shape 3D [3Sh]（pp.1990–1992）およびpp.1993冒頭**に基づきます。2つの任意入力、MaterialInputによる2D Image / 3D Materialの扱い、各Shape固有の設定、Subdivision、Wireframe、Sphere Mapとの違いを確認しました。

実機でのREGID、各Controlの既定値・数値範囲、Edition差、描画性能は未確認のため、`verification: partial`を維持しています。具体例のGraphはManualに載るShape 3Dによるセット構築の考え方を、説明用に簡略化したものです。
