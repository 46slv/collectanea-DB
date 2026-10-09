---
title: Pseudo Color
description: 入力画像のRGBAチャンネルを波形で変化させ、疑似色や色が巡るアニメーションを作るFusionノード。
doc_type: node
term_id: pseudo-color
term_short: 画像の色成分をチャンネルごとの波形設定で変化させ、元の色とは異なる疑似色を作るノード。
verification: partial
aliases: [Pseudo Color, PSCL]
concepts: [image-data, mask-data, alpha]
nodes: [Pseudo Color]
node_family: effects-film
controls: [Color, Wrap, High, Low, Soft Edge, Waveform, Frequency, Phase, Mean, Amplitude]
inputs: [image, mask]
outputs: [image]
tasks: [stylize-image]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-09"
---

# Pseudo Color

Pseudo Colorは、入力した2D画像の色成分を、設定した波形に応じて変化させるノードです。元画像の明暗や色の違いを利用して、通常の色補正では作りにくい規則的な色模様や、色が循環するアニメーションを作れます。

「疑似色」は、元の被写体が実際にその色だったという意味ではありません。数値の違いを別の色で見せる表現です。

## 役割

入力画像の赤・緑・青・アルファ（RGBA）を個別に制御し、各成分を波形の設定に沿って変化させます。たとえば白から黒へなめらかに変化する画像に適用すると、波形の種類や周波数によって、明暗の途中に複数の色帯を作れます。

出力も2D画像です。画像を新規に生成するノードではないため、元になる画像を接続します。波形が入力値をどう計算へ使うかという内部式は、21.1 Manualでは公開されていません。

## 入力

### Input

オレンジ色の入力です。色を変えたい2D <Term id="image">Image</Term>を接続します。写真、グラデーション、文字などを入力できます。

### Effect Mask

青色の任意入力です。<Term id="mask">Mask</Term>をつなぐと、その範囲だけにPseudo Colorの結果を適用します。Polygonや基本図形から作ったマスク、別ノードで作ったビットマップマスクなどを利用できます。

Effect MaskはPseudo Colorの処理後に適用されます。波形へ渡す入力画像そのものを切り抜く操作とは異なります。

## 出力

変換されたRGBAを持つ2D画像を出力します。MediaOutへ送るほか、Mergeで元の映像へ重ねたり、後段のカラー処理へ渡したりできます。

Alphaタブも有効にすると透明度に関わる成分が変化するため、色だけを変えたい場合はAlphaの有効・無効を確認します。

## 主な設定項目

Inspectorには**Red / Green / Blue / Alpha**の4つのタブがあり、同じ種類の設定を各チャンネルに持ちます。どのチャンネルを変えるかによって、出来上がる色と透明度が変わります。

### Color・High / Low・Soft Edge

- **Color** — そのチャンネルへのPseudo Colorの適用を有効にするチェックボックスです。色の変化を切り分けるときは、まず1チャンネルだけを有効にすると判断しやすくなります。
- **High / Low** — そのチャンネルで効果を及ぼす値域を決めます。対象とする部分を絞り、元画像のどの階調で色を変えるか調整します。
- **Soft Edge** — 色が切り替わる境界の柔らかさを調整します。硬い帯状の変化にしたい場合と、なめらかにつなげたい場合で使い分けます。

### Waveform・Frequency

**Waveform**では、色の変化の形を4種類から選びます。

| Waveform | 色の変化の特徴 |
| --- | --- |
| Sine | ゆっくり増減する、滑らかな変化 |
| Triangle | 直線的に増減する、山形の変化 |
| Sawtooth | 一方向に変わり、周期の切れ目で急に戻る変化 |
| Square | 2段階を切り替えるような、はっきりした変化 |

**Frequency**は波形の繰り返し頻度を調整します。値を高くすると変化が現れる回数が増えるため、画像内に細かな色の繰り返しを作りやすくなります。色帯の幅は入力画像の分布にも左右されます。

### Phase・Mean・Amplitude

