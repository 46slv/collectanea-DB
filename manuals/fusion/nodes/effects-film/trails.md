---
title: Trails
description: 過去frameをbufferへ蓄積し、Gain・変形・合成方法を使って移動物体の後ろへ時間方向の残像を作るNode。
doc_type: node
term_id: trails
term_short: 過去frameのImageを蓄積して、動きの後ろへ残像を作るNode。
verification: partial
aliases: [Trails, TRLS]
concepts: [image-data, mask-data, alpha, premultiplication]
nodes: [Trails]
node_family: effects-film
controls: [Restart, Preroll, Reset/Preroll on Render, Preroll Frames, Gain, Rotate, Offset X/Y, Scale, Blur Size, Apply Mode, Operator, Subtractive/Additive, Alpha Gain, Burn In, Merge Under]
inputs: [image, mask]
outputs: [image]
tasks: [afterimage, light-trails, stylize]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Trails

Trailsは、前のframeの2D <Term id="image">Image</Term>を内部bufferへ残し、現在frameと重ねながら移動物体の後ろへ残像を作るNodeです。

Directional Blurのように1 frameを引き伸ばすのではなく、時間方向に蓄積した複数frameを使います。動くTextや発光物へ適用すると、進行方向の後ろへ過去の姿が連なるような見た目を作れます。

## 役割

入力Imageをframeごとにbufferへ取り込み、過去のImageへGain・回転・位置ずれ・拡大縮小・Blurを加えながら現在frameと合成します。

```text
Animated Image → Trails → Output
                    ↑
                 Effect Mask
```

Trailsは過去frameのbufferを使うため、任意のframeへ直接移動しただけでは十分な残像がまだ溜まっていない場合があります。PreviewやrenderではPrerollを使って必要なframe数を先に計算できます。

## 入力

### Input

オレンジ色の入力です。残像を作りたい2D Imageを接続します。

21.1 Manualの例では、動くTextの出力をTrailsへ接続し、その移動履歴から残像を生成しています。

### Effect Mask

青色の任意入力です。<Term id="mask">Mask</Term>の範囲だけTrails結果を適用します。

ManualではEffect MaskはNodeの処理後に適用されると説明されています。

## 出力

残像を合成した2D Imageを出力します。Mergeなどの後段Image処理へそのまま接続できます。

## bufferとPreroll

### Restart

内部bufferを消去し、残像がない状態へ戻します。

設定を変えて比較するときに古いbufferが残っていると結果を読み違えやすいため、Manualの基本例でもpreview間にRestartを使います。

### Preroll

指定したframe数だけ事前計算し、現在frameへ到達する前の残像をbufferへ用意します。

`Reset/Preroll on Render`を有効にすると、previewや最終render開始時にbufferをresetしてから指定frame数をprerollします。

`This Time Only`を使うと、過去frameの内容を読む代わりに現在frameを使ってPrerollします。

## 残像の形を変える設定

### Gain

buffer内のImage強度を変えます。

値を下げると前のImageが早く弱くなり、短く薄いtrailになります。高くすると過去のImageがより長く残ります。

### Rotate / Offset X/Y / Scale

buffer内の過去Imageへ変形を加えてから次のframeを合成します。

これらの変形はtrailの各段へ累積します。たとえばOffset Xを少しずらすと、元のmotionとは別に残像自体がframeごとに横へ流れていきます。

### Blur Size

過去ImageへBlurを加えてから次のframeを合成します。Blurもtrailの各段へ累積するため、古い残像ほど柔らかく広がる見た目を作れます。

## 重なり方を決める設定

### Apply Mode

残像同士が重なる部分をどのblend計算で合成するか選びます。

Normalのほか、Screen、Multiply、Overlay、Differenceなど複数のmodeが用意されています。発光する軌跡ならScreen、通常のAlpha付き素材を重ねるならNormalから試すと違いを確認しやすくなります。

### Operator

Apply ModeがNormalのとき、Over / In / Held Out / Atop / XOrから重なり方を選びます。

### Subtractive/Additive

premultiplied / non-premultiplied Imageでedgeの明るさが不自然になる場合に、AdditiveとSubtractiveの合成を連続的に調整します。

21.1 Manualでは、premultiplied ImageではAdditive側、non-premultiplied ImageではSubtractive側が基本になる理由を説明しています。

### Alpha Gain / Burn In / Merge Under

- **Alpha Gain** — 前側のtrailのAlpha量を調整し、下にある残像の見え方を変える
- **Burn In** — 上のtrailが下のtrailを暗くするAlpha量を調整する
- **Merge Under** — 現在Imageを生成済みtrailの下へ置き、trailのlayer順も反転する

## 最小構成

```text
Text+ → Transform → Trails → Merge → Output
```

1. Text+をTransformで移動させます。
2. Trailsへ接続します。
3. Restartでbufferを消去してから連続再生します。
4. まずGainだけを下げ、残像の長さがどう変わるか確認します。
5. 次にOffsetやBlurを1項目ずつ加えると、時間方向の蓄積と追加変形を分けて理解できます。

## 運用例

発光するタイトルの軌跡を作る場合は、Alphaを持つTextを移動させてTrailsへ入れ、Apply ModeをScreen系にしてGainを調整します。

```text
Text+ → Transform → Trails → Glow → Merge
```

短い残像ならGainを低めにし、残像が硬すぎる場合はBlur Sizeを加えます。軌跡を元のmotionとは別方向へ流したい場合はOffset X/Yを使います。

## 挙動と注意点

- Trailsは内部bufferを持つため、単一frameだけを評価した状態と連続再生 / renderで結果が異なることがあります。
- 設定変更後に過去の結果が残って見える場合はRestartを使います。
- Effect MaskはTrails処理後に適用されるため、bufferへ入るImage自体を制限する操作とは役割が異なります。
- Motion Blurは1 frame内の移動をblurとして見せる処理です。Trailsは複数frameのImageを明示的に残すため、長いafterimageや多重露光風の見た目に向きます。

## 関連する考え方

- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)
- [Premultiplication](../../learn/04-compositing/premultiplication)

## 似たNode・関連Node

- [Directional Blur](../blur-filter/directional-blur) — 1 frameのImageを方向・中心に沿ってぼかす
- [Glow](../blur-filter/glow) — 発光成分を広げる
- [Merge](../compositing/merge) — trail結果を別Imageへ重ねる

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 97、pp.2297–2302で、Image / Effect Mask入力、image buffer、Restart / Preroll、Gain、Rotate、Offset、Scale、Blur Size、Apply Mode、Operator、Subtractive/Additive、Alpha Gain、Burn In、Merge Underを確認しました。

内部bufferの実装方式、各Apply Modeの内部最適化、実機性能は未確認のため `verification: partial` としています。
