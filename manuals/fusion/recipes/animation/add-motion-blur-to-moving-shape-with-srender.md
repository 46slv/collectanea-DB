---
title: sRenderのMotion Blurで移動する図形に動きぼけを加える
description: sEllipseをsTransformで横移動させ、sRenderのMotion Blurを切り替えてシャッター角とサンプル数の違いを比較する。
doc_type: recipe
verification: partial
aliases: [sRender Motion Blur, Shapeモーションブラー, 図形の動きぼけ, シャッター角]
concepts: [shape-data, rasterization, transform, keyframes, frame-evaluation]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sTransform, sRender]
tasks: [shape, motion-blur, animation, motion-graphics]
prerequisites: [shape-data, keyframes]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sRenderのMotion Blurで移動する図形に動きぼけを加える

## 作るもの

左から右へ素早く移動する円を作り、移動中の輪郭にモーションブラー（動きぼけ）を加えます。図形の位置はsTransformで動かし、ブラーは画像化する段階のsRenderで調整します。

画像化した円へ後から方向性のあるぼかしをかけるのではなく、Shapeのアニメーションを保ったまま、描画時の仮想シャッターを利用する例です。

## 必要なものと入力条件

- 1920×1080、正方形ピクセル、24fps、開始から24フレーム以上あるFusion Compositionを想定します。素材映像は不要です。
- sEllipse：塗りのある円を生成します。
- sTransform：円の位置にキーフレームを設定します。
- sRender：Shapeを画像化し、SettingsでMotion Blurを調整します。
- Viewer、Inspector、Splineを使います。

以下の数値は差を観察するための設定案であり、実機で測定した値ではありません。開始フレームが0でない場合は相対的なフレーム番号として読み替えてください。

## 接続

~~~text
sEllipse
  │ Shape
  ▼
sTransform（X Offsetをアニメーション）
  │ Shape
  ▼
sRender（Motion Blur）
  │ 2D Image
  ▼
Viewer / MediaOut
~~~

Shapeの出力は次のShapeノードのInput1へ接続します。完成画像はsRenderをViewerへ表示して確認します。

## 手順

### 1. 比較用の円を作る

1. sEllipseを追加し、Solidをオンにします。
2. WidthとHeightをともに0.12、X OffsetとY Offsetを0.0にします。
3. Styleで白など輪郭が分かりやすい色を選び、Alphaを1.0にします。
4. sTransformとsRenderを順に接続し、sRenderのAuto Resolutionを有効にします。

### 2. 円を横方向へ移動する

1. sTransformのX SizeとY Sizeを1.0、Y Offsetを0.0にし、Rotationを0°にします。
2. フレーム0でX Offsetを-0.30にしてキーフレームを設定します。
3. フレーム12でX Offsetを0.30にします。
4. Splineで2つのキー間を線形補間に設定します。フレーム5、6、7で位置が順に変わることを確認します。

Offsetはフレーム幅を基準にした正規化座標です。ここでは移動中の差が見えやすいよう短いフレーム間隔を使います。

### 3. 同じフレームでMotion Blurを比較する

1. フレーム6で停止し、sRenderを選択します。
2. InspectorのSettingsにあるMotion Blurをオフにし、円の輪郭を観察します。
3. Motion BlurをオンにしてShutter Angleを180°にします。Quality、Center Bias、Sample Spreadは比較中に変更しません。
4. フレームを動かさずShutter Angleを360°に変更し、輪郭が横方向へどの程度広がるか比較します。
5. Viewerの倍率をそろえ、必要なら拡大して輪郭と透明部分を確認します。

360°はManualで1フレーム分の露光に相当すると説明されています。180°と360°の具体的な画素幅や明るさは実機で比較してください。

### 4. サンプル数の違いを見る

Shutter Angleを360°のままにしてQualityを低い値と高い値で比較します。Qualityは描画時のサンプル数を決める設定です。値を増やすと滑らかなブラーが期待できますが、処理時間も増えます。

