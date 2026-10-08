---
title: "Ward"
description: "UVのU/V方向ごとに反射の広がりを調整し、ヘアライン加工の金属などを表現するClassic 3D Material。"
doc_type: node
term_id: "ward"
term_short: "Wardは、UVの2方向でハイライトの広がりを別々に調整できるClassic 3D Material。"
verification: partial
aliases: ["Ward", "3Wd"]
concepts: ["classic-3d"]
nodes: ["Ward"]
node_family: "materials-lights"
controls: ["Diffuse Color", "Alpha", "Opacity", "Specular Color", "Specular Intensity", "Spread U", "Spread V", "Attenuation", "Alpha Detail", "Color Detail", "Saturation", "Receives Lighting/Shadows", "Two-Sided Lighting", "Material ID"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Ward

Ward [3Wd]は、3Dオブジェクトの表面色と光の反射を設定する**3D Material Node**です。特徴は、反射の明るい部分（ハイライト）の広がりを**U方向とV方向で別々に変えられる**ことです。円形に広がる反射だけでなく、一方向へ伸びる反射も作れます。

たとえば金属板を一定方向に磨くと、細い傷の向きによって光が伸びて見えます。Wardはこのような**異方性反射**を表すのに適しています。U/Vは物体の表面へ画像を貼る位置を表す**UV座標**の2方向です。物体の世界座標のX/Y軸と同じとは限りません。

Ward自体は形状や光源を生成せず、**3D Material**を出力します。[Shape 3D](../3d/shape-3d.md)などのMaterial入力へ渡し、照明を加えて[Renderer 3D](../3d/renderer-3d.md)で画像にします。データの区別は<Term id="classic-3d">Classic 3D</Term>の解説を参照してください。

## 入力と出力

6つの入力から、表面の色、反射の強さ、反射が伸びる方向の分布、細かな凹凸を画像や別のMaterialで制御できます。入力を接続せず、Inspectorの値だけで均一なMaterialを作ることもできます。

| 入力 | 受け取るデータ | 何が変わるか |
| --- | --- | --- |
| **Diffuse Material**（オレンジ） | 2D Image / 3D Material | 表面の基本色と模様。塗装の色やラベル画像などを貼る。 |
| **Specular Color Material**（緑） | 2D Image / 3D Material | ハイライトの色。反射色を表面の位置によって変える。 |
| **Specular Intensity Material**（マゼンタ） | 2D Image / 3D Material | ハイライトの強さ。2D Imageでは**Alpha**を使い、RGBは使わない。 |
| **Spread U Material**（白） | 2D Image / 3D Material | U方向の反射の広がり。接続画像の**Alpha**とInspectorのSpread Uを掛け合わせる。 |
| **Spread V Material**（白） | 2D Image / 3D Material | V方向の反射の広がり。接続画像の**Alpha**とInspectorのSpread Vを掛け合わせる。 |
| **Bump Map Material**（白） | **3D Materialのみ** | 表面の法線を変え、細かな凹凸に沿って反射の方向を変える。 |

**出力は3D Material**です。Merge 3DのScene入力へ直接渡すものではありません。Bump Map Material入力には高さ画像をそのまま接続せず、[Bump Map](./bumpmap.md)でMaterialへ変換してから接続します。

入力端子が重なって選びにくい場合は、WindowsではAlt、macOSではOptionを押したまま他のNodeの出力をWardのタイルへドラッグして離すと、入力をメニューから選べます。

## 最小構成：磨いた金属の球

    Ward［Material出力］ → Shape 3D［Material］ ─┐
    Camera 3D ────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D Image
    Point Light ──────────────────────────────────┘

1. Shape 3DをSphereにし、WardをMaterial入力につなぎます。
2. WardのSpecular Intensityを上げ、光を当ててハイライトを見えるようにします。
3. Spread UとSpread Vを同じ程度にすると、両方向へ近い広がりの反射になります。一方をもう一方より大きくすると、特定のUV方向へ広がった反射を作れます。
4. ライトやカメラを動かし、表面の角度によってハイライトがどう変わるかを観察します。

異方性反射は**UVの向きに依存**します。同じWardの設定でも、物体のUVの張り方が違えば反射の伸びる方向が変わります。反射の向きを合わせたい場合は、値を変える前にUVの配置も確認します。

## Inspectorの主な設定

### Diffuse：表面の基本色と透明度

- **Diffuse Color**：照明を受けた物体の基本色。Diffuseの画像を接続すると、Inspectorの色と画像の色が掛け合わされます。
- **Alpha**：MaterialのAlpha。Diffuse画像がある場合は、そのAlphaとも掛け合わされます。
- **Opacity**：表面全体の不透明度。下げるとDiffuseとSpecularの色・Alphaが弱まり、透けて見えます。

### Specular：反射の色と方向別の広がり

- **Specular Color**：ハイライトの色。金属らしい有色反射や、明るい無彩色の反射を調整します。
- **Specular Intensity**：ハイライトの強さ。画像を接続した場合はそのAlphaで表面ごとに強さを変えられます。
- **Spread U**：UVのU方向に沿った反射の減衰・広がり。**小さい値ほどその方向の反射が鋭く**なります。
- **Spread V**：UVのV方向に沿った反射の減衰・広がり。**小さい値ほどその方向の反射が鋭く**なります。

Spread U/Vはハイライトの**形**を変える値で、主に明るさを調整するSpecular Intensityとは役割が異なります。Spread U Material / Spread V MaterialへAlpha画像を与えると、たとえば金属の一部だけ磨き方向や反射の広がりを変えられます。

### Transmittance：影を通過する光

物体の見かけの透明度を決めるOpacityとは別に、**影へどれだけ光や色を通すか**を設定します。

- **Attenuation**：通過する光のRGB成分。たとえば赤成分だけを通すと、赤い透過影を作れます。
- **Alpha Detail**：画像のAlphaを影の形へ反映する度合い。
- **Color Detail**：Diffuseの色や画像の模様を、透過する光の色へ反映する度合い。
- **Saturation**：透過光でできる影の彩度。

透過影を見るにはLightとRenderer 3D側の影の設定も必要です。

### その他

- **Receives Lighting / Receives Shadows**：このMaterialが照明や影の影響を受けるかを切り替えます。
- **Two-Sided Lighting**：裏面側にも別の法線を設けて照明計算します。形状自体を厚くする機能ではありません。
- **Material ID**：Material識別用の数値。Renderer 3Dで対応する補助チャンネルを有効にするとMatIDとして出力できます。

## 具体的な運用例

### ヘアライン加工の金属板

Shape 3DでPlaneを作ってWardを接続します。Diffuse Colorを暗いグレーにし、Specular ColorとIntensityで明るい反射を設定します。Spread UとSpread Vに差を付け、細く長いハイライトにします。実際の研磨方向と光の伸びる方向が合わないときは、UVの向きを確認します。

### 一部だけ粗い金属の筐体

筐体のUVに合わせてAlpha画像を作り、Spread U Materialに入力します。Alphaの異なる場所でU方向の反射の広がりが変わるため、均一な金属と部分的に磨いた領域を同じMaterial内で表現できます。Spread V Materialにも別のAlpha画像を使えば、方向ごとの変化を独立して描けます。

### 表面の細い傷を反射へ加える

[Fast Noise](../generators/fast-noise.md)などで細かな模様の画像を作り、[Bump Map](./bumpmap.md)を通してWardのBump Map Materialへ接続します。光源を動かすと、模様に応じた細かな反射の変化が見えます。これは法線を変える処理であり、物体の輪郭やMeshそのものを変形するものではありません。

## 関連Nodeと使い分け

- [Blinn](./blinn.md) / [Phong](./phong.md)：一般的な光沢の調整に使うClassic 3D Material。UV方向ごとに反射の広がりを分けたい場合はWardを検討します。
- [Cook Torrance](./cook-torrance.md)：RoughnessやFresnelを使って反射を調整するMaterial。WardはU/Vごとの反射の広がりが必要なときに向いています。
- [Reflect](./reflect.md)：環境マップから反射・屈折風の見た目を加えるNode。WardのDiffuse Materialへ接続する構成も公式Manualに記載されています。
- [OpenPBR](./openpbr.md)：複数の物理ベースの表面要素をまとめて扱う別のMaterial。
- [3D Material / Lightノード一覧](./index.md)：Family全体と他のMaterial・Lightの選び方。

## 出典と確認範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 90「3D Material Nodes」、**Ward [3Wd]（pp.2075–2079）**。6入力、Material出力、Spread U / V、Diffuse、Specular、Transmittance、その他のInspector説明を確認しました。

`verification: partial`は、runtime REGID、Inspectorの初期値・設定範囲、Edition差、実機での描画結果が未確認であることを示します。各値のdefaultやrangeはここでは断定していません。
