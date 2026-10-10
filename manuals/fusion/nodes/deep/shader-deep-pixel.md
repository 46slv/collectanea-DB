---
title: Shader (Deep Pixel)
description: Normalチャンネルから面の向きを読み取り、レンダリング後の明るさ・ハイライト・映り込みを調整するShaderノード。
doc_type: node
term_id: shader-deep-pixel
term_short: 2D画像に保存されたNormal（面の向き）を使い、レンダリング後の照明や反射を調整するNode。
verification: partial
aliases: [Shader, Shd, Shader (Deep Pixel)]
concepts: [auxiliary-channels, image-data, normals, relighting]
nodes: [Shader]
node_family: deep
controls: [Ambient, Diffuse, Specular, Reflection, Reflection Type, Equator Angle, Polar Height, Diffuse Curve, Specular Curve, Specular Color]
inputs: [image, image, mask]
outputs: [image]
tasks: [aov, relight, reflection, shading]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Shader (Deep Pixel)

Shaderは、3Dシーンを2D画像へ描画した後に、表面の明るさ・ハイライト・映り込みを調整するNodeです。通常の色補正と違い、<Term id="image">Image</Term>に格納された**Normal（法線）チャンネル**から、画素ごとに表面が向いている方向を読み取ります。

例えば球の正面と側面では表面の向きが違います。NormalのX・Y・Z成分を使うことで、その違いに応じて明暗や反射の見え方を変えられます。**Normalを持たない実写素材やRGBA画像では効果がありません**。

名称はDeep Pixelですが、Shaderの入力は**補助チャンネル付きの2D画像**です。画素内に複数の奥行きサンプルを保存するDeep Imageとは別物です。詳しくは[補助Channel / AOV](../../learn/02-data/auxiliary-channels.md)を参照してください。

## 入力

### Input

**Normal X・Y・Z**チャンネルを含む2D画像です。Normalは別端子へ配線するのではなく、この画像の補助情報として読み取ります。RGBAの色だけでは面の向きは分かりません。

### Reflection Map Image

映り込みに使う環境画像を接続する**緑色の任意入力**です。Normalを入力する端子ではありません。マニュアルは、**32-bit floatの正距円筒図法（equirectangular）画像**を適した形式として挙げています。

### Effect Mask

効果を2D画像の一部へ限定する**青色の任意入力**です。マニュアルによれば、マスクは処理後の結果に適用されます。

入力画像にObjectID / MaterialIDが保存されていれば、共通のSettingsから対象の物体・材質を制限することもできます。IDが画像になければその選択はできません。

## Light controls

### Ambient

shadow部にも加わるbase illuminationです。

### Diffuse

surfaceから全方向へ散乱するbase color / light成分を調整します。

### Specular

view方向へ反射するhighlight成分を調整します。

### Reflection

Reflection Mapの寄与量です。Reflection inputが無い場合は効果を持ちません。

## Reflection Type

緑入力の画像をどのように面へ投影するかを選びます。

- **Screen**：視点の後ろにスクリーンがあるように環境画像を配置する
- **Spherical**：シーン全体を取り囲む巨大な球へ投影するように扱う
- **Refraction**：面の形状に応じて屈折・歪みが生じるように扱う

**Equator Angle**は左右方向、**Polar Height**は上下方向の向きを調整します。Reflectionの強さだけを変えても反射位置が合わない場合に確認します。

## Shader tab

**Diffuse / Specular**チェックボックスを有効にすると、それぞれの明暗変化をShaderのSpline画面で編集できます。**In / Out**は選択ポイントの値を表示・編集する項目です。**Specular Color**ではハイライトの色を調整します。

例えばハイライトが広がりすぎる場合は、Specularの量だけでなくカーブの変化も比較します。カーブの形状は面の向きに対する陰影の出方を変えるため、作業前後をViewerで見比べます。

## 例1：Renderer 3Dの出力へ反射を追加する

~~~text
3Dオブジェクト ──┐
Camera 3D ──────┼→ Merge 3D → Renderer 3D（RGBA + Normal） → Shader → 出力
Light ──────────┘                                          ↑ Reflection Map Image
環境画像（LatLong形式など）──────────────────────────────────┘
~~~

