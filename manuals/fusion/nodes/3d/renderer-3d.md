---
title: Renderer 3D
description: FusionのClassic 3Dシーンを2D画像に変換するNode。カメラ・照明・補助チャンネル・レンダーパス・UV書き出しを解説。
doc_type: node
term_id: renderer-3d
term_short: Renderer 3Dは、Fusionの3Dシーンをカメラから見た2D画像として描画するNode。
verification: partial
aliases: [Renderer3D, Renderer 3D, 3Rn]
concepts: [classic-3d, rendering, image-data]
nodes: [Renderer 3D]
node_family: 3d
controls: [Camera, Eye, Reporting, Renderer Type, Output Channels, Enable Lighting, Enable Shadows, Anti-Aliasing, Accumulation Effects, Transparency, Cryptomatte, Wireframe, UV Gutter Size]
inputs: [classic-3d, mask]
outputs: [image]
tasks: [render-3d, convert-domain, composite-3d]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-09"
---

# Renderer 3D

Renderer 3Dは、<Term id="classic-3d">Classic 3Dシーン</Term>を、カメラから撮影したような2D画像に変換するNodeです。3D空間に配置した物体・カメラ・ライトは、そのままでは通常の2D画像用MergeやBlurに渡せません。Renderer 3Dを通すと、画素を持つ画像として実写素材と合成できるようになります。

3D Viewerで物体が見えていても、最終画像に同じ構図が描かれるとは限りません。**Renderer 3Dが使うCamera、Renderer Type、照明と影の設定**が出力を決めます。

## 入力と出力

| 接続 | 受け取るもの | 役割 |
| --- | --- | --- |
| **SceneInput**（オレンジ、必須） | Classic 3Dシーン | 描画する形状・カメラ・ライトなど。通常はMerge 3Dの出力を接続する |
| **EffectMask**（青、任意） | 2Dマスク画像 | Renderer 3Dの出力を適用する範囲を制限する |
| **出力** | 2D画像 | RGBAに加え、設定に応じて深度などの補助チャンネルやレンダーパスを持てる |

EffectMaskは3D空間に置く物体ではなく、3Dシーンを描画する処理へ使う2Dマスクです。

## 実写へ3Dタイトルを重ねる

まずText 3D、Camera 3D、ライトをMerge 3Dで同じシーンにまとめます。次にRenderer 3Dでタイトルを画像化し、通常の2D Mergeで実写へ合成します。

```text
Text 3D ──────┐
Camera 3D ────┼→ Merge 3D → Renderer 3D ──┐（Foreground）
Spot Light ───┘                            ↓
実写映像（MediaIn）────────────────────────→ Merge → MediaOut
                                         （Background）
```

1. [Camera 3D](./camera-3d)を配置し、タイトルが映る位置と向きを決めます。
2. [Merge 3D](./merge-3d)に3D文字、カメラ、ライトを接続します。
3. Renderer 3Dの**Camera**で使うカメラを確認し、必要なら**Enable Lighting**と**Enable Shadows**を設定します。
4. Renderer 3Dの2D出力をMergeのForegroundへ、実写をBackgroundへ接続します。

Camera 3Dを動かせば3D空間の遠近関係も変わります。画像化した後で2DのTransformを使って位置を変える処理とは異なります。

## カメラとステレオ設定

**Camera**メニューでシーン内のカメラを選びます。**Default**はシーン内で最初に見つかったカメラを使い、カメラがなければ既定のパースビューを使用します。複数のカメラがある場合は意図したカメラを明示的に選ぶと、構図の取り違えを防げます。

**Eye**はステレオ3D用です。**Mono**はステレオ設定を無視し、**Left / Right**はカメラの左右眼設定を使って描画します。**Stacked**は左右画像を上下に配置し、**Layers**は左右を別レイヤーとして出力します。

**Reporting**には、描画中のwarning / errorをConsoleへ表示するか、発生時にrenderを中断するかを決める設定があります。

## Renderer Type：3つの描画方式

