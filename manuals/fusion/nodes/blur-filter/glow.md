---
title: Glow
description: 光のにじみを作るFusionノード。3種類の入力、8種類のFilter、Apply Mode、Glow Maskの使い方と制作例を解説。
doc_type: node
term_id: glow
verification: partial
aliases: [Glow, Glo]
concepts: [image-data, mask-data, filtering, domain-of-definition]
nodes: [Glow]
node_family: blur-filter
controls: [Filter, Color Channels, Lock X/Y, Glow Size, Num Passes, Glow, Clipping Mode, Blend, Apply Mode, Color Scale]
inputs: [image, mask, mask]
outputs: [image]
tasks: [glow, bloom, light-effect]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-23"
---

# Glow

Glowは、入力された2D <Term id="image">Image</Term>をぼかして明るくし、その光の成分を元画像に重ねるNodeです。文字の周囲に広がる発光、ライトのにじみ、明るい反射の強調などに使います。元の輪郭を残したまま周囲へ光を広げられる点が、画像そのものをぼかす[Blur](./blur)との違いです。

Glow Sizeは「どこまで広がるか」、Glowは「どれだけ強く光るか」、Blendは「元画像と効果をどれだけ混ぜるか」を調整します。入力にないライトの形や反射を自動生成するNodeではありません。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| Input（オレンジ） | 2D Image | Glowを適用する画像。元画像も合成の基準になる |
| Effect Mask（青） | Mask | Glowを**計算した後**、効果の適用範囲を制限する |
| Glow Mask（白） | Mask | Glowを**計算する前**、発光元になる画素を制限する |
| Output | 2D Image | Glowを合成した画像。後続の2D NodeやMergeに渡す |

Glow Maskはpre-maskです。例えばランプの発光部分だけを囲むEllipseを白い端子へ接続すると、ランプの外側に広がる光はマスク境界を越えられます。発光元を選んだ後で、その画素をぼかすためです。

同じEllipseを青いEffect Maskへつなぐと、処理済みの結果がマスクで制限され、周囲に広がった光も境界で切れます。**光源を選ぶならGlow Mask、最終的に効果を見せる範囲を限定するならEffect Mask**が基本です。[マスクの基礎](../../learn/02-data/mask)も参照してください。

```text
MediaIn（ランプを含む映像） → Glow → MediaOut
                            ↑ 白：Glow Mask
                         Ellipse（光源の部分）
```

## Inspector：発光の形を決める

### Filter：どのようにぼかすか

Filterは8種類です。単純な「品質順」ではなく、光の広がり方や負荷の異なる方式を選びます。

| Filter | 動作と使い分け |
| --- | --- |
| Box | 単純で速いぼかし。広がりを試すときに使いやすい |
| Bartlett | より滑らかに減衰するGlow。大きなSizeではBoxより重くなり得る |
| Multi-box | Boxを複数回重ねてGaussianに近い分布を作る。Gaussianより速い場合があり、マニュアルではringingを生じない方式として説明される |
| Gaussian | Gaussian方式で柔らかく広げる |
| Fast Gaussian | Gaussian方式の高速版。**21.1マニュアル上の既定Filter** |
| Blend | 白い部分と黒い部分の双方に現れる非線形のGlow |
| Hilight | 周囲の画素にhaloを作らずハイライト効果を加える |
| Solarize | Glowとともにsolarize効果を加える |

**Filterの「Blend」とBlendスライダーは別の設定**です。前者は発光の処理方式、後者は元画像との混合率を選びます。Hilightも、光源の周囲に広いhaloを作る通常の発光とは異なります。

### Color Channels（RGBA）

R・G・B・Aのうち、Glowの処理対象にするチャンネルを選びます。この選択はGlowの**演算前**に適用され、外したチャンネルは演算されません。Common ControlsにあるRGBAの選択は演算**後**に反映されるため、同じ動作ではありません。

透明背景の文字やロゴで輪郭が不自然なときは、RGBだけでなくAチャンネルの扱いと元画像のAlphaも確認します。適切な設定は入力素材のチャンネル構成によります。

### Lock X/Y・Glow Size・Num Passes

**Lock X/Y**を有効にすると、水平方向と垂直方向のGlow Sizeを連動させます。解除すれば横と縦で異なる広がりを設定できます。横長の光を強調したい場合などに比較します。

**Glow Size**は光の広がりを決めます。大きくすればhaloは広くなりますが、光そのものを強くする設定ではありません。

**Num Passes**はFilterが**Multi-boxのときだけ**使います。増やすと分布を滑らかにできますが、レンダリング時間も増えます。21.1マニュアルは4 Pass程度を例示しますが、固定の推奨値ではありません。