1. [Renderer 3D](../3d/renderer-3d.md)の**Output Channels**でNormalを有効にしてから、Shaderの**オレンジ入力**へ接続します。3DシーンをShaderへ直接接続する構成ではありません。
2. **Ambient**で影の部分にも加わる明るさ、**Diffuse**で拡散反射、**Specular**で光沢のあるハイライトを個別に調整します。どの成分が変化しているか、一項目ずつ比較します。
3. 環境の映り込みが必要ならHDR画像などを緑入力へ接続し、**Reflection**の寄与を調整します。Reflection Mapをつながなければ、Reflectionの値を変えても効果はありません。
4. 反射の位置や歪み方が意図に合わない場合は、**Reflection Type / Equator Angle / Polar Height**を変更して比較します。
5. 特定の物体だけを調整したい場合は、Effect MaskまたはObjectID / MaterialIDによる制限を使います。

Shaderは3Dレンダリングをやり直すNodeではありません。**レンダリング後に残された表面方向の情報を利用する後処理**なので、画像の裏側や隠れた面の情報を新しく生成するわけではありません。

## 例2：読み込んだEXRのNormalパスを使う

外部の3Dソフトで作ったEXRでも、Normalの各成分が保存されていればShaderの入力にできます。ただし、**RGBにNormalらしい色が見えていることと、FusionのNormal補助チャンネルに正しく割り当てられていることは異なります**。

1. **MediaIn**または**Loader**で、カラー画像とNormalパスを含む素材を読み込みます。
2. **Channels**または**Format**タブで、法線X・Y・Z成分をそれぞれ**X Normal / Y Normal / Z Normal**チャンネルへ割り当てます。
3. 読み込みノードの出力をShaderのオレンジ入力へ接続します。必要に応じて反射用EXRを緑入力へつなぎます。
4. ShaderのAmbient・Diffuse・Specularを変え、法線に応じた変化が出るか確認します。

この接続は21.1マニュアルのChapter 77「Understanding Image Channels」に記載された手順です。NormalパスがRGBにしか存在しない場合、[Channel Booleans](../color/channel-boolean.md)などで補助チャンネルへ割り当てます。元のRGBAとNormalデータを入れ替えないよう注意してください。

## 3D Materialとの違い

OpenPBRやPhongは3D sceneをrenderする前のMaterialです。

Shader (Deep Pixel)はrender後の2D Image + Normal channelへpost-processを行います。

## よくある問題

- **Shaderの値を変えても変化しない**：オレンジ入力画像にNormal X・Y・Zがあるかを確認します。外部EXRならMediaIn / Loaderの割り当ても確認します。
- **Reflectionが効かない**：緑のReflection Map Image入力に画像を接続しているか確認します。
- **面の境界で陰影が不自然**：[Renderer 3D](../3d/renderer-3d.md)のNormal補助チャンネル用アンチエイリアス設定を確認します。21.1マニュアルはNormal値を境界で平均しないことを強く推奨しています。
- **別の物体にも効果が出る**：Effect MaskやObjectID / MaterialIDの指定に対応するデータが入力画像にあるか確認します。

## 関連Node・概念

- [補助Channel / AOV](../../learn/02-data/auxiliary-channels.md) — NormalやIDなどの意味
- [Renderer 3D](../3d/renderer-3d.md) — Normal付きの2D画像を作る
- [Channel Booleans](../color/channel-boolean.md) — 外部画像のRGBと補助チャンネルを組み合わせる
- [Ambient Occlusion](./ambient-occlusion-deep-pixel.md) — ZとNormalなどを使って接触部の陰影を近似する
- [Texture (Deep Pixel)](./texture-deep-pixel.md) — UV座標を使って面の模様を変更する

## 出典と確認範囲

一次資料：**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**。

- Chapter 96「Shader [Shd]」、pp.2263–2266：Normal要件、入出力、反射の投影方式、Light / Shaderの各設定。
- Chapter 77「Understanding Image Channels」、p.1694：MediaIn / LoaderでNormal X・Y・Zを割り当てる具体的な手順。
- Chapter 88「Renderer3D」、pp.1974–1975：Normal出力と補助チャンネルのアンチエイリアス。

外部EXRとResolve 21.1の実機差・GPU差は未検証のため、**verification: partial**としています。