| 方式 | 処理の特徴 | 用途・制約 |
| --- | --- | --- |
| **Software** | CPUで描画。マシン間で結果を揃えやすい | ネットワークレンダリングや**柔らかい影（soft shadow）**が必要な場合。一般にOpenGLより遅い |
| **OpenGL** | GPUで高速に描画。Supersamplingや3D被写界深度に対応 | 作業中の応答性や画質調整に向く。ただしGPU・ドライバーで結果が変わることがあり、**soft shadowは生成できない** |
| **OpenGL UV** | 既存のUVをもとに表面を平面へ展開して描画 | テクスチャ作成やライティングの焼き込み。通常のカメラ視点を描く方式ではない |

Renderer Typeを変えるとInspectorの下部に現れる項目も変わります。以下の設定はすべての描画方式に共通するわけではありません。

### Lighting / Shadows

**Enable Lighting**を有効にすると、シーンのライトが物体を照らします。この状態でライトが存在しなければ、物体は黒く描かれます。**Enable Shadows**は影の生成を有効にしますが、描画負荷が増えます。柔らかい影が必要ならSoftwareを使います。

OpenGLの**Lighting Mode**にはPer-vertexとPer-pixelがあります。Per-vertexは頂点単位で光を計算するため、分割の少ない形状では明るさが角ばって見える場合があります。Per-pixelはより滑らかですが、透過や色付きの影までSoftwareと同じ結果になるわけではありません。

OpenGLの**Transparency**は、半透明の物体を描く順序の設定です。**Z Buffer (fast)**は主に不透明なシーンに向きます。半透明の物体が前後逆に見える場合は、描画前に物体を並べ替える**Sorted (accurate)**を試します。**Quick Mode**は粒子主体のシーン向けの実験的な方式です。

## Output Channels：色以外の情報を残す

Renderer 3Dは完成した色に加え、深度や法線、物体IDを画像の補助チャンネルとして出力できます。例えばZはカメラからの距離、Normalは表面の向き、TexCoordは表面上のUV位置を表します。

| チャンネル | 内容 | 後段での使い方 |
| --- | --- | --- |
| **RGBA** | 色・Alpha。常に出力され、無効化できない | 実写との合成 |
| **Z** | カメラからの距離 | 深度を使った合成・処理 |
| **Normal** | 表面の3D方向（X/Y/Z） | 面の向きに応じた処理 |
| **TexCoord** | UV座標 | 2D側でテクスチャ座標を参照する |
| **ObjectID / MaterialID** | 物体・マテリアルに割り当てた識別番号 | 目的の物体・マテリアルをマスクとして分離する |
| **Coverage / BgColor** | 境界画素での前景占有率と、その背後の色 | 深度合成の境界を補助する。**Software側の出力項目** |

不要な補助チャンネルを有効にするとメモリと描画時間が増えます。SoftwareのZ値は、複数の面が同じ画素へ重なったとき手前側の深度を採用し、通常の色のようにはアンチエイリアス処理されません。

**例：3Dの球だけ色を変える。** まず球へObject IDを設定し、Renderer 3DでObjectIDを出力します。後段でその番号に対応する画素を取り出してマスク化すると、他の物体を保ったまま球を色補正できます。Object IDは自動的にすべての物体を異なる番号へ振り分ける仕組みではないため、対象のID設定も確認します。

### Multilayer：光の成分を後から調整する

21.1のRenderer 3Dは、完成画像に加え、**Shadow / Diffuse / Specular / Ambient / Reflect / Refract / Fog**という7種類のレイヤーを出力します。Viewerのレイヤー表示で確認できます。

例えば3Dタイトルのハイライトが強すぎるとき、Specularを個別に調整してから他の成分と再合成できます。マニュアルでは**ShadowをMultiply、それ以外のパスをAdd**で組み合わせる方法が示されています。完成したRGBAを複数回加算する操作とは異なります。

OpenGLの**Cryptomatte**は物体やマテリアルの識別情報から、境界を含む選択マスクを得る別の手段です。hardware rendererで生成したCryptomatteレイヤーとメタデータはCryptomatteツールで読み取り、OpenEXRに保存して後段でも使えます。ObjectIDとは異なるデータです。

