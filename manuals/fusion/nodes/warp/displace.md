---
title: Displace
description: 別Imageのchannel値を変位mapとして読み、2D Imageを中心方向またはX/Y方向へ歪ませるNode。
doc_type: node
term_id: displace
term_short: "Displaceは、別Imageの画素値を変位量として使い、Imageを歪ませるNode。"
verification: partial
aliases: [Displace, Dsp]
concepts: [image-data]
nodes: [Displace]
node_family: warp
controls: [Type, Center, Refraction Channel, Refraction Strength, X Refraction, Y Refraction, Light Power, Light Angle, Spread, Light Channel]
inputs: [image, image, mask]
outputs: [image]
tasks: [warp-image]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-22"
---

# Displace

Displaceは、変形したいImageとは別に**変位map用のImage**を受け取り、その画素値を使ってmain Imageのsampling位置をずらすNodeです。Fast Noiseのような模様をmapへ使えば、熱気・水面・布の揺れのような不規則な歪みを作れます。

## 役割

```text
Image to warp ────────→ Input
Displacement map ─────→ Foreground Image → Displace → Image
Mask ─────────────────→ Effect Mask
```

mapそのものを合成するのではなく、Red / Green / Blue / Alpha / Luminanceの値を変位量として利用します。

## 入力

### Input

オレンジ色のInputへ、実際に歪ませたい2D Imageを接続します。21.1 Manualでは必須入力です。

### Foreground Image

緑色のForeground Imageへ、変位mapとして使うImageを接続します。こちらも必須です。どのchannelを変位へ使うかはRefraction Channelで選びます。

### Effect Mask

青色のEffect MaskへMaskを接続すると、効果を必要な領域だけに限定できます。MaskはNodeの処理後に適用されます。

## 出力

mapに従って座標が移動した2D Imageを出力します。後段では通常のImageとしてMerge、Color、Blurなどへ接続できます。

## RadialとX/Y

### Radial

Centerを基準に、mapの値でpixelを内側または外側へ動かします。Refraction Strengthで変位の強さを調整します。

### X/Y

X方向とY方向を別々に扱います。X Refraction / Y Refractionで各軸の強さを調整し、Refraction ChannelもXとYで個別に選べます。

## 主な設定項目

### Refraction Channel

変位mapのRed / Green / Blue / Alpha / Luminanceから、変位へ使うchannelを選びます。Radialでは1組、X/YではX用とY用の2組です。

### Light Power / Light Angle

変位mapの起伏へ仮想的な明暗を付けます。Light Powerは強さ、Light Angleは方向を調整します。

### Spread / Light Channel

Spreadはmapのridgeやedgeを広げます。Light Channelは仮想lightの計算へ使うColor / Red / Green / Blue / Alpha / Luminanceを選びます。

## 主な用途

- Fast Noiseをmapにして、空気が揺れるようなheat distortionを作る
- noiseを時間変化させ、布や水面へ不規則な揺れを加える
- channelごとに異なるmapを使い、X/Y方向を独立して歪ませる
- Light controlsを使い、屈折したedgeへ明暗を付けてbevel風に見せる

## 最小構成

```text
MediaIn ───────→ Displace → MediaOut
Fast Noise ───→ Foreground Image
```

Fast NoiseをForeground Imageへ接続し、Refraction Strengthを小さく動かして変位方向を確認します。Fast Noiseを時間変化させると、歪みも動きます。

## 運用例：熱気で背景の直線を揺らす

撮影素材の建物や道路の直線が、熱い空気を通して見たときのようにゆっくり揺れる構成です。**元の映像を変形する入力**と、**変形量を指示する入力**を分けて組みます。

1. 撮影素材のMediaInをDisplaceの**Input（オレンジ）**へつなぎ、Displaceの出力をViewerで確認します。
2. Fast Noiseを追加し、Displaceの**Foreground Image（緑）**へつなぎます。Fast Noiseは背景へ重ねるのではなく、画面の場所ごとに画素の参照位置を変えるためのマップです。
3. まずDisplaceの**TypeをX/Y**にします。X RefractionとY Refractionの強さを別々に変え、窓枠などの直線がどの向きに歪むか確かめます。大きな変位で形が崩れる場合は、強さを抑えます。
4. **Refraction Channel**で、Fast Noiseのどのチャンネルを横方向・縦方向に使うか選びます。同じ白黒模様が複数チャンネルへ入っている場合、XとYでチャンネル名だけを変えても独立した動きにはなりません。異なる模様を使いたいときはマップ側のチャンネル内容を用意します。
5. Fast Noiseの**Seethe Rate**を調整し、マップの時間変化に合わせて歪みが動くことを確認します。これは21.1 Manualにも示されている構成です。
6. 揺らしたい範囲が画面の一部だけなら、Ellipseなどで作ったマスクをDisplaceの**Effect Mask（青）**へつなぎます。マスクは効果の場所を決め、Fast Noiseはその内部での歪み方を決めます。
7. 必要な場合だけ**Light Power / Light Angle**を調整します。これは変位マップの起伏に応じた明暗を加える設定なので、まずは光の演出なしで輪郭の変化を判断します。

