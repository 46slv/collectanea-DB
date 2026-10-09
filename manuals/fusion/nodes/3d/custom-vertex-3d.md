---
title: "Custom Vertex 3D"
description: "数式を頂点ごとに評価し、Classic 3D geometryのPosition・Normal・UV等を加工する高度な3D Node。"
doc_type: node
term_id: "custom-vertex-3d"
term_short: "Custom Vertex 3Dは、数式を頂点ごとに評価してClassic 3D geometryのPositionやNormal、UV等を加工するNode。"
verification: partial
aliases: ["Custom Vertex 3D", "3CV"]
concepts: ["classic-3d"]
nodes: ["Custom Vertex 3D"]
node_family: "3d"
controls: ["Numbers 1-8", "Points 1-8", "LUTs 1-4", "Setups 1-8", "Intermediates 1-8", "Random Seed"]
inputs: ["classic-3d", "image", "image", "image"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Custom Vertex 3D

Custom Vertex 3D [3CV]は、**Classic 3D geometryの頂点ごとに式を評価し、PositionやNormal、Texture Coordinateなどの属性を加工する**Nodeです。

ここでいう頂点は、3D geometryの形を構成する点です。頂点はXYZ位置だけでなく、面の向きを表すNormal、textureを貼るためのUV、Vertex Color、Velocityなどの属性を持てます。Custom Vertex 3Dは、それらを数式で読み書きしたいときに使います。

単にobject全体を移動・回転するTransform 3Dとは役割が異なります。たとえば平面の各頂点を別々に動かして旗のように波打たせたり、geometryを螺旋状に変形したりできます。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、4本の入力が記載されています。

- **SceneInput**（orange、必須）: 加工する3D geometryまたはClassic 3D sceneを受け取ります。
- **ImageInput1**（green、任意）: 式から利用できる2D Imageです。
- **ImageInput2**（magenta、任意）: 2本目の2D Imageです。
- **ImageInput3**（teal、任意）: 3本目の2D Imageです。
- **Output**: 頂点属性を計算した後のClassic 3D geometry / sceneを返します。

基本構成は次のようになります。

```text
Image Plane 3D → Custom Vertex 3D → Merge 3D → Renderer 3D → Image
                    ↑  ↑  ↑
               optional Image inputs
```

Image inputはgeometryへ直接変換される入力ではありません。Custom Vertex 3Dの式からImageの値を参照し、頂点計算へ利用するための補助入力です。

## 何を変更できるか

Vertex tabでは、頂点が持つ複数の属性に対して式を書けます。21.1 Manualで明記されている対象は次のとおりです。

- Position
- Normals
- Vertex Color
- Texture Coordinates
- Environment Coordinates
- UV Tangents
- Velocity

Positionはworld spaceの **px / py / pz**、Normalは **nx / ny / nz**、Vertex Colorは **vcr / vcg / vcb / vca** として扱われます。

すべてのgeometryがすべての属性を持つわけではありません。Manualでは、Vertex Colorを持つgeometryはparticleや一部のFBX / Alembic meshなどに限られ、Velocityはparticleだけが持つと説明されています。入力geometryに属性がない場合は既定値として扱われ、該当属性へ有効な式を書くことで属性が作られる場合があります。

## Numbers 1-8

Numbers tabには8本の数値Controlがあります。

各値は **n1〜n8** として式から参照でき、通常のControlと同じようにanimationやmodifierを接続できます。現在frame以外の値を参照するために、Manualでは **n1_at(t)** のような形式も説明されています。

変形量、周波数、回転量など、式の中へ直接数値を書き込まずInspectorから調整したい値を置く用途に向きます。

Config tabでは各Numberを非表示にしたり、表示名を変更したりできます。

## Points 1-8

Points tabには8個の3D Point Controlがあります。

これらはgeometryの頂点そのものではなく、**式へ渡すための3D位置Control**です。1番目のPointなら **p1x / p1y / p1z** として参照でき、Manualでは **p1x_at(t)** のように別時刻の値を読む形式も説明されています。

たとえば「このPointを中心に頂点を回す」といった処理なら、中心位置をPoint ControlとしてInspectorへ出せます。Pointもanimationやmodifierへ接続でき、Config tabから表示・非表示と名前を設定できます。

## LUTs 1-4

LUT tabには4本のLUT splineがあります。

式では **getlut1(x)** から **getlut4(x)** の形でLUTを参照し、0〜1の入力値をcurveに沿った値へ変換できます。直線的な数式だけでは調整しにくい変形量をcurveで整える用途に使えます。

21.1 Manualの同節にはLUT本数と別の変数表記が整合しない記述があるため、このページではManualで一貫して確認できる「LUTs 1-4」とgetlut1〜4の範囲だけを確定情報として扱います。

## SetupとIntermediate

Custom Vertex 3Dでは、同じ計算を各頂点の式へ繰り返し書かず、SetupとIntermediateへ分けられます。

```text
Setup          1 frameにつき1回
  ↓
Intermediate   各vertexにつき1回
  ↓
Vertex属性の式
  ↓
加工後の3D geometry
```

### Setups 1-8

Setup tabには最大8本の式があります。Setup式は**1 frameにつき1回**、頂点ごとの計算より前に評価されます。

frame内で変化しない値を先に計算する場所です。Manualでは、Number Control、time、ImageのWidth / Height、sin()などの関数を利用でき、model spaceからworld spaceへの変換準備を例として挙げています。

一方、現在の頂点ごとに変わる値をSetupへ置く用途ではありません。

なお、21.1 Manualは「Setups 1-8」と記載する一方、同じ節で結果変数を **s1〜s4** とだけ記載しており、本数と変数表記が整合していません。このページでは、実機確認なしにSetup結果変数の全範囲を補完しません。

### Intermediates 1-8

Intermediate tabには最大8本の式があります。

Intermediate式はSetupの後に**各頂点につき1回**評価され、結果は **i1〜i8** として後段の頂点属性式から参照できます。

たとえば、複数のPosition / Normal / UV式で共通して使う頂点単位の計算をIntermediateへ置けます。Manualでは、新しいPosition・Normal・Tangent・UVを作る計算や、world spaceからmodel spaceへ戻す処理を例として挙げています。

## Random Seed

Config tabのRandom Seedは、**rand() / rands()**で使うseedを設定します。

複数のCustom Vertex 3Dで異なるrandom結果が必要なときは、Nodeごとにseedを分けられます。Reseedで新しいseedを設定できます。

## 具体的な使い方

### 平面を旗のように波打たせる

Manualが挙げる代表例です。

頂点ごとのPositionを時間と位置に応じた式で動かせば、平面全体を1枚の板として動かすのではなく、各頂点に異なる変位を与えられます。

```text
Plane / Image Plane 3D
        ↓
Custom Vertex 3D
        ↓
Merge 3D → Renderer 3D
```

変形の強さや速度をNumbersへ出しておけば、式自体を書き換えずにInspectorから調整できます。

### 3D Pointを基準に頂点を動かす

Points 1-8は、頂点とは独立した3D位置です。

回転中心や変形の基準位置をPointへ置き、そのPointから各頂点までの関係を式で計算できます。Point Controlをanimateすれば、基準位置自体を時間とともに動かせます。

### Imageの値を頂点計算へ使う

Custom Vertex 3Dには3本の任意Image inputがあります。

Imageの値を式から参照し、geometryのPositionや他の属性を計算できます。Imageを使って単純にNormal方向へ変位させるだけなら[Displace 3D](./displace-3d.md)の方が目的を読み取りやすい場合があります。複数Imageや数式、Numbers / Points / LUTを組み合わせて複数の頂点属性を計算したい場合はCustom Vertex 3Dが候補になります。

## NormalとTangentの注意

**Positionを変更してもNormal / Tangentは自動では再計算されません。**

頂点位置を大きく変形したのに元のNormalが残っていると、lightingやshadingが変形後のsurfaceと一致しない場合があります。21.1 Manualは、この場合に[Replace Normals 3D](./replace-normals-3d.md)を後段で使ってNormal / Tangentを再計算する方法を案内しています。

```text
Geometry
   ↓
Custom Vertex 3D
   ↓
Replace Normals 3D
   ↓
Merge 3D → Renderer 3D
```

## Custom Vertex 3Dを使う判断

Custom Vertex 3Dは、既存の3D変形Nodeで表現しにくい**頂点単位の独自処理**を作るための高度なNodeです。

単純なobject transformならTransform 3D、ImageからNormal方向へ頂点を押し出す処理ならDisplace 3Dなど、目的に合う専用Nodeがある場合はそちらの方がGraphを読みやすくできます。

次のような場合にCustom Vertex 3Dを検討します。

- Position以外のNormal、UV、Velocity等も式で加工したい
- Numbers / Points / LUTを使った独自の頂点変形を作りたい
- 複数のImageを頂点計算へ利用したい
- Setup / Intermediateで計算を分ける程度に複雑な式を組みたい

## 関連

- [Classic 3D Family Overview](./index.md)
- [Classic 3D scene](../../learn/02-data/classic-3d.md)
- [Displace 3D](./displace-3d.md): Imageを基準に頂点を変位させる専用Node。
- [Replace Normals 3D](./replace-normals-3d.md): geometryのNormal / Tangentを再計算するときに使います。
- [Merge 3D](./merge-3d.md): 加工後のgeometryをCamera / Light / 他objectと同じsceneへまとめます。
- [Renderer 3D](./renderer-3d.md): Classic 3D sceneを2D Imageへ変換します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 88「3D Nodes」のCustom Vertex 3D [3CV]（pp.1930–1935）を基準にしています。

確認した項目は、SceneInput、3本のImage input、Vertex属性、Numbers 1-8、Points 1-8、LUTs 1-4、Setups 1-8、Intermediates 1-8、Random Seed、Number / PointのConfig、Position変更時のNormal / Tangent再計算に関する注意です。

Manual内で表記が整合しないSetup結果変数の全範囲やLUTの別表記は推測で補っていません。runtime REGID、現在のEffects Library表示、edition差、式で使える全functionの網羅、実機performanceは別verification対象として残しているため、verification: partialを維持しています。
