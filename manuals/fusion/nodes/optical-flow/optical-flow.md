---
slug: /fusion/nodes/optical-flow/optical-flow
title: Optical Flow
description: 連続frameを解析してForward / Back Vectorを生成し、retime・motion blur・vector warpなどの後段処理へ渡すNode。
doc_type: node
term_id: optical-flow
term_short: "Optical Flowは、連続frameを解析してpixelごとの前後方向motion vectorを生成するNode。"
verification: partial
aliases: [Optical Flow, OF]
concepts: [image-data, auxiliary-channels, motion-vectors]
nodes: [Optical Flow]
node_family: optical-flow
controls: [Method, Warp Count, Iteration Count, Smoothness, Half Resolution, Output Vectors as Layers, Proxy, Edges, Match Weight, Mismatch Penalty, Filtering]
inputs: [image]
outputs: [image, vector]
tasks: [analyze-motion, motion-vectors, retime, motion-blur]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-22"
---

# Optical Flow

Optical Flowは、連続する2D <Term id="image">Image</Term>をframe間で比較し、各pixelが前後のframeへどの方向にどれだけ動いたかをmotion vectorとして求めるNodeです。

解析後のImageには、元のRGBAに加えてForward Vector / Back Vectorの補助channelが入り、Time Stretcher、Time Speed、Vector Motion Blur、Vector Warpなどがその動きを利用できます。

## 役割

通常のImageだけでは「このpixelが次のframeでどこへ移動したか」は分かりません。Optical Flowはframe間の見た目を比較し、その移動量をvector dataとして付加します。

```text
Image sequence → Optical Flow → Image + Forward / Back Vector
                                   ↓
              retime / blur / warp / smoothing
```

Optical Flow自体はslow motionやwarpの最終結果を作るNodeではなく、後段が使うmotion dataを用意する役割です。

## 入力

### Input

オレンジ色の入力へ、解析したい2D Image sequenceを接続します。

長いclip全体を解析すると計算量が増えるため、ManualではLoaderやMediaInを必要な範囲へtrimしてから解析する方法が案内されています。

## 出力

元のImageと、解析したForward Vector / Back Vectorを出力します。

vector channelはViewerでChannel > Vectorsを選び、Normalize Color Rangeを有効にすると確認できます。

21.1では **Output Vectors as Layers** を使い、motion vectorをmultilayer pipelineの独立layerとして渡すこともできます。

## ベクトルの時間方向と単位

- **Vector（前方）**：現在のframeから**次のframe**へ、各画素がどれだけ移動するかを表します。
- **BackVector（後方）**：現在のframeから**前のframe**への移動を表します。

これらは画像全体のカメラ移動を表す1本の値ではなく、画素ごとに異なるX・Yの移動量です。値は正規化座標ではなく**ピクセル単位**です。Proxy / AutoProxyで画像を縮小しても、補助チャンネルは**元のフル解像度を基準にした値**を保持します。縮小表示上の画素位置と比較するときは、表示解像度と元解像度の比率で換算してください。

最初のframeにアクセス可能な前frameがなければBackVectorが0、最後のframeに次frameがなければVectorが0になります。素材ファイル自体に隣接frameが存在していても、LoaderのGlobal Rangeなどでアクセスが制限されている場合は同じです。Time Speed / Time Stretcherは**隣接する1frame間のベクトル**を前提とするため、離れたframe同士の移動量をそのまま入れないでください。

出典：DaVinci Resolve 21.1 Reference Manual、Chapter 87 pp.1909–1910。


## Motion Vectorを使うNode

代表的な接続先は次のとおりです。

- Time Speed / Time Stretcher — Flow Interpolationでretimeする
- Smooth Motion — vectorやAOVを時間方向に平滑化する
- Vector Denoise — motion compensated averagingでnoiseを減らす
- Vector Transform — vector / UV channelを変形する
- Vector Warp — clipの動きに合わせて別Imageをwarpする
- Vector Motion Blur — pixelごとの動きに沿ってmotion blurを作る

