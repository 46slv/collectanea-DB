---
title: "Blinn"
description: "3D Objectの表面色、光沢、透過光を設定し、画像で各成分を制御するClassic 3D Material。"
doc_type: node
term_id: "blinn"
term_short: "Blinnは、3D Objectの表面が光をどう受けて見えるかを設定するClassic 3D Material。"
verification: partial
aliases: ["Blinn", "3Bl"]
concepts: ["classic-3d"]
nodes: ["Blinn"]
node_family: "materials-lights"
controls: ["Diffuse Color", "Alpha", "Opacity", "Specular Color", "Specular Intensity", "Specular Exponent", "Attenuation", "Alpha Detail", "Color Detail", "Saturation", "Receives Lighting/Shadows", "Two-Sided Lighting"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Blinn

Blinn [3Bl]は、**3D Objectの表面色と光の反射の仕方を決めるMaterial Node**です。たとえば球体に色を付け、ライトを当てたときに明るくなる場所やハイライト（光沢のある部分）の形を調整できます。

Geometryを作ったり、2D画像に光を描き込んだりするNodeではありません。Blinnの出力は**3D Material**で、[Shape 3D](../3d/shape-3d.md)などのMaterial inputへ接続します。Object・Camera・Lightをまとめる3D sceneの作り方は[Classic 3D scene](../../learn/02-data/classic-3d.md)を参照してください。

Shape 3DなどのMaterialタブにある標準材質も、簡略化されたBlinnモデルです。独立したBlinn Nodeを使うと、表面色だけでなく、ハイライトの色・強さ・鋭さや細かな凹凸を、別々の画像で制御できます。

## 入力と出力

Blinnには**5つの任意のMaterial/Texture入力**があります。各入力の画像やMaterialから得た値は、Inspectorで設定した対応成分の値と掛け合わせて使用します。

| 入力 | 接続できるもの | 何が変わるか |
| --- | --- | --- |
| **Diffuse Texture**（オレンジ） | 2D Image / 3D Material | 物体の基本の表面色。画像を貼れば模様や色むらが現れる。 |
| **Specular Color Material**（緑） | 2D Image / 3D Material | ハイライトの色。表面の位置によって反射色を変えられる。 |
| **Specular Intensity**（マゼンタ） | 2D Image / 3D Material | ハイライトの強さ。**2D ImageではAlphaのみ**を使い、RGBは使わない。 |
| **Specular Exponent Material**（青緑） | 2D Image / 3D Material | ハイライトの広がり方。**2D ImageではAlphaのみ**を使い、RGBは使わない。 |
| **Bump Map Material**（白） | **3D Materialのみ** | 細かな凹凸に応じて光の当たり方を変える。通常は[BumpMap](./bumpmap.md)の出力を入れる。 |

Specular Intensityの入力はManual本文で「Specular Intensity Materials」と表記されています。表では読みやすく成分名を示しており、runtimeの端子ラベルを独立に確定したものではありません。

**出力:** 単一の3D Material。2D Imageでも3D sceneでもありません。GeometryのMaterial inputに接続した後、GeometryをRenderer 3Dで描画すると画像になります。

## 基本の接続例

次は、色付きの球体をライトで照らす構成です。

```text
色の画像 → Blinn [Diffuse Texture] → Shape 3D [Material] ─┐
Point Light ───────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D Image
Camera 3D ────────────────────────────────────────────────┘
```

画像の色はDiffuse Textureとして球体の表面に使われます。Point Lightを動かすと、Blinnの設定に従って表面の明るさやハイライトが変化します。照明が見えないときは3D ViewerのLighting表示とRenderer 3DのLighting設定も確認してください。

凹凸を足す場合は、白黒の模様などを[BumpMap](./bumpmap.md)へ渡し、その**Material出力**をBlinnのBump Map Material入力へ接続します。Blinnの白い端子へ2D Imageを直接つなぐ構成ではありません。

## Inspectorの主な設定

### Diffuse — 表面色と透明度

- **Diffuse Color**: 基本色。Diffuse Textureを接続すると、設定色と画像の色を掛け合わせます。白いテクスチャでもDiffuse Colorを赤くすれば赤みが付きます。
- **Alpha**: 材質のAlpha。Diffuse TextureのAlphaがあれば掛け合わせます。DiffuseとSpecularの双方に作用し、レンダリング後のAlphaにも影響します。
- **Opacity**: 表面そのものの不透明度。下げるとDiffuseとSpecularの色・Alphaがともに弱まり、物体が透けます。

### Specular — 光沢

- **Specular Color**: ハイライトの色。画像を接続した場合は、その色と掛け合わせます。白い反射にするか、金属のように色の付いた反射にするかを決める項目です。
- **Specular Intensity**: ハイライトの強さ。強弱用画像を接続した場合、画像のAlphaとの積で場所ごとに強さが変わります。
- **Specular Exponent**: ハイライトの減衰・鋭さ。値を上げるほどハイライトの輪郭が鋭くなり、表面が滑らかで光沢の強い印象になります。画像入力時はAlphaとの積で調整されます。

Blinnでは面のNormal（表面の向き）と、光源方向・視線方向の中間ベクトルの関係からハイライトを求めます。同じ「Blinn」という名前でも、他の3Dソフトと完全に同じ見え方になるとは限りません。

### Transmittance — 表面を通過する光

**Opacity（物体の見た目の透明度）とは別の設定**です。たとえば物体を不透明に表示しながら、影には色付きの光を通す表現を設定できます。

- **Attenuation**: 通過する光のRGB成分。特定の色だけ通せば、色付きガラスのような影を作れます。
- **Alpha Detail**: 物体のAlphaを、どの部分が影を落とすかの判定へ反映する度合い。0ではAlphaを無視して物体全体が影を落とし、1ではAlphaに応じた影になります。
- **Color Detail**: Diffuse ColorとTextureの色を通過光へどれだけ反映するか。模様のある色付きの影を作るときに使います。
- **Saturation**: 通過光による影の色の彩度。0なら色成分を持たない影になります。

### 照明・裏面

- **Receives Lighting / Receives Shadows**: Scene内の照明・影の影響を材質が受けるかどうか。無効にすると対応する影響を受けなくなります。
- **Two-Sided Lighting**: 裏面のために逆向きのNormalを使い、片面のPlaneや開いたGeometryの裏側にも照明が当たるようにします。通常の閉じたObjectでは必要なときだけ使用します。

## 具体的な運用例

### 模様のあるプラスチック

Diffuse Textureに色柄の画像を接続します。Specular Colorを白寄りにし、Specular Intensityで光沢の強さを調整します。Specular Exponentを変えると、広く柔らかいハイライトから小さく鋭いハイライトまで変えられます。Objectを回転させ、柄と光沢が別の要素として変化することをRenderer 3Dで確認します。

### 一部分だけ強く反射させる

たとえばロゴの印刷面と下地の光沢を変えるには、Specular Intensityへ、ロゴ部分のAlphaが高い画像を接続します。RGBの明暗ではなく**Alpha値**が強弱に使われるため、画像のAlphaを確認してください。Specular Exponentへ別のAlpha画像を入れると、光沢の鋭さも場所ごとに変えられます。

### 凹凸のある塗装

ノイズ画像をBumpMapで凹凸用Materialへ変換し、BlinnのBump Map Materialへ接続します。Diffuseには塗装色を使い、ライトの位置を動かして細かな陰影の変化を確認します。これはMeshの頂点位置を変更する[Displace 3D](../3d/displace-3d.md)とは異なり、材質側で光の当たり方を変える方法です。

## 関連Nodeとの使い分け

- [Phong](./phong.md): 同じDiffuse系の表現を持ちますが、特に斜めから見たときのハイライトの広がり方が異なります。
- [OpenPBR](./openpbr.md): 物理ベースの材質としてBase、Specular、Coat、Transmissionなどをまとめて扱いたい場合の候補です。
- [Material Merge 3D](./material-merge-3d.md): Blinnのような材質同士を混合し、1つのMaterialとして使います。
- [BumpMap](./bumpmap.md): 凹凸用のMaterialを作り、Blinnの白い入力へ渡します。
- [3D Material / Lightノード一覧](./index.md): 他のMaterialやLightとの比較。
- [Classic 3D scene](../../learn/02-data/classic-3d.md): Material、Geometry、Light、Renderer 3Dの接続関係。

## 出典と確認範囲

**DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 90「3D Material Nodes」、**Blinn [3Bl]、pp.2047–2050**を基準に、5入力の種類、Material出力、Inspectorの各項目と入力画像による調整方法を確認しました。Fusion Fundamentals、Chapter 84（p.1851）もBlinnと標準材質の違い、Phongとの比較に使用しています。

`verification: partial`はruntimeの内部REGID、Inspectorの正確な初期値・range、Edition別の表示や実機でのレンダリング結果が未検証であることを示します。これらをManualだけから推測していません。