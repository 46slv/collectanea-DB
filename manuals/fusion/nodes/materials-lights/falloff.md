---
title: "Falloff"
description: "カメラから見た表面の向きに応じて2つのMaterialを混ぜ、物体の正面と輪郭付近で異なる見た目を作るTexture Node。"
doc_type: node
term_id: "falloff"
term_short: "Falloffは、カメラに正対する面と斜めに見える面で、2種類の3D Materialや色を混ぜるNode。"
verification: partial
aliases: ["Falloff", "3Fa"]
concepts: ["classic-3d", "material"]
nodes: ["Falloff"]
node_family: "materials-lights"
controls: ["Color Variation", "Face On Color", "Glancing Color", "Falloff", "Material ID"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Falloff

Falloff [3Fa]は、**カメラから見た物体表面の傾きに応じて、2種類の材質を混ぜる**Texture Nodeです。例えば球を正面から見たとき、中央付近には落ち着いた材質を、輪郭に近い部分には明るい反射材質を使えます。球を回転させたりカメラを移動したりすると、面がカメラに向く角度も変わるため、混ざり方が変化します。

「Falloff」は一般に値が徐々に減衰することを指しますが、このNodeで変化させるのは主に**Face OnとGlancingという2つの材質の混合比**です。単に画面の周囲を暗くするビネットでも、ライトの距離減衰でもありません。

Falloffの出力は**3D Material**です。<Term id="classic-3d">Classic 3D</Term>の[Shape 3D](../3d/shape-3d.md)などに材質として接続し、[Renderer 3D](../3d/renderer-3d.md)で2D画像に変換します。Falloff自体は3D形状や完成画像を生成しません。

## 角度によって何が変わるか

球の表面を例に、カメラから見える部分を2つに分けて考えます。

- **Face On（正面）**：表面がカメラの方を向いている部分。球では中央付近が該当します。
- **Glancing（斜め）**：表面がカメラに対して斜めになっている部分。球では輪郭に近づくほどこちらの影響が強くなります。

Falloffはこの間を滑らかにつなぎます。Face OnとGlancingを二者択一で切り替えるだけではなく、角度に応じた中間状態を作るNodeです。平らな面を正面から見ていると変化が分かりにくいため、まずはSphereなど曲面のある物体で確認すると仕組みを理解しやすくなります。

**注意：** ここでいう「斜め」は画面の左右端という意味ではありません。判定基準は**物体の表面の向きとカメラの方向**です。画面中央の物体でも、カメラに斜めを向く面ならGlancingの影響を受けます。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualには、次の**2つの入力**が記載されています。

| 入力 | 受け取れるデータ | 役割 |
| --- | --- | --- |
| **Face On Material**（オレンジ） | 2D Image / 3D Material | 表面がカメラの方を向く部分に使う材質。 |
| **Glancing Material**（緑） | 2D Image / 3D Material | 表面を斜めから見る部分に使う材質。 |

2D画像を接続した場合は、基本Materialの**Diffuse Texture（表面の基本色を決める画像）**として扱われます。したがって、入力に画像を渡せても、**出力は常に3D Material**です。2つの画像を普通の2D合成として混ぜた完成画像が出るわけではありません。

出力先は[Shape 3D](../3d/shape-3d.md)などの**Material入力**です。[Merge 3D](../3d/merge-3d.md)が受け取る3D Scene入力へFalloffを直接渡す構成ではありません。画像・Material・3D Sceneの違いは[Classic 3Dの基礎](../../learn/02-data/classic-3d.md)を参照してください。

## 最小構成：正面はBlinn、輪郭はReflect

公式Manualでは、[Blinn](./blinn.md)と[Reflect](./reflect.md)をFalloffで組み合わせる例が示されています。Blinnはライトを受けた基本の材質、Reflectは環境画像による映り込みを扱うMaterialです。

~~~text
Blinn ──────────→ Falloff［Face On Material］
Reflect ────────→ Falloff［Glancing Material］
                                │ 3D Material
                                ▼
                       Shape 3D［Material］──┐
Camera 3D ──────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D画像
必要に応じてLight ─────────────────────────┘
~~~

1. [Shape 3D](../3d/shape-3d.md)でSphereを作り、Falloffの出力をShape 3DのMaterial入力へ接続します。
2. Blinnを**Face On Material**に接続し、中央付近に出したい色とハイライトを設定します。
3. Reflectを**Glancing Material**に接続します。周囲の景色を反射させたい場合は、[Sphere Map](./sphere-map.md)や[CubeMap](./cubemap.md)で環境画像を用意し、Reflectへ渡します。
4. Shape 3D、Camera 3D、必要に応じてLightをMerge 3Dへ接続し、Renderer 3Dで描画します。
5. Falloffの値を動かし、Blinn側の見え方からReflect側の見え方へ移る範囲を確認します。カメラの角度を変えて比較すると違いが分かります。

この例の目的は**表面を見る角度に応じて材質の混合比を変えること**です。Falloffそのものが反射計算や環境マップの生成を行うわけではありません。Reflectの設定とFalloffの設定を分けて調整すると、どのNodeが何を変えているか確認できます。

## Inspectorの主な設定

### Color Variation：色の指定方法

**Color Variation**には、Manual上で**Two Tone**と**Gradient**の2つが説明されています。

| 設定 | できること | 使い方 |
| --- | --- | --- |
| **Two Tone** | Face OnとGlancingの色を、それぞれ通常のColor設定で指定する。 | 正面は青、輪郭は白など、2つの色の対比を明確にしたいとき。 |
| **Gradient** | Face OnからGlancingへつながる色をGradientで指定する。 | 中間の色を増やし、輪郭に向けて段階的な色変化を作りたいとき。 |

Gradientはトゥーン調の材質表現にも利用できます。ここでの色変化は**表面と視線の角度**に基づきます。ライトが当たっている部分だけを判定する一般的なトゥーンシェーダーと、同一の仕組みではありません。

### Face On Color / Glancing Color：それぞれの色と不透明度

**Face On Color**はカメラに正対する側、**Glancing Color**は斜めから見る側の色を設定します。

入力にTextureまたはMaterialが接続されている場合、指定した色はその入力の色に**乗算**されます。例えば、白い模様のTextureへ青い色を指定すると、その模様を青寄りに着色できます。色を設定したからといって、入力画像やMaterialの模様が消えるという意味ではありません。

各Colorの**Opacity**を下げると、その側の材質の色とAlphaが減少し、透明な見え方になります。例えば正面側を低Opacity、斜め側を高Opacityにすると、正面が透けやすく輪郭が残りやすい材質を作れます。ただし、後段のMaterialやRendererの設定、背景となる3Dシーンによって最終的な見え方は変わります。

### Falloff：2つの材質の混ざり方

**Falloff**は、Face Onの影響からGlancingの影響へ移る過程を調整します。Manualは、2つの値を混ぜるGradientに**Gammaのような操作**を適用するイメージで説明しています。

これはFace OnとGlancingの材質を変える設定ではなく、**どの角度で、どの程度混ぜるか**を変える設定です。まずFace OnとGlancingの色をはっきり違うものにして、値を動かしたときに球のどの範囲が変化するか観察すると理解しやすくなります。

### Material ID：補助チャンネル用の識別番号

**Material ID**は材質へ数値の識別番号を割り当てます。[Renderer 3D](../3d/renderer-3d.md)で対応する設定を有効にした場合、**MatID**補助チャンネルへ記録されます。後から材質単位で選択・補正するときに使える情報であり、色や反射強度を変えるパラメータではありません。

**Settings**タブは他の3D Texture Nodeとも共通の項目で、上記の角度による混合設定とは分けて考えます。

## 運用例

### 製品CGの輪郭だけ反射を強める

金属製の球や丸みのある製品を撮影映像へ合成する際、正面は本来の塗装色を見せ、輪郭ではスタジオ環境の映り込みを強調したい場合があります。

Face OnへBlinn、Glancingへ環境マップを使うReflectをつなぐと、面の向きに応じて2つの見え方を配分できます。**反射させる環境そのものはReflect側**で設定し、**正面から輪郭への移行具合はFalloff側**で調整します。Falloffだけを調整しても、環境画像に存在しない窓や照明が新しく映り込むことはありません。

### 2色で輪郭を強調する

ゲーム風のキャラクターやモーショングラフィックスで、正面の色と輪郭の色を変えたい場合は、Two Toneで色の差を大きくすると角度の違いが見えやすくなります。さらにGradientを使えば、正面から輪郭までの色の段階を増やせます。

この手法で変わるのは**材質の色**です。3D形状の輪郭線を新しいGeometryとして作るわけではなく、ペンで外側に線を引くアウトライン処理とも異なります。

### 正面を透かし、輪郭を残す

透明感のあるガラス風・ホログラム風の表現では、Face On ColorのOpacityを下げ、Glancing側のOpacityを高くする組み合わせが考えられます。球の中央ほど透け、端ほど色が残る見え方を狙う例です。

Falloffは透明度の角度依存を作るための材質制御であり、現実のガラスの屈折、内部の光路、正確なフレネル反射を自動計算する保証ではありません。物理的な屈折風表現が必要なら[Reflect](./reflect.md)側の機能や別の描画方法も検討します。

## 似たNodeとの違いと注意点

| Node | 何を変えるか | Falloffとの違い |
| --- | --- | --- |
| **Falloff** | 表面を見る角度で、2つのMaterialや色の混合比を変える。 | 材質そのものを切り替える・混ぜる目的に使う。 |
| [Reflect](./reflect.md) | 環境画像による反射、反射強度の角度依存、屈折風の効果を扱う。 | Reflectの「By Angle」は主に**反射の強さ**を変える。Falloffは**2種類の材質**を混ぜられる。 |
| [Material Merge 3D](./material-merge-3d.md) | 複数のMaterialを組み合わせる。 | 一般的な材質の合成をしたいのか、視線に対する角度で配分したいのかで選ぶ。 |

Falloffの入力へ2D画像を渡せても、画像のマスクとしてRGBの白黒を独立に評価する端子があると考えないでください。Manualで確認できる入力は**Face On Material**と**Glancing Material**の2つで、各側のOpacityや混合はInspectorで調整します。

画面上で差が出ない場合は、まず**曲面のあるGeometryを使っているか**、Face OnとGlancingに十分異なる材質を設定しているか、FalloffがShape 3D等の**Material入力**へ渡されているかを確認します。通常の2D Mergeや3D Scene入力へ接続しようとしても、目的の処理にはなりません。

関連する説明：[3D Material / Lightの一覧](./index.md)、[Classic 3Dの基礎](../../learn/02-data/classic-3d.md)、[Blinn](./blinn.md)、[Reflect](./reflect.md)、[Shape 3D](../3d/shape-3d.md)、[Renderer 3D](../3d/renderer-3d.md)。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 91「3D Texture Nodes」、**Falloff [3Fa]（pp.2090–2092）**。Nodeの役割、Face On / Glancingの2入力と受け取れるデータ、Material出力、Blinn / Reflectの接続例、Color Variation、Face On Color、Glancing Color、Falloff、Material IDを確認しました。

本文の制作例はManualの仕様を組み合わせて説明したもので、Resolve 21.1実機の描画結果ではありません。出力端子の内部REGID、Inspectorの正確な初期値・数値範囲、Edition差は未確認のため、verification: partialを維持しています。
