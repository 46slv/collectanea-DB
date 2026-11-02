---
title: OpenPBR
description: 画像・金属感・粗さ・凹凸を組み合わせ、Classic 3Dの形状へ割り当てるOpenPBR材質の使い方。
doc_type: node
term_id: openpbr
term_short: 色、金属感、粗さ、凹凸などの入力を持つ3D材質ノード。出力は材質であり完成画像ではない。
verification: partial
aliases: [OpenPBR, 3OP]
nodes: [OpenPBR]
node_family: materials-lights
inputs: [image, material]
outputs: [material]
controls: [Base Color, Metalness, Specular Roughness, Transmission, Coat, Sheen, Subsurface, Thin Film Thickness, Opacity, Thin Walled, Material ID]
tasks: [build-material, shade-3d]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-16'
---

# OpenPBR

OpenPBR [3OP]は、3D物体の表面が光をどのように反射・透過するかを、一つの材質として設定するNodeです。色の画像だけでなく、金属らしさ、光沢の広がり、細かな凹凸を、それぞれ別の画像や設定で制御できます。

PBR（Physically Based Rendering）は、表面の性質を分けて扱い、照明に対する見え方を組み立てる考え方です。同じ灰色の球でも、**Metalness**と**Specular Roughness**を変えると、金属とマットな素材の違いを表現できます。色の画像だけで材質が決まるわけではありません。

OpenPBRが扱うのは<Term id="classic-3d">Classic 3D</Term>のMaterial（材質）です。3Dの形状やライトを作るNodeではなく、[Shape 3D](../3d/shape-3d.md)などのMaterial入力へ接続して使います。

<!-- capture:S209 -->

## 実機例：Specular Roughnessを変える

`OpenPBR` を `Shape 3D` の球に接続し、`Directional Light` とまとめてレンダリングしました。

同じ色と光源でSpecular Roughnessを0.1から0.4に変えると、この例では小さく明るいハイライトが広くなります。数値はSDKで読み戻しています。[接続と設定の記録](/img/fusion/captures/S209/readback.json)に条件を記載しています。

[![OpenPBRを球に接続しDirectional Lightとレンダリングする構成](/img/fusion/captures/S209/graph.png)](/img/fusion/captures/S209/graph.png)

材質を球に接続し、ライトとまとめます。

[![OpenPBRのBaseカラー設定](/img/fusion/captures/S209/controls.png)](/img/fusion/captures/S209/controls.png)

Baseカラーを設定した状態です。

[![Specular Roughness 0.1で描画した球](/img/fusion/captures/S209/low.png)](/img/fusion/captures/S209/low.png)

0.1では小さく明るいハイライトです。

[![Specular Roughness 0.4で描画した球](/img/fusion/captures/S209/high.png)](/img/fusion/captures/S209/high.png)

0.4ではハイライトが広がります。

[再現用Graph](/img/fusion/captures/S209/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S209/capture.json)

<!-- /capture:S209 -->

## 入力

Manual本文は29の入力があると説明しています。初期状態で表示される三角形はオレンジ色の`Base Color`だけです。他ノードの接続線をOpenPBRへドラッグすると、接続先の選択メニューが出ます。追加の入力は接続後に表示されます。

### 接続先メニュー

p.2061の図で読める29項目を、役割別に並べています。これは図中の表示名の転記であり、スクリプト用Input IDではありません。

| 分類 | メニューにある入力名 |
| --- | --- |
| 基本の表面 | Base Color、Base、Diffuse Roughness、Occlusion、Metalness |
| 鏡面反射 | Specular Color、Specular、Specular Roughness、Specular Anisotropy、Specular Rotation |
| 透過 | Transmission Color、Transmission、Transmission Extra Roughness、Transmission Scatter |
| 上塗り層 | Coat Color、Coat、Coat Roughness、Coat Affected Roughness、Coat Affect Color、Coat Anisotropy、Coat Rotation |
| 表面のSheen | Sheen Color、Sheen、Sheen Roughness |
| 内部散乱 | Subsurface Color、Subsurface、Subsurface Radius |
| 発光・不透明度 | Emission Color、Opacity |

### 凹凸とAmbient Occlusion

同じp.2061には、法線・凹凸のテクスチャを[Bump Map](./bumpmap.md)へ入れ、そのMaterial出力をOpenPBRのBumpmap入力へ接続する構成もあります。高さを表す画像を使う場合、Bump Map側でSource Image TypeをHeight Mapに設定してから接続します。上の29項目のメニュー図と、このBumpmap入力の数え方の関係は本文で明確ではありません。実機の総端子数を29に固定した仕様表にはしていません。

