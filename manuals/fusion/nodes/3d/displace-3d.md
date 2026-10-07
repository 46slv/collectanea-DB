---
title: "Displace 3D"
description: "2D画像の値に応じてClassic 3Dメッシュの既存頂点を移動し、凹凸を作るNode。"
doc_type: node
term_id: "displace-3d"
term_short: "Displace 3Dは、2D画像の画素値を使い、3Dメッシュの各頂点を法線方向または指定カメラへ向かう方向に動かすNode。"
verification: partial
aliases: ["Displace 3D", "3Di"]
concepts: ["classic-3d", "image-data"]
nodes: ["Displace 3D"]
node_family: "3d"
controls: ["Channel", "Scale", "Bias", "Point to Camera", "Camera"]
inputs: ["classic-3d", "image"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Displace 3D

Displace 3D [3Di]は、**2D画像の明るさやチャンネル値を使って、3Dメッシュの頂点を移動する**Nodeです。平らな面を波打たせたり、画像に描かれた模様に合わせて起伏を作ったりできます。

たとえば平面のメッシュにFast Noiseの白黒画像を与えると、画像の値が異なる場所で頂点の移動量が変わり、平面に不規則な凹凸が生まれます。単なる2Dの見かけ上の歪みではなく、**3D空間にある頂点の位置そのもの**が変わります。

通常は頂点をその面の**Normal（法線）**方向に移動します。Normalとは、表面がどちらを向いているかを表す方向です。別の方向へ移動させるCamera Displacementも用意されています。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualに記載されている入力は2本です。

- **SceneInput**（orange、必須）：変形したい3D objectまたはClassic 3D sceneを接続します。
- **Input**（green）：変形量を決める2D Imageを接続します。ここに画像がない場合、Displace 3Dはsceneを実質的にそのまま出力します。
- **Output**：変形後のClassic 3D sceneを返します。2D Imageに変換するわけではありません。

使用する画像のどの位置を参照するかは、メッシュが持つ**texture coordinates（UV座標など）**で決まります。UV座標は、3Dメッシュのどこに2D画像のどの部分を対応させるかを示す情報です。

~~~text
Image Plane 3D ── SceneInput (orange) ┐
                                     Displace 3D → Merge 3D → Renderer 3D
Fast Noise ─────── Input (green) ─────┘
~~~

Fast Noiseは2D Imageを生成するNodeです。Image Plane 3Dは2D Imageを貼った平面geometryを3D空間に作るため、この組み合わせで凹凸のある板を作れます。

## 頂点数と画像解像度の違い

Displace 3Dは**すでにある頂点だけ**を動かします。画像が高解像度でも、入力メッシュの頂点が四隅の4つしかなければ、その間に新しい細かな起伏は作られません。

細部まで起伏を表現したい場合は、Displace 3Dより前のgeometry側で分割数を増やします。Image Plane 3DならSubdivision Levelを使います。

一方、分割数を増やすほど処理する頂点も増えます。必要な凹凸の細かさに合わせて調整します。

画像側の画素値には負の値も利用できます。0～1の白黒画像だけが入力対象だと考える必要はありません。

## Inspectorの主な設定

### Channel

**Channel**は、接続した画像のどのチャンネルを変位量として読むかを選ぶ設定です。実際に選べる項目の完全な一覧は、この版の一次資料の該当説明だけでは確定していないため列挙しません。

### ScaleとBias

**Bias**は画像から得た値へ加えるオフセット、**Scale**はその結果を拡大・縮小する倍率です。Manualでは、**Biasを先に適用し、Scaleを後に適用する**と明記されています。

同じノイズ画像でも、Biasを変えると変位の基準が移動し、Scaleを変えると起伏の大きさが変わります。表面全体が意図せず一方向へ寄る場合はScaleだけでなくBiasも確認します。

このページではexact defaultと設定範囲を推測していません。

### Point to Camera / Camera

通常の変位はNormal方向ですが、**Point to Camera**を有効にすると各頂点をカメラへ向かう方向に移動させます。**Camera**メニューで、その方向の基準に使うscene内のカメラを選択します。

Manualでは、カメラから見た投影を保ちながらimage planeを3D空間内で変形し、他の3D layerと奥行き方向で組み合わせる用途が紹介されています。これは「カメラから見れば変形前の画が維持される」ことを利用する構成です。カメラや配置条件を変えた場合まで同じ見た目になると保証するものではありません。

## 具体的な運用例

### 平面に波や地形状の起伏を作る

1. [Image Plane 3D](./image-plane-3d.md)で平面を作り、Subdivision Levelを上げます。
2. Fast Noiseを作成してDisplace 3Dのgreen Inputへつなぎます。
3. Image Plane 3DをDisplace 3Dのorange SceneInputへつなぎます。
4. Scaleで起伏の強さ、Biasで基準位置を調整します。
5. [Merge 3D](./merge-3d.md)にLight / Camera等をまとめ、[Renderer 3D](./renderer-3d.md)で画像へ戻します。

画像の細かい模様が頂点数不足で消えて見える場合は、Fast Noiseの解像度だけを上げず、平面側の分割数も確認します。

### 変位によってメッシュに割れが出る

読み込んだメッシュで同じ位置にある頂点が別々に存在すると、Normal方向への変位によって接続部分に隙間が生じる場合があります。

その場合は変位する前に[Weld 3D](./weld-3d.md)を入れ、近接したPosition vertexを接続できるか確認します。

~~~text
Imported Geometry → Weld 3D → Displace 3D
~~~

また、大きく変位した後に光の当たり方が形状と合わなくなった場合は、[Replace Normals 3D](./replace-normals-3d.md)でNormalを再計算することを検討します。Weldは頂点の接続、Replace Normalsは表面方向の再計算であり、役割が異なります。

## 使用上の注意

- **UV座標**：画像のどの位置を参照するかはgeometryのtexture coordinatesで決まります。テクスチャ座標が適切でなければ、期待した場所に起伏が出ません。
- **細分化**：Displace 3D自身は面を分割しません。凹凸の細かさは入力geometryの頂点密度に制限されます。
- **Particle**：Manualによると、particle systemをDisplace 3Dへ通すとpEmitterのAlways Face Cameraが無効になります。Particleの各quadを1点として扱うのではなく、4頂点を個別に変位するためです。2D spriteのようなparticleの向きが維持されると考えないでください。
- **Image未接続**：green Inputが空では変位しないため、接続忘れを最初に確認します。

## 関連

- [Classic 3D Family Overview](./index.md)：3D sceneとgeometryの基本。
- [Classic 3D scene](../../learn/02-data/classic-3d.md)：2D Imageとのデータ上の違い。
- [Image Plane 3D](./image-plane-3d.md)：映像や画像を貼った平面geometryを作る。
- [Weld 3D](./weld-3d.md)：分離した頂点の位置を接続し直す。
- [Replace Normals 3D](./replace-normals-3d.md)：頂点変位後のNormal / Tangentを再計算する。
- [Renderer 3D](./renderer-3d.md)：3D sceneを2D Imageへ描画する。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」の**Displace 3D [3Di]（pp.1936–1937）**を一次資料としています。

Node名と略号、SceneInput / Input、texture coordinates、既存vertexのみの変位、Channel、Bias→Scaleの順序、Point to Camera / Camera、particleへの注意は該当節に基づきます。

runtime REGID、Inspectorのexact default / range、版・edition差と実際の処理性能は未検証のため、verification: partialを維持しています。