DaVinci Resolve 21.1 Reference Manual（p.2618）は、Optical FlowをTime Speed / Time Stretcherへ直結すると**Optical Flowが2回レンダーされる**と記載しています。受け手が要求するレイヤー順は`A. FwdVec → B. BackVec`、Optical Flow側が処理時に生成する順は`A. BackVec → A. FwdVec`です。これはマニュアルにあるレイヤー配置の表記で、あらゆるOpenEXRの実チャンネル名を保証するものではありません。単に「解析が必ず2回」という説明へ置き換えず、実機でレンダー回数と解析コストを分けて確認します。

高解像度・長尺のshotでは、[Optical FlowをEXRに保存して再利用するレシピ](../../recipes/animation/optical-flow-exr-roundtrip.md)に従い、SaverでOpenEXR連番へ保存してLoaderから再読込する方法があります。保存できたことだけで解析負荷が消えたと判断せず、前後ベクトルの値とFlow補間の処理時間を別々に確認してください。

## 主な設定項目

### Method

Optical Flow、Repair Frame、Tweenでは解析方式を選べます。

- **Advanced** — GPUを使う現行のOptical Flow方式
- **Classic** — 旧CPU方式。古いCompとの互換や一部Stereo 3D処理向け

### Warp Count / Iteration Count

Advanced解析で、画像を合わせ込む反復量を調整します。

下げると計算を速くできますが、shotによって解析精度へ影響します。値を増やしても一定以上では改善量が小さくなるため、速度と結果を見ながら調整します。

### Smoothness

vector fieldをどの程度滑らかにするかを調整します。

高めるとnoiseへ強くなり、下げると細かな動きを残しやすくなります。

### Half Resolution

解析用Imageを縮小して計算を軽くします。最終出力解像度を半分にするための設定ではなく、motion解析の高速化用です。

### Output Vectors as Layers

Forward / Back Vectorをmultilayer Imageのlayerとして出力します。

Smooth Motion、Vector Denoise、Vector Transform、Vector Warp、Flow InterpolationのTime Speed / Time Stretcherなどへvector layerを渡す場合に使えます。

### Classic方式の調整：何が変わるか

Classicは旧CPU方式です。過去のCompとの互換性や一部のStereo 3D処理を理由に選ぶ場合を除き、Advancedと同じControlがすべてあると考えないでください。計算時間と結果を比較するときは、同じ短いフレーム区間で1項目ずつ変更します。

| Control | 変えるもの | 調整するときの確認点 |
| --- | --- | --- |
| **Proxy (for Tracking)** | 解析用画像を縮小してOptical Flowの計算量を減らす | マニュアルではProxy scale 2で約4倍、3で約9倍の計算高速化の目安を示します。縮小によって小さい模様や細い輪郭の追跡が崩れないか確認します。 |
| **Smoothness** | 推定された動きを滑らかにする度合い | 上げるとノイズへの耐性を高めやすく、下げると細かな動きを残しやすくなります。 |
| **Edges** | RGB画像の境界をOptical Flowの境界へどの程度反映するか | 低い値では境界を越えて動きが滑らかになり、高い値では色の境界へ沿いやすくなります。ただし高すぎるとRGBの細部を動きとして拾い、補間した輪郭が筋状に伸びる場合があります。 |
| **Match Weight** | 大きな色の構造と、小さく鋭い色の変化のどちらを対応付けるか | 低い値は大きな構造を、高い値は細かな変化を重視します。マニュアルの一般的な目安は**0.7〜0.9**ですが、露出差やフリッカーがあれば先に入力側も整えます。 |
| **Mismatch Penalty** | 似ていない領域を対応させた場合のペナルティ | **Quadratic**寄りは大きな不一致を強く罰しますが、小さなランダム変動が増える場合があります。**Linear**寄りは比較的滑らかな結果を得やすい傾向です。 |
| **Warp Count / Iteration Count** | 画像同士を合わせ込む反復回数 | 減らすと高速化しやすく、増やしても一定以上では精度の改善が小さくなります。画質と処理時間の両方で判断します。 |
| **Filtering** | Flow生成中のフィルタリング方式 | **Bilinear**は速度を優先するときの比較対象です。**Catmull-Rom**は高品質を狙えますが、計算時間が大幅に増えます。 |

