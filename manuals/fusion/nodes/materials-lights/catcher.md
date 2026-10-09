---
title: "Catcher"
description: "Camera 3DやProjector 3DのTexture投影を受け、3Dオブジェクトの表面へ画像と透明度を反映する材質ノード。"
doc_type: node
term_id: "catcher"
term_short: "Catcherは、Camera 3DやProjector 3Dから投影された画像を指定した3Dオブジェクトの表面へ受け取り、透明部分も反映する材質ノード。"
verification: partial
aliases: ["Catcher", "3Ca"]
concepts: ["classic-3d", "projection", "material"]
nodes: ["Catcher"]
node_family: "materials-lights"
controls: ["Enable", "Color Mode", "Alpha Mode", "Threshold", "Restrict by Projector ID", "Material ID"]
inputs: []
outputs: ["material"]
tasks: ["shade-3d", "projection"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Catcher

Catcher [3Ca]は、**Camera 3DやProjector 3Dから投影した画像を、指定した3Dオブジェクトの表面に貼るためのノード**です。たとえば、建物の壁に実写映像を投影し、窓の透明部分から後ろの部屋が見えるようにできます。

このノード自身は画像を読み込まず、3Dオブジェクトも作りません。投影する側のCamera 3DまたはProjector 3Dを**Textureモード**にし、Catcherの出力を受け手となるオブジェクトのMaterial入力へ接続します。2D画像・材質・3Dシーンの違いは<Term id="classic-3d">Classic 3Dの基礎</Term>を参照してください。

## 役割：照明として足すのではなく、表面の画像にする

Projector 3DやCamera 3Dは、画像を3D空間へ投影できます。ただし、**Light / Ambient Lightモード**での投影は画像のRGBを照明として加える方式で、投影画像の**Alpha（透明度）を利用して壁を透過させることはできません**。

**TextureモードとCatcher**を組み合わせると、投影が材質のテクスチャとして使われ、画像のAlphaも表面へ反映できます。これは投影画像を照明として足す処理とは異なります。さらに、照明を有効にしなくても投影を材質へ反映でき、Diffuse Colorだけでなく、光沢の強さなど別の材質成分へ投影結果を渡す用途にも使えます。

Catcherは、3D空間にあるすべての面へ自動で投影する設定ではありません。**Catcherの材質を接続したオブジェクトが受け手**です。投影する側のノードは同じ3Dシーンに含めます。

## 入力と出力

- **入力端子：なし。** Catcherに投影元の2D画像を直接つなぐ入力はありません。画像はCamera 3DまたはProjector 3Dの画像入力へつなぎ、投影元ノードを3Dシーンへ配置します。
- **出力：材質（Material）。** [Shape 3D](../3d/shape-3d.md)などのMaterial入力へ接続すると、その形状が投影を受ける対象になります。[Blinn](./blinn.md)などの**Diffuse Texture入力**へ接続し、細かな材質設定と組み合わせることもできます。

**Catcherの出力は3Dシーンそのものではありません。** Merge 3DやRenderer 3Dへ直接渡すのではなく、まず形状ノードの材質として使います。

## 最小構成：平面へ画像を投影する

```text
画像（MediaIn / Loader）→ Camera 3D［画像入力／Texture投影］─┐
Catcher → Shape 3D［Material入力／Plane］──────────────┤
表示用Camera 3D ──────────────────────────────────────┤
                                                       ↓
                                                   Merge 3D
                                                       ↓
                                                 Renderer 3D → 2D画像
```

1. 画像をCamera 3Dの**Image Input**に接続し、Camera Projectionの**Projection ModeをTexture**にします。ここではこのCamera 3Dを投影専用にします。
2. Shape 3DでPlane（平らな面）を作り、**Catcherの出力をShape 3DのMaterial入力**へ接続します。
3. 投影専用Camera 3D、Shape 3D、画面を撮るための別のCamera 3DをMerge 3Dに加えます。投影用のCameraを動かすと、画像が面へ当たる位置が変わります。
4. Merge 3DをRenderer 3Dへ接続し、表示用Cameraを選んで結果を確認します。必要に応じて投影元を[Projector 3D](../3d/projector-3d.md)へ置き換えられます。

この構成の**投影先はCatcherをつないだShape 3D**です。ほかのオブジェクトにも受け取らせたい場合は、それぞれのMaterial接続を確認します。

## Inspectorの主な設定

| 設定 | 何を変えるか | 確認する場面 |
| --- | --- | --- |
| **Enable** | Catcherの効果を有効・無効にする。Inspector左上のTool全体の有効スイッチとは別。 | 投影の影響を切り分ける。 |
| **Color Mode** | 複数の投影が重なった場合の色の合成方法。 | 同じ面へ複数の画像を投影するとき。 |
| **Alpha Mode** | 複数投影のAlphaをどう合成するか。 | 透明部分が重なるとき。 |
| **Threshold** | 複数投影の集計から小さい値を除外するしきい値。 | 弱い値が重なり方へ影響する場合。 |
| **Restrict by Projector ID** | 有効時に、IDが一致する投影元だけを受け取る。 | 複数の壁へ別々の映像を割り当てるとき。 |
| **Material ID** | 材質の識別番号。 | Renderer 3DでMatID補助チャンネルを使うとき。 |

**Color ModeとAlpha Modeは、投影元が1つだけなら結果に影響しません。** また、21.1 Manualでは**Renderer 3DのSoftware Renderer向け**とされ、**OpenGL Rendererでは効果がありません**。複数投影の合成を調整しても結果が変わらない場合は、投影元の数とRendererの方式を確認してください。

Thresholdは合成計算に使う値の下限です。たとえばManualが挙げるMedian Accumulationでは、0.01より小さい画素値を中央値計算から除外する、と説明されています。しきい値を設定しただけで画像全体の透明度が一律に変わるわけではありません。

Material IDは通常のカラー画像へ番号を書き込む設定ではありません。Renderer 3Dで対応する補助チャンネルを有効にした場合に使われます。初期値や正確な数値範囲、複数投影の各モード一覧は実機未確認です。

## 具体的な運用例

### 建物の窓だけ透過させる

実写の建物写真から窓部分をマスクで抜き、**窓を透明（Alpha=0）にした画像**を用意します。その画像を投影用Camera 3Dへ入力し、Textureモードで建物の壁に見立てたPlaneへ投影します。壁のPlaneにはCatcherを接続します。

Lightモードで投影すると、窓のAlphaは照明として反映されず、背後の部屋は見えません。Catcherを使うTextureモードなら、窓に相当する部分を透明にでき、後ろへ配置した別の3Dオブジェクトが見える構成を作れます。これはManualでも紹介されている用途です。

### 複数のプロジェクターを使い分ける

3D空間に複数の投影元を置き、それぞれ違う画像を入力します。たとえば展示会場の左壁と右壁へ別の映像を投影する場合は、各壁にCatcherを使い、**Restrict by Projector ID**で受け取る投影を制限できます。

同じ壁へ複数の投影を重ねる場合は、Software RendererでColor Mode・Alpha Modeを調整します。どの投影が重なるか、透明部分がどう合成されるかをViewerで確認します。これらの合成設定はOpenGL Rendererでは使えません。

## 表示されないとき・似たノードとの違い

- **Catcherをつないだ物体が透明になる**：Textureモードの投影元が同じシーンに存在しない、または投影がその物体へ届いていない可能性があります。**CatcherはTextureモードの投影を受け取らないと物体を透明・不可視にする**とManualに明記されています。
- **透明な窓を作れない**：投影元がLight / Ambient Lightになっていないか、元画像にAlphaがあるかを確認します。
- **複数投影の合成モードが効かない**：投影元が1つだけか、Renderer 3DがOpenGLになっていないか確認します。
- **投影と普通の画像貼り付けの違い**：画像を最初からオブジェクトの表面へ貼るだけなら、[Image Plane 3D](../3d/image-plane-3d.md)などのMaterial入力で足ります。**カメラの位置・向きから、別の形状へ画像を投影する**ならCatcherを検討します。
- **USDのuCatcherとは別系統**：このページはFusionの<Term id="classic-3d">Classic 3D</Term>用Catcherです。USDのu*ノードを同じ端子へ直接つなぐ前提ではありません。

## 関連する概念とノード

- [Classic 3Dの基礎](../../learn/02-data/classic-3d.md)：Image、Material、3Dシーンの接続の違い。
- [Camera 3D](../3d/camera-3d.md)：画像入力とCamera Projectionの設定。
- [Projector 3D](../3d/projector-3d.md)：専用の投影元として使う3Dノード。
- [Shape 3D](../3d/shape-3d.md)：CatcherのMaterialを使う壁や床の形状。
- [Blinn](./blinn.md)：Catcher出力をDiffuse Textureなどの材質成分へ渡す場合。
- [Renderer 3D](../3d/renderer-3d.md)：Software / OpenGLでの描画方式の違い。
- [3D Material / Lightノード一覧](./index.md)：材質と照明の選び分け。

## 出典と検証状況

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 91「3D Texture Nodes」、**Catcher [3Ca]（pp.2085–2087）**。入力端子がないこと、Materialへの接続先、Texture投影とLight投影の違い、Alphaの扱い、透明になる条件、複数投影の合成設定、Software/OpenGL差、Projector ID、Material IDを確認しました。

`verification: partial`は、内部REGID、Controlの初期値・正確なrange、Edition差、現在の実機での表示・レンダリングを未確認としているためです。