## OpenGLの画質調整

**Anti-Aliasing**は、内部でより大きな画像を描画して縮小し、斜めの輪郭のギザつきを減らす処理です。OpenGLではLowQ / HiQ別に有効化し、**Supersampling LowQ/HiQ Rate**や**Filter Type**を調整できます。倍率を大きくすると通常は描画コストも増えます。通常のViewerではHiQを有効にしない限り、アンチエイリアスを省略することがあります。

補助チャンネルで境界の値を平均すると、存在しないIDやUV、法線の向きができて後段処理を乱すことがあります。21.1マニュアルは**ObjectID / MaterialID / TexCoord / Normal / Vector / BackVector**へのアンチエイリアスを無効にするよう強く推奨しています。ZやWorldCoordも処理によっては有効化が逆効果になります。

OpenGLで3Dの被写界深度を作る場合は、**Accumulation Effects**と**Depth of Field**を両方有効にし、Camera 3Dの**Plane of Focus**を被写体までの距離に合わせます。焦点位置をアニメーションすればラックフォーカスができます。ぼけを大きくするほどQualityを高くする必要があります。

**Wireframe**を有効にすると、面の代わりにモデルの辺を描けます。必要なら**Wireframe Anti-Aliasing**を併用します。また、ImageタブのColor Depthをint16やfloat32にすると、GPUによっては描画が遅くなることがあります。

## OpenGL UVでテクスチャを焼き込む

OpenGL UVは「モデルをカメラで撮る」のではなく、モデルのUV座標に沿って表面を2Dへ展開します。展開した画像を外部でペイントしてからテクスチャとして戻したり、照明結果をテクスチャへ焼き込んだりするときに使います。

焼き込んだ照明を含む画像を再利用する場合、後の描画でライトを重ねて適用しないよう注意します。**UV Gutter Size**が0だとテクスチャの面の継ぎ目が見える場合があり、値を増やすと防ぎやすくなります。左右対称の形状でUVを共有している場合や、複数メッシュのUVが重なっている場合は、異なる面の照明情報を同じ場所へ書くことになるため、期待どおりに焼き込めないことがあります。

## トラブル時の確認

- **3D Viewerでは見えるのに最終画像に出ない**：Camera選択、Merge 3Dへの接続、物体のVisibilityを確認します。
- **物体が黒い**：Enable Lightingを有効にしている場合、シーンにライトがあるか確認します。
- **半透明の物体が不自然に重なる**：OpenGLのTransparencyをSortedへ変更して比較します。
- **柔らかい影が出ない**：OpenGLではなくSoftwareを使います。
- **粒子のモーションブラーが崩れる**：pRenderとRenderer 3DのMotion Blur設定を一致させます。サブフレーム設定が異なると結果が正しくならない場合があります。

## 関連Node・概念

- [Classic 3Dとは](../../learn/02-data/classic-3d) — 3Dシーンと2D画像が別のデータである理由
- [Merge 3D](./merge-3d) — 物体・カメラ・ライトを同じシーンへまとめる
- [Camera 3D](./camera-3d) — 撮影位置・画角・焦点位置を決める
- [Image Plane 3D](./image-plane-3d) — 2D素材を3D空間へ置く
- [Classic 3Dノード一覧](./) — 関連Nodeを探す

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**, Chapter 88「Renderer3D [3Rn]」、本文pp.1970–1978。入力、Camera / Eye、Software / OpenGL / OpenGL UV、Output Channels、Multilayer、アンチエイリアス、Depth of Field、Cryptomatte、UV書き出しを確認。
- 同ManualのChapter 77「Understanding Image Channels」。補助チャンネルと2D合成の関係を確認。
- [Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)（21.1 Manual、2026-09-08公開）。

設定名と方式の違いは21.1マニュアルによります。GPUごとの速度、補助チャンネルの実機挙動、edition差は未検証です。