例えば車が前景を横切る素材で、補間後の車体輪郭が背景に引っ張られる場合、まず**Edges**を変えて境界の推定を比較します。背景の細かい模様が動きとして拾われる場合は、**Match Weight**と**Mismatch Penalty**を一度に変えず、個別に比較してください。いずれも元映像に存在しない隠れた領域を復元するControlではありません。

これらは21.1マニュアル**pp.2620–2621**のClassic Controlsに基づく調整指針です。Proxyの倍率はマニュアル中の概算であり、実際の処理時間や最適値を保証するものではありません。

## 主な用途

- slow motionや可変retime用のmotion vectorを作る
- Vector Motion Blurへpixel単位の移動方向を渡す
- Vector Warpで衣服・肌・看板などの動きへ別素材を追従させる
- Smooth MotionやVector Denoiseの前段としてvectorを用意する
- 前後motion vectorをOpenEXRへ保存し、Loaderで値を検証して後続のretime処理へ再利用する（実際に再解析を回避できたかは別途確認する）

## 最小構成

```text
MediaIn → Optical Flow → Time Stretcher → MediaOut
```

vectorだけを確認したい場合はOptical FlowをViewerへ表示し、Vectors channelを確認します。

## 運用例

24fps素材から滑らかな中間frameを作ってslow motionへ使う場合:

1. 必要なclip範囲だけをMediaInで用意します。
2. Optical FlowでForward / Back Vectorを解析します。
3. Time StretcherまたはTime SpeedをFlow Interpolationで使います。
4. 動く輪郭で破綻が出る場合はvector表示を確認し、解析条件やSmooth Motionの使用を検討します。

長尺や高解像度で解析が重い場合は、Optical Flowの出力をSaverでOpenEXR sequenceへ書き出し、vector channelを保持したままLoaderから再利用できます。

## 挙動と注意点

- frameごとに明るさがちらつく素材はfeature matchingが不安定になりやすいため、Manualは事前のdeflickerを推奨しています。
- Optical Flowは解析処理なのでreal-time前提ではありません。解像度、clip長、設定によって処理時間が大きく変わります。
- motion vectorはRGBそのものではなく補助channelです。後段Nodeが要求するchannel名・layer構成を確認します。
- exactな内部REGID、全既定値、全数値範囲、Edition差は実機未確認です。

## 関連Node

- [Smooth Motion](./smooth-motion)
- [Tween](./tween)
- [Repair Frame](./repair-frame)
- [Vector Denoise](./vector-denoise)
- [Vector Motion Blur](../blur-filter/vector-motion-blur)
- [Optical FlowをEXRに保存して再利用する](../../recipes/animation/optical-flow-exr-roundtrip.md)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2617–2621およびFusion Fundamentals Chapter 87 pp.1901–1904で、Input、Vector / Back Vector、Viewer確認、Advanced / Classic、Warp Count、Iteration Count、Smoothness、Half Resolution、Output Vectors as Layers、Classic側のEdges / Match Weight / Mismatch Penalty / Filtering、EXR保存、主要な後段用途を確認しました。

ベクトルの時間方向・フレーム境界・Proxy時の単位は同ManualのChapter 87 pp.1909–1910、Time Speed / Time Stretcherへの直結時の二重レンダーとレイヤー順はChapter 112 p.2618で確認しました。EXR再読込後の自動割り当て・実際の解析回避は21.1実機で未確認です。

全Inspector既定値・数値範囲、実機性能、内部REGIDは未確認のため `verification: partial` としています。
