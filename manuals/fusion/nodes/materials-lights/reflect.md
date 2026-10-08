---
title: "Reflect"
description: "環境マップを使って3D Materialに映り込みや屈折風の見え方を加えるNode。反射の角度・強さ・色を調整する。"
doc_type: node
term_id: "reflect"
term_short: "Reflectは、周囲の画像を3D物体の表面へ映り込ませ、透明な材質では屈折風の見え方も作るMaterial Node。"
verification: partial
aliases: ["Reflect", "3RR"]
concepts: ["classic-3d", "material"]
nodes: ["Reflect"]
node_family: "materials-lights"
controls: ["Reflection Strength Variability", "Glancing Strength", "Face On Strength", "Falloff", "Constant Strength", "Separate RGB Refraction Indices", "Refraction Index", "Refraction Tint"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Reflect

Reflect [3RR]は、**周囲の景色を写した画像（環境マップ）を、3D物体の表面に映り込ませる**ためのMaterial Nodeです。金属球にスタジオの照明設備を映したり、透明な瓶の向こう側が曲がって見えるような表現を作ったりできます。

Reflectが作るのは物体そのものではなく、**表面の見え方を決める3D Material**です。<Term id="classic-3d">Classic 3D</Term>の[Shape 3D](../3d/shape-3d.md)などへ材質として渡し、物体とカメラを[Renderer 3D](../3d/renderer-3d.md)で描画します。2Dの映像へ直接エフェクトをかけるNodeでも、3Dシーンを結合する[Merge 3D](../3d/merge-3d.md)の代わりでもありません。

## 入力と出力

21.1 Reference Manualでは、**5つの入力**が説明されています。入力する画像と、どのチャンネルが使われるかに違いがあります。

| 入力 | 接続できるもの | 何が変わるか |
| --- | --- | --- |
| **Background Material**（オレンジ） | 2D Image / 3D Material | 映り込みの下にある基本の材質。画像を接続すると、基本MaterialのDiffuse Textureとして扱う。 |
| **Reflection Color Material**（白） | 2D Image / 3D Material | 映り込みの色と模様。画像の**RGB**を使い、**Alphaは無視**する。 |
| **Reflection Intensity Material**（白） | 2D Image / 3D Material | 映り込みの強さを表面の場所ごとに変える。画像の**Alpha**を反射強度に掛け合わせる。 |
| **Refraction Tint Material**（白） | 2D Image / 3D Material | 透明な部分を通して見える環境マップの色。画像の**RGB**を使う。 |
| **Bump Map Texture**（白） | **3D Materialのみ** | 表面の細かな凹凸に対応する法線の向きを渡し、反射の方向を変える。通常は[Bump Map](./bumpmap.md)の出力を接続する。 |

**出力は3D Material**です。[Shape 3D](../3d/shape-3d.md)のMaterial入力へ接続するか、[Phong](./phong.md)や[Ward](./ward.md)などのDiffuse Material入力へ渡します。Reflectの出力をMerge 3DのScene入力へ直接つなぐ構成ではありません。

白い入力が複数あって接続先を選びにくい場合は、Windowsでは**Alt**、macOSでは**Option**を押したまま別Nodeの出力をReflectのタイル上へドラッグして離すと、入力一覧から選べます。

## 最小構成：金属球に周囲を映す

~~~text
Sphere Map ───────────→ Reflect［Reflection Color Material］
                              │
                              └→ Shape 3D［Material］─┐
Camera 3D ────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D画像
Light（必要に応じて）─────────────────────────────────┘
~~~

1. [Shape 3D](../3d/shape-3d.md)でSphereを作り、Reflectの出力をMaterial入力へ接続します。
2. [Sphere Map](./sphere-map.md)から環境を表す画像を渡し、Reflectの**Reflection Color Material**へ接続します。Sphere Mapは環境の方向に応じて画像を参照するためのNodeです。
3. Shape 3DとCamera 3DをMerge 3Dへ入れ、Renderer 3Dで画像にします。
4. Reflectの**Reflection Strength Variability**を切り替え、正面と輪郭付近で映り込みがどう変わるか比較します。

Reflect単独でもInspectorで材質を調整できますが、周囲の具体的な景色を映したい場合はReflection Color Materialに環境マップを渡す必要があります。画面に景色が映っているからといって、その場所に3Dモデルが存在するわけではありません。

## Inspectorの主な設定

### Reflection：見る角度による映り込みの強さ

**Reflection Strength Variability**で、反射強度を一定にするか、見る角度によって変えるかを選びます。

- **Constant**：物体表面の向きに関係なく、**Constant Strength**で反射強度を設定します。
- **By Angle**：カメラに正対する部分と、輪郭に近い斜め向きの部分で反射の強さを変えます。こちらを選ぶと、次の3項目が現れます。

| 設定 | 調整するもの |
| --- | --- |
| **Face On Strength** | カメラを正面から向く部分の反射の強さ。 |
| **Glancing Strength** | 表面を斜めから見る、輪郭に近い部分の反射の強さ。 |
| **Falloff** | 正面側の強さから斜め側の強さへ変化する過程。値によって切り替わりの鋭さが変わる。 |

たとえば輪郭側の反射を強く、正面側を弱くすると、球の外周に映り込みが集まる見え方を作れます。これは角度に応じて強度を変える操作であり、現実のすべての材質を物理的に再現する設定ではありません。

### Refraction：透明な物体の屈折風表現

Reflectは、**Background Materialの不透明度が1未満**の場合に、環境マップを使って透明な物体の屈折風の見え方を作れます。背景画像を物体の形に沿って曲げるように見せる処理です。

- **Refraction Index**：表面に入る角度に応じて、環境マップがどれだけ変形して見えるかを調整します。
- **Separate RGB Refraction Indices**：有効にすると共通のRefraction Indexに代わり、**赤・緑・青の3つの値**を別々に指定できます。厚いガラスに色のずれが見えるような表現に使います。
- **Refraction Tint**：屈折に使う画像の色へ乗算する色です。緑や茶色の瓶など、色付きの透明材質を表すときに使います。

ここでの屈折は**環境マップによる近似**です。Manualも現実の光の屈折を正確にシミュレーションする機能ではないと明記しています。実際のレンズや透明素材の光学特性を、Refraction Indexの値だけで正確に再現できるわけではありません。

## 具体的な運用例

### 商品CGにスタジオの映り込みを足す

製品の3Dモデルに、周囲の白いライトパネルや暗い壁が映り込む状態を考えます。環境を写した画像をSphere Mapへ渡し、その出力をReflectのReflection Color Materialへ接続します。Reflection Strength VariabilityをBy Angleにして正面と輪郭の反射強度を調整すると、物体の向きによって映り込みが変わります。

製品本体の色を残したい場合は、Background Materialへ別のMaterialや画像を接続します。環境マップは**映り込みを作る入力**であり、製品の基本色を指定する入力とは別です。

### 表面の一部だけ映り込みを強くする

ロゴのある金属板で、ロゴ部分だけ反射を弱くしたい場合は、ロゴ形状に合わせたAlpha画像をReflectの**Reflection Intensity Material**へ接続します。Alphaが高い場所では反射強度が高く、低い場所では反射が弱くなります。

この入力に白黒のRGB画像を置くだけでは、狙った強弱にならない場合があります。Manualで反射強度に乗算されると説明されているのは**Alphaチャンネル**です。RGBを使うReflection Color Materialとは用途を分けます。

### 色付きガラス瓶の屈折風表現

瓶のGeometryへReflectを割り当て、Background Materialを透明な設定にします。環境マップを用意し、Refraction Indexで透けて見える環境の曲がり方を調整します。Refraction Tintを緑寄りにすると、緑色の瓶を通して見たような色を加えられます。さらにSeparate RGB Refraction Indicesで各色の値を分けると、色ごとに像がずれる表現も可能です。

この構成は**屈折らしく見せるための近似**です。厚みを持つガラス内部の光路、背後の3D物体の正確な屈折、波長ごとの物理挙動を保証するものではありません。

## 環境マップで表現できないこと

Reflectが参照する環境マップは、物体の周囲の景色が**非常に遠くにある**と仮定しています。そのため、同じ環境マップを使う2つの物体を隣り合わせても、**片方の物体がもう片方に自動的に映るわけではありません**。取っ手付きの物体でも、取っ手へ本体が正しく映り込むとは限りません。

物体間の映り込みまで必要な場合は、Manualが案内するように、対象ごとのCube Mapを描画して用いる方法を検討します。カメラの近くの物体が動くシーンや、正確な自己反射が必要なシーンでは、単一の静的環境マップだけでは不足します。

また、Reflectの**Bump Map Textureは3D Material入力**です。2Dの高さ画像をそのまま白い入力につなぐのではなく、Bump Map Nodeなどで必要なMaterialへ変換してください。

## 関連するNode・概念

- [Classic 3Dの基礎](../../learn/02-data/classic-3d.md)：3Dシーン、Geometry、Material、2D画像の違い。
- [3D Material / Light一覧](./index.md)：MaterialとLightの役割、および類似Nodeの選び方。
- [Sphere Map](./sphere-map.md)：Reflectへ渡す環境マップ画像の方向を扱う。
- [Phong](./phong.md) / [Ward](./ward.md)：表面の基本色・ライトによるハイライトを調整するMaterial。ReflectをDiffuse Material入力へ重ねる構成も取れる。
- [Bump Map](./bumpmap.md)：細かな凹凸をMaterialとして渡し、反射の向きを変える。
- [Renderer 3D](../3d/renderer-3d.md)：Materialを割り当てた3Dシーンを2D画像として描画する。

## 出典と確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 90「3D Material Nodes」、**Reflect [3RR]（pp.2071–2073）**。5入力と使用チャンネル、Material出力、Sphere Mapとの接続例、Constant / By Angle、Refractionの設定、環境マップによる近似の制限を確認しました。

接続例と運用例はManual記載の仕様を組み合わせた説明で、Resolve 21.1実機の描画結果を検証したものではありません。内部REGID、正確な初期値・数値範囲、Edition差は未確認のため、`verification: partial`を維持します。
