---
title: uProjector
description: 2D ImageをUSD geometryへLightまたはTextureとして投影し、Color・Intensity・Projection Mode・shadow等を制御するNode。
doc_type: node
term_id: uprojector
term_short: uProjectorは、2D画像をUSD空間の指定方向から物体へ投影するノード。光として照らす方式と、テクスチャとして渡す方式がある。
verification: partial
aliases: [uProjector, uPj]
concepts: [usd-scene, projection, image-data, lighting]
nodes: [uProjector]
node_family: usd
controls: [Color, Intensity, Exposure, Projection Mode, Decay Type, Fit Method, Shadows, Transform]
inputs: [usd, image]
outputs: [usd]
tasks: [usd, projection, texture, lighting]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uProjector

**uProjectorは、2D画像をプロジェクターのようにUSD空間へ投影するノード**です。壁や立体の表面に画像の色を持つ光を当てることも、画像をテクスチャとして渡すこともできます。画像そのものを貼った平面を作る[uImage Plane](./uimage-plane)とは異なり、既存の物体へ指定した方向から画像を届かせます。

uProjectorの出力は<Term id="usd-scene">USDシーン</Term>です。投影後の見た目を2D画像で確認するには[uRenderer](./u-renderer)を使います。

## 入力・出力

| 接続 | データ | 何に使うか |
| --- | --- | --- |
| **SceneInput（オレンジ）** | USD scene | 既存の3Dシーンを通す入力。ここへ接続するとProjectorへのTransform操作が入力シーンにも影響します。 |
| **ProjectiveImage（白）** | 2D Image | 投影する画像。Manualで必須とされる入力です。 |
| **出力** | USD scene | 投影を設定したUSDシーンをuMergeなどへ渡します。 |

投影先の形状をSceneInputへ接続する必要はありません。**Projectorだけを独立して動かす場合**は、Projectorと形状をそれぞれ[uMerge](./u-merge)へ接続する構成が分かりやすくなります。

## Projection Mode：光かテクスチャか

| | **Light** | **Texture** |
| --- | --- | --- |
| 何が起きるか | 画像のRGBが物体への照明として作用する | 画像が表面で使うテクスチャになる |
| 受け取る条件 | 投影範囲にある照明対象へ作用する | [uCatcher](./ucatcher)を使う物体が受け取る |
| Alpha | 透明部分で物体を切り抜かない | 透明部分で奥の形状を見せられる |
| 主な用途 | 光の模様、壁面への照射、影を伴う投影 | セット拡張、複数面への写真の投影、再ライティング可能なテクスチャ |

**Light**では、投影画像の色がDiffuse / Specularの光として働き、表面の向きや反射に影響されます。表示にはライティングの有効化が必要です。投影が重なると光の寄与は加算され、画像のAlphaだけでは壁を透明にできません。

**Texture**では、uProjector単独では受け手の物体へテクスチャが付くとは限りません。形状に**uCatcher**を接続し、Projectorと受け手を同じUSDシーンへまとめます。投影画像のAlphaとuCatcherによる合成については[uCatcherの記事](./ucatcher)を参照してください。

## 制作例1：壁に画像を光として当てる

~~~text
MediaIn（2D画像） ──→ uProjector（Light） ────┐
uShape / uLoader（投影先の壁） ───────────────┼→ uMerge → uRenderer
uCamera ────────────────────────────────────┘
~~~

1. [uShape](./ushape)で壁を作るか、[uLoader](./uloader)でUSD形状を読み込みます。
2. MediaInの出力をuProjectorの**ProjectiveImage**へ接続し、Projection Modeを**Light**にします。
3. Projector、壁、uCameraをuMergeへ集め、uRendererで描画します。ライティングを有効にします。
4. Projectorの位置・回転を壁へ向け、**Shaping Cone Angle**で照射範囲、**Intensity**と**Color**で光の見え方を調整します。

壁に画像を貼り付けたのではなく、**画像の模様で壁を照らした**状態になります。物体が回転すると照明の当たり方も変化します。

## 制作例2：窓が透明な建物写真を投影する

~~~text
MediaIn（窓のAlphaを抜いた建物画像）
  └→ uProjector（Texture） ────────────────┐
uShape（投影先の平面） → uCatcher ─────────┼→ uMerge → uRenderer
uCamera / 背景のUSD形状 ──────────────────┘
~~~

1. 建物写真の窓に透明なAlphaを用意します。RGBを黒くするだけでは透明になりません。
2. 投影先の形状に**uCatcher**を接続します。
3. 写真をProjectiveImageへ入力し、Projection Modeを**Texture**へ変更します。
4. ProjectorとuCatcherのUSD出力を同じuMergeへ接続し、奥に見せたい物体とカメラも追加します。
5. Projectorの方向を合わせ、窓の向こうに配置した形状が見えるか確認します。

Projectorと投影先を相対的に動かすと、写真が物体の表面を**滑るように移動**します。写真を物体に固定したい場合は、両者を同じ変換で動かす構成を検討します。

## Fit Method：画像を投影範囲へ収める

