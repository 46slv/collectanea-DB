---
title: Bitmap Mask
description: 2D ImageのColor・Alpha・Luminance・Saturation・Coverage・Object/Material IDなどから単一channelのMaskを作るNode。
doc_type: node
term_id: bitmap-mask
term_short: Bitmap Maskは、ImageのchannelやID情報からMaskを作り、threshold・softness・combineも調整できるNode。
verification: partial
aliases: [Bitmap Mask, Bmp]
concepts: [mask-data, image-data]
nodes: [Bitmap Mask]
node_family: masks
controls: [Level, Filter, Soft Edge, Paint Mode, Invert, Fit Input, Center, Channel, Threshold Low, Threshold High, Use Object, Use Material]
inputs: [image, mask]
outputs: [mask]
tasks: [create-mask, isolate-effect, matte]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Bitmap Mask

Bitmap Maskは、2D <Term id="image">Image</Term>のchannel値を読み取り、<Term id="mask">Mask</Term>へ変換するNodeです。

Alphaだけでなく、Red / Green / Blue、Hue、Luminance、Saturation、Coverage、Object ID、Material IDなどをMaskの元にできます。

## 役割

ImageをそのままEffect Mask入力へ接続できるNodeもあります。Bitmap Maskは、その間に置くことで**どのchannelをMaskにするか、thresholdでどこを白黒へ寄せるか、softnessをどうするか、別Maskとどう組み合わせるか**を明示的に制御します。

```text
Image → Bitmap Mask → Effect Mask input
```

## 入力

### Input

オレンジ色の入力です。Maskの元にする2D Imageを接続します。

### Effect Mask

青色の任意入力です。別のMaskを接続し、Bitmap Maskで作るMaskと組み合わせます。

組み合わせ方はPaint Modeで決めます。

## 出力

単一channelのMaskを出力します。

通常はBlur、Color、MergeなどのEffect Mask入力や、Garbage Matte / Pre-Mask等のMask入力へ接続します。

## 主な設定項目

### Channel

入力Imageのどの情報からMaskを作るかを選びます。

21.1 Manualでは次が挙げられています。

- Red / Green / Blue
- Alpha
- Hue
- Luminance
- Saturation
- auxiliary Coverage
- Object ID / Material ID

Object / Material IDは、元Imageにそのchannelが含まれている場合だけ利用できます。

### Threshold Low / High

Mask値を切り詰めます。

- Lowを上げると、それ未満のpixelを黒（0.0）へ寄せる
- Highを下げると、それより高いpixelを白（1.0）へ寄せる

「どの明るさ・channel値をMaskとして残すか」を狭める用途です。

### Fit Input

元Imageと生成するMaskの寸法が違う場合に、Imageをどう合わせるかを決めます。

ManualにはCrop、Stretch、Inside、Width、Height、Outsideがあります。

### Center X / Y

Bitmap Mask内で元Imageの位置を調整します。

### Soft Edge / Filter

Maskの境界をぼかします。FilterはSoft Edge計算に使う方式を選びます。

### Paint Mode

Effect Mask入力へ別Maskを接続した場合に表示されます。

Merge、Add、Subtract、Minimum、Maximum、Average、Multiply、Replace、Invert、Copy、Ignoreから組み合わせ方を選びます。

### Invert

最終Mask全体を反転します。

Paint ModeのInvertは「重なった範囲の組み合わせ方」で、Invert checkboxはMask全体の反転です。役割を分けて考えます。

## 最小構成

LuminanceからEffect Maskを作る場合:

```text
Source Image
    ↓
Bitmap Mask  ← Channel: Luminance
    ↓
Effect Mask input
```

まずChannelだけを変更し、次にThreshold、最後にSoft Edgeを調整すると、どのControlが結果へ影響したか追いやすくなります。

## 運用例

明るい部分だけにBlurをかけたい場合、同じImageまたは別の参照ImageをBitmap Maskへ接続し、ChannelをLuminanceにします。

Thresholdで対象範囲を絞り、Bitmap Maskの出力をBlurのEffect Maskへ接続します。

```text
Image ───────────────→ Blur → Output
  └→ Bitmap Mask ─────↑
```

この構成では、Image branchが「何をBlurするか」、Bitmap Mask branchが「どこへBlurするか」を担当します。

## Bitmap Maskを挟まなくてもよい場合

21.1 Manualでは、Effect Mask入力にImageを直接接続できる場合、Bitmap Maskは必須ではないと説明されています。

単純にAlpha等をEffect Maskとして使うだけなら直接接続で足りる場合があります。Channel選択、threshold、softness、Mask combine等が必要になったときにBitmap Maskを挟むと意図が明確になります。

## 関連する考え方

- [マスク（Mask）](../../learn/02-data/mask)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 似たNode・関連Node

- [Ellipse Mask](./ellipse-mask) — 幾何形状からMaskを作る
- [Polygon Mask](./polygon-mask) — 自由な輪郭からMaskを作る
- [Ranges Mask](./ranges-mask) — tonal rangeからMaskを作る
- [Wand Mask](./wand-mask) — 連続した近似色領域からMaskを作る

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 108、pp.2463–2467で、Image / Effect Mask入力、Channel、Threshold、Fit Input、Center、Object / Material ID、Mask combineの役割を確認しました。

内部REGID、ID channelの生成方法、各Filterの実機差、Edition差は未確認のため `verification: partial` としています。
