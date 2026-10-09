---
title: "Fast Noise Texture"
description: "UV/UVW座標からノイズ模様を作り、3D物体の表面や材質へ使うTexture Node。"
doc_type: node
term_id: "fast-noise-texture"
term_short: "Fast Noise Textureは、2D/3D座標を使ってノイズを生成し、3D Materialとして出力するTexture Node。"
verification: partial
aliases: ["Fast Noise Texture", "3FN"]
concepts: ["classic-3d"]
nodes: ["Fast Noise Texture"]
node_family: "materials-lights"
controls: ["Output Mode", "Detail", "Brightness", "Contrast", "Scale", "Scale Z", "Seethe", "Seethe Rate", "Discontinuous", "Invert", "Material ID"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Fast Noise Texture

Fast Noise Texture [3FN]は、雲のような濃淡や不規則なまだら模様を計算で作り、**3D物体の表面に使う材質（Material）として出力する**Nodeです。例えば、何も模様のない球体に岩のような色のむらを付けたり、ほかの材質へ模様を渡して色の変化に利用したりできます。

2Dの**Fast Noise**は画像を生成するのに対し、Fast Noise Textureは<Term id="classic-3d">Classic 3D</Term>の材質用です。このNode単体では3Dの形も完成画像も生成しません。

## 役割：UVとUVWで何が違うか

Textureは、物体の表面に付ける色や模様です。画像を手描きする代わりに、座標から模様を計算する方法を「プロシージャル」と呼びます。Fast Noise Textureは**画像の解像度に依存しない**ノイズ模様を作ります。

| Output Mode | 模様の計算に使う座標 | 特徴 |
| --- | --- | --- |
| **2D** | UV：横方向Uと縦方向V | 表面を2次元の座標に対応させてノイズを描き、模様を時間とともに変化させられる。 |
| **3D** | UVW：U・Vに加え、奥行き方向W | 立体内部にも続くノイズ分布として計算できる。Manual上、ノイズ模様自体のアニメーションには対応しない。 |

例えば箱の各面を個別の2D画像で覆うと、面のつなぎ目で模様が切れることがあります。3Dモードで**連続したUVW座標が適切に割り当てられていれば**、面をまたいだ模様を自然につなげられます。ただし、3Dモードを選ぶだけで元のモデルのUVの継ぎ目が自動修復されるわけではありません。

座標は物体の形を持つGeometry側で用意します。[Shape 3D](../3d/shape-3d.md)の基本形状は3つ目のTexture座標を利用できます。外部モデルなどで必要なら[UV Map 3D](../3d/uv-map-3d.md)の**XYZ to UVW**などを使って座標を作り直します。UV Map 3Dが変えるのは**模様を貼る位置の対応関係**であり、ノイズそのものではありません。

## 入力と出力

### 入力：SourceMaterial（任意）

21.1 Manualで説明されている入力は**SourceMaterial**の1つです。**2D Imageまたは3D Material**を受け取り、入力した画像・材質にノイズによる変化を加えます。入力がなくても、Fast Noise Texture単体でノイズ材質を生成できます。

例えば画像をSourceMaterialへ接続した場合、画像から3Dの形を作るわけではありません。画像を元にした材質の見た目をノイズで変えます。入力とノイズの厳密な合成式や各チャンネルの演算方法は、該当するManual本文だけでは断定できないため、必要なら実機で確認します。

### 出力：3D Material

出力は**3D Material**です。[Shape 3D](../3d/shape-3d.md)や[FBX Mesh 3D](../3d/fbx-mesh-3d.md)などの**Material入力**へ渡し、表面の色柄に使います。[Phong](./phong.md)など、Materialを受け取るシェーダーの入力へ渡して別の材質と組み合わせることもできます。

3D Scene出力ではないため、[Merge 3D](../3d/merge-3d.md)のScene入力へ直接つなぐNodeではありません。Materialを割り当てた物体を[Renderer 3D](../3d/renderer-3d.md)で描画して、初めて2D画像として確認できます。[Classic 3Dの基礎](../../learn/02-data/classic-3d.md)も参照してください。

## Inspectorの主な設定

### Output Mode：2D / 3D

- **2D**：UV座標で模様を計算します。**Seethe**や**Seethe Rate**でノイズ自体を滑らかに変化させられます。
- **3D**：UVW座標で計算します。立体的な模様や、面の境界をまたぐ模様に向きます。ただし、**3Dモードではノイズ自体のアニメーションをサポートしません**。2Dモードと同じ感覚でSeetheを動かさないよう注意してください。

### Detail / Brightness / Contrast

| 設定 | 見た目への影響 |
| --- | --- |
| **Detail** | 大きな模様を維持しながら、より細かなノイズを重ねる。高いほど描画負荷が増す。 |
| **Brightness** | ノイズ全体の明るさを変える。 |
| **Contrast** | 明るい部分と暗い部分の差を強めたり弱めたりする。 |

Detailは模様全体の縮尺ではありません。**Scaleで模様の大きさ、Detailで内部の細かさ**を分けて調整すると結果を予測しやすくなります。Manualは、高いDetail値が一部のグラフィックスカードではハードウェア的に制限される場合も説明しています。

### Scale / Scale Z

- **Scale**：UV方向のノイズの大きさを調整します。大きく緩やかなまだら模様から、細かく密集した模様まで切り替えます。
- **Scale Z（3Dのみ）**：UVWの**W方向**に対するノイズの縮尺を調整します。WはUV平面に垂直なTexture座標の方向です。

Scale Zはカメラのズームや物体の形の拡大ではなく、**材質内部のノイズ分布**を変更する設定です。

### Seethe / Seethe Rate（2Dのみ）

- **Seethe**：ノイズ模様を滑らかに変化させる値。値をキーフレームで動かすと、模様が徐々に別の形へ変わります。
- **Seethe Rate**：ノイズがフレームごとに自動的に変化する速さ。Seetheをキーフレームで動かさなくても模様を変化させられます。

これらは**模様そのものの変化**であり、3D物体を移動・回転させる設定ではありません。21.1 Manualでは両方とも**2Dモード専用**です。

### Discontinuous / Invert / Material ID

- **Discontinuous**：通常の滑らかな濃淡の途中へ急な境界を作ります。雲のようなぼけた模様から、境目のはっきりした不規則なパターンへ変える際に使います。
- **Invert**：ノイズの明暗を反転します。ManualではDiscontinuousとの併用が効果的と説明しています。
- **Material ID**：材質の識別番号です。Renderer 3Dで対応する補助チャンネルを有効にすると**MatID**へ記録できます。ノイズ模様を変化させるパラメータではありません。

**Settings**タブはほかの3D Texture Nodeと共通の設定です。上記のノイズ生成と区別して扱います。

## 最小構成：球体へまだら模様を付ける

~~~text
Fast Noise Texture［Material］──→ Shape 3D［Sphere / Material］ ──┐
Camera 3D ───────────────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D Image
必要ならLight ──────────────────────────────────────────────────┘
~~~

1. Shape 3Dで**Sphere**を作り、Fast Noise Textureの出力をShape 3Dの**Material入力**へ接続します。
2. Output Modeを**3D**にし、球体の3次元Texture座標で模様を計算します。
3. Contrastで濃淡を見やすくし、Scaleで模様の大きさ、Detailで細部の多さを変えます。
4. Shape 3DとCamera 3DをMerge 3Dへ接続し、Renderer 3Dで描画します。照明が必要な設定ならLightも追加します。
5. Output Modeを**2D**にしてSeethe Rateを変更し、時間とともに模様が変わる様子を比較します。

この例で変わるのは**球体の表面の色柄**です。Meshの頂点や物体の輪郭はFast Noise Texture単体では変わりません。

## 運用例

### FBXモデルへ、面の境界をまたぐ模様を付ける

Blenderなどから読み込んだ箱や岩のモデルに、不規則な色のむらを付ける例です。21.1 Manualにも**FBXモデルへの解像度非依存Textureの適用例**があります。

~~~text
FBX Mesh 3D（Geometry）──→ UV Map 3D（XYZ to UVW）──→ Merge 3D → Renderer 3D
         ↑ Material
Fast Noise Texture（3D / Material出力）
~~~

FBX Mesh 3DへMaterialを割り当て、後段のUV Map 3DでGeometryのUVW座標を用意します。**Fast Noise TextureはMaterialの経路、UV Map 3DはGeometryの経路**という違いが重要です。つなぎ目が目立つ場合は、ノイズのDetailをむやみに増やす前にUVWの割り当てを確認します。

### 材質の表面色を均一でなくする

プラスチック製品のCGが単調に見える場合、Fast Noise Textureを[Phong](./phong.md)などの**Diffuse Material**へ接続し、色にばらつきを付ける構成を考えられます。物体の形やライトを変えずに表面の模様だけを変える用途です。

色柄ではなく細かな凹凸の陰影を付けたいなら、[Bump Map](./bumpmap.md)などを使う別の構成が必要です。**ノイズを材質として出すことと、Geometryを変形させることは別**です。

### 時間とともに模様が変わる演出

ホログラム風の球体など、表面の模様が変化し続ける演出では、**2Dモード**に切り替えてSeethe Rateを使います。ただし3Dモードのような奥行き方向の座標計算と、2Dモードのノイズ自体のアニメーションは同時には利用できません。**立体的に続く模様**と**時間変化する模様**のどちらを優先するかで選びます。

## 似たNodeとの違い・注意点

| Node | 役割 | Fast Noise Textureとの違い |
| --- | --- | --- |
| **Fast Noise（2D）** | 2D Imageのノイズを生成 | 映像へ合成する画像やマスクを作る用途に向く。 |
| [UV Map 3D](../3d/uv-map-3d.md) | GeometryのUV/UVW座標を変更 | 模様は生成せず、どこに対応させるかを変える。 |
| [Gradient 3D](./gradient-3d.md) | 3D Materialとして滑らかなグラデーションを生成 | 不規則な模様ではなく、位置に応じた規則的な色変化に向く。 |
| [Bump Map](./bumpmap.md) | 表面の凹凸を陰影で表現するためのMaterialを作る | Fast Noise Textureだけでは表面の法線やGeometryを変形しない。 |

模様が表示されないときは、Material出力が**物体のMaterial入力へ接続**されているか、物体にUV/UVW座標があるか、Renderer 3Dまでつながっているかを確認します。3DモードでSeetheが動かないのは**仕様上の制限**です。

関連：[3D Material / Lightの一覧](./index.md)、[Classic 3Dの基礎](../../learn/02-data/classic-3d.md)、[Shape 3D](../3d/shape-3d.md)、[UV Map 3D](../3d/uv-map-3d.md)、[Renderer 3D](../3d/renderer-3d.md)。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 91「3D Texture Nodes」、**Fast Noise Texture [3FN]（pp.2092–2094）**。解像度非依存のMaterial生成、SourceMaterial入力、2D/3DとUV/UVWの違い、Inspectorの各Control、3Dモードのアニメーション制限、FBXモデルを使った例を照合しました。

接続図と制作例はManualで確認できた仕様に基づく構成例であり、Resolve 21.1実機での描画検証結果ではありません。端子の内部REGID、Inspectorの初期値・範囲、Edition差は未確認のため、`verification: partial`を維持しています。