このBumpMapの接続例は、任意の材質をOpenPBRへ入力して混合できることまで示すものではありません。各端子が受け付ける内部型は未確認です。

Ambient Occlusionの画像は`Occlusion`へ接続します。ManualではDomeLightまたはAmbientLightを使う場合に限り、この入力が利用できると説明しています。

## 出力

出力は**3D Material**です。Shape 3Dなどの形状NodeのMaterial入力へ接続します。これを[Merge 3D](../3d/merge-3d.md)のScene入力へ直接接続したり、MediaOutで完成映像として表示したりはできません。

物体に割り当てた後、物体・カメラ・ライトをMerge 3Dにまとめ、[Renderer 3D](../3d/renderer-3d.md)で**2D画像へ変換**して初めて映像として確認できます。

## 主な設定

### 表面の色と金属感

`Base Color`は反射やハイライトを加える前の表面色です。画像を接続した場合、Inspectorの色と画像の色が乗算されます。設定色を変えたら画像の色も変わるため、テクスチャだけで色が決まるわけではありません。

`Metalness`は画像入力の強さ、または入力がない場合の材質全体の金属感を調整します。`Diffuse Roughness`はDiffuse Roughnessテクスチャ入力の強さです。

### ハイライト

`Specular Color`は反射光の色です。`Specular Roughness`はハイライトの広がりを調整し、値を大きくすると広い範囲へ広がると説明されています。対応画像がある場合、この値は画像のAlphaと乗算されます。

`Specular IOR`は屈折率、`Specular Anisotropy`と`Rotation`は方向によって異なる粗さ・光沢とその向きを扱います。これらの数値範囲は本ページでは未確定です。

### 透過と上塗り層

`Transmission Color`、`Extra Roughness`、`Depth`、`Scatter Color`は透過色、透過層の拡散、内部を通る距離、散乱色を扱います。ManualではDepthが0のときScatter Colorは無視されます。

`Coat`系は材質の上に追加する層です。色、粗さ、屈折率、方向性と回転を調整します。

### 布・内部散乱・薄膜

`Sheen`は表面の散乱層です。Sheen Roughnessが低いと光沢のある布、高いと粉っぽい外観になると説明されています。

`Subsurface`はプラスチック、大理石、肌などの内部散乱を扱います。Radius X/Y/ZとScaleで散乱距離に関わる値を調整します。`Thin Film Thickness`と`Thin Film IOR`は薄膜干渉による色の変化を扱います。

### 不透明度と面の扱い

`Opacity`は各チャンネルの材質値を減らし、三つのチャンネルを0にすると透明になると説明されています。`Thin Walled`を有効にすると、内部や裏側を持たない面のように振る舞います。

`Receives Lighting/Shadows`は照明・影を受けるかどうかです。`Two Sided Lighting`は裏側に逆向きの法線を加えて照明を扱う設定であり、単に裏面の表示を切り替える設定と同一ではありません。`Material ID`は、対応する描画設定でMatID補助チャンネルへ出す識別番号です。

## 接続例：材質を球に割り当てて描画する

最初は1つの球と1つのライトで試すと、**材質の設定**と**照明の設定**を別々に確認できます。

~~~text
色の画像 ─────────→ OpenPBR［Base Color］──┐
高さ画像 → Bump Map → OpenPBR［Bumpmap］───┤
                                           ↓
                                    Shape 3D［Material］─┐
Camera 3D ─────────────────────────────────────────────┤
Point Light ───────────────────────────────────────────┤
                                                        └→ Merge 3D → Renderer 3D → 2D画像
~~~

1. [Shape 3D](../3d/shape-3d.md)の形状をSphereに設定します。
2. OpenPBRの出力をShape 3DのMaterial入力へ接続します。色の画像があればOpenPBRの**Base Color入力**へ接続し、画像がなければInspectorのBase Colorを調整します。
3. 細かな凹凸を付ける場合は、高さ画像を[Bump Map](./bumpmap.md)へ接続し、Source Image TypeをHeight Mapにします。その出力をOpenPBRのBumpmap入力へ渡します。凹凸の陰影は変わりますが、Sphereの頂点と輪郭は変わりません。
4. Shape 3D、Camera 3D、Point LightをMerge 3Dへまとめ、Renderer 3Dで画像へ変換します。
5. MetalnessとSpecular Roughnessを別々に調整します。色の画像を変える操作とは分けると、見え方の差を追いやすくなります。