### Glow・Blend：強さと混合率

**Glow**は発光の強さです。上げすぎると画像が白く飛ぶことがあります。広い発光が欲しいときでもGlowだけを上げず、Glow Sizeで広がりを作ってから強さを決めます。

**Blend**は処理後の画像と元画像の混合率です。0に近づけるほど元画像の割合が増えます。Common ControlsのBlendと連動しており、一方を変えるともう一方にも反映されます。

例えばネオン文字なら、Glow Sizeを広げて周囲への光を作り、Glowで明るさを合わせ、Blendで元の文字の輪郭が読める程度に戻します。

## Apply Mode：光をどう重ねるか

Glowには3種類のApply Modeがあります。

| Apply Mode | 処理の意味 | 選ぶ場面 |
| --- | --- | --- |
| Normal | Glowを元画像の上に加える既定方式 | 通常の発光やライトのにじみ |
| Merge Under | **Alphaを基準に**Glowを元画像の下へ置く | 透明な文字・図形で本体と周囲のhaloの重なりを比較 |
| Threshold | Glowの値をLow / Highの範囲でclipする | 弱いGlowを切り、強い部分を明確にする |

**Thresholdを選ぶとHigh–Low Range Controlが表示されます。** マニュアルではGlowが適用された領域の値について、Low未満を黒、High超を白へ押し込むと説明しています。これは「入力画像の明るい画素だけを事前に発光元として抽出するThreshold」と同じ意味ではありません。[Soft Glow](./soft-glow)のThresholdと、名前だけで動作を同一視しないでください。

透明な文字を使うときはNormalとMerge Underを切り替え、文字の塗りと外側のhaloがどう重なるかをViewerで比較します。不透明な映像では、Alphaを基準とするMerge Underの見え方は透明素材と異なります。

## Color Scale（RGBA）：光の色

Color ScaleはR・G・B・Aそれぞれの**Glow成分**の量を変え、発光を色付けする設定です。元画像全体を別の色に置き換えるものではありません。

例えば白い文字に青みのある光を足すなら、発光成分のR/G/Bバランスを調整します。Pickボタンを押したままViewerへドラッグすると、画像から色を取得できます。色が予想と違うときは、Color Scaleだけでなく元画像のRGB値とGlowの処理チャンネルも確認します。

## Clipping Mode：画面端で発光が切れるとき

Glowは周辺画素を参照するため、入力の**DoD（Domain of Definition：画像データが存在する有効領域）**が発光の端に影響します。特に透明なText+、小さい画像、大きなGlow Sizeでは確認が必要です。

| Clipping Mode | 21.1マニュアルの動作 |
| --- | --- |
| Frame | 既定値。入力のDoDにかかわらずフレーム全体を使用し、元DoDの外は黒／透明として扱う |
| Domain | 入力のDoDを尊重する。大きなFilterでは境界が切れる場合がある |
| None | 元画像のsource clippingを行わない。必要なDoD外のデータは黒／透明として扱う |

FrameとNoneを「どちらも無制限」と捉えないでください。端の光が不自然なら、Glow Sizeと入力画像の有効領域を確認し、そのうえでClipping Modeを切り替えて比較します。[DoDの基礎](../../learn/03-space/domain-of-definition)と[境界の確認手順](../../learn/07-debugging/resolution-domain-of-definition)を参照してください。

## 制作例

### 1. Text+のネオン文字を実写に重ねる

Text+で明るい文字を作り、Glowへ接続します。Glowの出力をMergeのForegroundへ、実写MediaInをMergeのBackgroundへつなぎます。

```text
Text+ → Glow ─────────────→ Merge（Foreground）→ MediaOut
実写 MediaIn ─────────────→ Merge（Background）
```

Fast Gaussianを起点にGlow Sizeを上げ、文字の外側へ光が広がることを確認します。次にGlowとBlendを調整し、文字が読みにくくならない程度にします。透明なText+ならNormalとMerge Underを比較します。色はColor Scaleで調整します。

明るい芯と広いhaloの両方が欲しければGlowを2段使う方法もあります。前段は小さいSize・控えめな強さ、後段は広いSize・弱い強さにし、各段を単独表示しながら調整します。

### 2. ランプからの光だけを周囲へ広げる

実写のランプと背景を含むMediaInをGlowのInputへつなぎます。Ellipseでランプの光源部分を囲み、**白いGlow Mask**へ接続します。