## 運用例：横と縦の変位を分けて確認する

X/Yモードでどの設定がどの方向に効くか分からなくなったら、動きの少ない素材に窓枠や格子などの直線を含めて確認します。X Refractionだけを強めた状態と、Y Refractionだけを強めた状態を見比べると、横方向と縦方向の変形を切り分けられます。

さらに、X側とY側のRefraction Channelを変え、マップに異なるチャンネル情報がある場合だけ、方向ごとに別の模様を使った変形が得られるか確認します。**Radialモードへ切り替えると、Centerを基準に内外方向へ変位する**ため、X/Yモードと同じ見た目にはなりません。

## Grid Warp / Vector Distortionとの違い

- **Displace** — 別Imageのchannel値を変位mapとして使う
- **Grid Warp** — Viewer上のmeshを直接動かす
- **Vector Distortion** — vector channelをX/Y方向の変位量として使う

noiseやgrayscale mapから歪みを作るならDisplace、手で形を合わせるならGrid Warp、motion vector等を使うならVector Distortionを先に検討します。

## 挙動と注意点

Foreground Imageは変位量を決めるための入力です。マップの明暗やチャンネル内容を変えると、同じRefraction Strengthでも歪み方が変わります。Light Power / Light Angleは変位量の調整とは分けて扱います。

| 症状 | 先に確認すること |
| --- | --- |
| 何も歪まない | InputとForeground Imageが両方つながっているか、参照したチャンネルに明暗差があるか、Refractionの強さとEffect Maskを確認します。 |
| XとYを別々に設定しても同じように揺れる | Fast Noiseなどのマップで、選んだチャンネルが実際には同じ模様になっていないか確認します。 |
| 画面全体が激しく歪む | Refractionの強さを抑え、必要な範囲をEffect Maskで限定します。 |
| 意図しない明暗が出る | Light Power / Light Angle / Light Channelを確認し、まず変位だけの結果と比較します。 |

## 実機でmapと変位結果を比べる

Resolve Studio 21.1.0.14、Windows、日本語UIで、テストチャートとFast Noiseを使って撮影しました。

[![chart.pngをDisplace1のInputへ、NoiseMap1をForegroundへ接続した実機Node Editor](/img/fusion/captures/S30/graph.png)](/img/fusion/captures/S30/graph.png)

[![Displace1 Inspector。種類は放射状、屈折チャンネルは輝度、屈折の強度0.06、ライトの強度0](/img/fusion/captures/S30/inspector.png)](/img/fusion/captures/S30/inspector.png)

[![左はまっすぐな格子の入力チャート、右はDisplaceで格子や外枠が波打つ出力](/img/fusion/captures/S30/compare.png)](/img/fusion/captures/S30/compare.png)

Radial、Refraction ChannelはLuminance、Refraction Strengthは0.06です。Light Powerは0にし、明暗を足す照明効果を使わずに変位を見ています。

[![NoiseMap1のFast Noise Inspector。Detail 4、Contrast 2、X/YをロックしScale 6、Seethe 0](/img/fusion/captures/S30/map-inspector.png)](/img/fusion/captures/S30/map-inspector.png)

[![左Viewerは変位mapの白黒ノイズ、右はその輝度を参照して歪んだチャート](/img/fusion/captures/S30/map.png)](/img/fusion/captures/S30/map.png)

左をNoiseMap1へ切り替えると、変位に使った模様を確認できます。Color表示にはmapの透明部分を示す市松模様も重なります。この設定ではmapの輝度を参照しています。1920×1080、フレーム0、両Viewer 40%の静止例で、Seetheのアニメーション、X/Yの別チャンネル、Effect Mask、最適な強さや速度の比較は含めていません。

[再現用Graph](/img/fusion/captures/S30/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S30/capture.json)

## 関連Node

- [Fast Noise](../generators/fast-noise)
- [Grid Warp](./grid-warp)
- [Vector Distortion](./vector-distortion)
- [Vector Warp](./vector-warp)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2967–2969で、3入力、Radial / X/Y、Center、Refraction Channel、Refraction Strength、X/Y Refraction、Light Power / Angle、Spread、Light Channel、Fast Noiseを使うBasic Node Setupを確認しました。

上記の熱気・X/Y切り分け手順は、ManualのFast Noise例と各Controlsの説明を基にした実用構成です。個々の素材での見た目や最適な数値を実機検証したものではありません。

掲載例のREGID Displaceと配線・固定値の表示結果は確認しました。全既定値・数値範囲、性能は未確認です。