21.1 ManualのOpenPBR・Bump Map構成を、描画までの経路を含めて示した説明用の例です。実機での描画結果は未検証です。

### 例：金属ロゴと塗装面を作り分ける

同じShape 3Dで**Base Colorを変えず**、MetalnessとSpecular Roughnessの違いを比較します。金属のような反射を作る側ではMetalnessと光沢の広がりを調整し、塗装面の側では金属感を抑え、必要ならCoat（上塗り層）を追加します。

ロゴの場所によって粗さを変えるにはSpecular Roughnessの画像入力を使えます。ただし21.1 Manualでは、InspectorのSpecular Roughness値に**接続した画像のAlpha**が乗算されると説明されています。RGBに白黒模様を描いただけでは場所ごとの差が反映されない場合があるため、画像のAlphaも確認します。

### 例：室内の環境光とAmbient Occlusion

Ambient Occlusion（AO）は、壁と床の境目など、周囲からの光が届きにくい場所を暗く見せるための補助情報です。OpenPBRのOcclusion入力へAO画像を接続し、InspectorのAmbient Occlusionで強さを調整します。

21.1 Manualはこの入力を**DomeLightまたはAmbientLightを使う場合に利用できる**と説明しています。[DomeLight](./dome-light.md)または[Ambient Light](./ambient-light.md)を含むシーンで確認してください。AOは3D形状を増やしたり、影を投影するライトを作ったりしません。

## うまく見えないとき

- **画面に何も出ない**：OpenPBRの出力はMaterialです。Shape 3DのMaterial入力へ渡し、Shape 3DをMerge 3DとRenderer 3Dで描画しているか確認します。
- **色が想定と違う**：Base ColorのInspector値と画像の色は**乗算**されます。両方を確認します。
- **粗さのテクスチャが効かない**：ManualはSpecular Roughness、Transmission Extra Roughness、Coat RoughnessなどでInspector値と入力画像の**Alpha**との乗算を説明しています。RGBの白黒模様とAlphaの情報を区別します。
- **凹凸が見えない**：Bump Mapの入力画像の種類、Source Image Type、ライトの有無、Renderer 3Dの照明設定を確認します。
- **Emissionを設定したのに周囲が明るくならない**：Manualが説明するのは材質自体の発光表現です。他の物体を照らすライトとして動作するとは記載されていないので、シーン照明にはLight Nodeを追加します。
- **Opacityや裏面の見え方がおかしい**：Opacityは3つの色チャンネルを下げる設定です。Thin Walledや、裏面の法線を加えるTwo Sided Lightingとは別に確認します。透明な両面材質の結果は直感と異なる場合があります（Manual p.2066）。

## 似たノードとの違い

- [Material Merge 3D](./material-merge-3d.md)は**2つのMaterialを混ぜる**Nodeです。OpenPBRはBase ColorやMetalness、Roughnessなど**別々の性質から1つのMaterialを作る**Nodeです。
- [Blinn](./blinn.md)や[Phong](./phong.md)も材質を設定しますが、OpenPBRはCoat、Sheen、Subsurface、Thin Filmなども一つのInspectorで扱います。
- [Bump Map](./bumpmap.md)は画像を法線変化の情報へ変える前処理で、完成した3Dシーンを出力するNodeではありません。
- [Channel Boolean（3D Material）](./channel-boolean-material.md)はMaterialのRGBA成分を選択・演算するNodeです。OpenPBRの材質特性を設定する操作とは用途が異なります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 90、pp.2060–2066。本文とp.2061の接続メニュー・構成図を確認しました。

Base、Specular、Transmission、Coat、Sheen、Subsurface、Emissionなどの係数について、ManualはMaterialのAlphaを調整するという似た説明を繰り返しています。これらの記述だけから各係数の厳密な物理的意味や透過計算を断定していません。特に、**画像のRGBを使う入力**と**画像のAlphaを係数に掛ける入力**を混同しないようにしています。

上の実機例ではResolve 21.1の`MtlPBRUber`とSpecular Roughnessを変えた描画を確認しました。その他の接続図と制作例はManualの記述から構成したものです。全端子の型・初期値・数値範囲、Rendererごとの結果、Edition差は未確認のため、verificationはpartialのままです。
