---
title: Soft Glow
description: 明るい画素から柔らかな光のにじみを作るNode。入力Maskの違い、Inspector設定、制作例を解説。
doc_type: node
term_id: soft-glow
verification: partial
aliases: [Soft Glow, SGlo]
concepts: [image-data, mask-data, filtering, domain-of-definition]
nodes: [Soft Glow]
node_family: blur-filter
controls: [Filter, Color Channels, Threshold, Gain, Lock X/Y, Glow Size, Num Passes, Clipping Mode, Blend, Color Scale]
inputs: [image, mask, mask]
outputs: [image]
tasks: [soft-glow, haze, beauty, dream-look]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Soft Glow

Soft Glowは、2D <Term id="image">Image</Term>の明るい部分から光のにじみを作り、元画像へ合成するNodeです。[Glow](./glow)に似ていますが、より滑らかで自然な発光を作るための追加処理を備えます。肌のハイライト、惑星の縁、夢のような柔らかい映像などに向きます。

画像全体を一律にぼかすのではなく、Thresholdで発光元を選び、Glow Sizeで広がり、Gainで強さを調整します。暗い画素に存在しない光源を自動生成するものではありません。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| Input（オレンジ） | 2D Image | 発光を加える入力画像 |
| Effect Mask（青） | Mask | **発光処理後**の結果を適用する範囲 |
| Glow Mask（白） | Mask | **発光処理前**に光の発生元を限定する範囲 |
| Output | 2D Image | 発光済み画像。次のNodeやMergeへ渡す |

例えば、人物の明るい部分から背景へ光を広げる場合はGlow Maskです。発光元だけを限定するため、にじみはマスクの外まで広がります。Effect Maskは最終的な結果を切り取るため、マスクの境界でにじみも切れます。同じ青いMaskと白いMaskの接続先を取り違えないでください。基本概念は[マスク（Mask）](../../learn/02-data/mask)を参照します。

## Threshold：どの明るさから発光させるか

Thresholdを上げるほど明るい画素だけが発光します。中間調や暗部まで白っぽくなったら値を上げます。発光が見えない場合は下げて、元画像に明るい画素があるかも確認します。

## Gain：光の明るさ

Gainは発光の明るさです。Thresholdが「どこから作るか」、Gainが「どれほど強くするか」を担当します。広いが弱い発光ならGlow Sizeを大きく、Gainを控えめにします。

## Glow Size

haloの広がりです。

Lock X/Yを外すとhorizontal / verticalで別sizeにできます。

## Filter / Num Passesと処理チャンネル

| Filter | 見た目と負荷の特徴 |
| --- | --- |
| Box | 単純で高速なぼかし |
| Bartlett | より滑らかな減衰。Boxより処理が長い場合がある |
| Multi-box | Boxを複数Pass重ね、Gaussianに近い分布を作る |
| Gaussian | 滑らかな発光。21.1マニュアル上の既定方式 |

**Num PassesはMulti-boxのときだけ**使用します。増やすと光の分布は滑らかになりますが、レンダリング時間も増えます。マニュアルは4 Pass程度を例示します。固定の最適値ではなく、素材に応じて比較します。

**Color Channels（RGBA）**ではR/G/B/Aのどれを処理するか選びます。この選択は演算**前**に適用され、外したチャンネルは処理されません。Common ControlsのRGBAは演算**後**の選択なので、同一視しないでください。

## Color Scale（RGBA）とBlend

Color Scaleは発光成分のR/G/B/Aごとの量を調整し、光を色付けする設定です。元画像全体を色補正するものではありません。21.1マニュアルではPickボタンでViewerの色を選択できると説明されています。

Blendは処理後の画像と元画像を混ぜます。**0に近いほど元画像が多く戻ります**。Glow Sizeで光の広がりを決め、Blendで効果の混合率を下げれば、広がりを保ちながら弱い発光にできます。

## Clipping ModeとDoD

ぼかしは周辺画素を参照します。入力のDoD（Domain of Definition、画像データの有効な領域）が小さいと、にじみが端で切れる場合があります。

- **Frame**：フレーム全体をDoDとする既定動作。元DoD外は黒／透明として扱います。
- **Domain**：入力DoDを尊重します。大きなFilterでは境界が切れる場合があります。
- **None**：元画像のクリッピングを行いません。必要なDoD外の画素は黒／透明として扱います。

[DoDの基礎](../../learn/03-space/domain-of-definition)と[Resolution / DoDの確認](../../learn/07-debugging/resolution-domain-of-definition)も参照してください。

## 制作例

### 1. 肌のハイライトだけを柔らかくする

人物のMediaInをSoft Glowへ接続し、その出力を次のNodeへ渡します。Thresholdを上げ、頬や額の明るい部分だけが発光元になるよう調整します。背景の照明を含めたくなければ、顔付近のEllipseをGlow Maskへつなぎます。Glow Sizeで広がり、Gainで強さを決めた後、Blendで元の質感を戻します。

**Glow Maskは発生元を限定するため、にじみが顔の外へ伸びられます。** Effect Maskへつなぐと境界で発光が切れる点に注意してください。

### 2. 惑星の明るい縁を宇宙側へにじませる

入力には、すでに明るいリムライト（細い輪郭の明部）を含む惑星画像を使います。Thresholdで明部を選び、背景の星など不要な発光元がある場合はGlow Maskで限定します。Glow Sizeを広めに、Gainを控えめにすると暗い背景へ自然に光を伸ばせます。端で切れるならDoDとClipping Modeを比較します。元画像に明るい輪郭がなければ、このNodeだけでリムライトは生まれません。

### 3. Text+の文字を実写背景へ発光合成する

Text+の明るい文字をSoft Glowへ入力し、OutputをMergeのForegroundへ接続します。実写MediaInはMergeのBackgroundへ接続します。Glow Sizeだけを増やすと文字が読みにくくなるため、GainとBlendを別々に調整します。透明端がおかしい場合はColor ChannelsのAとDoDも確認します。

## トラブルシューティング

| 症状 | 確認すること |
| --- | --- |
| 発光が出ない | 入力の明部、Threshold、Gain、Blend、Mask |
| 全体が白っぽい | Thresholdを上げ、Gain・Blendを下げる |
| マスク境界で光が切れる | Glow MaskとEffect Maskの接続先 |
| 端の発光が切れる | 入力DoD、Clipping Mode、Glow Size |
| 色や透明領域が不自然 | Color Scale、処理するRGBA、入力Alpha |
| Multi-boxが重い | Num PassesとGlow Sizeを下げて比較 |

## Glow・Blurとの使い分け

[Glow](./glow)は明確なhaloやApply Modeの使い分けに向きます。Soft GlowはThresholdで選んだ明部から自然で滑らかなにじみを作る目的に向きます。[Blur](./blur)は発光を合成するのではなく、元画像自体をぼかします。[Blur / Filterノード一覧](./index)も参照してください。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）Chapter 92「Blur Nodes」pp.2121–2124を確認しました。入力3種類、Filter、Color Channels、Threshold、Gain、Lock X/Y、Glow Size、Num Passes、Clipping Mode、Blend、Color Scaleの名前と基本動作は一次資料に基づきます。

肌・惑星・文字の制作例は確認した仕様から構成した手順であり、同一素材を使った21.1実機レンダリング検証ではありません。内部REGID、数値範囲、Edition差、GPU性能は未確認のため `verification: partial` のままです。