するとランプ付近の画素が発光元となり、周囲の壁や暗部へhaloを伸ばせます。青いEffect Maskへ同じEllipseをつなぐと光が境界で切れます。Glow Sizeで範囲を決め、GlowとBlendで周囲の明るさに合わせます。

Glowは**ランプの既存画素をにじませる**処理です。壁への照明方向や影まで物理的に計算するものではありません。

### 3. 透明なロゴを外側だけ光らせる

Alphaのあるロゴ画像をGlowへ入力し、出力をMergeで背景と合成します。Apply ModeをNormalからMerge Underへ切り替え、ロゴ本体と下側の発光の重なり方を比較します。

境界が暗くなったり色が変わる場合は、入力Alpha、Color ChannelsのA、Apply Mode、Blendを一つずつ確認します。発光がロゴ画像の端で切れるなら、Clipping ModeとDoDを確認します。最初はGlowを控えめにし、原寸表示で輪郭を確認すると原因を切り分けやすくなります。

## トラブルシューティング

| 症状 | 確認する設定 |
| --- | --- |
| ほとんど光らない | 元画像の明るさ、Glow、Blend、Glow Mask |
| 全体が白くなる | Glowを下げ、Blendで元画像を戻す |
| 光がMask境界で切れる | Glow MaskとEffect Maskの接続先、DoD |
| 光が画像端で切れる | Clipping Mode、入力DoD、Glow Size |
| 透明部分の色や輪郭が不自然 | RGBA、Color Scale、元画像のAlpha、Apply Mode |
| 横方向だけ広げられない | Lock X/Yを解除する |
| Multi-boxの処理が重い | Num PassesとGlow Sizeを下げる |
| Thresholdで発光元を選べない | GlowのApply Mode Thresholdは合成側のclip設定。光源選択にはGlow Maskを使う |

## Glow・Soft Glow・Blurの使い分け

[Glow](./glow)はFilterやApply Modeを使い、明確なhaloやグラフィックな発光を組み立てる場合に向きます。[Soft Glow](./soft-glow)は追加処理による柔らかく自然な発光が必要な場合に向き、ThresholdとGainで発光元と強さを調整します。[Blur](./blur)は元画像をぼかすNodeで、Glowのように光の成分を元画像へ重ねる目的ではありません。[Blur / Filterノード一覧](./index.md)も参照してください。

## 実機で文字に光を足す

DaVinci Resolve Studio 21.1.0.14、Windows、日本語UIで撮影しました。文字の輪郭を残すため、ここではApply ModeをMerge Under（日本語UIでは「下にマージ」）にします。

[![Text1からGlow1、MediaOut1へ接続した実機Node Editor](/img/fusion/captures/S03/graph.png)](/img/fusion/captures/S03/graph.png)

1. Text+に `GLOW` と入力し、Arial Bold、Size 0.17にします。
2. GlowのFilterをFast Gaussian、Lock X/Yを有効、Glow Sizeを30、Glowを0.3にします。
3. Apply Modeを「下にマージ」、Blendを1にします。

[![Glow Inspector。Glow Sizeは30、Glowは0.3、Blendは1、適用モードは下にマージ](/img/fusion/captures/S03/inspector.png)](/img/fusion/captures/S03/inspector.png)

[![左右の実機Viewer比較。左はText1の元文字、右はMediaOut1に出したGlow後の文字。両方ともフレーム0、倍率40%](/img/fusion/captures/S03/compare.png)](/img/fusion/captures/S03/compare.png)

左右は同じ1920×1080の文字、フレーム0、倍率40%です。右では輪郭の外へhaloが広がっています。市松模様は透明部分で、背景色を合成した画像ではありません。まずこの値で再現し、Sizeだけを変えて広がりを、Glowだけを変えて強さを比べられます。

この撮影ではGlow MaskとEffect Maskの比較、全Filter・Apply Modeの挙動は確認していません。PNGレンダーはViewerと一致する結果として採用できなかったため、掲載画像は実機Viewerの無加工の切り出しです。

[再現用Graph](/img/fusion/captures/S03/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S03/capture.json)

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）Chapter 92「Blur Nodes」pp.2116–2119に基づき、3入力、8種類のFilter、RGBAの演算順、Glow Size・Glow・Num Passes、Apply Mode・Color Scale・Clipping Mode・Blendを確認しました。

上記のText+とGlowの条件では、同一フレーム・同一倍率の実機Viewer結果を確認しました。他の制作例はマニュアルに記載された入出力と処理内容から構成したものです。全Filter・Apply Mode・Mask、各値の範囲・初期値、Edition差、GPUごとの性能、測色を伴うPNG出力は未確認のため `verification: partial` を維持しています。
