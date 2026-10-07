---
title: "Bump Map"
description: "高さ画像やRGBバンプ画像を、Classic 3Dの材質が使う凹凸情報へ変換するNode。"
doc_type: node
term_id: "bumpmap"
term_short: "Bump Mapは、画像から表面の法線の変化を作り、Meshを変形せずに細かな凹凸を見せる3D Texture Node。"
verification: partial
aliases: ["Bump Map", "BumpMap", "3Bu"]
concepts: ["classic-3d", "image-data"]
nodes: ["Bump Map"]
node_family: "materials-lights"
controls: ["Source Image Type", "Filter Size", "Height Channel", "Clamp Z Normal", "Height Scale", "Texture Depth", "Wrap Mode"]
inputs: ["image"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Bump Map

Bump Map [3Bu]は、**白黒の高さ画像やRGBのバンプ画像を、3D Materialで使える凹凸情報に変換するNode**です。たとえば球体の表面に岩肌のような細かな起伏を見せたいとき、画像の模様に応じて光の当たり方を変えられます。

変わるのは表面の**Normal（法線）**、つまり「その場所がどちらを向いているように光を計算するか」です。Meshの頂点位置や物体の輪郭は変わりません。実際に立体の形を変えたい場合は、[Displace 3D](../3d/displace-3d.md)などの頂点変形を使います。

Geometry・Material・Light・Renderer 3Dの関係は[Classic 3D scene](../../learn/02-data/classic-3d.md)を参照してください。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **ImageInput**（オレンジ、入力） | 2D RGBA Image | 白黒のHeight Map、RGBに法線を記録したBump Map、またはCreate Bump Mapが作った2D画像を受け取る。 |
| **Material出力** | 3D Material | [Blinn](./blinn.md)などの**Bump Map Material**入力へ渡し、表面の陰影計算に使う。 |

Bump Mapの出力は**3D sceneではなくMaterial**です。Merge 3Dへ直接入れるのではなく、Blinn等の材質Nodeに接続し、その材質をShape 3D等の3D Objectへ与えます。

~~~text
Fast Noise（高さ画像） ─→ Bump Map ─→ Blinn［Bump Map Material］
                                     ↓
                                Shape 3D［Material］ ─┐
Camera 3D ────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D Image
Point Light ──────────────────────────────────────────┘
~~~

Fast Noiseは2D画像の明暗を作ります。Bump Mapがその明暗の変化を法線の変化へ変換し、Blinnが光の当たり方を決めます。**Fast Noiseをそのまま使う場合は、Source Image TypeをHeight Mapに設定します。**

## 高さ画像とバンプ画像

**Height Map（高さ画像）**は、画素の明暗で高さを表す画像です。Bump Mapは周囲の画素との値の差から傾きを求めます。そのため、画面全体が白いだけでは細かな凹凸にならず、白から黒へ変わる境目などで光の当たり方が変化します。

**Bump Map（法線を記録した画像）**は、表面の向きをRGBの3成分に収めた画像です。Fusionが想定するバンプ画像は、既存の法線を変化させる**タンジェント空間**のデータです。タンジェント空間とは、物体表面の向きを基準にした座標系のことです。

他の3Dソフトから読み込んだ法線画像を使う場合は、RGB値が0〜1に収められた（packed）タンジェント空間の画像であることを確認してください。Bump Map Nodeは材質用の変換を行いますが、**別の座標系からタンジェント空間への変換は行いません**。

Manualでは「Bump Map＝既存の法線を変化させる画像」「Normals Map＝既存の法線を置き換える画像」と区別しています。外部素材の名称がこれと一致するとは限らないため、画像が表す情報を確かめて使います。

## Inspectorの主な設定

- **Source Image Type**：Height Map（白黒画像から傾きを計算）とBump Map（既にRGBで法線が記録された画像）を切り替えます。Fusionは入力画像を自動判別しません。
- **Filter Size**：高さ画像から凹凸情報を求めるフィルターの大きさを選びます。
- **Height Channel**：高さとして読み取る画像のチャンネルを指定します。RGBに別々の模様がある場合、選択で凹凸が変わります。
- **Clamp Z Normal**：生成されるバンプ画像の青チャンネル（Z方向）の低い値を切り詰めます。
- **Height Scale**：生成されるバンプ値のコントラストを変えます。大きくすると凹凸がより目立ちます。
- **Texture Depth**：生成するバンプテクスチャを必要なビット深度へ変換します。
- **Wrap Mode**：画像をタイル状に繰り返す場合、端の境界で適切に計算できるようにします。

Inspectorの初期値、正確な選択肢の全一覧、数値範囲はManualで根拠が取れないものを推測していません。

## 具体的な運用例

### 球体の表面に細かな凹凸を付ける

1. [Shape 3D](../3d/shape-3d.md)でSphereを作り、BlinnのMaterial出力をShape 3DのMaterial入力につなぎます。
2. Fast NoiseをBump Mapのオレンジ入力へ接続し、Source Image TypeをHeight Mapにします。
3. Bump MapのMaterial出力をBlinnのBump Map Material入力へつなぎます。
4. Shape 3D、Camera 3D、Point LightをMerge 3Dへまとめ、Renderer 3Dで描画します。
5. Lightを動かしながら、Height ScaleやFast Noiseの模様を調整します。

球体の外形は変わらず、表面の明暗とハイライトだけが変化します。カメラを横へ動かしても、凹凸が輪郭から飛び出すことはありません。

### 外部の法線テクスチャを使う

読み込んだタンジェント空間のRGB法線画像をImageInputへ接続し、Source Image TypeをBump Mapへ切り替えます。Blinnへの接続は高さ画像の場合と同じです。陰影の向きが不自然なら、画像の座標系とRGBの値が0〜1に収められているかを確認します。

### Create Bump Mapとの使い分け

**Create Bump Map [CBu]**は、白黒の高さ画像からRGBのバンプ画像を作る**2D Filter Node**です。出力は2D Imageなので、さらに画像処理を加えられます。一方、**Bump Map [3Bu]**は2D画像を材質用の3D Materialへ変換します。

~~~text
高さ画像 → Create Bump Map → 必要なら2D画像加工 → Bump Map［Source Image Type: Bump Map］ → Blinn
~~~

途中で2D画像を加工しないなら、高さ画像をBump Map［Source Image Type: Height Map］へ直接つなぐだけでも構いません。

## うまく見えないとき

- **凹凸が見えない**：Bump Mapの出力をBlinn等のバンプ入力につないだか、Lightが当たっているかを確認します。
- **凹凸の向きがおかしい**：Source Image Typeと実際の画像の種類を合わせます。Fusionは自動判別しません。
- **階調が縞になる**：高さ画像の精度を確認します。Manualは低周波数の画像でfloat32が必要になる場合に言及しています。
- **文字や細線の縁が荒い**：ViewerでHigh Quality表示を試し、入力画像のアンチエイリアスを確認します。
- **輪郭が平らなまま**：Bump MapはMeshを変形しません。[Displace 3D](../3d/displace-3d.md)とは役割が違います。

## 関連と出典

- [Blinn](./blinn.md)：Bump Mapの出力を受けて陰影へ反映する3D Material。
- [3D Material / Lightノード一覧](./index.md)：MaterialとLightの選び分け。
- [Classic 3D scene](../../learn/02-data/classic-3d.md)：2D Image、3D Material、3D sceneの違い。
- [Displace 3D](../3d/displace-3d.md)：画像の値でMeshの頂点そのものを動かすNode。

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 91「3D Texture Nodes」**Bump Map [3Bu]（pp.2082–2084）**。Height MapとBump Mapのデータの違い・トラブル対処はChapter 84「3D Compositing Basics」（pp.1855–1856）、Create Bump Mapとの違いはChapter 99「Filter Nodes」（pp.2328–2329）を参照しています。

**verification: partial**はruntime REGID、Inspectorの初期値とrange、edition差、実機での描画を未確認としているためです。
