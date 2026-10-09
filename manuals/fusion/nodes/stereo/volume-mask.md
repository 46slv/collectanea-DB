---
title: "Volume Mask"
description: "World Position PassのXYZ座標を参照し、3D空間内の指定範囲を2DマスクにするFusion Node。"
doc_type: node
term_id: "volume-mask"
term_short: "各画素の3D位置を使い、空間に置いた球体や直方体の範囲を選ぶPosition Node。"
verification: partial
aliases: ["Volume Mask", "VLM"]
concepts: ["image-data"]
nodes: ["Volume Mask"]
node_family: "stereo"
controls: ["Shape", "Translation Pick", "X, Y, Z Offset", "Rotation Pick", "X, Y, Z Rotation", "X, Y, Z Scale", "Size", "Soft Edge", "Color", "Subtractive/Additive Slider", "Mask Only", "Camera"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["process-stereo"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-10"
---

# Volume Mask

**Volume Mask [VLM]**は、3D空間の指定位置に球体や直方体の領域を置き、その範囲にあるものだけを選ぶマスクを生成するNodeです。たとえば、CGの部屋の奥に置いた家具だけを色補正し、手前の床や壁は補正しない、といった用途に使います。

PolygonやRectangle Maskは画面上の2D位置で選択します。一方Volume Maskは、**各画素が3D空間内のどの場所を写しているか**を判断して選択します。被写体やカメラが動いても、そのフレームに対応する位置情報があれば、画面上でマスクを手描きして追従させる必要を減らせます。

公式『DaVinci Resolve 21.1 Reference Manual』では、Volume Maskは**Chapter 115「Position Nodes」**（pp.2712–2715）に収録されています。サイト上では既存の参照経路を維持するためStereo 3Dフォルダーにありますが、**左右眼の位置合わせや視差を計算するStereo Nodeではありません**。

## World Position Passとは

Fusionの<Term id="image">2D Image</Term>には、画素のRGB・Alphaに加えて補助情報を持たせることができます。**World Position Pass（WPP）**は、各画素に映る物体表面の3D位置を**X・Y・Zの3つの数値**で記録したデータです。

CGレンダーの位置パスでXをR、YをG、ZをBへ割り当てれば、Volume MaskはRGBの値を色ではなく**世界座標**として扱えます。位置の値は負数や1を超える値もあるため、見た目の画像として0～1へ丸めると情報が失われます。

WPPは**World Space**の座標で、**32-bit float**の精度を保って用意します。Camera SpaceやObject Spaceをそのまま渡すと、空間の位置が一致しません。カメラや物体が動く場合、WPPも**元の映像と同じフレーム・同じカメラ**のものを使います。

Z深度は奥行きを表す1つの値であり、WPPのXYZ座標とは異なります。Z深度と元画像に対応したカメラがあれば、[Z to World Pos](./z-to-world.md)でWPPを再構成できる場合があります。**通常のRGB画像だけで正しい3D位置が得られるわけではありません**。

## 入力と出力

21.1 Manualのp.2713に明記されている入力は次の3つです。

| 端子 | 接続するもの | 役割 |
| --- | --- | --- |
| **Image**（オレンジ） | XYZ Positionチャンネルを含む2D Image | どの画素が空間内のどこにあるかを調べるための画像です。 |
| **Mask Image**（緑） | 2D Image | 生成するマスクを別の画像で調整するための入力です。 |
| **Effect Mask**（青） | Polygon、Rectangle、Paintなどのマスク | Volume Maskの処理を画面内の指定範囲に制限します。 |

**Mask Image、Effect Mask、Shapeは別のもの**です。Mask Imageはマスクを構成する画像、Effect Maskは処理の対象画面を制限する2Dマスク、Shapeは3D空間内の領域を定義する設定です。

出力はマスク結果を持つ**2D Image**です。**Mask Only**を有効にすると生成したマスクが黒背景上に出るため、Color CorrectorのEffect Maskとして利用できます。3Dメッシュや3Dシーンは出力しません。

**Scene Inputの資料上の不一致**：Manualの「Inputs」には上の3入力だけが列挙されていますが、p.2715のCameraタブでは**Scene inputへカメラまたは3Dシーンを接続する**説明があります。このため実際の端子数と表示名は21.1実機での要確認事項として残します。カメラをSceneから選ぶ機能そのものはManualに記載されています。

## Inspectorの主要Control

### Shape：3D領域をどこに置くか

**Shape**は球体と直方体を切り替えるメニューです。球体なら中心から周囲へ広がる範囲、直方体なら部屋の一角や床上の薄い範囲などを選べます。Viewerへ平面の円や四角を描く2Dマスクではありません。

- **Translation Pick**：Viewer内の3Dシーン、またはXYZ位置を含む画像から、領域の中心座標を取得します。
- **X, Y, Z Offset**：領域の中心を3軸で移動します。アニメーションや他Controlへの接続もできます。
- **Rotation Pick**：XYZ Normal Passなどの方向情報を使って領域の向きを取得します。
- **X, Y, Z Rotation**：領域を軸ごとに回転させます。斜めの壁などに合わせるときに使います。
- **X, Y, Z Scale**：軸ごとの大きさを変えます。球を横長にしたり、箱の高さだけを減らしたりできます。
- **Size**：領域全体の大きさを指定します。
- **Soft Edge**：領域の境界から内側へマスクを徐々に弱め、補正範囲の切り替わりをなだらかにします。

Pickで2D画像から座標を取得するときは**32-bit float**が必要です。Rotation PickにXYZ Normal Passを使う場合は、Manualが**World Space**の法線情報を要求しています。表示用のRGB画像から3Dの向きを自動推定する設定ではありません。

### Color：生成マスクの合成

**Color**は生成するマスクの色を変更し、接続したMask Imageの色にも作用します。**Subtractive/Additive Slider**は、Mergeと同様の考え方でマスクを加算・減算方向に合成する項目です。空間内の領域の大きさを変える設定ではありません。

**Mask Only**はマスクを黒背景上に取り出します。まずMask ImageなしでMask Onlyの結果を確認し、Soft Edgeで境界を調整してから、必要に応じてMask Imageを追加すると作業しやすくなります。

### Camera：領域を評価するカメラ

Cameraタブには**Camera、Translation Pick、X, Y, Z Offset**があります。Scene Inputに複数のカメラが含まれるとき、Cameraメニューで対象を選びます。カメラの位置はViewerのXYZデータから取得するか、Offsetへ入力して指定できます。

元レンダーのカメラとWPPの世界座標が一致しているか確認してください。Scene Inputの実際のポート構成は上記の資料不一致があるため、断定しません。

### Settings：共通の動作

**Blend**、**Process When Blend Is 0.0**、RGBAチャンネル指定、**Apply Mask Inverted**、**Multiply by Mask**などはPosition系Nodeに共通する設定です。Shape・Color・Cameraとは別の制御として理解します。Manual pp.2719–2721を参照してください。

## 運用例：CGの奥の家具だけ色補正する

21.1 Manual（p.2713）にあるChannel Booleans、Volume Mask、Color Correctorの接続例を作業手順に直したものです。

~~~text
CGのRGBA画像 ─────────────────────────────────→ Color Corrector / Image

CGのWorld Position Pass
    └→ Channel Booleans（X→R、Y→G、Z→B）
       └→ Volume Mask / Image（オレンジ）
          └→ Volume Maskの2D出力 ─────────────→ Color Corrector / Effect Mask

任意の2D画像 ─────────────────────────────────→ Volume Mask / Mask Image（緑）
任意のPolygon ───────────────────────────────→ Volume Mask / Effect Mask（青）
~~~

1. CGのRGBA画像と、そのレンダーに対応する**WPP**を読み込みます。カメラやフレームが異なる位置パスを混ぜません。
2. 必要に応じて**Channel Booleans**でXをR、YをG、ZをBへ割り当て、Volume Maskの**Image**へ接続します。
3. Shapeを直方体にして、**Translation Pick**またはXYZ Offsetで家具のある位置へ配置します。**Size**と**Scale**で範囲を絞ります。
4. **Mask Only**を有効にしてマスクの範囲をViewerで確認します。境界が急すぎる場合は**Soft Edge**を調整します。
5. 元のRGBA画像をColor Correctorへ渡し、Volume Maskの出力をEffect Maskとして使います。Mask Imageと追加のEffect Maskは必要な場合だけ接続します。

これは公式接続例をもとに整理した手順であり、21.1実機でレンダリング結果まで確認した記録ではありません。

## 問題が起きた場合

**位置がずれる**：WPPがWorld Spaceか、32-bit floatを保っているか、対応フレーム・カメラが一致しているか、ShapeのOffset・Rotation・Scaleが正しいかを確認します。

**本来ない背景が選ばれる**：WPPの空白背景が(0, 0, 0)になっていると、空間内の実在位置として誤って選択する場合があります。ManualのWPP Conceptでは、CG側で背景用の球体や箱を遠方へ配置する対処が説明されています。

**画面の一部だけ補正したい**：Effect Maskは2D画像内の範囲を制限し、Shapeは3D空間内の範囲を定義します。両方を組み合わせられます。

**[Volume Fog](./volume-fog.md)との違い**：Volume Maskは「どこを補正するか」を選ぶためのマスクを作ります。Volume FogはWPPを使って空間内の霧の濃さや照明・散乱を計算し、元画像へ合成します。

関連する処理は[Z to World Pos](./z-to-world.md)（Z深度からXYZ位置への変換）、[Disparity To Z](./disparity-to-z.md)（左右画像の視差からZ深度への変換）、[画像（Image）](../../learn/02-data/image.md)（2D Imageの基礎）です。[Stereo 3Dノード一覧](./index.md)はサイト内の既存分類で、公式のPosition Nodes分類とは異なります。

## 出典・確認範囲

一次資料：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』、**Chapter 115「Position Nodes」pp.2712–2715（Volume Mask [VLM]）、pp.2717–2721（WPP Concept／共通Settings）**。2026年9月版。

**確認済み**：WPPのXYZ Position利用、Manualに列挙された3入力、Shape／Color／Cameraタブの主要Control、Channel Booleans→Volume Mask→Color Correctorの作例。

**verification: partial**：Scene Inputの実際の端子構成はManual内の記述が一致しません。21.1実機のREGID、端子表示、Inspectorの既定値・範囲、Free/Studio差、レンダリング結果は未確認です。
