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
updated: "2026-10-24"
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

## Renderer 3DのHiQと、AO特有の注意点

AOの輪郭が荒れるときは、Kernel RadiusやNumber of Samplesだけでなく、[Renderer 3D](../3d/renderer-3d)の**Z・Normal出力とアンチエイリアス**も確認します。OpenGLレンダラーではRGBAと補助チャンネルのアンチエイリアスを別々に設定できます。

21.1マニュアルには、目的の異なる次の説明があります。

- **AO固有の説明（Chapter 96、p.2259）**：AOでアンチエイリアスを利用するには、Renderer 3Dの**ZとNormalsのパスでHiQを有効にする**よう案内されています。
- **補助チャンネル全般の説明（Chapter 88、p.1975）**：Normalは異なる面の向きを平均すると存在しない中間値になるため、通常は**アンチエイリアスを無効にすることを強く推奨**しています。一方、ZやWorldCoordには有効な場合もあると説明しています。
- **Zの仕様（Chapter 88、pp.1974–1975）**：同じ画素で複数の奥行きが重なると手前のZが使われます。Zのスーパーサンプリングが後段の処理にとって有益かどうかは用途で変わります。

両方の説明を「Normalのアンチエイリアスは常にON」「常にOFF」のどちらかに読み替えないことが重要です。Z・Normalの出力を有効にしたうえで、**AOをHiQで表示して輪郭を比較**します。不自然な筋が出る場合はNormal側のアンチエイリアス設定も切り替えて確認します。Renderer 3Dのインタラクティブ表示はHiQがOFFだとスーパーサンプリングを省略するため、最終品質の表示も比較してください。

### 透明物・粒子・カメラ移動

Ambient Occlusionは基本的に**不透明な3D形状**向けです。21.1マニュアル（p.2259）には次の制約があります。

- **透明・半透明物**：ガラス・煙などが遮蔽する側、影を受ける側のどちらでも不自然になる場合があります。不透明な形状と分離してAOを計算してから合成する方法が候補です。
- **Particles**：半透明の粒子には適しません。不透明な立体形状として描かれる粒子は例外です。アンチエイリアスされた輪郭の半透明部分も同様の問題を起こし得ます。
- **カメラ移動**：AOは画面内の情報から推定するため、同じ3Dシーンでも視点を動かすと陰影の濃さが変化する場合があります。静止フレームだけでなくショット全体を確認します。

これらはNumber of Samplesを増やすだけでは解消しません。必要ならAOを独立パスで出し、マスクや合成量で調整します。

## 関連Node・概念

- [Renderer 3D](../3d/renderer-3d) — ZとNormalを含む2D画像を描画する
- [Camera 3D](../3d/camera-3d) — AOが参照する撮影視点
- [補助Channel / AOV](../../learn/02-data/auxiliary-channels) — Z、Normal、IDなどの意味と用途
- [Depth Blur](./depth-blur-deep-pixel) — 同じZチャンネルを使った奥行きぼかし
- [Deep / Auxiliary Channelノード](./index.md) — 真のDeep Imageとの違い

## 実機例：球と床の接触部へAOを加える

<!-- capture-case:S120 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%、フレーム0で撮影しました。左がRenderer 3Dのカラー出力、右が処理後です。

[![RGBAとZとNormalをAOへ渡し、同じCamera3DをAOのCamera入力へ接続した実機Graph](/img/fusion/captures/S120/graph.png)](/img/fusion/captures/S120/graph.png)

球は原点、床はY＝−1、X回転＝−90、Scale＝6にしています。カメラはY＝1.5・Z＝7、X回転＝−12です。Software RendererのRGBA・Z・Normalを有効にし、画像をAOのInputへ、Camera 3DをAOのCameraへ接続しました。Camera未接続の初期状態では出力できなかったため、その状態は完成例へ採用していません。

[![Software RendererでAOに必要なRGBAとZとNormalを有効にした実機Inspector](/img/fusion/captures/S120/renderer-inspector.png)](/img/fusion/captures/S120/renderer-inspector.png)

Output Mode＝Color、Kernel Type＝Hemisphere、Number of Samples＝512、Kernel Radius＝1、Lift＝0、Gamma＝1、Tint＝白にしました。まずSettingsのBlend＝0で、元のカラーと同じ状態を確認します。

[![Ambient OcclusionのBlend0で元の球と床のカラーが保たれる実機比較](/img/fusion/captures/S120/baseline.png)](/img/fusion/captures/S120/baseline.png)

Blend＝1へ戻すと、右の球と床の接触部に暗い陰影が加わりました。ほかのパラメータと元のCamera・Lightは変えていません。

[![AOのColor、Hemisphere、Samples512、Radius1、Lift0、Gamma1を選んだ実機Inspector](/img/fusion/captures/S120/inspector.png)](/img/fusion/captures/S120/inspector.png)

[![右のAOカラー出力で球と床の接触部が暗くなる実機比較](/img/fusion/captures/S120/compare.png)](/img/fusion/captures/S120/compare.png)

Output ModeをAOへ切り替えると、陰影成分だけを白黒で確認できます。接触部が暗く、ほかの面は白く表示されました。512サンプルでも接触部周辺にはノイズや縞が残っています。この値を最適値や十分な品質として示すものではありません。最後はColor、Blend＝1へ戻して保存しました。

[![AOのみを出力するモードへ切り替えたAmbient Occlusionの実機Inspector](/img/fusion/captures/S120/ao-inspector.png)](/img/fusion/captures/S120/ao-inspector.png)

[![白い面と暗い接触部をAOのみの出力で確認した実機比較](/img/fusion/captures/S120/ao.png)](/img/fusion/captures/S120/ao.png)

入力側では、CopyAux1でZをFrom＝−9〜−4からTo＝0〜1へ、NormalAux1でNormalを−1〜1から0〜1へ取り出しました。いずれもChannel Missing＝Failで出力しています。2本は診断用の分岐で、AOへの入力にはRendererの元の補助チャンネルを使っています。

[![球と床が連続した奥行き値を持つことを示す固定範囲のZ診断表示](/img/fusion/captures/S120/z.png)](/img/fusion/captures/S120/z.png)

[![球面の連続した法線と床の一定方向がRGBで区別できるNormal診断表示](/img/fusion/captures/S120/normal.png)](/img/fusion/captures/S120/normal.png)

これは通常の2D画像・Z・Normalを使う画面空間の後処理です。完全な大域照明、透明物や粒子、HiQ比較、カメラ移動時の安定性、別KernelやRadiusの最適化、EXR保存、別Renderer・Edition差と性能は未確認です。

[再現用Graph](/img/fusion/captures/S120/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S120/capture.json)

## 出典・確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**, Chapter 96「Ambient Occlusion [SSAO]」、本文pp.2256–2259。入出力、Output Mode、Kernel、Samples、Radius、HiQ、透明物・粒子の制約を確認。
- 同ManualのChapter 88「Renderer3D [3Rn]」、本文pp.1974–1975。Z / Normalの出力とOpenGL補助チャンネルのアンチエイリアスに関する推奨・記述の違いを確認。
- 同ManualのChapter 77「Understanding Image Channels」、本文p.1686。AO等のShadowパスをMultiplyで合成する例を確認。

S120でSoftware RendererのZ・NormalとCamera入力、Color／AO出力の表示を実機確認しました。GPU差、ほかの入力や最適なRadius／Samplesは未確認です。
