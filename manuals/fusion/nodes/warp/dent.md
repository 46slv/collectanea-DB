---
title: "Dent"
description: "中心と範囲を指定して2D Imageへ円形の膨らみ・凹みを作るWarp Node。"
doc_type: node
term_id: "dent"
term_short: "Dentは、中心と範囲を指定してImageへ円形の変形を作るNode。"
verification: partial
aliases: ["Dent", "Dnt"]
concepts: ["image-data"]
nodes: ["Dent"]
node_family: "warp"
controls: ["Type", "Center", "Size", "Strength"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["warp-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# Dent

Dentは、Imageの指定した位置を中心に、円形の膨らみ・凹みなどを作るNodeです。6種類のTypeを切り替え、Center、Size、Strengthで変形の位置・範囲・強さを調整します。

## 入力と出力

```text
変形したい映像・画像 ──→ Dent（Input・オレンジ）──→ 変形後の2D Image
必要な範囲のMask ───→ Dent（Effect Mask・青／任意）
```

**Input（オレンジ）**には、円形に歪ませたい2D Imageを接続します。人物の映像、文字を画像化した結果、Fast Noiseが作った模様などを入力できます。

**Effect Mask（青）**は任意です。EllipseなどのMaskを接続すると、処理された結果を見せる範囲を制限できます。MaskはDentの変形を計算した**後**に適用されるため、Maskの中心とDentのCenterは別々に設定します。Maskの境界が硬い場合は、変形領域の境目も目立ちます。

**出力**は変形済みの2D Imageです。通常のMergeやCropへ渡せます。Dentは歪み方を内部で作るため、Displaceのような別の変位マップ入力は必要ありません。

## 主な設定項目

### Type

円形に変形する方法を、次の6種類から選びます。同じCenter・Size・Strengthでも、Typeを変えると画素の押し引き方が変わります。

- **Dent 1** — 中心付近が膨らんだように見える変形。レンズ状の膨らみを試す最初の候補。
- **Kaleidoscope** — Dentによる変形に鏡像反転を組み合わせる。実写の自然な補正ではなく、模様を対称的に崩す用途。
- **Dent 2** — 画素の位置をずらす変位型のDent。
- **Dent 3** — 形状を曲げる変形型のDent。
- **Cosine Dent** — 中心へ向かって裂け目が集まるような変形。
- **Sine Dent** — 滑らかな丸みを持つ変形。

これらは21.1マニュアルの分類です。Dent 2とDent 3の厳密な変位式までは記載されていないため、同じ設定で切り替えて輪郭の変わり方を比較してください。

### Center X / Y

効果の中心位置です。21.1マニュアルに示された既定値は**X = 0.5、Y = 0.5**で、画像中央を指します。

たとえば人物の顔の一部へ膨らみを加えたいなら、まずCenterをその場所へ動かします。Effect Maskを移動してもCenterは連動しません。

### Size

Dentが影響する範囲を調整します。animationすると効果範囲を広げたり縮めたりできます。

### Strength

Dent全体の変形量を調整します。

## 主な用途

**実写の一部分を膨らませる：** 人物や物体が写った2D映像をInputへつなぎ、Dent 1とCenter / Sizeで小さな領域を変形します。周囲の背景まで歪むときはSizeを絞るか、Effect Maskを併用します。これは見た目を意図的に変える処理であり、撮影レンズの歪みを正確に補正する用途には[ Lens Distort ](./lens-distort)を使います。

**モーショングラフィックスの中心を脈動させる：** Fast Noiseなどの模様をDentへ入力し、SizeとStrengthをキーフレームで動かします。静的な円形歪みから、中心が広がったり戻ったりする動きにできます。

**対称的に崩れたパターンを作る：** Fast Noiseなどの細かな模様を入力し、TypeをKaleidoscopeへ切り替えます。元の模様と比較しながらCenterとSizeを調整し、必要ならCropで最終的な画面サイズを整えます。

## 最小構成

```text
MediaIn → Dent → MediaOut
```

最初はTypeをDent 1にし、Centerを歪ませたい場所へ合わせ、Sizeで対象の範囲を決めてからStrengthを動かします。この順番なら「中心位置が違う」のか「変形量が足りない」のかを切り分けやすくなります。

<!-- capture:S159 -->

## 実機例：文字の中央を円形に変形する

生成した文字画像を `Dent1` のInputへ接続し、Dent 1、Center X/Yをそれぞれ0.5、Sizeを0.5、Strengthを1.0に設定しました。frame 0では中央付近の文字が円形に大きく曲がります。

これは静止した生成画像での固定例です。他のTypeや動く被写体は比較していません。[接続と設定の記録](/img/fusion/captures/S159/readback.json)に条件を記載しています。

[![文字画像をDentに通してMediaOutへ接続したノード構成](/img/fusion/captures/S159/graph.png)](/img/fusion/captures/S159/graph.png)

文字画像をDentのInputへ接続し、出力をMediaOutへ渡します。

[![Dent 1、中心0.5と0.5、サイズ0.5、強度1.0のInspector](/img/fusion/captures/S159/controls.png)](/img/fusion/captures/S159/controls.png)

Dent 1、Center X/Y 0.5、Size 0.5、Strength 1.0です。

[![Dentの中心と範囲のガイドを表示した入力と出力](/img/fusion/captures/S159/center-guide.png)](/img/fusion/captures/S159/center-guide.png)

Dentを選ぶと、Viewerに中心と円形のガイドが重なります。

[![元の文字と中央を円形に変形した文字を並べた比較](/img/fusion/captures/S159/comparison.png)](/img/fusion/captures/S159/comparison.png)

左は入力、右はDent 1の出力です。中央付近の文字が大きく曲がっています。

[再現用Graph](/img/fusion/captures/S159/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S159/capture.json)

<!-- /capture:S159 -->

## 制作例：動く被写体の一部を膨らませる

1. 被写体が写った映像をDentのInputへ接続します。
2. Typeを**Dent 1**にして、Centerを膨らませたい部分へ合わせます。
3. Sizeを小さくして、周囲の背景や輪郭が必要以上に歪まない範囲を探します。
4. Strengthを少しずつ変えて、中心付近の変形量を決めます。
5. 被写体が画面内で動く場合は、Centerへキーフレームを設定して位置を追わせます。Dent自体は被写体を自動追跡しません。
6. 必要な領域だけ効果を見せたい場合は、EllipseなどのMaskをEffect Maskへ接続し、Centerとは別に位置・境界を調整します。

この手順は21.1のCenter / Size / Strengthとキーフレーム機能を使った制作例であり、特定の素材での見た目を実機検証したものではありません。

## 制作例：ノイズから円形の背景模様を作る

```text
Fast Noise → Dent → Crop → MediaOut
```

1. Fast Noiseで濃淡のある2D模様を作り、その出力をDentのInputへ渡します。
2. DentのTypeを切り替えて、模様の線や粒が中心周辺でどう曲がるかを比較します。
3. Center / Size / Strengthを調整し、円形の歪みが画面内に収まるようにします。
4. 必要な大きさに仕上げる場合は、後段のCropで出力サイズを整えます。
5. さらにモザイク状の質感が必要なら、使用環境で利用できる場合にMosaic Blurを組み合わせます。

21.1マニュアルにはFast NoiseとMosaic Blur（DaVinci ResolveのResolve FX）を利用し、最後にCropを置く円形パターンの構成が掲載されています。上の最小例はMosaic Blurを省いた構成で、同一の完成画像になると保証するものではありません。

## Drip / Vortex / Displaceとの違い

- **Dent** — 中心と範囲を指定し、単発の円形変形を作る
- **Drip** — rippleの形・周波数・Phaseで波紋状に歪ませる
- **Vortex** — 指定範囲を渦状に回転させる
- **Displace** — 別Imageのchannel値を変位mapとして使う

別のmap Imageを用意せず、局所的な円形warpを作りたい場合はDentを先に検討します。

## 挙動と注意点

DentのCenter、Size、Strengthなどはキーフレームで変化させられます。一方、**Effect Maskは歪ませる範囲を決めるのではなく、処理済みの結果をどこに適用するか**を指定します。範囲が意図と合わないときは、まずCenter / SizeとEffect Maskを別々に確認します。

Dent 1の膨らみはフィッシュアイレンズに似た見た目を作れますが、カメラや実レンズのキャリブレーション値から補正する機能ではありません。VFXで実写とCGの直線を合わせるなら[ Lens Distort ](./lens-distort)と比較してください。

### 思ったように変形しないとき

| 症状 | 確認すること |
| --- | --- |
| ほとんど変化しない | DentのInputが接続されているか。Centerが画面外や無地の領域を向いていないか。SizeとStrengthが小さすぎないか。 |
| 変形させたい場所とずれる | Center X / Yを確認する。Effect Maskだけを移動してもDentの中心は変わらない。 |
| 背景まで大きく歪む | Sizeを狭め、必要ならEffect Maskを追加する。Mask境界も確認する。 |
| 被写体が動くと効果が取り残される | Centerに時間方向の位置合わせがあるか確認する。Dent自体は追跡結果を生成しない。 |
| 円形にしたいのに反転模様になる | TypeがKaleidoscopeになっていないか確認する。 |
| 模様の外周で不自然に見える | Typeを比較し、Size・StrengthやEffect Mask境界を調整する。 |

## 関連Node

- [Drip](./drip)
- [Vortex](./vortex)
- [Displace](./displace)
- [Coordinate Space](./coordinate-space)
- [Lens Distort](./lens-distort)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2965–2966で、Input / Effect Mask、6種類のDent Type、Centerの既定値0.5 / 0.5、Size、Strength、パラメータのキーフレーム化、Fast Noise / Mosaic Blur / Cropを使うBasic Node Setupを確認しました。

各Typeの厳密な数式、Center以外の全既定値・数値範囲、上記固定例以外の21.1実機描画結果と性能は未確認です。