最初はShutter AngleとQualityを同時に変えず、それぞれの作用を分けて観察します。

## 期待される結果と確認ポイント

| 比較条件（フレーム6） | 観察する項目 |
| --- | --- |
| Motion Blurオフ | 移動中でも、その時刻の円の輪郭が見えるか |
| オン・180° | 移動方向にぼけが広がるか |
| オン・360° | 180°より露光時間が長い設定で、広がりが増えるか |
| 360°のままQualityを上げる | サンプル数の増加によって描画が滑らかになるか |

これらはManualの説明から導いた確認項目であり、今回の設定で取得した比較画像や実測結果ではありません。

## この構成で動く理由

sTransformはShapeのまま追加の移動・拡大縮小・回転を与えます。sRenderはその図形を2D Imageへ変換します。Shape系の共通設定のうちMotion BlurはsRenderに限って利用できると21.1 Manualに記載されています。

sRenderのMotion Blurは予測された動きと仮想シャッターに基づく描画です。Shutter Angleはシャッターの角度、Qualityはサンプリングに関する設定であり、役割が異なります。

図形の編集を先に終え、必要な地点で画像化する考え方は[Shapeの基本](../../learn/02-data/shape)と[画像化を後段へ延ばすパターン](../../patterns/data-domain/defer-domain-conversion)を参照してください。

## バリエーション

- 移動速度を変える：終了キーを12から24フレームへ移し、キー間を再び線形にして、同じShutter Angleで比較します。
- 回転する図形を使う：[星の自転・公転を分ける構成](./animate-star-spin-and-orbit-with-stransform)へ応用し、円とは異なる輪郭の動きを観察します。
- ブラーの中心位置を調整する：Center Biasはモーションブラーの中心位置を変える設定です。移動量とShutter Angleを固定して比較します。Sample Spreadはサンプルの重み付けに関わるため、明るさの変化も別に確認します。

## うまくいかないとき

- **円が表示されない**：Shapeの接続、sRenderのViewer表示、Solid、Alphaを確認します。
- **Motion Blurが見つからない**：sTransformではなくsRenderを選び、Settingsを確認します。
- **オンにしても差が分かりにくい**：移動が止まるキーの外側ではなく、途中フレームを使います。隣接フレームで円の位置が変化しているか確認し、Viewerの倍率をそろえます。
- **描画が重い**：まずQualityを下げ、必要な滑らかさとのバランスを確認します。Shutter Angleを小さくする比較も行いますが、特定の処理速度を保証するものではありません。
- **画像化した後の移動にブラーを加えたい**：この構成とは区別し、[画像をTransformで動かすレシピ](./add-motion-blur-to-moving-title)を参照します。

## 関連資料

- [sEllipseのNode Reference](../../nodes/shapes/s-ellipse)
- [sTransformのNode Reference](../../nodes/shapes/stransform)
- [sRenderのNode Reference](../../nodes/shapes/s-render)

## 出典と検証範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117「Shape Nodes」。

- pp.2739–2740：sEllipseのSolid、Width、Height、Offset、Color。
- pp.2759–2761：sRenderのShape入力、画像出力、解像度。
- pp.2766–2767：sTransformのShape入力、Offset、Size、追加の変形。
- pp.2768–2769：Shape系共通Settings、sRender専用Motion Blur、Quality、Shutter Angle、Center Bias、Sample Spread。

[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)と同版の提供済みPDF本文を2026年11月24日に照合しました。

各ノードの役割とMotion Blurの設定項目はManualで確認済みです。既存のsEllipse・sTransform・sRenderの実機記録は静止フレームでの確認を含みますが、今回の動きぼけの実証には使っていません。キーフレーム補間、サンプリング、Alphaの画素値、ブラー幅、処理時間、GPU・OS・Edition差は未実測です。このためverificationはpartialとします。
