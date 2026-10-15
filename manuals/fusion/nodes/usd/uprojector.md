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
controls: [Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Decay Type, Decay Rate, Shaping Focus, Shaping Cone Angle, Normalize Intensity, Fit Method, Projection Mode, Shadows, Shadow Map Size, Shadow Map Bias, Transform]
inputs: [usd, image]
outputs: [usd]
tasks: [usd, projection, texture, lighting]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
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

## 制作例3：1枚の画像を壁と床にまたがって投影する

展示空間の壁から床へ続くグラフィックを、別々の画像に分けず、一つの投影元で表現する例です。

1. 壁と床を別々の[uShape](./ushape)、または[uLoader](./uloader)で読み込んだUSD形状として用意します。
2. 2D画像をuProjectorの**ProjectiveImage**へ接続します。
3. 光の模様として見せるなら**Light**を選び、壁・床・uProjectorを[uMerge](./u-merge)で同じUSDシーンへ集めます。照明の有効化も確認します。
4. あとで別のライトから照らせる表面模様として使うなら**Texture**を選び、壁と床の双方に[uCatcher](./ucatcher)を用います。Texture投影はuCatcherを使う物体に届く点がLightと異なります。
5. [uRenderer](./u-renderer)で結果を見ながら、投影方向とFit Methodを調整します。片方の面だけ投影されない場合は、その面が投影範囲にあるか、Textureの場合はuCatcherが接続されているかを確認します。

物体と投影元の相対位置が変わると、模様は表面を滑って見えます。一体で動かす場合は、両者をuMergeでまとめて同じ変換を適用する構成を検討します。一方、uProjectorの**SceneInput**に物体を接続するとProjector側のTransformが物体にも作用するため、方向だけ調整しているつもりで物体まで動かさないようにします。

撮影済み画像をカメラの画角に合わせたい場合は、Film BackやClip Planeを扱える[uCamera](./ucamera)の投影機能も候補です。uProjectorは光の色・強さ・減衰・影を制御する投影光源として選ぶと違いが明確になります。

## Inspector：重要な項目

| 設定 | 働き・確認点 |
| --- | --- |
| **Color** | 投影する2D画像へ乗算する色。元画像の色をそのまま使う場合も乗算色を確認します。 |
| **Intensity** | Lightでは投影光の強さ、TextureではColor乗算後の画像色値の倍率を調整します。 |
| **Exposure** | シーンを照らす露出への寄与。Intensityと似ていますが別の調整項目です。 |
| **Color Temperature / Enable** | 色温度と、その使用の切り替え。Manualの記載値は6500 Kです。 |
| **Diffuse Response / Specular Response** | 拡散反射・鏡面反射それぞれへの光の寄与。 |
| **Decay Type** | 距離減衰。Manual記載の既定はQuadratic Decay。Linear DecayとNo Decayも選択肢として説明されています。 |
| **Decay Rate** | 距離による減衰速度。Manualでは小さい値ほど投影が強くなると説明されます。 |
| **Shaping Focus** | 投影強度の分布を周辺から中心へ寄せます。 |
| **Shaping Cone Angle** | 投影範囲の広がり。大きいほど広くなり、Manual記載の上限は180度です。 |
| **Normalize Intensity** | Manualでは有効時にWidth / Heightを標準値へ設定し、無効時に手動調整すると説明しています。明るさだけを一定化するスイッチと読み替えません。 |
| **Fit Method** | 元画像を投影範囲へ収める方法。Inside / Width / Height / Outside / Stretchの違いは前節を参照。 |
| **Projection Mode** | Lightは照明として投影、TextureはuCatcherが受け取る表面テクスチャとして投影。 |
| **Enable Shadows / Shadow Color / Density** | 影の有効化、色、密度に関する設定。 |
| **Softness / Softness Quality** | 影の柔らかさと、その計算品質。 |
| **Shadow Map Size / Bias / Offset** | 影のマップ解像度、影が出ない場合の補正、Size設定へのオフセット。Sizeを上げると細部が改善する代わりにメモリ・処理負荷が増えます。 |

### 光量・影を調整する順番

投影が暗い場合、Intensityを大きくする前に、**物体が投影範囲内にあるか**、**LightかTextureか**を確認します。Lightの場合はDecay TypeとDecay Rateも影響します。No Decayは距離が変わっても強さが一定になる方式で、自然な光の距離減衰を表す場合とは用途が異なります。

影を使う場合はEnable ShadowsとShadow Map Sizeを別々に確認します。影の輪郭が荒いときはSizeが関係し、影が見えない場合はBiasも確認します。SoftnessとSoftness Qualityも同一の項目ではありません。ManualはEnable Shadowsを既定で有効としていますが、現在の値はInspectorで確認してください。

**公式Manualの記述差：** Intensityの説明には「Ambient Light projection mode」が登場する一方、Projection Modeの一覧は**LightとTextureのみ**です。さらにShadow Densityには「1.0で完全透明」と「値を下げるほど透明」という整合しない説明があります。この文章だけで第三のModeの存在やDensityの変化方向は確定しません。

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
| 投影が重なると明るすぎる | 複数のLight投影の重なりと、Decay Type / Decay Rateを確認します。 |
| 影が粗い、見えない | Enable Shadows、Shadow Map Size / Bias、Softness / Softness Quality、投影の向きを確認します。 |

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
