---
title: "Gradient 3D"
description: "色のグラデーションを解像度に依存せず生成し、3D物体の表面に割り当てるTexture Node。"
doc_type: node
term_id: "gradient-3d"
term_short: "Gradient 3Dは、色の変化する模様をUV/UVW座標から作り、3D Materialとして渡すNode。"
verification: partial
aliases: ["Gradient 3D", "3Gd"]
concepts: ["classic-3d", "material"]
nodes: ["Gradient 3D"]
node_family: "materials-lights"
controls: ["Gradient Type", "Gradient Bar", "Interpolation Space", "Scale", "Offset", "Repeat", "Sub Pixel", "Material ID"]
inputs: []
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Gradient 3D

Gradient 3D [3Gd]は、**位置に応じて色が滑らかに変わる模様を作り、3D物体の表面に使う**Texture Nodeです。例えば球体の一端から反対側へ色を変えたり、製品CGに帯状の色分けを付けたりできます。

グラデーションは複数の指定色の間を補間して作る、連続的な色の変化です。Gradient 3Dはこれを固定サイズの画像として出力せず、物体の**テクスチャ座標**から計算します。模様の計算は画像解像度に依存しません。

このNodeは<Term id="classic-3d">Classic 3D</Term>の**3D Material**を生成します。物体の形、ライト、3Dシーンを作るNodeではありません。映像全体にグラデーションを重ねたい場合は、画像を出力する2DのBackgroundなどと使い分けます。

## 入力と出力

**入力端子はありません。** 21.1 Reference Manualは、外部画像を受け取らず、Inspectorの色とパターンからグラデーションを生成すると説明しています。

**出力は3D Material**です。[Shape 3D](../3d/shape-3d.md)や[FBX Mesh 3D](../3d/fbx-mesh-3d.md)などの**Material入力**に接続すると、物体の表面に色の変化を適用できます。

[Merge 3D](../3d/merge-3d.md)が受け取る3Dシーンではないため、そのシーン入力へ直接つなぎません。Materialを割り当てた形状をMerge 3Dでまとめ、[Renderer 3D](../3d/renderer-3d.md)で描画すると2D画像として確認できます。

## 色の位置を決めるUVW座標

UV/UVWは、物体表面の**どの位置で模様のどの部分を参照するか**を表す座標です。U・Vは通常2方向、Wは3つ目の方向で、物体の頂点位置そのものとは区別します。

Gradient 3Dの既定のLinearグラデーションは、**Z軸方向の−1から＋1**へ色が変わります。実際にどちらの方向へ色が変わって見えるかは、形状のテクスチャ座標に左右されます。

- **[UV Map 3D](../3d/uv-map-3d.md)**：3D形状の**頂点ごと**にUVW座標を設定し直します。Manualは**XYZ to UVW**モードで形状の座標をUVWへ対応させる方法を勧めています。Viewerの操作ハンドルで位置や向きを確認でき、Manualでは後述のTexture Transformより処理が速いとされています。
- **[Texture Transform](./texture-transform.md)**：Material側で、模様の座標の対応を**ピクセルごと**に変換します。物体の形状を移動する処理ではありません。

Shape 3Dの基本形状はUVWに使う3つ目のテクスチャ座標を出力できます。FBXなどの外部モデルで模様の向きが合わないときは、カラーストップを調整する前にモデルのUVW座標も確認します。

## Gradient Type：色の変化の形

| Type | 色の変わり方 | 利用例 |
| --- | --- | --- |
| **Linear** | 一方向へ色が順番に変わる。 | 上下に色の異なる塗装。 |
| **Reflect** | Linearの変化を中央で折り返す。 | 中央を挟んで対称な配色。 |
| **Square** | 四角いパターンに沿って色が変わる。 | 四角形を意識した帯。 |
| **Cross** | Reflectに似た変化を2方向へ適用する。 | 縦横に対称性を持つ色の帯。 |
| **Radial** | 円形のパターンに沿って色が変わる。 | 中央から外へ広がる色の変化。 |

これは**模様の色の分布**を変える設定です。Radialを選んでも球体が生成されるわけではありません。物体のどこに模様が現れるかは、そのテクスチャ座標で決まります。

## Inspectorの主な設定

### Gradient Bar：色とストップの位置

Gradient Bar上の**カラーストップ**は、指定した位置の色を表します。ストップの追加・削除、色・位置の変更により、配色と色の変化の幅を調整します。**色とストップ位置はアニメーションできます。** Manualには、画像からグラデーションを評価する**From Image modifier**も記載されています。

例えば青・白・赤のストップを置き、中央の白を片側へ寄せると、青い領域と赤い領域の幅を変えられます。位置をキーフレームで移動すれば、物体は動かさず色の境界だけが移る演出にも使えます。

### Interpolation Space

ストップとストップの間の色を、どの色空間で計算するかを選びます。既定は**RGB色空間での線形補間**です。中間色が意図と異なる場合、Interpolation Spaceを変更して比較します。これはRenderer 3Dの出力色空間全体を変える設定ではありません。

