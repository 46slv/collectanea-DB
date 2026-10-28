---
title: Vari Blur
description: 別の画像をぼかし量のマップとして使い、位置ごとに異なるぼかしを作るFusionノード。3つの入力、Method・Quality・Blur Size・Blur Limitと制作例を説明する。
doc_type: node
term_id: variblur
verification: partial
aliases: [Vari Blur, VBL]
concepts: [image-data, filtering, mask-data]
nodes: [Vari Blur]
node_family: blur-filter
controls: [Method, Quality, Blur Channel, Lock X/Y, Blur Size, Blur Limit]
inputs: [image, image, mask]
outputs: [image]
tasks: [variable-blur, map-driven-blur, depth-like-blur]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Vari Blur

Vari Blurは、映像や画像の**場所ごとにぼかし量を変える**ノードです。通常の[Blur](./blur)では画面全体へ同じ設定のぼかしを掛けますが、Vari Blurではもう1枚の画像を参照して、どの位置をどれだけぼかすかを決めます。

ぼかしを指示する画像を**ブラー用マップ（Blur Image）**と呼びます。たとえば左から右へ明るくなるグラデーションを接続し、選択したチャンネルの値を使えば、画面の一方から他方へぼかし量を変える素材を作れます。これはカメラの正確なピント計算をする仕組みではなく、画像の値でぼかしを制御する方法です。

## 入力と出力

| 接続 | 必須 | 接続するものと役割 |
| --- | --- | --- |
| **Input（金色）** | 必須 | ぼかしたい2D Image。MediaInやLoader、合成済みの画像など。 |
| **Blur Image（緑）** | 必須 | 各位置のぼかし量を指示する2D画像。Backgroundのグラデーション、テキスト、静止画、動画などを利用できます。 |
| **Effect Mask（青）** | 任意 | Vari Blurの結果を最終的に適用する範囲を指定するMask。 |
| **Output** | — | 位置ごとに異なるぼかしを適用した2D Image。後段のMergeや画像処理ノードへ渡せます。 |

最小構成は次のとおりです。

```text
MediaIn ──────────────────→ Vari Blur ──→ MediaOut
Background（グラデーション）──→ Blur Image（緑）
```

**Blur ImageとEffect Maskは役割が異なります。** Blur Imageは画像内の各位置のぼかし量を決めます。Effect Maskは、計算済みの効果をどの範囲へ適用するかを制限します。21.1マニュアルによると、Effect MaskはVari Blurの処理**後**に適用されます。

たとえば「人物の後ろだけ場所によってぼかす」なら、背景の明暗マップをBlur Imageへ、人物を除外するためのマスクをEffect Maskへ接続します。マスクについては[Maskの基礎](../../learn/02-data/mask)を参照してください。

## Inspectorの主な設定

### Blur Channel

Blur Imageの**どのチャンネルをぼかし量の指示に使うか**を選びます。DaVinci Resolve 21.1マニュアルではRed、Green、Blue、Alpha、Luminanceを確認できます。

- グレースケールのグラデーションなら、Luminanceを基準にするとマップの明暗を確認しやすくなります。
- 透明な背景に文字が載った画像では、Alphaを選ぶと文字の不透明度をマップにできます。
- RGBの各チャンネルに異なる情報が入った素材なら、意図した情報を持つチャンネルを選びます。

Blur Channelは**入力映像の色を処理するチャンネル指定ではありません**。参照するのはBlur Image側のデータです。マップのRGBが同じでもAlphaが異なる素材では、選択を変えると結果も変わり得ます。

### Method

ぼかしの計算方法を選択します。

| Method | 21.1マニュアルに記載された特徴 | 向いている確認 |
| --- | --- | --- |
| **Soften** | Qualityを上げるとBox状からBartlett（三角形の重み付け）、滑らかなぼかしへ変化。ぼかしの弱い部分のディテールはMulti-boxよりやや保ちやすい。 | 元の質感を残したいグラデーションぼかし。 |
| **Multi-box** | Qualityが高いとGaussianにより近いぼかしになる。 | 均一で滑らかな広がりを求める場合。 |
| **Defocus** | ぼけた点を円盤状に広げ、ピント外れに似た見た目を作る。 | 光点の形を含め、ピント外れ風に見せたい場合。 |

Defocusはここで選べるMethod名で、別ノードの[Defocus](./defocus)と同じ全機能を持つという意味ではありません。

### Quality

**Qualityは滑らかさと処理速度の調整**です。高くすると滑らかになりやすい一方、処理は遅くなります。

