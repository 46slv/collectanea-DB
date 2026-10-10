---
title: Ambient Occlusion (Deep Pixel)
description: 3DレンダリングのZ・Normal・Cameraから接触部の陰影を作るAmbient Occlusion。入力、調整手順、OpenGLの補助チャンネル設定を解説。
doc_type: node
term_id: ambient-occlusion-deep-pixel
verification: partial
aliases: [Ambient Occlusion, SSAO, Ambient Occlusion (Deep Pixel)]
concepts: [auxiliary-channels, image-data, classic-3d]
nodes: [Ambient Occlusion]
node_family: deep
controls: [Output Mode, Kernel Type, Number of Samples, Kernel Radius, Lift, Gamma, Tint]
inputs: [image, camera, mask]
outputs: [image]
tasks: [aov, ambient-occlusion, post-process]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Ambient Occlusion (Deep Pixel)

## 何をするNodeか

Ambient Occlusion（AO）は、3Dレンダリング画像の**物体同士が接する場所や、奥まった場所にできる暗さ**を、描画後に計算するNodeです。例えば、床に置いた球の接地部分や、壁の隅に陰影を足せます。

ライトからの光が物体に遮られる様子を厳密に計算するものではありません。画面に写った形状の距離（Z）と表面の向き（Normal）を手掛かりに、周囲の物体がどれだけ光を遮りそうかを近似する**スクリーンスペースの後処理**です。鋭い投影影や反射光の代わりにはならず、通常は元画像の照明と組み合わせます。

このカテゴリの「Deep Pixel」は、1画素に複数の奥行きサンプルを保持する<Term id="deep-image">Deep Image</Term>とは別です。Ambient Occlusionが受け取るのは、<Term id="auxiliary-channels">補助チャンネル</Term>を含んだ通常の2D <Term id="image">Image</Term>です。

## 入力・出力

| 端子 | 必要なデータ | 何に使うか |
| --- | --- | --- |
| **Input**（オレンジ、必須） | **RGBA + Z-Depth + Normal**を含む2D画像 | 色、カメラからの距離、物体表面の向きを取得する |
| **Camera**（緑、必須） | 画像を描画したCamera 3D、またはそのCameraを含む3Dシーン | 画像内の画素と3Dカメラの関係を対応させる |
| **Effect Mask**（青、任意） | 2Dマスク | AOを適用する範囲を制限する |
| **出力** | 2D画像 | 元画像とAOを合成した画像、またはAOのみのグレースケール画像 |

**InputとCameraの両方が必要**です。どちらかが未接続なら、21.1マニュアル上は画像を出力しません。Cameraには、Renderer 3Dで使用したカメラを接続します。別の視点のカメラを渡すと、距離と表面の解釈が合いません。

Effect Maskは3D空間に置く物体ではありません。処理後のAOの適用範囲を、画面上で制限するためのものです。

## 接地部分の陰影を作る

次の例では、球と床を1つの3Dシーンに置き、両者が接する場所を暗くします。

~~~text
Shape 3D（球） ───┐
Shape 3D（床） ───┼→ Merge 3D → Renderer 3D ─→ Ambient Occlusion → MediaOut
Camera 3D ────────┘                                  ↑ Camera
      └──────────────────────────────────────────────┘
~~~

1. 2つの[Shape 3D](../3d/shape-3d)で球と床を作り、[Camera 3D](../3d/camera-3d)とともにMerge 3Dへつなぎます。
2. [Renderer 3D](../3d/renderer-3d)の**Output Channels**で**Z**と**Normal**を出力するよう設定します。最終色のRGBAだけではAOに必要な情報が足りません。
3. Renderer 3Dの2D出力をAmbient Occlusionの**Input**へ接続します。同じCamera 3Dの出力を、Ambient Occlusionの**Camera**入力にも接続します。
4. **Output Mode = AO**にして、陰影だけを白黒で確認します。白い部分ほど周囲が開けており、黒い部分ほど遮られている状態を表します。
5. **Kernel Radius**を調整して、球と床が接する場所に影響が現れる大きさを探します。次に**Number of Samples**を上げて、まだらなノイズを減らします。
6. 元の色に陰影を加えたい場合は**Output Mode = Color**へ切り替えます。AOを別の画像として調整するならAOモードの出力を使います。

AOモードの出力を別系統で合成する場合は、通常のMergeに元画像をBackground、AO画像をForegroundとしてつなぎ、**Apply Mode = Multiply**を試します。白は元画像をほぼ保ち、暗い部分だけ色が落ちます。AOをAddで足しても同じ陰影にはなりません。

