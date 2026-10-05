---
title: Remove Noise
description: Image channelをsoftenして元Imageとの差からnoiseを抽出し、detailを戻しながら単純なnoise reductionを行うNode。
doc_type: node
term_id: remove-noise
term_short: channelをsoftenしてnoiseを分離し、detailを戻しながらnoiseを減らすNode。
verification: partial
aliases: [Remove Noise, RN]
concepts: [image-data, mask-data]
nodes: [Remove Noise]
node_family: effects-film
controls: [Method, Lock, Softness, Detail]
inputs: [image, mask]
outputs: [image]
tasks: [denoise, prepare-key, reduce-grain]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Remove Noise

Remove Noiseは、入力した2D <Term id="image">Image</Term>のchannelをいったんsoftenし、元Imageとの差からnoise成分を見つけ、必要なdetailを戻しながらnoiseを減らすNodeです。

21.1 Manualでは、keying前のgrainを減らす例としてDelta Keyerの前段に置く構成が示されています。

## 役割

Remove Noiseは、まずImageをぼかしてnoiseを目立たなくし、その結果と元Imageを比較してnoiseを分離します。その後、noiseと判断した部分を除きながらdetailを戻します。

```text
Noisy Image → Remove Noise → Keyer / Composite
                    ↑
                 Effect Mask
```

強いdenoiseを一度にかけるより、Softnessでnoiseが消える境界を探してからDetailを戻す順番で調整します。

## 入力

### Input

オレンジ色の入力です。noiseを減らしたい2D Imageを接続します。

### Effect Mask

青色の任意入力です。<Term id="mask">Mask</Term>でnoise reductionを適用する範囲を制限します。

21.1 ManualではEffect MaskはNode処理後に適用されると説明されています。

## 出力

noise reduction後の2D Imageを出力します。keying前処理として使う場合はDelta Keyerなどへ、そのまま仕上げる場合は後段のImage-processing Nodeへ接続します。

## 主な設定項目

### Method

noiseをどのchannel表現で調整するか選びます。

- **Color** — Red / Green / Blueを個別に調整
- **Chroma** — Luminance / Chrominanceへ分けて調整

RGB channelごとにgrain量が異なる素材ではColor、色noiseと明るさnoiseを分けて扱いたい場合はChromaから試せます。

### Softness

各channelへ加えるblur量を決めます。

Manualの手順では、まずRed channelを表示し、grainが見えなくなるところまでRed Softnessを上げます。その後Green / Blueでも同じ考え方で調整します。Chroma MethodではLuminanceとChrominanceそれぞれのSoftnessを調整します。

### Detail

soften後にどの程度detailを戻すかを決めます。Softnessでgrainを消した後、detailが戻るまで上げ、noiseまで再び見え始める手前で止めるのがManualで示されている基本調整です。

### Lock

channelごとのSoftness / Detailをlinkしてまとめて動かします。channel差を個別に追い込む場合はLockを外します。

## 最小構成

```text
MediaIn → Remove Noise → Output
```

1. MethodをColorにします。
2. ViewerでRed channelを確認します。
3. Red Softnessをgrainが消えるまで上げます。
4. Red Detailで必要なedgeやtextureを戻します。
5. Green / Blueも同様に調整します。

素材によってはChroma Methodへ切り替え、LuminanceとChrominanceを別々に調整する方が分かりやすい場合があります。

## 運用例

green screen素材のgrainがmatte edgeを不安定にしている場合:

```text
MediaIn → Remove Noise → Delta Keyer → Composite
```

keying前にRemove Noiseで細かなgrainを抑えます。Softnessを上げすぎると髪や細いedgeまで失うため、noiseが消えた後はDetailで必要な構造を戻し、key結果を見ながら過剰処理を避けます。

## 挙動と注意点

- 21.1 Manualで説明されているRemove Noiseは、Image channelのsoftenとdetail復元を使う単純なnoise managementです。motion analysisや複数frame bufferを使う処理としては説明されていません。
- SoftnessとDetailは逆方向の役割を持つため、両方を同時に大きくするよりSoftness → Detailの順で調整すると原因を追いやすくなります。
- keying前ではnoise reduction量だけでなく、細いedgeやtextureがどこまで残っているかも確認します。
- Effect Maskは処理後の適用範囲を制限するため、noise検出そのものへ別Imageを入力する端子ではありません。

## 似たNode・関連Node

- [Film Grain](./film-grain) — 最終compositeへgrainを戻す
- [Grain](./grain) — legacy grain生成
- [Blur](../blur-filter/blur) — 単純にImageをぼかす。noise抽出とdetail復元は行わない

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 98、pp.2322–2323で、Image / Effect Mask入力、noise抽出の基本動作、Delta Keyer前の例、Color / Chroma Method、Lock、Softness、Detailの調整手順を確認しました。

内部noise detection algorithm、edition差、実機性能は未確認のため `verification: partial` としています。
