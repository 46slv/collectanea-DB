---
title: uShape
description: USDの立体をFusion内で作るノード。図形ごとの形状設定、画像テクスチャ、材質、レンダリングまで説明する。
doc_type: node
term_id: ushape
term_short: uShapeは、立方体・球・円柱などの立体を作り、USDシーンとして出力するノード。
verification: partial
aliases: [uShape, uSh]
concepts: [usd-scene, geometry, material, image-data]
nodes: [uShape]
node_family: usd
controls: [Shape, Double Sided, Lock Width/Height/Depth, Size Width/Height/Depth, Radius, Height, Top Radius, Subdivision Level, Subdivision Scheme, Angle, Latitude, Cap Bottom/Top, Section, Matte, Diffuse Mode, Emissive, Workflow Mode, Roughness, Clearcoat, Clearcoat Roughness, Opacity]
inputs: [image]
outputs: [usd]
tasks: [usd, primitive, geometry]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uShape

uShapeは、立方体・球・円柱などの**基本的な立体をFusion内で作るUSDノード**です。外部の3Dモデルを読み込まなくても、形状や材質を調整して立体を配置できます。

ここでいう<Term id="usd-scene">USD scene</Term>は、立体の形状だけでなく、カメラやライトなどもまとめて扱う3Dシーンのデータです。uShapeは立体を生成しますが、**それ自体は完成した2D画像を出力しません**。画像にするには、USD用の[uRenderer](./u-renderer)で描画します。[USD sceneの基礎](../../learn/02-data/usd)も参照してください。

## 入力・出力と基本的な接続

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Image Input（任意）** | 2D Image | 表面のDiffuse Textureに使用する画像。静止画像だけでなく動画やFusion内で作った画像も接続できる |
| **uShapeの出力** | USD scene | 作った立体を、他のUSDノードへ渡す |

画像を接続しなくても、uShapeの形状とMaterialタブの色だけで立体を作れます。Image Inputは「3D形状の入力」ではなく、**立体の表面に表示する画像の入力**です。

~~~text
uShape ─────┐
uCamera ────┼─ uMerge → uRenderer → 2D Image
uLight ─────┘
~~~

[uMerge](./u-merge)で立体・カメラ・ライトを同じUSDシーンにまとめ、uRendererで2D画像に変換します。通常の画像用Mergeで映像と重ねる場合は、**uRendererの後**につなぎます。ライトの効果を確認するときは、uRenderer側のLighting設定も確認してください。

<!-- capture:S326 -->

## 実機例：CapsuleとSphereを描画する

`uShape`を`uMerge`、`uRenderer`へ接続し、ShapeをCapsuleとSphereに切り替えました。Inspectorの選択とViewerの描画がそれぞれ変わります。この例は1つのUSD sceneを入力した静止画で、材質や画像入力、他形状、複数sceneは確認していません。市松模様はViewerの透明表示です。[接続と設定の記録](/img/fusion/captures/S326/readback.json)に条件を記載しています。

[![uShapeからuMerge、uRenderer、MediaOutへ接続した構成](/img/fusion/captures/S326/graph.png)](/img/fusion/captures/S326/graph.png)

uShapeのUSD出力をuRendererで描画します。

[![Sphereを選択したuShapeのControls](/img/fusion/captures/S326/controls.png)](/img/fusion/captures/S326/controls.png)

uShapeのControlsでSphereを選択しています。

[![Sphereの描画結果](/img/fusion/captures/S326/sphere-result.png)](/img/fusion/captures/S326/sphere-result.png)

Sphereの出力です。

[![Capsuleの描画結果](/img/fusion/captures/S326/capsule-result.png)](/img/fusion/captures/S326/capsule-result.png)

同じ構成でCapsuleを選択した出力です。

[再現用Graph](/img/fusion/captures/S326/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S326/capture.json)

<!-- /capture:S326 -->

## Shape：どんな立体を作るか

Inspectorの**Controlsタブ > Shape**で、生成する立体を選びます。選択した形状によって表示される設定が変わります。

| Shapeの選択肢 | できる形・使いどころ |
| --- | --- |
| **Plane** | 厚みを持たない平面。床面やシンプルな板状の表現 |
| **Cube** | 六面の箱形。ブロック、台、製品モックなど |
| **Sphere** | 球。ボールや球状の装飾 |
| **Ico sphere** | 球に近い多面体。面構成を持つ球状の形 |
| **Cylinder** | 円柱。柱、円筒、台座など |
| **Cone** | 円すい。Top Radiusを変えると先端を切り落とした形にもできる |
| **Capsule** | 両端が丸いカプセル状の立体 |
| **Torus** | 中央に穴がある輪。リングやドーナツ状の立体 |

