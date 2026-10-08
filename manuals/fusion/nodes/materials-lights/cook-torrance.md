---
title: "Cook Torrance"
description: "金属などの光沢面をRoughnessとFresnelで調整するClassic 3D Material。"
doc_type: node
term_id: "cook-torrance"
term_short: "Cook Torranceは、表面色と反射の強さ・粗さ・Fresnelを調整するClassic 3D Material。"
verification: partial
aliases: ["Cook Torrance", "3CT"]
concepts: ["classic-3d"]
nodes: ["Cook Torrance"]
node_family: "materials-lights"
controls: ["Diffuse Color", "Alpha", "Opacity", "Specular Color", "Specular Intensity", "Roughness", "Do Fresnel", "Refractive Index", "Attenuation", "Alpha Detail", "Color Detail", "Saturation", "Receives Lighting/Shadows", "Two-Sided Lighting", "Material ID"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Cook Torrance

Cook Torrance [3CT]は、**3Dオブジェクトの表面色と光の反射を設定するMaterial Node**です。反射ハイライトの計算にはFresnel / Beckmannに基づくモデルを使い、金属や磨いた表面の見た目を調整します。**Roughness（粗さ）**を上げると反射が広がり、鋭い光の点から柔らかいハイライトへ変わります。

Cook TorranceはGeometryやLightを作りません。出力するのは**3D Material**で、[Shape 3D](../3d/shape-3d.md)などのMaterial入力へ接続します。Geometry・Light・Cameraを[Merge 3D](../3d/merge-3d.md)でまとめ、[Renderer 3D](../3d/renderer-3d.md)で描画すると反射が画像になります。基本のデータの流れは[Classic 3D scene](../../learn/02-data/classic-3d.md)で説明しています。

## 入力と出力

Cook Torranceには**6つの任意入力**があります。何も接続しなくても、Inspectorだけで均一な色と光沢を作れます。画像や別のMaterialを接続すると、表面の位置ごとに色や反射を変えられます。

| 入力 | 接続できるデータ | 作用 |
| --- | --- | --- |
| **Diffuse Color Material**（オレンジ） | 2D Image / 3D Material | 基本色と模様。色柄の画像を貼ると物体の表面色が変わる。 |
| **Specular Color Material**（緑） | 2D Image / 3D Material | ハイライトの色。部分ごとに反射色を変える。 |
| **Specular Intensity Material**（マゼンタ） | 2D Image / 3D Material | ハイライトの強さ。2D画像では**Alpha**を使い、RGBは使わない。 |
| **Specular Roughness Material**（白） | 2D Image / 3D Material | ハイライトの広がり。画像の**Alpha**をInspectorのRoughnessに掛け合わせる。 |
| **Specular Refractive Index Material**（白） | 2D Image / 3D Material | Fresnelの屈折率計算へテクスチャを与える。チャンネルの扱いは下記の注意を参照。 |
| **Bump Map Material**（白） | **3D Materialのみ** | 微細な凹凸で反射の方向を変える。通常は[Bump Map](./bumpmap.md)を接続する。 |

**出力は3D Material**です。Merge 3DのScene入力ではなく、3DオブジェクトのMaterial入力へ渡します。Bump Map Materialへ高さ画像を直接入れず、Bump Map NodeでMaterialに変換してください。

端子を選びにくい場合は、WindowsではAlt、macOSではOptionを押しながら他のNodeの出力をCook Torranceのタイルへドラッグして離すと、接続先の入力を一覧から選べます。

**Refractive Index入力の注意：** 21.1 Manualの入力説明にはRGBを使うとありますが、Inspectorの説明では入力画像のAlphaとの乗算が記されています。記述が一致しないため、画像チャンネルの正確な優先順位はここでは断定しません。

## 基本の接続例：金属の球体

```text
色の画像 ──────────────→ Cook Torrance［Diffuse Color Material］
                                      │
粗さ用のAlpha画像 ─────→ Cook Torrance［Specular Roughness Material］
                                      │
                                Material出力 → Shape 3D［Material］─┐
Camera 3D ────────────────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D Image
Point Light ──────────────────────────────────────────────────────┘
```

Shape 3DをSphereにしてCook Torranceを接続します。Lightを球体の横へ動かし、Roughnessを小さくすると鋭い反射、大きくすると幅の広い反射になります。粗さ用のAlpha画像を接続すれば、同じ物体の一部分だけ反射を広げられます。画像の位置合わせには物体のUVなどのテクスチャ座標が関係します。

## Inspectorの主な設定

### Diffuse：表面色と不透明度

- **Diffuse Color**：基本色。Diffuse画像を接続すると、そのRGBと掛け合わせられる。
- **Alpha**：MaterialのAlpha。Diffuse画像のAlphaとも掛け合わせられ、レンダリング結果のAlphaへ影響する。
- **Opacity**：表面の不透明度。下げるとDiffuseとSpecularの色・Alphaが弱まり、物体が透ける。

### Specular：ハイライトの色・強さ・粗さ

- **Specular Color**：反射光の色。プラスチックでは白っぽい反射、金属では材質色に近い反射を作る用途がある。
- **Specular Intensity**：反射の強さ。画像を接続した場合はそのAlphaで場所ごとの強さを制御する。
- **Roughness**：反射の広がり。大きいほどハイライトが広がり、ブラッシュ仕上げのように見える。画像のAlphaと組み合わせられる。
- **Do Fresnel**：Fresnel計算を有効にし、表面角度に応じた反射を考慮する。
- **Refractive Index**：Do Fresnelを有効にすると現れる、**ハイライト計算用**の屈折率。透明な物体を通る像そのものを屈折させる機能ではない。

Roughnessは反射の「明るさ」だけを変える値ではありません。反射の強さを主に変えたい場合はSpecular Intensity、広がりを変えたい場合はRoughnessを調整します。

### Transmittance：影を通る光

Transmittanceは、物体が落とす**影へ通す光と色**を調整します。表面自体が透明に見えるかを決めるOpacityとは別です。

- **Attenuation**：通過する光のRGB成分の割合。赤成分だけを通すと、赤い透過影を作れる。
- **Alpha Detail**：Alphaが影の形へ影響する度合い。0ではAlphaを無視し、1ではAlphaを反映する。
- **Color Detail**：Diffuseの色やテクスチャを、透過光へどれだけ反映するか。
- **Saturation**：透過光による影の彩度。0なら色のない影になる。

透過影を見るには、LightとRenderer 3D側の影設定も必要です。

### その他

- **Receives Lighting / Receives Shadows**：照明や影をこのMaterialへ反映するかを切り替える。
- **Two-Sided Lighting**：裏面用の法線を追加し、平面や開いた形状の裏側にも光を当てる。裏面が見えることと、裏面へ照明が当たることは別。
- **Material ID**：識別用の数値。Renderer 3Dで対応する補助チャンネルを有効にするとMatIDへ出力できる。

## 具体的な運用例

### 金属のつまみを磨き分ける

Shape 3Dで円柱を作り、Cook TorranceをMaterial入力に接続します。Diffuse ColorとSpecular Colorを金属に合わせて設定し、Do Fresnelを有効にします。前面は鋭く、側面は広い反射にしたい場合、UVに合わせたAlpha画像をSpecular Roughness Materialへ入れます。Point Lightを動かして、部分ごとのハイライトの広がりを確認します。

### 塗装と露出した金属の光沢を変える

Diffuse Color Materialへ塗装の模様を入力し、Specular Intensity Materialへ光沢を出す部分だけAlphaが高い画像を接続します。さらにSpecular Roughness Materialへ別のAlpha画像を与えると、反射の強さと粗さを別々に配置できます。RGBの明暗ではなく、各入力が使う**Alpha**の値に注意してください。

### 微細な凹凸を反射へ加える

[Fast Noise](../generators/fast-noise.md)などで高さ画像を作り、[Bump Map](./bumpmap.md)で3D Materialへ変換してからCook TorranceのBump Map Material入力へ接続します。Lightを動かすと細かな模様に沿って反射が変わります。これはMeshの形状を変える[Displace 3D](../3d/displace-3d.md)と異なり、輪郭を変えません。

## 関連Nodeと注意点

- [Blinn](./blinn.md)・[Phong](./phong.md)：基本色と反射を調整する別のClassic 3D Material。Cook TorranceはRoughnessとFresnelを使いたい場合の候補。
- [Ward](./ward.md)：一定の方向へ伸びるような異方性反射を扱うMaterial。
- [OpenPBR](./openpbr.md)：Base、Specular、Coat、Transmissionなどをまとめて扱うPBR Material。
- [Bump Map](./bumpmap.md)：高さ画像を凹凸用Materialへ変換する。
- [Material Merge 3D](./material-merge-3d.md)：複数のMaterialを組み合わせる。
- [3D Material / Lightノード一覧](./index.md)：このFamilyの役割と選び方。

## 出典と確認範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 90「3D Material Nodes」、**Cook Torrance [3CT]（pp.2054–2058）**。6入力、Material出力、Roughness / Fresnel / Transmittanceを含むInspectorの説明を確認しました。

`verification: partial`は、runtime REGID、各値の初期値・範囲、Edition差、実機の描画結果が未確認であることを示します。Refractive Index用画像のチャンネル処理も、Manual内の記述に差があるため未確定としています。