21.1マニュアルでは、Quality **1** はどのMethodでも高速で単純なBox blurを使用すると説明されています。そのため、Quality 1でMethodを切り替えても期待した形の差が出ない場合があります。小さなBlur Sizeなら**2**、多くの制作では**4**程度が目安とされています。大きなBlur Sizeでは、より高い設定を比較します。

最初から最大値にせず、同じフレームを等倍で見比べて、滑らかさの差が必要な範囲だけ上げます。

### Lock X/YとBlur Size

**Blur Size**は、Blur Imageの各位置の値を使って適用する**ぼかし全体の量**を調整します。マップの模様を作り直さず、全体のぼかしを強めたり弱めたりできます。

**Lock X/Y**を有効にすると、X方向とY方向へ同じBlur Sizeが適用されます。解除するとXとYのBlur Sizeを別々に指定できます。横方向へ広がるような柔らかさを作りたい場合は、Lock X/Yを解除して横方向の量から調整します。

マップに対する正確な数式、単位、全ての値域での挙動は21.1マニュアルからは確定できません。黒から白へのマップを使うときも、黒が常に「ぼかしゼロ」になると未検証のまま断定せず、後述の確認手順で判断してください。

### Blur Limit

**Blur Limit**はBlur Imageから使用する値の範囲を制限します。特に深度（Z-depth）画像は非常に大きな値や無限大に相当する値を含むことがあり、そのまま使うとぼかし量が極端になる可能性があります。

深度マップで一部だけ不自然に大きくぼける場合は、Blur Sizeだけを下げる前にBlur Limitを調整します。これはピント位置を自動決定するパラメータではありません。

<!-- capture:S158 -->

## 実機例：明暗マップで文字の一部をぼかす

文字画像を `Input` に接続し、黒い背景の上に柔らかい白い楕円を重ねた画像を `Blur Image` に接続します。frame 0でブラー チャンネルを赤、Methodをマルチボックス、品質を2、ブラー サイズを10に設定しました。

この例ではマップの明るい側にある数字がぼけ、左側の文字は比較的鮮明です。マップの黒が常に無処理になると断定する比較ではありません。[接続と設定の記録](/img/fusion/captures/S158/readback.json)に固定例の条件を記載しています。

[![文字画像と別の明暗マップをVari Blurへ接続したノード構成](/img/fusion/captures/S158/graph.png)](/img/fusion/captures/S158/graph.png)

文字画像をInput、別に作った明暗マップをBlur Imageへ接続します。

[![左に明暗マップ、右にマップの明るい部分で文字がぼけた出力](/img/fusion/captures/S158/map-output.png)](/img/fusion/captures/S158/map-output.png)

左の明暗マップと右の出力。明るい側にある数字が大きくぼけています。

[![元の文字画像と数字部分をぼかした出力の比較](/img/fusion/captures/S158/source-output.png)](/img/fusion/captures/S158/source-output.png)

同じframeの入力と出力です。この固定例では左側の文字が比較的鮮明に残ります。

[![Vari Blurのマルチボックス、品質2、赤、ブラーサイズ10の設定](/img/fusion/captures/S158/inspector.png)](/img/fusion/captures/S158/inspector.png)

Methodはマルチボックス、品質2、ブラー チャンネルは赤、ブラー サイズは10です。

[再現用Graph](/img/fusion/captures/S158/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S158/capture.json)

<!-- /capture:S158 -->

## 実際の制作例

### 1. 画面の奥へ向かって徐々にぼかす

道路や室内の引き画で、遠くへ行くほど柔らかく見せるための**演出的な**ぼかしを作ります。

1. MediaInをVari Blurの**Input（金色）**へ接続します。
2. 別のBackgroundでグラデーションを作り、暗い側と明るい側を「手前」「奥」に対応させます。画面内の距離感に合うよう、グラデーションの位置と方向を調整してください。
3. Backgroundを**Blur Image（緑）**へ接続し、Blur Channelを**Luminance**にします。
4. MethodをSoften、Qualityを2程度から始め、Blur Sizeを変えて映像と見比べます。
5. Qualityを4へ上げ、細い輪郭や光点がどう変わるか確認します。ぼかしの強弱が逆なら、グラデーションの向きを変えます。

この方法で使っているのは**2D上に描いた距離感のマップ**です。遮蔽物の前後関係や実際のレンズの焦点距離を自動解析するわけではありません。奥行きの境界が複雑な映像では、マップを手直しする必要があります。

### 2. 文字のある場所だけ、ぼかし量を変える