「2D画像の円を作るsEllipse」や「Classic 3Dで立体を作るShape 3D」とは、**扱うデータの種類が違います**。それぞれのノードを同じ画像用Mergeへ直接つなげるものではありません。

## Controlsタブ：形状と面の設定

### 大きさを変える

- **Lock Width/Height/Depth**：PlaneとCubeで使う設定です。有効にすると大きさをまとめて調整でき、無効にすると軸ごとのサイズを調整できます。
- **Size Width/Height/Depth**：PlaneとCubeの大きさを指定します。ほかの形状には同じ組み合わせが常に表示されるわけではありません。
- **Radius**：Capsule、Sphere、Cylinder、Cone、Torusの半径です。
- **Height**：Capsule、Cone、Cylinderの高さです。
- **Top Radius**：Coneの上端の半径です。先端を尖らせる形だけでなく、上端を広げた**台形断面の円すい台**も作れます。
- **Section**：Torusを構成する輪の管の太さを調整します。リング全体の大きさと、管の厚みを区別して考えるための設定です。

### 形状の一部を開く・切り取る

**Angle**はCapsule、Cone、Cylinder、Sphere、Torusで表示される角度範囲の設定です。例えば開始を180°、終了を360°にすると、全周ではなく半周分の立体を作る設定になります。

**Latitude**はSphereとTorusの緯度方向の範囲を絞ります。**Cap Bottom / Cap Top**はCylinderとConeの底面・上面を作るかを選び、無効にすると該当する端を開いた形にできます。

これらはすべてのShapeに共通する設定ではありません。「設定が見当たらない」ときは、まずShapeの種類を確認してください。

### 面の数と両面表示

**Subdivision Level / Base / Height / Cap / Cylinder**は、形状を構成する面の細かさを変える設定群です。細分化を増やすと頂点・ポリゴンが増えます。なめらかな見た目を狙う場合でも、必要な範囲から増やしてください。

**Subdivision Scheme**は面を細分化する方式で、21.1 Manualには`None`、`Bilinear`、`Loop`、`Catmull-Clark`が記載されています。方式と細分化の量は別の設定です。

**Double Sided**はポリゴンの両面を扱い、裏側からも面が見え、照明を受けるようにする設定です。CylinderやConeの端の穴を閉じる機能ではありません。開口部には前述のCap Bottom / Topを使います。

## Materialタブ：色・画像・質感を付ける

uShapeは基本的なMaterial設定を内蔵しています。単純な物体なら、別の材質ノードを作らずにここで見た目を調整できます。

| Control | 何が変わるか |
| --- | --- |
| **Diffuse Mode — Color / Texture** | 基本の表面色を指定するか、画像を表面に使うかを選ぶ |
| **Emissive** | 発光しているような表面色の寄与を加える |
| **Workflow Mode — Metallic / Specular** | 金属らしさの数値で扱うか、反射色で扱うかを選ぶ。選択に応じてMetallicまたはSpecular Colorが現れる |
| **Roughness** | 反射の広がり・粗さを変える |
| **Clearcoat / Clearcoat Roughness** | 表面に追加する光沢層と、その層の粗さを調整する |
| **Opacity** | 立体の不透明度を調整し、色とAlphaに影響する |
| **Matte（Is Matte）** | 背後の物体を隠したり、Alphaに抜きを作ったりする用途の設定 |

**Roughness**は材質の反射の見え方、**Subdivision**は立体の面の構成に作用します。形が角張っている問題をRoughnessだけで直そうとしないようにします。

Matteは「表面を透明にするOpacity」とは目的が異なります。背景を隠すための抜き形状が必要なのか、物体自体を半透明にしたいのかで選びます。シーン全体のAlpha合成結果は、実際のuRenderer出力を確認してください。

### Image Inputとファイルテクスチャの優先順位

MaterialタブのTextureでは、**Browseから画像ファイルを選ぶ**方法があります。一方、ノードの**Image Inputへ画像を接続すると、File Nameの設定が隠れ、接続した画像が優先**されます。21.1 Manualでは、ファイル選択によるテクスチャは単一フレーム、Image Inputは動画などの**時間で変わる画像**に対応すると説明されています。

~~~text
MediaIn / Text+などの2D Image
             │
             ▼
       uShape Image Input
             │   （立体の表面テクスチャ）
             ▼
           uMerge → uRenderer
~~~

表面の映像が更新されない場合は、ファイル指定とImage Inputのどちらを使っているか、入力元の画像が時間とともに変わっているかを分けて確認します。

