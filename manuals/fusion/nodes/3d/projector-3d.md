---
title: "Projector 3D"
description: "2D画像をClassic 3Dの物体へ投影するノード。照明として投影する方法と、Catcherで材質へ貼り付ける方法を説明。"
doc_type: node
term_id: "projector-3d"
term_short: "Projector 3Dは、2D画像を3D空間内の物体へ投影し、照明や材質のテクスチャとして利用するノード。"
verification: partial
aliases: ["Projector 3D", "3Pj"]
concepts: ["classic-3d", "projection"]
nodes: ["Projector 3D"]
node_family: "3d"
controls: ["Enabled", "Color", "Intensity", "Decay Type", "Angle", "Fit Method", "Projection Mode", "Enable Shadows", "Shadow Map Size", "Shadow Map Sampling", "Softness"]
inputs: ["classic-3d", "image"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "projection"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Projector 3D

Projector 3D [3Pj]は、**画像を3D空間へ向けて投射し、その先にある物体へ色や模様を映すノード**です。画像を壁や床に投影したり、複数の物体にまたがる模様を一度に付けたりできます。

画像を平面の板として配置する[Image Plane 3D](./image-plane-3d.md)とは異なり、Projector 3Dは**投影元の位置と向き**を持ちます。映像を受ける物体が前後に分かれていれば、それぞれの表面へ投影されます。使うデータは<Term id="classic-3d">Classic 3D scene</Term>で、通常の2D合成へ戻すには[Renderer 3D](./renderer-3d.md)を通します。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualには、次の2入力が記載されています。

- **ProjectiveImage（white、必須）**：投影する2D画像。MediaInやLoaderなどの画像出力を接続します。
- **SceneInput（orange、任意）**：Classic 3D scene。ここにつないだシーンには、Projector 3D自身のTransformも作用します。
- **出力：Classic 3D scene**。投影元を3Dシーンへ追加するための出力で、2D画像を直接返すものではありません。

投影先の物体をSceneInputへ必ず直列接続する必要はありません。投影元と受け手を別々にMerge 3Dへ加えると、投影元だけを移動・回転させやすくなります。

## まず理解する：投影には3つのモードがある

Inspectorの**Projection Mode**で、画像をどのように物体へ反映するかを選びます。

| Mode | 画像がどう使われるか | 向いている用途 |
| --- | --- | --- |
| **Light** | RGBをDiffuse / Specularに影響する照明として投影。物体のNormal（面の向き）や材質によって見え方が変わる。 | 映像を投影する照明、模様のある光 |
| **Ambient Light** | Ambient Lightとして画像を投影。LightモードのようなSpecular highlightを避けたいときの選択肢。 | 光沢の影響を抑えた色の投影 |
| **Texture** | [Catcher](../materials-lights/catcher.md)を使う材質へ画像を渡す。画像のAlphaも反映できる。 | 実写背景の貼り付け、透明部分を持つ投影、照明を変えても扱えるテクスチャ |

**Light / Ambient Lightで投影しても、元画像のAlphaで物体を透過させることはできません。** 窓だけを透明にした写真など、Alphaが必要な場合はTextureモードとCatcherを使います。

Light / Ambient Lightでは、Renderer 3D側でLightingを有効にする必要があります。投影は通常のライトと同様に物体側のLighting設定や材質のReceives Lighting設定の影響を受けます。複数の投影が重なると、それぞれの照明成分が加算されます。

Textureモードで投影を受けるのは、**Catcherを材質の全部または一部に使用した物体**です。Catcherを使わない物体へ、投影画像が自動でテクスチャとして貼られるわけではありません。

## 具体例1：壁と床に映像を投影する

展示空間の壁と床を、Shape 3DのPlaneなどで作った場合の例です。

    壁のShape 3D ─────────┐
    床のShape 3D ─────────┤
    Projector 3D ─────────┼─ Merge 3D → Renderer 3D → 2D画像
      ↑ ProjectiveImage   │
      │                   │
    投影する映像     Camera 3D

1. 投影する映像をProjector 3Dの**ProjectiveImage**へつなぎます。
2. 壁と床に使う3D形状、Projector 3D、Camera 3DをMerge 3Dへ接続します。
3. Projector 3Dの位置と向きを調整し、映像が壁や床へ届くようにします。
4. 光として映像を当てるならProjection ModeをLightまたはAmbient Lightにし、Renderer 3DでLightingを有効にします。
5. 画像を表面のテクスチャにしたいならTextureモードへ切り替え、投影先のShape 3DのMaterial入力にCatcherを接続します。

Projector 3Dと受け手の物体を別々に動かすと、投影模様は物体の表面を滑るように動きます。投影と物体の相対位置を保ちたい場合は、両者をMerge 3Dでまとめ、同じTransformで動かす方法があります。

## 具体例2：透明な窓を持つ背景写真を投影する

実写の建物写真を3Dで再構成した壁へ投影し、窓の奥に配置した3Dオブジェクトを見せたい場合です。

1. 写真の窓部分を透明にしたRGBA画像を用意します。
2. その画像をProjector 3DのProjectiveImageへ接続し、Projection Modeを**Texture**にします。
3. 壁のShape 3Dへ[Catcher](../materials-lights/catcher.md)を材質として接続します。
4. Projector 3Dと壁を同じMerge 3Dへ入れ、投影範囲を合わせます。
5. 壁の後ろへ別の形状を置き、表示用Camera 3DからRenderer 3Dで確認します。

Textureモードでは投影画像のAlphaで受け手の表面を抜けます。Light / Ambient Lightモードへ切り替えると、同じ画像でも窓のAlphaは物体の透過に使われません。

元の撮影カメラと投影位置を正確に合わせる用途では、[Camera 3D](./camera-3d.md)のCamera Projectionも候補になります。Camera 3DはFilm BackやAperture、Clipping Planeを調整できるため、撮影視点との一致を優先する場合に適しています。一方、Projector 3Dは照明の強さ、減衰、影を調整する用途に向きます。

## Inspectorの主な設定

### 投影する色と光の範囲

| Control | 動作 |
| --- | --- |
| **Enabled** | 投影効果を有効・無効にする。Inspector左上のTool全体の有効スイッチとは別。 |
| **Color** | 入力画像へ乗算する色。 |
| **Intensity** | Light / Ambient Lightで投影の強さを調整。TextureではColorを乗算した後のテクスチャ色をスケールする。 |
| **Decay Type** | No Falloff / Linear / Quadraticから距離に応じた減衰を選ぶ。No Falloffでは距離による明るさの減少を加えない。 |
| **Angle** | 投影範囲の広がりを調整する。 |
| **Projection Mode** | Light / Ambient Light / Textureを切り替える。 |

Projector 3Dが照らす範囲は、厳密には円すいではなく**底面が正方形の四角すい状**です。画像が横長でも、投影範囲の水平・垂直の画角が画像の縦横比に合わせて変わるわけではありません。

### Fit Method：画像と投影範囲の合わせ方

| Mode | 動作 |
| --- | --- |
| **Inside** | 画像全体が投影範囲へ収まるように等倍率で縮放する。範囲内に余白ができる場合がある。 |
| **Width** | 画像の横幅を投影範囲に合わせる。縦方向にはみ出す場合がある。 |
| **Height** | 画像の高さを投影範囲に合わせる。横方向にはみ出す場合がある。 |
| **Outside** | 投影範囲全体を画像が覆うように等倍率で縮放する。画像の一部が範囲外へ出る場合がある。 |
| **Stretch** | 縦横を別々の倍率で拡大・縮小し、投影範囲全体へ合わせる。画像が変形する場合がある。 |

たとえば16:9の映像を正方形の投影範囲へ入れるとき、Insideでは画像全体を保ち、Outsideでは範囲を覆うために画像の一部が外へ出ます。Stretchは縦横比を保持しないため、文字や人物の形を変えたくない場合は注意が必要です。

### Shadows：影を落とす場合

Projector 3DはSpot Lightに近い動作を持ち、**Enable Shadows**で影を使えます。影の形はShadow Mapで計算されます。

- **Shadow Color / Density**：影の色と透け方を調整します。
- **Shadow Map Size / Shadow Map Proxy**：影を計算する画像の解像度と、proxy時の解像度を調整します。サイズを上げると細部を表現しやすくなりますが、メモリと計算量が増えます。
- **Multiplicative / Additive Bias**：自己シャドウの不自然な線や、影が物体から浮いて見える現象を調整します。ManualはMultiplicative側から調整し、Additiveで微調整する順を案内しています。
- **Shadow Map Sampling / Softness**：影のサンプリング品質や輪郭の柔らかさを設定します。SoftnessにはNone / Constant / Variableがあり、Variableでは投影物と影を受ける面の距離に応じて柔らかさが変わります。

影の設定と投影画像のAlphaは別の機能です。**透明な窓を作るためにEnable Shadowsを操作する必要はありません。**

## 投影が見えないとき

- **そもそも画像が出ない**：必須のProjectiveImageに2D画像が接続されているか、Projector 3Dの向きが投影先を向いているかを確認します。
- **Light / Ambient Lightなのに変化しない**：Renderer 3DでLightingを有効にし、投影を受ける物体のLighting / Material設定を確認します。
- **Textureモードで映らない**：投影先の材質にCatcherが含まれているか確認します。Catcherの材質はTexture投影を受けられないと透明になることがあります。
- **一部の物体にだけ届かない**：Projector 3Dが影響するのは原則として、その下流で最初に接続されるMerge 3D内の物体です。さらに下流へ通す場合はMerge 3Dの**Pass Through Lights**設定を確認します。
- **Projectorを動かすとシーン全体が動く**：SceneInputへ物体を直列接続していないか確認します。SceneInputにつないだシーンにはProjector 3DのTransformも作用します。
- **映像が伸びる・切れる**：Fit Methodと投影範囲のAspectを確認します。

## 関連するノードと概念

- [Classic 3Dノード一覧](./index.md)：3D Scene、Geometry、Light、Materialの役割を整理。
- [Classic 3D sceneの基礎](../../learn/02-data/classic-3d.md)：Imageと3Dデータの区別。
- [Catcher](../materials-lights/catcher.md)：Textureモードで投影された画像を受け取る材質。
- [Camera 3D](./camera-3d.md)：撮影視点に合わせたCamera Projection。
- [Shape 3D](./shape-3d.md)：壁や床などの投影先を作る。
- [Merge 3D](./merge-3d.md)：3D要素をまとめ、照明の適用範囲を管理。
- [Renderer 3D](./renderer-3d.md)：3D sceneを2D Imageへ変換。

Projector 3Dは**Classic 3D**のノードです。USD側のuProjectorと名称が似ていますが、別のデータ系統として扱います。

## 出典と確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」、**Projector 3D [3Pj]（pp.1965–1969）**。入力端子、3つのProjection Mode、LightとTextureの違い、Catcherとの関係、Fit Method、主要Inspector設定、Shadowsを確認しました。補足としてChapter 84「3D Compositing Basics」のProjectionを参照しています。

このページの「検証」はManual記載との照合を意味します。現在のResolve 21.1実機でのノード接続、REGID、各Controlの全range / default値、Edition差、Rendererごとの画質差は未確認のため、frontmatterは**verification: partial**のままです。
