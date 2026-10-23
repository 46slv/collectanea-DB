---
title: Deep to Points
description: Deep Imageの各奥行きサンプルを3D空間の点として表示するNode。カメラによる位置合わせ、表示とレンダーの違い、奥行き調整を解説。
doc_type: node
term_id: deep-to-points
verification: partial
aliases: [Deep to Points, DTP]
concepts: [deep-image, classic-3d, depth]
nodes: [Deep to Points, Camera 3D, Merge 3D, Renderer 3D]
node_family: deep
controls: [Style, Size, Antialiasing, Density, Default Color, Use Per-Point Colors, Make Renderable, Unseen by Camera, Scale, Depth Scale, Flip Depth, Transform]
inputs: [deep-image, camera]
outputs: [classic-3d]
tasks: [deep, visualize-depth, point-cloud, convert-domain]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# Deep to Points

**Deep to Points [DTP]は、映像の各画素に記録された奥行き情報を、3D空間に並ぶ点として見られるようにするNode**です。通常の画像では手前の物体に隠れて見えない奥側の情報も、<Term id="deep-image">Deep Image</Term>に奥行きごとのサンプルとして残っていれば、点の集まりとして確認できます。

たとえば人物と背景を別々にレンダリングして合成するとき、人物が背景のどの位置にいるのかを3D Viewerで確かめたり、追加する3Dオブジェクトの置き場所を決めたりするために使います。

## 何を変換するのか

Deep Imageは、同じ画素位置に複数の色と奥行きの組を記録できます。Deep to Pointsは、そこに含まれる奥行きのサンプルを**点群（Point Cloud）**として立体的に表示します。

~~~text
Deep Image
  画素A: 手前のサンプル / 奥のサンプル
  画素B: 別の奥行きのサンプル
          ↓ Deep to Points
3D空間に配置された点の集まり
          ↓
3D Viewerで奥行きを観察
~~~

出力は通常の2D画像でも、元のDeep Imageでもなく、<Term id="classic-3d">Classic 3Dシーン</Term>で扱う点群です。点を表示する機能であって、点どうしを面で結んで元の物体の表面を復元する機能ではありません。

[Deep Imageの基本](../../learn/02-data/deep-image)と[Classic 3Dの基本](../../learn/02-data/classic-3d)では、この二つのデータ形式を区別して説明しています。

## 入力と出力

| 端子 | 接続するもの | 役割 |
| --- | --- | --- |
| **Input（オレンジ）** | Deep Image | 点の位置と色の元になるデータ。必須。 |
| **Camera（緑）** | 元シーンのCamera 3D | 撮影時のカメラの視点を使い、元の3Dシーンに対する点の位置を合わせる。任意。 |
| **出力** | Classic 3Dの点群 | 3D Viewer、Merge 3D、Renderer 3Dなどへ渡す。 |

Camera入力なしでも点群は生成されます。ただし、**別の3Dオブジェクトと元のシーンの位置を合わせたい場合**は、Deep Imageの生成に使用したカメラを接続することが重要です。適当なCamera 3Dを新しく置くだけでは、元のカメラとの一致は保証されません。

### 2D画像として出力したい場合

通常のViewerで最終画像として見せるには、点群をRenderer 3Dで描画します。

~~~text
Deep EXR → Deep to Points → Renderer 3D → 2D Image
                         ↑
                 Make Renderableを有効化
~~~

**Make Renderableが無効なら、3D Viewerで点が見えてもRenderer 3Dの出力には描画されません。** 奥行きの確認だけが目的なら、描画を有効にする必要はありません。

## 点の見た目を調整する

Inspectorの**Controls**タブには、点群を観察しやすくする設定があります。

| 設定 | 変える内容 | 使いどころ |
| --- | --- | --- |
| **Style** | 点を十字（Cross Hair）または点（Point）として表示する。 | 位置を読むなら十字、全体の密度を見るなら点を試す。 |
| **Size** | Viewer上の点・十字の表示サイズを変える。 | 点が小さくて見えないときに上げる。 |
| **Antialiasing** | 点の輪郭を滑らかにする。 | 表示が粗く見える場合に使う。 |
| **Density** | 点の表示の濃さ・集まり具合を調整する。 | 密集した領域と薄い領域を見分ける。 |
| **Use Per-Point Colors** | 元画像の色を各点へ使う。 | どの点がどの素材に対応するか、色で確認する。 |
| **Default Color** | Per-Point Colorsを無効にしたときの共通色を指定する。 | 色より奥行きの形を優先して見る。 |

Densityについて、21.1 ManualはViewer上の点の**濃さ（intensity / concentration）**を変える設定として説明しています。「値を半分にすればDeepサンプルの個数も半分になる」とは断定しません。

### 3D Viewerにだけ表示するか、画像にも描くか

- **Make Renderable**：有効にすると、Renderer 3Dで点群を2D画像へ描画できる。
- **Unseen by Camera**：Make Renderableが有効な場合に現れる項目。有効にすると3D Viewerでは見えるまま、Renderer 3Dの最終画像には点群を出さない。

点群を**作業中の位置合わせ用**に使うなら、まずMake Renderableを無効のまま確認します。点群そのものを映像表現として出力したいときだけ有効にしてください。

## 奥行きと位置を調整する

- **Scale**：点群全体の大きさを変える。
- **Depth Scale**：奥行き方向の点の間隔を広げたり縮めたりする。立体的な分布を観察しやすくするときに使う。
- **Flip Depth**：奥行きデータの向きを反転し、負側と正側を入れ替える。