## 制作例1：色の付いた立方体を描画する

1. `uShape`の**ShapeをCube**にして、Width / Height / Depthで形を決めます。
2. Materialタブの**Diffuse ModeをColor**にして、基本色を設定します。必要ならRoughnessを変更します。
3. `uCamera`とuShapeを[uMerge](./u-merge)へ接続し、[uRenderer](./u-renderer)へ渡します。
4. uRendererの結果をViewerへ表示して、形・材質・カメラの向きを確認します。照明を追加した場合はuRendererのLighting設定も合わせて確認します。

カメラの位置、材質の粗さ、ポリゴンの細かさをそれぞれ独立に調整できます。ここではUSDシーンを作る段階と、画像として描画する段階を区別することが重要です。

## 制作例2：動画を立体の表面へ貼る

1. `MediaIn`などで、時間とともに内容が変わる**2D Image**を用意します。
2. uShapeでCubeやPlaneなどを選び、画像の出力をuShapeの**Image Input**へ接続します。
3. uShapeをuMerge、uRendererへつなぎます。
4. 複数フレームへ移動して、立体の表面に表示される画像が変わるか確認します。

ファイルを静止テクスチャとして読み込む方法とは異なり、Fusion側で作ったアニメーション画像をそのまま表面へ渡せます。画像の見え方は、立体の向きやカメラ位置にも左右されます。

## 制作例3：一部を開いた円柱を作る

1. Shapeを**Cylinder**にしてRadiusとHeightで大きさを決めます。
2. **Angle**を全周より狭い範囲にし、円柱の一部だけを作ります。
3. **Cap Bottom / Cap Top**の一方を無効にして、その端の面をなくします。
4. Viewerで形を確認し、必要ならSubdivisionを増やします。

Angleは周方向の範囲、Capは上下端を閉じるかどうか、Subdivisionは面の細かさです。別々に変更すると、それぞれの役割を確かめられます。

## 表示されない・想定と違う場合

| 症状 | 確認すること |
| --- | --- |
| uShapeを通常のMergeへ直接つなげない | uShapeはUSD sceneを出力します。先にuRendererで2D Imageへ変換します。 |
| 立体が見えない、真っ黒に見える | uMergeに立体とCameraが接続されているか、uRendererのCamera / Lighting設定、カメラから見た形状の位置を確認します。 |
| WidthやTop Radiusが見当たらない | Shapeの種類で表示されるControlが変わります。Width系はPlane/Cube、Top RadiusはConeです。 |
| Textureで指定したファイル画像が使われない | Image Inputが接続されていないか確認します。接続中はFile Nameより入力画像が優先されます。 |
| 動画テクスチャが静止して見える | ファイル選択ではなくImage Inputを使っているか、入力元の2D Imageがフレームごとに変化するか確認します。 |
| 円柱の上下を開けたいのに変わらない | Angleは周方向の範囲です。上下端はCap Bottom / Cap Topで切り替えます。 |
| 輪郭が角張って見える | Subdivisionの量と方式を確認します。Roughnessは反射の設定で、形状の面数は変えません。 |
| 裏から見ると面が見えない | Double Sidedを確認します。穴のある形状を自動的に閉じる設定ではありません。 |

## 関連ノードとデータの違い

- [uMerge](./u-merge) — 複数のUSD立体・カメラ・ライトを同じシーンへまとめる
- [uRenderer](./u-renderer) — USD sceneを画像・AOVとして描画する
- [uShader](./ushader) / [uReplaceMaterial](./ureplacematerial) — uShape内のMaterial設定では足りない場合、別の材質を作って対象へ適用する
- [Shape 3D](../3d/shape-3d) — 似た立体生成でもClassic 3D形式で、Merge 3D / Renderer 3Dと組み合わせる
- [Shapeノード](../shapes/) — 2Dの図形データを扱う別系統。画像化にはsRenderを使う

USDシーンとClassic 3Dシーン、2D Shapeは異なるデータです。「立体を作る」「図形を作る」という言葉だけで接続先を選ばず、出力の種類を確認してください。

## バージョン・出典と未確認事項

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」、pp.2917–2921**を基準としています。Shapeの8種類、Image InputがFile Nameより優先される条件、Controls / Materialタブの各項目と形状ごとの表示条件を照合しました。例の手順はManualの仕様を組み合わせた説明であり、すべての設定値について実機レンダリングを検証したものではありません。

uShapeの内部REGID、端子色、非記載Controlの既定値・数値範囲、複雑なUSD/MaterialX互換性、Editionによる利用可否、実機のレンダリング結果は未確認です。したがって`verification: partial`を維持しています。
