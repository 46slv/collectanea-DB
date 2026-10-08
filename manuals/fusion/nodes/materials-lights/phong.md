---
title: "Phong"
description: "Classic 3Dの表面色と光沢を設定するMaterial。画像でハイライトや凹凸を制御する。"
doc_type: node
term_id: "phong"
term_short: "Phongは、3D Objectの表面色と光沢を設定し、画像で各成分を調整できるClassic 3D Material。"
verification: partial
aliases: ["Phong", "3Ph"]
concepts: ["classic-3d"]
nodes: ["Phong"]
node_family: "materials-lights"
controls: ["Diffuse Color", "Alpha", "Opacity", "Specular Color", "Specular Intensity", "Specular Exponent", "Attenuation", "Alpha Detail", "Color Detail", "Saturation", "Receives Lighting/Shadows", "Two-Sided Lighting", "Material ID"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Phong

Phong [3Ph]は、**3D Objectの表面色と光沢を設定するMaterial Node**です。ライトが当たったときにできる明るい反射部分（スペキュラーハイライト）の色・強さ・広がり方を調整できます。特に、磨かれたプラスチックのような表面を作るときに向いています。

Phong自体は3Dの形を作らず、2D画像を直接加工するNodeでもありません。出力は**3D Material**で、[Shape 3D](../3d/shape-3d.md)などのMaterial入力へ接続します。GeometryやLightを[Renderer 3D](../3d/renderer-3d.md)で描画すると、Phongの表面色・光沢が画像に現れます。データの接続関係は[Classic 3D scene](../../learn/02-data/classic-3d.md)で説明しています。

## 入力と出力

Phongには、色や反射を表面の場所ごとに変えるための**5つの任意入力**があります。入力した画像やMaterialの値は、Inspectorで設定した対応成分の値と掛け合わせて使います。

| 入力 | 接続できるデータ | 変わるもの |
| --- | --- | --- |
| **Diffuse Material**（オレンジ） | 2D Image / 3D Material | 表面の基本色や模様。ロゴ画像を貼ると、その模様が物体の表面色になる。 |
| **Specular Color Material**（緑） | 2D Image / 3D Material | ハイライトの色。場所ごとに反射の色を変えられる。 |
| **Specular Intensity Material**（マゼンタ） | 2D Image / 3D Material | ハイライトの強さ。2D Imageでは**Alphaのみ**を使い、RGBは使わない。 |
| **Specular Exponent Material**（青緑） | 2D Image / 3D Material | ハイライトの鋭さ。2D Imageでは**Alphaのみ**を使い、RGBは使わない。 |
| **Bump Map Material**（白） | **3D Materialのみ** | 表面の細かな凹凸に応じて光の当たり方を変える。通常は[Bump Map](./bumpmap.md)を接続する。 |

**出力は3D Material**です。Merge 3DのScene入力へ直接つなぐのではなく、3D ObjectのMaterial入力へ渡します。Bump Map Materialにも2D画像を直接接続せず、Bump Map Nodeで材質用のデータへ変換してください。

入力端子を選びにくい場合は、Option / Altを押したまま他のNodeの出力をPhongのタイルへドラッグして離すと、入力一覧から接続先を選べます。

## 基本の接続例：光沢のある球体

~~~text
色の画像 ───────────────→ Phong［Diffuse Material］
                             │
高さ画像 → Bump Map ──────→ Phong［Bump Map Material］
                             │
                       Phong［Material出力］ → Shape 3D［Material］─┐
Camera 3D ───────────────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D Image
Point Light ─────────────────────────────────────────────────────┘
~~~

色の画像は球体の表面色になります。高さ画像をBump Mapへ渡すと、平坦なメッシュのまま細かな凹凸を陰影に反映できます。Point Lightを動かすと、ライトの方向に応じてハイライトの位置が変わります。

Bump Mapを使わない場合は、Phongを単独でShape 3Dへ接続して、Inspectorから色と光沢を設定できます。

## Inspectorの主な設定

### Diffuse：表面色と不透明度

- **Diffuse Color**：基本色。Diffuseの画像を接続した場合、その画像のRGB値と掛け合わせます。
- **Alpha**：MaterialのAlpha。Diffuse画像にAlphaがあれば掛け合わせられ、DiffuseとSpecularの双方、およびレンダリング後のAlphaへ影響します。
- **Opacity**：表面の見た目の不透明度。下げるとDiffuseとSpecularの色・Alphaがともに弱まり、物体が透けます。

### Specular：ハイライト

- **Specular Color**：ハイライトの色。接続した画像があれば、画像の色と掛け合わせます。プラスチックの白い反射、金属の色付きの反射などを調整します。
- **Specular Intensity**：ハイライトの強さ。専用画像を使う場合は、その**Alpha値**と掛け合わせます。
- **Specular Exponent**：ハイライトの減衰・鋭さ。大きい値ほど狭く鋭いハイライトになり、表面が滑らかで光沢の強い印象になります。専用画像があれば、そのAlpha値と掛け合わせます。

Specular IntensityとSpecular Exponentへ画像を入れるとき、RGBを白黒にしても強弱の値としては使われません。**Alphaチャンネルに必要な濃淡を設定**してください。

### Transmittance：影に通す光

Phongでは、**見た目の透明度を決めるOpacity**とは別に、物体を通って影へ届く光を調整できます。物体の表面を不透明に描画しながら、透過光による色付きの影を作ることもできます。

- **Attenuation**：通過する光のRGB成分ごとの割合。たとえば赤だけを通すと赤みを持つ影になります。
- **Alpha Detail**：Alphaを影の形へ反映する度合い。0ではAlphaを無視して物体全体が影を落とし、1ではAlphaに応じて影が変わります。
- **Color Detail**：Diffuseの色やテクスチャの模様を、透過する光へどれだけ反映するかを調整します。
- **Saturation**：透過光による影の色の彩度。0なら色成分を持たない影になります。

影の確認にはRenderer 3D側の照明・影設定も必要です。Opacityを下げることと、Transmittanceを調整することは別の操作です。

### 照明・裏面・Material ID

- **Receives Lighting / Receives Shadows**：Sceneの照明・影の影響を受けるかを切り替えます。
- **Two-Sided Lighting**：平面などの裏側にも逆向きの法線を作り、裏側へ適切に光が当たるようにします。Fusionでは裏向きの面が既定で見える場合があるため、**見えることと照明が当たることは別**です。
- **Material ID**：Materialへ数値IDを割り当てます。Renderer 3Dで対応する補助チャンネルを有効にすると、MatIDへ出力できます。

## 具体的な運用例

### 磨いたプラスチックの筐体

Shape 3Dで箱か球体を作り、PhongをMaterial入力へ接続します。Diffuse Colorで筐体色を設定し、Specular Colorを白寄りにします。Point Lightを追加してSpecular Intensityで反射の強さ、Specular Exponentで反射の鋭さを調整します。Lightを動かしながら、表面色は保ったままハイライトの形が変わることをRenderer 3Dで確認してください。

### 印刷面と下地で光沢を変える

Diffuse Materialへ印刷の色柄を接続し、Specular Intensity Materialへは光沢の強い部分だけAlphaが高い別画像を接続します。印刷面はつや消し、周囲は光沢ありという部分差を作れます。RGBの明暗ではなく**Alphaの値**で指定する点に注意してください。Specular Exponent Materialへ別のAlpha画像を入れると、反射の鋭さも部分ごとに変えられます。

### 表面に微細な凹凸を加える

Fast Noiseから高さ画像を作り、[Bump Map](./bumpmap.md)でMaterialに変換してPhongの白い入力へ接続します。Lightを動かすと、模様に沿って細かなハイライトや陰影が変わります。これはMeshの頂点を動かす[Displace 3D](../3d/displace-3d.md)とは異なり、物体の輪郭は変えません。

## 関連Nodeとの違い

- [Blinn](./blinn.md)：同じようにDiffuseとSpecularを調整できます。Manualによると、**Phongは斜めから見た際により広いハイライト**を作り、高いExponentではより鋭いハイライトも作れます。
- [Bump Map](./bumpmap.md)：2D画像を凹凸用の3D Materialへ変換し、PhongのBump Map Material入力へ渡します。
- [OpenPBR](./openpbr.md)：Base、Specular、Coat、Transmissionなどをまとめて扱うPBR Materialです。
- [Material Merge 3D](./material-merge-3d.md)：複数のMaterialを組み合わせるときに使います。
- [3D Material / Lightノード一覧](./index.md)：MaterialとLightの選び分けを説明しています。

## 出典と確認範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 90「3D Material Nodes」、**Phong [3Ph]（pp.2067–2070）**。5つの入力、Inspectorの項目、Bump Mapの接続、Material出力はこの節に基づきます。Blinnとのハイライト比較はChapter 84「3D Compositing Basics」（p.1851）も参照しています。

`verification: partial`は、runtime REGID、Inspectorの初期値と範囲、Edition差、実機描画の結果が未確認であることを示します。Manualに根拠のない数値は記載していません。
