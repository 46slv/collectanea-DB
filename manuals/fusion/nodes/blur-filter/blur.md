---
title: Blur
description: 2D Imageをぼかす基本Node。Filter、RGBA、X/Y、Effect Mask、Clipping Modeを制作例から理解する。
doc_type: node
term_id: blur
verification: partial
aliases: [Blur]
concepts: [image-data, filtering, domain-of-definition, mask-data]
nodes: [Blur]
node_family: blur-filter
controls: [Filter, Color Channels, Lock X/Y, Blur Size, Clipping Mode, Blend]
inputs: [image, mask]
outputs: [image]
tasks: [blur, soften, filter]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Blur

Blurは、周囲の画素を参照して画像の輪郭や細部を柔らかくする基本的なフィルターノードです。映像を均一にぼかすほか、テロップ背面だけを柔らかくする、透明な図形の縁をなじませる、細かな模様を弱めるといった用途があります。

Blur Sizeは原則として画像全体に同じ設定が使われます。**ぼかしを表示する場所**はEffect Maskで限定でき、**場所ごとにぼかし量を変える**なら[Vari Blur](./variblur)を使います。

## 入力と出力

~~~text
MediaIn（2D画像） ───→ Blur ───→ MediaOut
                         ↑
                   Effect Mask（任意）
~~~

- **Input（オレンジ）**：ぼかす対象の2D <Term id="image">Image</Term>。映像、Text+、Backgroundなどの画像出力を接続します。
- **Effect Mask（青・任意）**：Ellipse、Rectangle、Polygonなどのマスク。白い範囲にぼかし結果を適用し、黒い範囲は元画像を残します。グレーの部分で効果をなじませられます。
- **出力**：ぼかした2D画像。別の画像処理、Merge、MediaOutなどへ接続します。

重要なのは、Effect Maskが**Blurの計算後**に適用される点です。Maskを使って背景だけに効果を見せても、Blurの計算はマスクの外側の画素も参照します。人物の輪郭に色がにじむ場合、処理前に前景・背景を分ける方法が必要になることがあります。[マスクの基礎](../../learn/02-data/mask)を参照してください。

## Inspectorの主な設定

### Filter

21.1マニュアルには次の5方式が掲載されています。

| Filter | 特徴 |
| --- | --- |
| **Box Blur** | 比較的速い一方、Gaussianより滑らかさで劣る方式。 |
| **Bartlett** | Boxより柔らかい、アンチエイリアスを意識した方式。 |
| **Multi-box** | Box処理を複数回重ね、Gaussianに近いなだらかなぼけを作る方式。 |
| **Gaussian** | 対称的で滑らかなぼけ。 |
| **Fast Gaussian** | Gaussian系の高速方式。**21.1マニュアル上の既定値**。 |

見た目の違いを確かめるには、輪郭のはっきりした画像でBlur Sizeを揃えて切り替えます。特に浮動小数点精度の画像をGaussianで強くぼかすと、境界付近に**ringing（明暗の行き過ぎや薄い縁）**が出る場合があります。後の処理で目立ったときはMulti-boxを比較します。どの方式が実機で最速か、正確なカーネルが何かは、マニュアルの説明だけから断定できません。

### Color Channels（RGBA）

R、G、B、Aのうち、どのチャンネルをぼかすか選べます。既定では4つとも有効です。RGBは画像の色、A（Alpha）は合成時の不透明度に関わる情報です。透明な文字では、RGBだけをぼかす場合と、Alphaもぼかす場合で輪郭の見え方が変わります。

この設定は**処理前**に適用され、チェックを外したチャンネルのBlur計算を省きます。共通コントロールのRGBAチェックは処理**後**の指定なので別の機能です。透明素材に不自然な縁が出たら、RGBとAlphaの設定に加え、元画像の透明画素と後段のMergeも確認します。[AlphaとMaskの違い](../../learn/07-debugging/alpha-vs-mask)も参考にしてください。

### Lock X/Y・Blur Size

Blur Sizeでぼかしの広がりを指定します。Lock X/Yは初期状態で有効になっており、横と縦が同じ量になります。解除するとX/Yを別々に設定できます。横だけ大きくすると、縦方向の輪郭が左右へ広がります。

ただし、X/Yの量を分ける操作は、被写体の移動方向を解析する機能ではありません。動きの軌跡を描きたい場合は[Directional Blur](./directional-blur)や[Vector Motion Blur](./vector-motion-blur)と比較します。

### Clipping Mode

<Term id="domain-of-definition">Domain of Definition（DoD）</Term>は画像データの有効領域です。透明なロゴや文字では、フレームよりDoDが小さい場合があります。Blurは周囲を参照するため、この境界で結果が途切れることがあります。

- **Frame（既定）**：ノードのDoDをフレーム全体に設定し、元のDoDの外側を黒・透明として扱います。
- **Domain**：上流のDoDを尊重します。大きいぼかしでは境界が切れる場合があります。
- **None**：元画像のクリッピングを行いません。ただし参照先が上流DoDの外なら黒・透明として扱われます。

