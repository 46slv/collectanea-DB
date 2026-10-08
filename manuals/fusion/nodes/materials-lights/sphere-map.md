---
title: "Sphere Map"
description: "全天周画像を3Dの反射・屈折に使う環境マップとして扱うTexture Node。画像の向きや球面への割り当てを調整する。"
doc_type: node
term_id: "sphere-map"
term_short: "Sphere Mapは、360度の風景画像を球面上の方向へ対応させ、3D物体の映り込みに使えるようにするTexture Node。"
verification: partial
aliases: ["Sphere Map", "3SpM"]
concepts: ["classic-3d", "material"]
nodes: ["Sphere Map"]
node_family: "materials-lights"
controls: ["Angular Mapping", "Rotation", "Material ID"]
inputs: ["image"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Sphere Map

Sphere Map [3SpM]は、**周囲360度の風景を記録した2D画像を、3D物体の映り込みに使う**ためのTexture Nodeです。例えばスタジオの照明や壁を写した全天周画像を入力し、金属球に周囲の様子が反射しているように見せられます。

ここでいう「環境マップ」とは、物体の周囲にある景色を、見る方向に応じて参照する画像のことです。映り込み用の画像を扱うためのNodeであり、Sphere Map自体が3Dの球を作ったり、シーンへ照明を追加したりするわけではありません。

## 役割

一般的な画像は、左から右、上から下へ色が並んでいます。Sphere Mapは、その画像の各位置を**球のどの方向の景色なのか**に対応させます。後段の[Reflect](./reflect.md)が物体の表面の向きに応じて画像を参照すると、表面に周囲の景色が映っているように描画できます。

入力として想定されるのは**正距円筒図法（Equirectangular / LatLong）**の画像です。横方向が経度0〜360度、縦方向が緯度−90〜＋90度に対応する、通常は横長の2:1画像です。普通の写真を接続すること自体はできますが、全天周の情報がなければ、反射する方向によって期待した景色を表示できません。

## 入力

| 入力 | 受け取るもの | 役割 |
| --- | --- | --- |
| **ImageInput**（オレンジ） | 2D RGBA Image | 球面上の各方向に割り当てる画像。全天周の正距円筒画像が適しています。 |

DaVinci Resolve 21.1 Reference Manualでは画像入力は**1つ**と説明されています。入力のRGBが環境の色を担い、RGBA画像を受け取ります。Alphaの具体的な合成動作は、このManualのSphere Map節では確認できないため断定しません。

## 出力

出力は、**3Dの材質・テクスチャとして利用するための環境マップ**です。通常は[Reflect](./reflect.md)の**Reflection Color Material**入力へ接続します。Reflectが映り込みを計算し、その出力Materialを[Shape 3D](../3d/shape-3d.md)などの物体へ割り当てます。

Sphere Map単体の出力は完成した2D映像でも、[Merge 3D](../3d/merge-3d.md)へ入れる3Dシーンでもありません。物体やカメラを組み合わせて[Renderer 3D](../3d/renderer-3d.md)で描画すると、最終的な2D画像になります。

## 主な設定項目

### Angular Mapping

球の極（北極・南極）に近い場所で画像が押し縮められて見えることを抑えるため、緯度方向の割り当てを変更します。Manualでは、面積の偏りを軽減して球面マップを描いたり修正したりしやすくする設定として説明されています。

全天周画像にまっすぐな線や細かい模様がある場合は、切り替え前後で極付近の模様がどう変わるか比較すると違いを把握できます。すべての画像で歪みを取り除く機能ではありません。

### Rotation

環境画像の向きを回転させます。例えばスタジオの白いライトパネルが金属球の正面に映り込んでいる場合、Rotationを変更して、そのパネルが映る位置を動かせます。物体やカメラを動かさず、映り込みの向きだけを調整したいときに使います。

### Material ID

この材質に割り当てる数値IDです。[Renderer 3D](../3d/renderer-3d.md)でMatID補助チャンネルの出力を有効にしている場合、そのチャンネルにIDを記録できます。反射の向きや強さを調整する値ではありません。

## 主な用途

- **商品CGの映り込み**：スタジオの全天周画像を使い、金属、塗装面などに周囲の照明設備や壁を映します。実際に周囲の壁を3Dモデルとして配置しなくても、環境の色を反射に利用できます。
- **環境の向きの調整**：カメラと製品の位置は固定したまま、Rotationで明るい窓やライトパネルの映り込み位置を変えます。
- **360度の背景用球面のテクスチャ割り当て**：全天周画像を球体へ貼る際、Sphere Mapを経由する場合と直接貼る場合で、球の表示角度を狭めたときの画像の切り取り方が変わります。背景球を使う場合の比較にも利用できます。

## 最小構成

~~~text
全天周画像（MediaIn / Loader）
         │ 2D Image
         ▼
     Sphere Map ─────────────→ Reflect［Reflection Color Material］
                                      │ 3D Material
                                      ▼
                                 Shape 3D［Material］ ──┐
Camera 3D ─────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D画像
必要に応じてLight 3D ─────────────────────────────────┘
~~~

1. スタジオ内を全天周で撮影した画像、またはCGで作った正距円筒画像を読み込み、Sphere MapのImageInputへ接続します。
2. Sphere MapをReflectの**Reflection Color Material**へ接続します。ReflectはSphere Mapとは別の、映り込みを材質へ加えるNodeです。
3. Reflectの出力をShape 3DのMaterial入力へ接続し、Shape 3DをSphereなどの形状にします。
4. Shape 3DとCamera 3DをMerge 3Dへつなぎ、Renderer 3Dで描画します。
5. Sphere MapのRotationを変えて、球面上の映り込みが回ることを確認します。

これはManualで説明されているSphere Map→Reflect接続に、描画までの通常のClassic 3D構成を補った作例です。21.1実機でのレンダリング結果を検証したものではありません。

## 運用例：製品の表面へ撮影環境を映す

光沢のあるボトルを実写に合成する場面を考えます。ボトルの3Dモデルだけをレンダリングすると、周囲に何があるかを示す映り込みが不足し、実写の環境から浮いて見えることがあります。

撮影した部屋に近い環境の全天周画像をSphere Mapへ読み込み、ReflectのReflection Color Materialへ接続します。ボトルへReflectを割り当て、Rotationを動かして実写の窓や照明の位置と映り込みの向きを合わせます。**映り込みの強さ**はSphere Mapではなく、ReflectのReflection Strength VariabilityやConstant Strengthなどで調整します。

環境マップは遠方の景色を仮定する近似です。ボトルの隣に置いた別のCG物体が自動的に映り込むわけではありません。近接する物体同士の反射が重要な場合は、別の方法で環境を表現する必要があります。

## 挙動と注意点

### 画像比率は2:1が基準

ManualではSphere Mapが**横:縦＝2:1**の画像を想定すると説明されています。別の比率では、球面上で表示が収まりきらない部分が端の色で埋められます（Clamp）。

Manualは、画像比率に応じて**極付近**または**経度0度の継ぎ目付近**に端の色が現れる場合を区別しています。ただし、記載されている条件式（2 × width と height の比較）は、直前に示された2:1の基準比率と算術的に整合しません。そのため、式だけでどちらにClampが生じるかを断定せず、21.1実機で確認する必要があります。

画像が想定外に伸びたり、極や継ぎ目に不自然な色が出たりしたら、まず入力画像を**2:1の正距円筒画像**として準備し、Viewerで結果を確認してください。

### Shape 3Dへ直接貼る場合との違い

正距円筒画像を球体へ直接接続する方法もあります。ただし、球体の開始・終了角度や緯度の範囲を狭めた場合、**直接接続では画像が縮められ、Sphere Map経由では画像が切り取られる**という違いがあります。さらにManualでは直接接続時は画像が左右反転すると説明しており、必要なら前段の[Transform](../transform/transform.md)で向きを調整します。

球体に画像を表示するだけなら直接接続の方が簡単な場合があります。一方、反射用の環境マップとして方向を扱い、Reflectへ渡すならSphere Mapを使います。

### 反射の限界

環境マップは、写っている周囲の景色が物体から非常に遠くにあるものとして計算します。物体自体の映り込み（自己反射）や、隣り合う物体が互いに反射し合う現象は、この画像1枚では再現されません。

[CubeMap](./cubemap.md)も環境マップを扱いますが、6方向の画像を十字状に配置した画像などを使います。Sphere Mapの正距円筒画像とは入力形式が異なります。

## 関連する考え方

- [Classic 3Dの基礎](../../learn/02-data/classic-3d.md)：画像、Material、3Dシーンの違い。
- [3D Material / Lightの一覧](./index.md)：Material・Texture・Lightの役割を整理。
- [Reflect](./reflect.md)：環境マップを物体の反射や屈折風の見え方に使用。
- [CubeMap](./cubemap.md)：球面画像とは別形式で周囲の景色を指定。
- [Shape 3D](../3d/shape-3d.md)／[Renderer 3D](../3d/renderer-3d.md)：材質を割り当てる物体と描画の出口。

## バージョンと検証状況

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 91「3D Texture Nodes」、**Sphere Map [3SpM]（pp.2100–2102）**。画像入力形式、Angular Mapping、Rotation、Material ID、2:1比率、直接接続との違いを確認。Chapter 90「3D Material Nodes」のReflect（p.2072）とChapter 84「3D Compositing Basics」（p.1853）も環境反射と接続の説明に使用しています。

説明中の手順はManualの仕様を基に組み立てた作例です。出力端子の内部REGID、各設定の初期値・範囲、Editionごとの差およびResolve 21.1実機での描画結果は未確認のため、verificationはpartialのままとします。