背景映像の上で文字の形に合わせた変化を作る例です。

```text
MediaIn ───────────────→ Vari Blur ──→ MediaOut
Text+ ─────────────────→ Blur Image（緑）
                         Blur Channel: Alpha
```

1. Text+で白い文字を作り、Vari BlurのBlur Imageへ接続します。
2. Blur Channelを**Alpha**にして、文字の内側と外側の結果を比較します。
3. Blur Sizeを少しずつ上げ、文字の境界でどう変化するか確認します。
4. 文字の周囲に意図しない急な切り替わりが出るなら、マップ側の境界を柔らかくするか、別のグラデーションを使います。

Text+は**ぼかす対象そのもの**ではなく、ここではぼかしの指示画像です。文字を画面に表示したい場合は、別の画像経路で合成します。文字以外の領域が必ず無処理になるとは決めつけず、実際の出力で確認します。

### 3. 深度パスを使って広がりを制限する

3Dレンダリングから得たZ-depthなどを、Blur Imageへ読み込んでぼかし量の指示に使う例です。

1. 元映像をInputへ、深度パスをBlur Imageへ接続します。
2. 深度が格納されたチャンネルをBlur Channelで選びます。AlphaやLuminanceが常に正しいとは限りません。
3. まず低いBlur Sizeで、近い部分と遠い部分の変化を確認します。
4. 極端に大きな深度値を持つ領域でぼかしが崩れる場合は、**Blur Limit**を調整します。
5. 被写体の境界でにじみが目立つ場合は、深度マップの境界や元映像との位置合わせを確認します。

ここではZ-depthを**数値マップ**として使用しています。焦点面と被写界深度を設定して物理的なピントを求める処理ではありません。焦点位置に基づく表現が必要なら、深度情報を扱う別の手法と比較してください。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| 画面全体が同じようにぼける | Blur Imageが緑の入力へ接続されているか。Blur Channelで選んだチャンネルに実際に明暗差があるか。 |
| 想定した場所がぼけない、強弱が逆になる | Blur ImageをViewerで直接確認し、マップの方向、選択チャンネル、Blur Sizeを1つずつ変える。 |
| Methodを切り替えても違いが見えない | Qualityが1ではないか確認する。21.1マニュアルではQuality 1はすべてのMethodで単純なBox blur。 |
| ぼかしが粗い、輪郭が段階的に見える | Blur Sizeを固定したままQualityを2→4と上げて比較する。マップ自体の階調の荒さも確認する。 |
| 一部分だけ極端にぼける | Blur Imageの値を確認する。Z-depth等ではBlur Limitを使って使用範囲を制限する。 |
| 人物など除外した場所まで効果が掛かる | Blur ImageとEffect Maskを取り違えていないか、青いEffect Maskの接続と白黒を確認する。 |
| 処理が重い | QualityとBlur Sizeを必要な範囲まで下げ、同じフレームで画質と速度を比較する。 |

**黒いマップの扱いについての注意**：21.1マニュアルのBlur Size説明には、Blur Imageが黒または未存在の画素についてもぼかされると読める一文があります。ブラー量を画像値で制御するという同章の説明と合わせると、ゼロ値の挙動は文面だけでは判断しにくい状態です。実機では黒一色・白一色・グラデーションの3つのマップで同じBlur Sizeを比較し、使用中のVersionで確認してください。この記事では**黒＝必ず無処理**という仕様を確定していません。

## 関連するノードと概念

- [Blur](./blur)：別の指示画像を使わず、ぼかしの方法と量を直接調整する。
- [Defocus](./defocus)：ピント外れの見た目や光点の形を別の設定で扱う。
- [Blur / Filterノードの入口](./index.md)：同じFamilyのノードを目的から選ぶ。
- [Imageの基礎](../../learn/02-data/image)：2D Imageとチャンネルの考え方。
- [Maskの基礎](../../learn/02-data/mask)：Effect Maskによる適用範囲の制御。

## バージョンと根拠

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月8日公開）、Chapter 92「Blur Nodes」、**pp.2126–2128**。[公式マニュアル](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

入力の数と役割、3種類のMethod、Qualityの目安、Blur Channel、Lock X/Y、Blur Size、Blur Limitはこの資料で確認しました。制作例と確認手順は、その仕様から組み立てた運用案です。黒いマップの厳密な挙動、内部のぼかし計算式、各設定の初期値・範囲、GPU性能、Edition差、および上記固定例以外の21.1実機出力は未確認のため、`verification: partial`としています。
