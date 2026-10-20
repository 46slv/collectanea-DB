---
title: Smooth Motion
description: Optical Flowの前後Motion Vectorを使い、選択したAOVを時間方向に平滑化するNode。
doc_type: node
term_id: smooth-motion
term_short: "Smooth Motionは、前後のmotion vectorで対応位置を追い、画像channelを時間方向に平滑化するNode。"
verification: partial
aliases: [Smooth Motion, SM]
concepts: [image-data, auxiliary-channels, motion-vectors]
nodes: [Smooth Motion]
node_family: optical-flow
controls: [Channel]
inputs: [image, vector]
outputs: [image, vector]
tasks: [smooth-motion, smooth-aov, stereo, motion-vectors]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-20"
---

# Smooth Motion

Smooth Motionは、**前後フレームの動きに沿って、指定した画像チャンネルの値を時間方向に平滑化する**FusionのNodeです。Disparity（ステレオ画像の左右で対応する点がずれる量）、Vector（画素の移動量）、Normal（面の向き）、Z（奥行き）などを扱います。RGBAとは別の値を持つ[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels.md)の説明も参照してください。

これは画面全体を固定するカメラスタビライズとは異なります。各フレームで同じ被写体がどこへ動いたかをMotion Vectorで追い、選択したチャンネルのちらつきを抑える処理です。

## 入力・出力

**物理的な入力端子はオレンジ色のImageが1つ**です。入力には2D画像の連番と、あらかじめ計算済みの**Vector（次フレーム方向）/ Back Vector（前フレーム方向）**が必要です。ベクトル専用の別入力端子はなく、これらはRGBAと一緒にImageへ付随する補助チャンネルです。

- **入力**：画像と、両方向のVector / Back Vector。通常は[Optical Flow](./optical-flow)の出力、またはベクトルを保存したOpenEXR連番を接続します。
- **出力**：Controlsで選んだチャンネルを時間方向に平滑化した2D画像。後段で必要とする補助チャンネルが残っているかは別途確認します。

~~~text
MediaIn ── Optical Flow ── Smooth Motion ── Viewer / 後段Node
              │                 │
       Vector / Back Vector   選択したchannelを平滑化
~~~

Vector / Back Vector自体が入力にない場合、Smooth Motionは**Consoleにエラーメッセージを表示します**。一方、選択したAOVが元画像に存在しないだけなら、そのチャンネルを処理せず、**エラーや警告は表示しません**。この違いはトラブルシューティングで重要です。

## Controls：Channel

Controlsタブの**Channel**で平滑化するチャンネルを選びます。マニュアルにはDisparity、Vector / Back Vector、Normal、Zなどの利用例があります。必要なデータが入力にあるか、Viewerのチャンネル表示やEXRのLoader設定も含めて確認してください。

Vector / Back Vector自体を平滑化することもできます。ただし、複数の物体が違う方向へ動く、物体が激しく跳ねる、細かく振動するといったショットでは、ベクトルを滑らかにした結果、後段の補間が**かえって悪くなる**場合があります。ベクトルの平滑化を常に有効にするのではなく、前後で比較します。

## 運用例1：ステレオ映像のDisparityのちらつきを減らす

人物が横切るステレオ映像で、Disparity（左右の像における位置差）が輪郭付近でフレームごとに揺れる場合を考えます。

1. Disparityを含む画像連番を用意します。RGB画像だけでは、Disparityを選択しても処理対象がありません。
2. Optical FlowでVector / Back Vectorを用意し、Smooth Motionへ渡します。すでにベクトルを持つEXRを読み込む場合は、再度Optical Flowで解析することは必須ではありません。
3. Smooth MotionのChannelでDisparityを選び、人物の輪郭や前景・背景の境界を数フレーム続けて見ます。
4. ちらつきが減ったかだけでなく、動く被写体の輪郭が不自然になっていないか、処理前と比較します。

ここで整えたいのは**表示されている色ではなく、後続のステレオ処理が参照するDisparityの時間変化**です。

## 運用例2：ベクトルを先に平滑化する

21.1マニュアルは、Smooth Motionを2個直列に接続する構成も紹介しています。

~~~text
画像 + Vector / Back Vector
  └─ Smooth Motion ①（Vector / Back Vectorを選択）
       └─ Smooth Motion ②（Disparityを選択）
            └─ 後段のステレオ処理
~~~

1つ目でMotion Vectorの時間変化を整え、2つ目でそのベクトルを使ってDisparityを平滑化します。**元のベクトルから直接Disparityを平滑化する構成**も試し、違いを比較してください。動きが急変するショットでは、ベクトルの前処理が逆効果になる可能性があります。

### 直列にしたときの参照フレーム数

マニュアルでは、Smooth Motionが1個なら**前・現在・次の3フレーム**、2個直列なら**5フレーム**、3個直列なら**7フレーム**を参照する例が示されています。単に1個の処理の強度が増えるのではなく、時間方向の参照範囲が広がります。素材の先頭・末尾や、急な動きの変化がある箇所では結果を確認します。

## Vector Denoiseとの違い

Smooth Motionは選択したAOVなどの**チャンネル値そのもの**を時間方向に平滑化します。[Vector Denoise](./vector-denoise)はMotion Vectorで動く被写体の位置を対応させ、**周辺フレームの画像ピクセルを平均してノイズを減らす**Nodeです。Disparityのちらつきを減らす用途と、低照度映像の粒状ノイズを抑える用途は区別します。

## 確認・トラブルシューティング

| 症状 | 確認すること |
| --- | --- |
| Consoleにベクトル関連のエラーが出る | VectorとBack Vectorが**両方**入力にあるか。Optical Flow / Loaderの出力を確認する |
| エラーはないのにDisparityが変わらない | Disparityが入力に存在するか、Channelで選択したか |
| 動く輪郭が不自然になる | Vectorを平滑化した場合と、元のVectorを使った場合を比較する |
| EXRから読み直すと働かない | [EXR再利用レシピ](../../recipes/animation/optical-flow-exr-roundtrip.md)に沿って両方向のベクトルの保存・割り当てを確認する |

## 関連Node・出典

- [Optical Flow](./optical-flow.md) — 前後Motion Vectorを作成する。
- [Vector Denoise](./vector-denoise) — 動きに沿って画像ピクセルを時間平均する。
- [Time Speed](../time-metadata/time-speed) — ベクトルを用いたFlow補間で速度を変える。

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、**Chapter 112 pp.2624–2626**。Image入力端子数、事前計算済みVector / Back Vectorの要件、Consoleの動作、Channel、直列使用時の3 / 5 / 7フレーム例、ベクトル平滑化の注意点を確認しました。

[Blackmagic Design公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)から一次資料を参照できます。

21.1実機での全Channel表示名、既定値・数値範囲、性能、内部REGIDは未確認です。そのため`verification: partial`としています。