- **Phase** — 波形の位置をずらします。キーフレームで変化させると、入力画像の形を変えずに色模様だけが巡るアニメーションを作れます。
- **Mean** — 波形全体の水準を変えます。高くすると、そのチャンネルの明るさが許容上限へ向かって上がります。
- **Amplitude** — 波形の強さを増減します。色の変化幅を大きくしたいときに調整します。

**Wrap**を有効にすると、波形の値が許容範囲を超えた場合、反対側の端へ回り込みます。MeanやAmplitudeを大きくしたときに、色の変化が境界でどのように続くかを比較できます。

## 主な用途

- **映像を色帯で分ける** — 明暗のある入力画像に異なる波形を割り当て、明るい場所と暗い場所が別の色に見えるポスター風・疑似サーモグラフィー風の表現を作ります。実際の温度を測定する処理ではありません。
- **色が循環する背景** — グラデーションを入力し、チャンネルごとのPhaseを動かして、画像の形を固定したまま色の帯だけが移動する背景を作ります。
- **被写体の一部だけ変色させる** — 人物や商品を含む映像へEffect Maskを加え、画面の指定範囲だけを疑似色に変えます。マスク外の映像は元の見た目を保てます。

## 最小構成

```text
MediaIn → Pseudo Color → MediaOut
```

1. MediaInの画像をPseudo Colorのオレンジ色のInputへ接続します。
2. RedタブでColorを有効にし、WaveformをSineにします。
3. Frequencyを変更して、色の変化がどの程度繰り返されるか確認します。
4. Phaseを変更し、色模様が移動する様子を確認します。
5. GreenとBlueも有効にし、それぞれ別のWaveformやPhaseを設定して色の組み合わせを変えます。

最初はAlphaを変更せず、RGBだけで見た目を確認すると結果を比較しやすくなります。

## 運用例：グラデーションから色が流れる背景を作る

```text
Background（グラデーション） → Pseudo Color → MediaOut
```

1. Backgroundで、暗い色から明るい色へ変化するグラデーションを用意します。
2. Pseudo ColorのRedとBlueを有効にし、SineとTriangleなど異なるWaveformを選びます。
3. Frequencyを上げ、元のグラデーションの途中に複数の色帯が現れるよう調整します。
4. RedのPhaseへキーフレームを設定して時間とともに変化させます。必要ならBlueのPhaseにも異なる動きを付けます。
5. 色帯の境界が強すぎる場合はSoft Edgeを調整します。

実写の一部分だけへ使う場合は、別ノードで作ったマスクを青色のEffect Maskに接続します。結果と元映像を比較して、色を変える範囲を決めます。

## 挙動と注意点

- **色補正との違い** — Color Correctorは自然な色・明るさの調整に使います。Pseudo Colorは波形に基づく意図的な色の再配置に向くため、通常の露出補正の代わりにはしません。
- **値の意味** — 疑似色は入力画像の階調を見た目に置き換えます。温度や深度など物理量を正確に表すには、元データと表示色の対応を別途定義する必要があります。
- **透明度** — Alphaを変化させると、Merge後の見え方も変わります。RGBの色だけを変更したい場合はAlphaタブを確認します。
- **適用範囲** — Effect Maskは変換後の効果を制限します。元画像の一部だけを入力したい場合は、Pseudo Colorより前の段階で画像を分けます。

## 関連する考え方

- [2D Imageの考え方](../../learn/02-data/image)
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## 似たNode・関連Node

- [Color Corrector](../color/color-corrector) — 画像の色や明るさを通常の色補正として調整する
- [Color Curves](../color/color-curves) — 曲線により色成分と階調の関係を調整する
- [Highlight](./highlight) — 明るい部分から星形の光条を作る。色の値を疑似色へ置き換える処理ではない

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 97「Effect Nodes」、pp.2291–2293で、2入力（Input / Effect Mask）、Red / Green / Blue / Alphaの各タブ、Color、Wrap、High / Low、Soft Edge、4種類のWaveform、Frequency、Phase、Mean、Amplitudeを確認しました。

上記の操作例はこれらの仕様に基づく構成案であり、21.1実機でのレンダリング結果、チャンネル変換の内部計算式、初期値や可動範囲は未検証です。そのため `verification: partial` としています。