## Inspectorの主要設定

| 設定 | 働き | 調整の目安 |
| --- | --- | --- |
| **Output Mode / Color** | 元の色へAOを適用した結果を出力 | 仕上がりをそのまま使う |
| **Output Mode / AO** | AOだけをグレースケールで出力 | 陰影の診断や個別合成 |
| **Kernel Type / Hemisphere** | 表面の向きを基準に、半球方向の遮蔽を調べる | 21.1マニュアルの通常推奨 |
| **Kernel Type / Sphere** | 表面方向ではなく周囲の球状範囲を調べる | 意図的に異なる、様式的な陰影 |
| **Kernel Radius** | 画素の周囲を3D空間でどこまで調べるか | 被写体の実寸・Zのスケールに合わせる |
| **Number of Samples** | 遮蔽の推定に使うサンプル数 | ノイズを減らせるが処理時間は増える |
| **Lift / Gamma / Tint** | 計算したAOの明るさ・階調・色を調整 | 陰影の見た目を整える |

Radiusは画面上のピクセル数ではなく、**3D空間での探索距離**です。非常に小さいと隣の物体に届かず、AOがないように見えます。大きすぎると広範囲の形状を拾って結果が荒くなるため、Samplesだけを増やす前にRadiusを見直します。異なるRadiusのAOを複数作り、細かな接触影と大きな陰影を別々に調整する方法もあります。

## Renderer 3Dのアンチエイリアスと注意点

[Renderer 3D](../3d/renderer-3d)の**OpenGL**レンダラーは、色のRGBAと、Z・Normalなどの補助チャンネルに対して、別々にアンチエイリアスを設定できます。輪郭のギザつきを減らす処理が、AOの入力値にとって常に有益とは限りません。

- **Normal**：異なる向きの面が同じ境界画素に混ざると、本来存在しない中間の向きが生まれます。21.1マニュアルはNormalを含む一部補助チャンネルのアンチエイリアスを**無効にするよう強く推奨**しています。AOの輪郭に不自然な筋が出たら確認します。
- **Z**：深度の境界で手前と奥の値が混ざると、後段の奥行き処理に影響します。一方、マニュアルは用途によってZへのスーパーサンプリングが有効な場合もあると説明しています。**Zのアンチエイリアスは一律にON/OFFと決めず、目的のAO出力を比較**します。
- **RGBA**：色の輪郭を滑らかにする設定と、NormalやZの値をどう扱うかは分けて考えます。HiQを使わないプレビューではスーパーサンプリングが省略される場合があるため、最終品質表示とも比較します。

なお、21.1マニュアルのRenderer 3D説明には、Zチャンネル値自体はアンチエイリアスを含まないという記述（p.1974）と、Zへのスーパーサンプリングの効果を扱う記述（p.1975）の両方があります。ここでは特定GPUや設定でのZ値の内部処理を断定しません。

AOは**画面に写っている情報から推定する後処理**です。カメラの移動、画面外の形状、輪郭や重なり方によって計算結果が変わり得ます。設定を調整しても不自然な場所に陰影が残るときは、AOを別パスで出してマスクや合成量を調整する方法が有効です。

## 関連Node・概念

- [Renderer 3D](../3d/renderer-3d) — ZとNormalを含む2D画像を描画する
- [Camera 3D](../3d/camera-3d) — AOが参照する撮影視点
- [補助Channel / AOV](../../learn/02-data/auxiliary-channels) — Z、Normal、IDなどの意味と用途
- [Depth Blur](./depth-blur-deep-pixel) — 同じZチャンネルを使った奥行きぼかし
- [Deep / Auxiliary Channelノード](./index) — 真のDeep Imageとの違い

## 出典・確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**, Chapter 96「Ambient Occlusion [SSAO]」、本文pp.2256–2258。入出力、Output Mode、Kernel、Samples、Radius、制約を確認。
- 同ManualのChapter 88「Renderer3D [3Rn]」、本文pp.1974–1975。Z / Normalの出力とOpenGL補助チャンネルのアンチエイリアスに関する推奨・記述の違いを確認。
- 同ManualのChapter 77「Understanding Image Channels」、本文p.1686。AO等のShadowパスをMultiplyで合成する例を確認。

設定名と動作は21.1の公式マニュアルに基づきます。DaVinci Resolve 21.1の実機、GPUごとの描画差、最適なRadius / Samples値は未検証です。