Noneは「外側の画素が無限に生成される」という意味ではありません。フレーム端や透明な文字で不自然な切れ方が出たら、3つを切り替えて確認します。[DoDの基礎](../../learn/03-space/domain-of-definition)と[表示領域の確認手順](../../learn/07-debugging/resolution-domain-of-definition)も参照してください。

### Blend

ぼかした結果と元画像を混ぜます。**0に近づけるほど元画像が戻る**設定です。Blur Sizeを小さくして狭くぼかす場合と、大きくぼかしてBlendを下げる場合は仕上がりが異なります。このBlendは共通コントロールのBlendと連動します。

## 制作例

### 1. テロップの背面だけをぼかす

映像の上に白い字幕を置くと、背景の模様で文字が読みにくくなる場合があります。字幕の背面だけぼかす構成です。

~~~text
MediaIn ───────────→ Blur ───────────→ Merge［Background］
                      ↑                    ↑
         Rectangle（Effect Mask）     Text+［Foreground］
                                           ↓
                                        MediaOut
~~~

1. MediaInからBlurへ映像を渡し、Blur Sizeで背景の細部を柔らかくします。
2. RectangleをEffect Maskへ接続し、字幕の背面が白、周囲が黒になるよう配置します。Soft Edgeで境界をなじませます。
3. Blurの出力をMergeのBackgroundへ、字幕のText+をForegroundへ入れます。
4. 背景がぼけすぎる場合はBlendで元画像を戻します。必要なら半透明の帯を別に合成して、明るさも整えます。

Effect Maskはぼかす前の画像を切り取るものではありません。**画面全体で計算したBlur結果を、Rectangleの範囲へ適用する**構成です。

### 2. 人物を鮮明に残し、背景だけを柔らかくする

人物と背景が1枚の映像では、人物の外側を白くしたEffect Maskを使う簡易方法があります。ただし人物の色が背景のBlur計算に混ざると、肩や髪の周りに輪郭が残ることがあります。

~~~text
MediaIn ──┬──→ Blur（背景用）──────→ Merge［Background］
          └──→ 人物の切り抜き ───→ Merge［Foreground］
                                          ↓
                                       MediaOut
~~~

背景用の枝をぼかし、もう一方で人物のAlphaを作ってMergeの前景に載せます。人物に隠れた背景はこの処理だけでは復元されません。境界にぼけた人物の像が残る場合は、背景側の修復も必要です。動く人物なら切り抜きも追従させます。

### 3. 透明なロゴの縁を柔らかくする

~~~text
Text+ / 透明PNG ──→ Blur ──→ Merge［Foreground］
背景画像 ─────────────────→ Merge［Background］
                                        ↓
                                     MediaOut
~~~

まずRGBAを有効にしてBlur Sizeを小さく増やし、文字の形と透明な縁を観察します。続いてAだけ、RGBだけを処理する設定で比較すると、色のぼかしと透明度のぼかしの違いを把握できます。透明画像の外縁が急に切れる場合はClipping Modeを比較します。

Blurは光を加算するノードではありません。ネオンのように発光させたいなら[Glow](./glow)や[Soft Glow](./soft-glow)を検討します。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| マスク境界に色がにじむ | Effect Maskは処理後に適用される。必要なら前景と背景を別の枝へ分ける。 |
| ロゴの外側でぼかしが切れる | DoD、Clipping Mode、Blur Sizeを確認。 |
| 透明な文字に黒い縁ができる | RGB・Alphaの処理、透明画素、Merge結果を分けて確認。 |
| Gaussianの周囲に薄い縁が見える | float-depth画像に強いBlurをかけていないか確認し、Multi-boxを比較。 |
| 横だけ広げたいのに縦もぼける | Lock X/Yを解除し、X/Yの量を別々に設定。 |
| ぼかし幅は適切だが強すぎる | Blur SizeはそのままにBlendを下げ、元画像を戻す。 |

## 関連Node

- [Vari Blur](./variblur) — 別画像の明暗などから位置ごとのぼかし量を決める。
- [Defocus](./defocus) — レンズのピント外れや光点の形状を作る。
- [Directional Blur](./directional-blur) — 指定した方向・中心に沿って像を流す。
- [Vector Motion Blur](./vector-motion-blur) — Motion Vectorに沿ったブラーを作る。
- [Blur / Filterカテゴリ](./index.md) — ぼかし・発光・輪郭処理の選択基準。

## 出典・確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、**Chapter 92「Blur Nodes」、Blur [Blur]、pp.2109–2111**。入出力、Maskの後段適用、5種類のFilter、RGBA、Lock X/Y、Blur Size、Clipping Mode、Blend、ringingについて確認しました。

制作例はManualの仕様を用いた接続説明です。実機の全レンダー結果、内部REGID、正確なFilterカーネル、処理速度、Edition差は未確認のため、verificationはpartialとしています。