Depth ScaleやFlip Depthは**表示する点群の奥行きの配置を変える操作**です。元のDeep EXRの奥行き情報を修正して書き戻すNodeではありません。元のDeep Imageを合成・変形する場合は、[dTransform](./dtransform)などのDeep系Nodeを使います。

**Transform**タブでは、3Dオブジェクトと同様に次の操作ができます。

- **Translation（X / Y / Z Offset）**：点群全体を移動する。
- **RotationとRotation Order**：回転角度と適用順を決める。
- **Pivot**：回転・拡大縮小の基準位置を移す。
- **Scale（X / Y / Z）**：軸ごとの拡大縮小。Lock X/Y/Zを外すと各軸を別々に調整できる。
- **Use Target**：指定した3D位置を向くように回転させる。
- **Import Transform**：外部3Dシーンから位置・回転・拡大縮小の情報だけを読み込む。

TransformタブのScaleとControlsタブのDepth Scaleは用途が異なります。奥行きの広がりだけを観察したいときは、まずDepth Scaleを調整します。

## 運用例：Deep EXRと追加オブジェクトの位置を合わせる

人物と室内のDeep EXRに、後から小さな3Dオブジェクトを追加する例です。

~~~text
Deep EXR ───────────→ Deep to Points ─┐
                        ↑ Camera     │
元のCamera 3D ──────────┘            ├→ Merge 3D → Renderer 3D → 2D Image
       └─────────────────────────────┤
Shape 3D（追加オブジェクト）────────────┘
~~~

1. Deep情報を含むEXRをMediaInまたはLoaderで読み込み、Deep to PointsのオレンジのInputへつなぎます。
2. Deep EXRをレンダリングしたときの**元のCamera 3D**を、緑のCamera入力へ接続します。
3. Deep to Pointsの出力を3D Viewerに表示し、点の集まりを回転させて奥行きの前後関係を見ます。
4. 点が読みづらければStyle、Size、Densityを変更します。元画像の色が邪魔ならUse Per-Point Colorsを外してDefault Colorを指定します。
5. Shape 3Dなど追加する物体をMerge 3Dで同じシーンに入れ、位置を点群と比較します。レンダリングにも同じカメラを使う構成にします。
6. 点群は位置合わせの参照として使うだけならMake Renderableを無効のままにし、追加オブジェクトのみをRenderer 3Dで描画します。

この構成は**公式に記載された端子と動作を組み合わせた制作例**であり、特定のEXR・カメラでの実機結果を確認したものではありません。入力EXRに有効なDeepサンプルがない場合や、元カメラの情報が違う場合は正しく位置合わせできません。

### 点群自体を作品に描きたい場合

Make Renderableを有効にし、必要に応じてStyle、Size、色を調整します。Renderer 3Dの出力は通常の2D Imageなので、その後はMergeなどの2D合成Nodeへ接続できます。位置合わせ用の3D Viewer表示と、最終画像に点を出すことは別々に決められます。

## 期待どおりに見えないとき

| 症状 | 確認すること |
| --- | --- |
| 点が出ない | 入力が通常の2D画像ではなくDeep情報を持つか。Inputへ正しく接続されているか。 |
| 点が元の3Dモデルとずれる | Deep EXRを生成した元カメラをCamera入力に使用しているか。Scale / Depth Scale / Flip Depth / Transformを変えていないか。 |
| 3D Viewerでは見えるのに最終画像に出ない | Make Renderableが有効か。Unseen by Cameraが選ばれていないか。 |
| 点が密集して奥行きが読めない | Style、Size、Densityを調整する。必要ならDepth ScaleでZ方向を一時的に広げる。 |
| 画像全体の色が分かりにくい | Use Per-Point Colorsを切り替え、Default Colorとの違いを見る。 |

Deep to Pointsは点群を見るためのNodeです。**通常の2D画像へ戻すだけ**なら[Deep to Image](./deep-to-image)、**Deepの奥行きごとのサンプルを編集**するなら[dCrop](./dcrop)や[dTransform](./dtransform)などを選びます。

## 関連Nodeと考え方

- [Deep Image](../../learn/02-data/deep-image)：なぜ1画素に複数の奥行きサンプルがあるのか。
- [Classic 3D](../../learn/02-data/classic-3d)：点群と3Dオブジェクトを同じ空間で見るための基礎。
- [Camera 3D](../3d/camera-3d)：視点と投影の設定。
- [Merge 3D](../3d/merge-3d)：点群、カメラ、追加オブジェクトを同じシーンへまとめる。
- [Renderer 3D](../3d/renderer-3d)：3Dシーンを2D画像として描画する。
- [Deep to Image](./deep-to-image)：Deep Imageを画素の色へまとめて出力する。

## バージョンと確認範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）に基づきます。

- **Chapter 95, pp.2226–2227**：Deep Image Compositing Toolsetは**Studio Version Only**。Deepデータの基本、EXRの読み込み、Deep合成でのlinear colorspace要件。
- **Chapter 95, pp.2241–2242**：Deep to Points [DTP]のInput / Camera入力、ControlsのStyle / Size / Antialiasing / Density / 色 / Make Renderable / Unseen by Camera / Scale / Depth Scale / Flip Depth。
- **Chapter 95, pp.2243–2244**：TransformタブのTranslation / Rotation / Pivot / Scale / Use Target / Import Transform。

実機でのEditionごとの表示、Renderer 3Dの描画モードによる点群の見え方、各設定の既定値・数値範囲、重いDeep EXRでの処理性能は未確認です。このため記事全体の検証状態は`partial`です。