Manualでは照射範囲を「Cone」と呼ぶ箇所がありますが、幾何学的には**先端から広がる四角錐**として説明しています。**uProjectorの照射範囲は縦横が同じ角度の正方形**で、入力画像が16:9でもProjectorの視野自体が横長になるわけではありません。Fit Methodは、この投影範囲へ画像をどう割り当てるかの設定です。

| 設定 | 配置の結果 |
| --- | --- |
| **Inside** | 画像全体が範囲内に収まるよう、縦横比を保持して合わせる。覆われない部分が残ることがある。 |
| **Width** | 画像の横幅を範囲の横幅に合わせる。高さは範囲外へはみ出す場合がある。 |
| **Height** | 画像の高さを範囲の高さに合わせる。横幅は範囲外へはみ出す場合がある。 |
| **Outside** | 投影範囲全体を画像で覆うよう、縦横比を保持して合わせる。画像の端が範囲外へ出る場合がある。 |
| **Stretch** | 縦横を別々の倍率で伸縮し、範囲全体へぴったり合わせる。元画像の縦横比は変わり得る。 |

例えば16:9の画像を正方形の投影範囲に使う場合、**Inside**では画像全体を見せられますが未使用の領域が生じ、**Outside**では全体を覆う代わりに画像の左右などがはみ出します。**Stretch**は欠けや余白をなくせても、画像が変形します。

[uCamera](./ucamera)による投影ではFilm Backに応じて視野が長方形になり得るため、同じFit Methodでも結果が異なります。**画像自体の縦横比と、投影範囲の縦横比は別**に確認します。

## Inspector：重要な項目

| 設定 | 役割 |
| --- | --- |
| **Color / Intensity** | 画像へ掛ける色と投影の強さ。Texture時にもIntensityは色値のスケールに使われます。 |
| **Exposure / Color Temperature / Enable** | 露出への寄与と光源の色温度。Manualの色温度初期値は6500 Kです。 |
| **Diffuse Response / Specular Response** | 拡散反射・鏡面反射へ与える光の量。 |
| **Decay Type / Decay Rate** | 距離による減衰。Quadratic、Linear、No Decayが説明されます。Manual上の既定値はQuadratic Decayです。 |
| **Shaping Focus / Shaping Cone Angle** | 照射中心と周辺の分布、照射の広がり。 |
| **Normalize Intensity** | 投影のWidth / Heightを標準値にするか、手動設定するか。 |
| **Fit Method / Projection Mode** | 投影範囲への画像の合わせ方と、Light / Textureの選択。 |
| **Shadows** | Enable Shadows、Shadow Color、Density、Softness、Shadow Map Size / Biasなど、影の見え方を調整します。 |

**Manualの記述差に注意**：Intensityの説明には「Ambient Light projection mode」とありますが、同じuProjector節の**Projection Mode一覧にはLightとTextureのみ**が載っています。Ambient Lightを21.1のuProjectorで選べるとは断定しません。またShadow Densityは、数値を上げ下げした際の説明が文中で整合しないため、濃さの変化方向をManualだけから確定しません。

## トラブル診断

| 症状 | 確認 |
| --- | --- |
| 画像が投影されない | **ProjectiveImage**が接続されているか、Projectorの位置・方向、同じUSDシーンにあるかを確認します。 |
| Lightで見えない | ライティングの有効化、Intensity、照射範囲、表面の向き、Decayを確認します。 |
| Textureで見えない | 形状側に**uCatcher**があるか、Projection ModeがTextureになっているかを確認します。 |
| 窓を透明にできない | Lightは画像のAlphaで形状を抜けません。Texture + uCatcherと画像Alphaを確認します。 |
| 画像が伸びる、または端が切れる | **Fit Method**、元画像の縦横比、投影範囲の縦横比を確認します。 |
| Projectorを動かすと物体も動く | **SceneInput**に形状を接続していないか確認します。Projectorと形状をuMergeの別要素にする方法と比較します。 |
| 物体が動くと画像が表面を滑る | Projectorと物体の相対位置が変化していないか確認します。 |
| 投影が重なると明るすぎる | 複数のLight投影が重なっていないか確認します。 |
| 影が粗い、見えない | Shadowsの有効化、Shadow Map Size / Bias、投影の向きを確認します。 |

## 関連ノード

- [uCatcher](./ucatcher)：Textureモードの投影を受け取り、Alphaを利用する。
- [uCamera](./ucamera)：実際のカメラ視点に合わせて投影するときの選択肢。
- [uImage Plane](./uimage-plane)：投影するのでなく、画像を貼った平面を作る。
- [uShape](./ushape)、[uLoader](./uloader)：投影先の形状を作成・読み込み。
- [uMerge](./u-merge)：Projector、物体、カメラを同じUSDシーンへまとめる。
- [uRenderer](./u-renderer)：USDシーンを2D映像へ描画する。

## 出典・検証範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121 **uProjector [uPj] pp.2906–2911**。入力・出力、Projection Mode、Fit Method 5種、Inspector、SceneInputのTransform影響、uCameraとの違いを確認。Textureの受け手とAlphaは**uCatcher pp.2892–2894**でも照合しました。

接続図と制作例はManualに記された仕様を組み合わせた説明です。**Resolve 21.1実機での動作、全Inspector既定値・選択肢、内部REGID、Edition差は未確認**です。したがってverification: partialを維持します。
