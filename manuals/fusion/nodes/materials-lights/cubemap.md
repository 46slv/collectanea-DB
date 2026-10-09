---
title: "CubeMap"
description: "6方向の画像または十字状に並べた1枚の画像から、3D物体の映り込みに使う立方体環境マップを作るTexture Node。"
doc_type: node
term_id: "cubemap"
term_short: "CubeMapは、上下左右・前後の6方向の景色を1つの環境テクスチャとして扱い、3D物体の反射などに渡すNode。"
verification: partial
aliases: ["CubeMap", "Cube Map", "3Cu"]
concepts: ["classic-3d", "material"]
nodes: ["CubeMap"]
node_family: "materials-lights"
controls: ["Layout", "Coordinate System", "Rotation", "Warn About Bad Dimensions", "Material ID"]
inputs: ["image"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# CubeMap

CubeMap [3Cu]は、**上下・左右・前後の6方向を撮影した画像から、3D物体の周囲にある景色を表す環境マップを作る**Texture Nodeです。金属製品のCGにスタジオの照明や壁を映り込ませたいときなどに使います。

ここでいう「環境マップ」は、物体から各方向を見たときに何があるかを記録した画像です。立方体の6面に画像を貼って方向を管理しますが、CubeMap自体が立方体の3Dモデルを生成するわけではありません。また、CubeMapを追加するだけでシーンに光源が置かれるわけでもありません。

## 何を入力し、何が出力されるか

入力は**2D画像**です。Inspectorの**Layout**によって、Nodeに現れる入力数が変わります。

| Layout | 入力 | 用意する画像 |
| --- | --- | --- |
| **Vertical Cross** | **CrossImage**（オレンジ）1つ | 立方体の6面を縦長の十字型に展開した1枚の画像。**幅:高さ = 3:4**。 |
| **Horizontal Cross** | **CrossImage**（オレンジ）1つ | 6面を横長の十字型に展開した1枚の画像。**幅:高さ = 4:3**。 |
| **Separate Images** | **CubeMap.[DIRECTION]** 6つ | 左・右・上・下・前・後の各方向に対応する画像をそれぞれ1枚ずつ。 |

CrossImageは既定で表示される入力です。Separate Imagesへ切り替えると、代わりに6つの方向別入力が現れます。どの入力へどの方向の画像を入れるかは、Node上の入力ラベルを見て合わせます。

**出力は環境テクスチャとして使う3D Material系のデータ**です。[Reflect](./reflect.md)の**Reflection Color Material**入力へ渡すと、Reflectが物体表面の向きとカメラの方向に応じて周囲の色を参照し、映り込みとして使います。CubeMapの出力は、そのまま画面に表示する完成した2D画像でも、[Merge 3D](../3d/merge-3d.md)へ接続する3Dシーンでもありません。

## 6方向の画像を1枚にまとめる理由

1方向だけを写した普通の写真では、カメラから見えない側の景色を反射に使えません。Cube Mapは6方向を使い、物体がどちらを向いていても、その方向の環境画像を参照できるようにします。

例えば、同じ位置に置いた90度画角のカメラを、前・後・左・右・上・下へ向けて撮影すると6枚の画像を用意できます。CGソフトで6方向のレンダリング画像を作る方法でも構いません。この6枚を個別に渡すか、指定の十字配置にまとめてCubeMapへ入力します。

十字配置は、6面の画像を無作為に並べたコラージュではありません。上下・左右・前後の**位置と向きが決まった立方体の展開図**です。面の並びや回転が異なる素材では、環境の継ぎ目がずれて見えます。

## Inspectorの設定

### Layout：1枚入力と6枚入力を切り替える

- **Separate Images**：6方向それぞれに別の画像を渡します。画像が正方形でなかったり、サイズがそろっていなかったりする場合は、それらを収められる最大の**1:1（正方形）サイズ**にリサイズします。異なる解像度の画像が混ざる場合は、事前に統一しておくと意図しない拡大を避けられます。
- **Vertical Cross**：縦長の十字画像を1枚入力します。入力の縦横比が**3:4**でない場合、CubeMapは適切な比率になるよう画像を**クロップ**します。
- **Horizontal Cross**：横長の十字画像を1枚入力します。比率が**4:3**でなければ、同様に**クロップ**します。

クロップは画像を縮小して全部収める処理とは異なり、画像の端が切り落とされます。環境マップに必要な面が欠けてしまう場合は、入力画像のレイアウトとサイズを先に修正します。

### Coordinate System：どの座標系を基準にするか

環境画像をどの座標系に沿わせるかを選びます。

| 値 | 基準 | 用途の考え方 |
| --- | --- | --- |
| **Model** | 物体自身のローカル座標 | 物体の向きを基準にテクスチャを配置したいとき。 |
| **World** | シーン全体のワールド座標 | 物体ごとに向きが違っても、同じ世界方向の環境を参照する構成を考えるとき。 |
| **Eye** | カメラ／Viewerの座標 | 視点に対して環境の向きをそろえる表現を作るとき。 |

撮影現場の環境を再現したい場合は、まず**World**を基準にし、カメラや物体を動かしたときの映り込みを見て判断すると違いを確認しやすくなります。どの設定が正しいかは、環境を物体・世界・視点のどれに固定したいかによります。

### Rotation：環境の向きを調整する

X・Y・Z各軸の回転量と**回転順序**を指定します。例えばXYZは、X軸、Y軸、Z軸の順に回転を適用する指定です。複数の軸を回す場合、順序を変えると最終的な向きも変わります。

商品CGでライトパネルの映り込みが実写より右に寄っている場合、商品やカメラの位置を変える前にCubeMapのRotationで環境画像の方向を合わせられます。ただし、環境画像に存在しない反射対象をRotationだけで追加することはできません。

### Warn About Bad Dimensions

入力画像の寸法が選択したLayoutの条件に合わないとき、**Consoleに警告**を出す設定です。警告を有効にしても画像を正しい展開図に自動変換するわけではありません。上下の面が欠ける、継ぎ目がずれるといった問題があれば、素材自体の配置も調べます。

### Material ID

この材質へ割り当てる数値IDです。[Renderer 3D](../3d/renderer-3d.md)で**MatID**の補助チャンネルを出力する設定を有効にした場合に、そのIDが記録されます。環境画像の明るさや反射率を変える設定ではありません。

## 使い方：スタジオで撮った環境を商品CGへ映す

金属製のボトルを実写の机へ合成する例です。CGのボトルを普通のライトで照らしただけでは、撮影現場にある白い照明パネルや暗い壁が表面に映らず、不自然に見えることがあります。

~~~text
撮影現場のCube Cross画像 / 6方向画像
                 │ 2D Image（1つまたは6つ）
                 ▼
              CubeMap
                 │ 環境テクスチャ
                 ▼
Reflect［Reflection Color Material］
                 │ 3D Material
                 ▼
       Shape 3D［Material］────┐
Camera 3D ───────────────────┼→ Merge 3D → Renderer 3D → 2D画像
必要に応じてLight ──────────┘
~~~

1. 撮影した部屋を6方向に記録し、6枚の画像、または3:4／4:3の十字型に展開した画像を準備します。方向の対応が分からない場合は、最初に十字配置のサンプル画像で確認します。
2. CubeMapのLayoutを素材の形式に合わせ、CrossImageまたは6方向の入力へ画像を接続します。画像サイズに関する警告があれば元画像を確認します。
3. CubeMapを[Reflect](./reflect.md)の**Reflection Color Material**へ接続します。Reflectの出力を[Shape 3D](../3d/shape-3d.md)のMaterial入力へ渡します。
4. Shape 3DとCamera 3DをMerge 3Dへつなぎ、Renderer 3Dで描画します。
5. CubeMapのCoordinate SystemとRotationを調整して、照明パネルや窓の位置が実写と近くなるようにします。反射の強さ自体はCubeMapではなくReflectで調整します。

Reflectへ渡す場合、Reflection Color Materialが参照するのは画像の**RGB**です。Alphaで反射強度を部分的に変えるなら、別の**Reflection Intensity Material**入力を使います。詳しくは[Reflect](./reflect.md)を参照してください。

## Sphere Map・Cube 3Dとの違い

| Node | 入力／役割 | 選ぶ場面 |
| --- | --- | --- |
| **CubeMap** | 6方向の画像、または十字型の画像を受け取り、立方体方向の環境マップとして扱う。 | 6枚のカメラ画像やCube Crossで周囲の反射を作りたい。 |
| [Sphere Map](./sphere-map.md) | 正距円筒図法（LatLong）の**2:1**全天周画像を環境マップとして扱う。 | 360度写真や通常のLatLong HDR画像を使いたい。 |
| [Cube 3D](../3d/cube-3d.md) | 立方体の**3D形状**を作る。 | 立方体を画面に表示し、他の3D物体と組み合わせたい。 |

同じ周囲の景色でも、6面で記録するCube Mapと、緯度・経度で表すSphere Mapでは、**入力画像の配置方法**が異なります。素材の形式に合わせてNodeを選びます。通常の2:1全天周画像をそのままCubeMapのCrossImageへ接続しても、正しい6面配置にはなりません。

## 注意点と関連Node

- **近くにある別の3D物体は自動で映らない**：CubeMapは画像に写っている環境を参照します。撮影後に追加したCG物体や、物体自身の裏側を勝手に再レンダリングする仕組みではありません。近距離の物体間反射が重要なら、別途環境画像を作り直すなどの対応が必要です。
- **Cube Crossの比率と面の向きは別問題**：画像が3:4または4:3でも、各面の並び方・向きが違えば正しい環境にはなりません。変な継ぎ目が現れたら、まず元画像の展開方式を確認します。
- **材質とシーンを混同しない**：CubeMapの出力をMerge 3DのSceneInputへ直接接続するのではなく、Reflectなどの材質を扱うNode、または対応するMaterial入力へ渡します。
- **光源は別途必要に応じて追加**：環境マップは映り込み用の画像です。物体の陰影や影を作るためのLight Node、Renderer 3Dの照明設定と役割が異なります。

関連する解説：[Classic 3Dの基礎](../../learn/02-data/classic-3d.md)、[3D Material / Lightの一覧](./index.md)、[Reflect](./reflect.md)、[Sphere Map](./sphere-map.md)、[Shape 3D](../3d/shape-3d.md)、[Renderer 3D](../3d/renderer-3d.md)。

## バージョンと検証範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 91「3D Texture Nodes」、**CubeMap [3Cu]（pp.2087–2090）**。Layout、CrossImage／6方向入力、Coordinate System、Rotation、Warn About Bad Dimensions、Material ID、入力画像の寸法処理を確認しました。Reflectとの接続はChapter 90「3D Material Nodes」のReflect節（pp.2071–2073）も参照しています。

このページの接続例はManualの各Node仕様を組み合わせた説明です。21.1実機での描画結果、出力端子の内部REGID、Inspectorの初期値・数値範囲、Edition差は未確認です。そのため`verification: partial`を維持しています。