### ScaleとOffset

**Scale**はグラデーションの大きさを変更し、色が移り変わる幅を調整します。**Offset**は模様を座標上でずらし、色の境界を移動します。どちらも3D形状の位置やサイズを変更しません。形状を動かす場合は[Transform 3D](../3d/transform-3d.md)を使います。

### Repeat：端の外側をどう扱うか

| 設定 | 端の外側の色 | 向く表現 |
| --- | --- | --- |
| **Once** | 端の色を保持する。 | 1回だけ色を変化させる。 |
| **Repeat** | 反対側へ戻って同じ並びを繰り返す。 | 周期的な色の帯。両端の色が違えば境界で急変する。 |
| **Ping Pong** | 端で折り返して往復する。 | 色が行き来する連続した帯。 |

Offsetを動かして模様の端が見えるときに違いを確認できます。RepeatとPing Pongは同じ「繰り返し」でも、折り返すかどうかが異なります。

### Sub Pixel / Material ID

**Sub Pixel**はグラデーションの生成精度を調整します。描画負荷や画質改善量の数値については、このManual節だけでは断定しません。

**Material ID**は材質の識別番号です。Renderer 3Dで対応する補助チャンネルを有効にすると**MatID**へ出力できます。グラデーションの明るさを変える値ではありません。

## 最小構成：球体の表面を色分けする

~~~text
Gradient 3D［3D Material］──→ Shape 3D［Sphere / Material］──┐
Camera 3D ──────────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D Image
必要ならLight ───────────────────────────────────────────────┘
~~~

1. Shape 3DでSphereを作り、その**Material入力**にGradient 3Dを接続します。
2. Gradient TypeをLinearにし、Gradient Barに2～3色のストップを配置します。
3. Renderer 3Dで確認し、ScaleとOffsetで色の境界を調整します。
4. 向きを変更したいときはShape 3Dの後段にUV Map 3Dを置き、**XYZ to UVW**を選んで座標の対応を変えます。
5. RadialやReflectに切り替え、**物体の形は同じでも表面の色の分布が変わる**ことを確認します。

## 運用例：外部モデルの塗装へグラデーションを適用する

Blenderなどから読み込んだ製品モデルで、上側と下側の塗装色を変える例です。21.1 Manualも、**FBXモデルへ解像度非依存のGradient 3Dを割り当て、UV Mapで配置する構成**を紹介しています。

~~~text
Gradient 3D［Material］──→ FBX Mesh 3D［Material］
                                    │ 3D geometry
                                    ▼
                             UV Map 3D［XYZ to UVW］──┐
Camera 3D ────────────────────────────────────────────┼→ Merge 3D → Renderer 3D
必要ならLight ────────────────────────────────────────┘
~~~

色を作るGradient 3Dは**Material側**に接続し、その後段のUV Map 3Dは**Geometry側の頂点のUVW座標**を調整します。これにより、モデル自体を回転させずに模様の方向や範囲を合わせられます。

色の境界が予想と違う場所に出る場合は、Gradient Type・Scale・Offsetだけでなく、UV Map 3Dの座標設定を確かめます。UV Map 3Dは頂点のテクスチャ座標を変更するNodeで、FBXモデルの形状そのものを編集するものではありません。

## 関連Nodeと注意点

- [Fast Noise Texture](./fast-noise-texture.md)：不規則なまだら模様を作るTexture。Gradient 3Dは規則的な色の分布を作る。
- [Texture Transform](./texture-transform.md)：Material側で模様の向きや位置を変える。
- [UV Map 3D](../3d/uv-map-3d.md)：頂点側でUVW座標を割り当て直す。
- [Shape 3D](../3d/shape-3d.md)：Materialを割り当てる基本形状を生成する。
- [Renderer 3D](../3d/renderer-3d.md)：3Dシーンから2D画像を作る。

模様が出ないときは、Gradient 3Dの出力が**3D物体のMaterial入力**につながっているか、物体に適切なUVW座標があるか、Renderer 3Dまで接続されているかを確認します。色の帯が変化しない場合は、ストップと繰り返し設定に加え、どの座標を参照しているかを確認します。

[3D Material / Light一覧](./index.md)と[Classic 3Dの基礎](../../learn/02-data/classic-3d.md)も参照してください。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 91「3D Texture Nodes」、**Gradient 3D [3Gd]（pp.2095–2097）**。入力なし・Materialへの出力、既定の−1～＋1/Z軸方向のLinear、5種類のGradient Type、Gradient Bar、Interpolation Space、Scale、Offset、Repeat、Sub Pixel、Material ID、UV Map 3DとTexture Transformの処理単位の違いを照合しました。

接続図と制作例はManualで確認できた仕様をもとにした説明です。Resolve 21.1実機での描画結果、内部REGID、Inspectorの数値範囲・Edition差は未確認のため、`verification: partial`を維持しています。
