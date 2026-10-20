---
title: Vector Denoise
description: Forward / Back Vectorでframe間の対応位置を合わせながら複数frameを平均し、時間方向のnoiseを減らすNode。
doc_type: node
term_id: vector-denoise
term_short: "Vector Denoiseは、motion vectorでframe間を合わせながら複数frameを平均するNode。"
verification: partial
aliases: [Vector Denoise, VDn]
concepts: [image-data, auxiliary-channels, motion-vectors]
nodes: [Vector Denoise]
node_family: optical-flow
controls: [Average, Threshold]
inputs: [image]
outputs: [image]
tasks: [analyze-motion]
product_scope: fusion-studio
suite_surfaces: [fusion]
updated: "2026-10-20"
---

# Vector Denoise

Vector Denoiseは、**動いている被写体の位置をフレーム間で合わせながら、複数フレームの画素を平均してノイズを減らす**Fusionのノードです。カメラや被写体が動いていても、同じ画面座標をそのまま平均するのではなく、Motion Vectorで対応する位置を探してから平均します。

ただし、動きの推定が正しくない場所では輪郭が二重に見えるなどの問題が起こり得ます。Optical Flowが作る動きの情報と、Vector Denoiseが行う画素の平均は別の処理です。

## 入力・出力

**物理的な入力端子は、オレンジ色のImageが1つ**です。入力する2D画像には、通常のRGBAだけでなく、事前計算された**Vector（次フレームへの移動）とBack Vector（前フレームへの移動）**が必要です。これらは独立した接続端子ではなく、画像に付随する[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels.md)です。

- **入力**：RGBA画像にVector / Back Vectorを持たせた連続フレーム。通常は[Optical Flow](./optical-flow.md)の出力、またはベクトルを保持したOpenEXR連番を使います。
- **出力**：動きに合わせて周辺フレームの画素値を平均した2D画像。

入力にベクトルがない場合は、単に画像だけをつないでもマニュアル記載の動き補償付き平均の前提を満たしません。出力に元の補助チャンネルがそのまま残るかは21.1マニュアルでは確認できないため、後段でベクトルを使う場合は別途検査してください。

## 処理の考え方

例えば人物が右へ歩いている動画で、現在フレームの顔が画面中央、次フレームでは少し右に移動しているとします。画面中央の同じ座標だけを平均すると、次フレームでは顔ではなく背景の画素が混ざる場合があります。

Vector Denoiseは前後のMotion Vectorで**同じ被写体に対応する画素**を参照し、その画素値を平均します。結果として、動きのあるショットでも時間方向のノイズ低減を試せます。逆に、遮蔽の境界や急な動きでベクトルが外れた場合には、平均範囲を広げるだけでは改善しません。

## Inspectorの主な設定

### Average

時間方向に平均する範囲を**フレーム数**で指定します。参照範囲を広くすると複数フレームの値が結果に関与します。ノイズの減り方と動く輪郭の見え方を同時に比較してください。既定値や設定可能な数値範囲は実機未確認です。

### Threshold

短いフラッシュや一瞬だけ強く光るハイライトなどを、平均へ含めないための上限しきい値です。明るさが急変するカットで、必要な光まで均されていないか比較します。具体的な数値の推奨値は、21.1マニュアルからは確定できません。

## 運用例：歩く人物を含む低照度ショット

~~~text
MediaIn ── Optical Flow ── Vector Denoise ── MediaOut
              │                  │
       前後の動きを計算     対応する画素を平均
~~~

1. ノイズが目立つ連続フレームをMediaInから読み込み、Optical FlowでVectorとBack Vectorを求めます。静止画1枚だけでは前後フレームを使う処理を評価できません。
2. Optical Flowの出力をVector Denoiseの**Image入力**につなぎます。ベクトル用の別ポートに接続する操作は必要ありません。
3. Averageを小さな時間範囲から調整し、止まっている背景と歩く人物の輪郭を、処理前後の同じフレームで比較します。
4. 撮影中のフラッシュや瞬間的な強い反射が平均で不自然に残る場合は、Thresholdを調整して比較します。
5. 顔や手の輪郭が重なるように見える場合は、Averageを大きくする前にOptical Flowの動き推定と前後フレームを確認します。

これは動く人物を必ずきれいにノイズ除去できるという意味ではありません。被写体が別の物体に隠れる場面などでは、対応位置を正しく推定できるかが結果に影響します。

## 解析済みOpenEXRを使う

すでにベクトル付きOpenEXR連番を保存している場合は、次の構成にできます。

~~~text
Loader（RGBA + Vector / Back Vectorを含むEXR連番）
  └─ Vector Denoise ── MediaOut
~~~

LoaderのFormat設定で**前方向・後方向の両方のベクトル**が読み込まれているか確認します。RGBが正常に表示されるだけでは補助チャンネルの存在は証明できません。確認手順は[Optical FlowのEXR保存・再利用レシピ](../../recipes/animation/optical-flow-exr-roundtrip.md)を参照してください。

この構成では、EXRに必要なベクトルが保持されていればOptical Flowを再接続する必要はありません。ただし、EXR保存時のチャンネル対応と、実際に再計算が省かれているかは分けて検証します。

## Smooth Motionとの違い

[**Smooth Motion**](./smooth-motion.md)は、DisparityやVectorなど**選択した補助チャンネルの値**を時間方向に平滑化します。一方、**Vector Denoiseはベクトルを位置合わせに利用し、画像の画素値を平均**します。ベクトル自体の揺れを整えたい場合と、画像のノイズを減らしたい場合で選ぶノードが異なります。

## 対応範囲と出典

DaVinci Resolve 21.1 Reference Manual（2026年9月）**Chapter 112 pp.2629–2630**に、Vector DenoiseのImage入力1つ、Vector / Back Vector要件、EXR入力、動き補償付きの時間平均、**Average**と**Threshold**が記載されています。p.2629ではこのノードを**Vector Warping Toolset (Studio Version Only)**に含めています。

[Blackmagic Design公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

全パラメータの既定値・数値範囲、出力側の補助チャンネル保持、実機性能、内部REGIDは未確認です。そのため`verification: partial`を維持します。