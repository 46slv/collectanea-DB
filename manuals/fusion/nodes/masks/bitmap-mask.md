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
updated: "2026-10-11"
---

# Bitmap Mask

Bitmap Maskは、2D <Term id="image">Image</Term>のchannel値を読み取り、<Term id="mask">Mask</Term>へ変換するNodeです。

Red / Green / Blue、Alpha、Hue、Luminance、Saturation、Coverageなどの値をMaskの元にできます。Object IDとMaterial IDによる選択もできますが、通常のChannelメニューとは別の設定です。

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
- auxiliary Coverage（入力Imageに補助Coverageチャンネルがある場合）

### Use Object / Use Material

Channelとは別に、Object IDまたはMaterial IDによるマスク生成を有効にする設定です。元Imageに該当するIDチャンネルが含まれていなければ効果はありません。

Object IDは物体単位、Material IDは材質単位で対象を区別するときに使います。たとえば、似た色の二つの物体でも、異なるObject IDを持つレンダー画像なら片方だけを選べます。Bitmap Mask自身は存在しないIDチャンネルを生成しません。

### Threshold Low / High

Mask値を切り詰めます。

- Lowを上げると、指定値より低い画素が黒（0.0）へ切り詰められます。
- Highを下げると、指定値より高い画素が白（1.0）へ切り詰められます。

これはチャンネル値の両端を切り詰める設定です。LowとHighの間だけを残して、それ以外をすべて黒にする「帯域抽出」ではありません。調整後のマスクをViewerで確認します。

### Fit Input

元Imageと生成するMaskの寸法が違う場合に、Imageをどう合わせるかを決めます。

21.1 ManualにはCrop、Stretch、Inside、Width、Height、Outsideがあります。Cropは元の大きさで配置し、はみ出す部分を切り取ります。Stretchは縦横を別々に引き伸ばすため、縦横比が変わる場合があります。Width / Heightは縦横比を保ち、幅または高さを一致させます。Inside / Outsideも縦横比を保つサイズ合わせで、入力と出力の縦横比によって画像の端が切れる、または一部が覆われない場合があります。異なる解像度の素材ではマスクの四隅まで確認してください。

### Center X / Y

Bitmap Mask内で元Imageの位置を調整します。

### Level

マスク全体の強さを調整します。1.0から下げると、白い領域もグレーに近づき、後段の処理が弱く適用されます。境界だけをぼかすSoft Edgeとは異なります。

### Soft Edge / Filter

Soft Edgeはマスクの境界をぼかします。0.0なら輪郭が明瞭です。Filterはぼかしの計算方式で、21.1 ManualにはBox、Bartlett、Multi-box、Gaussianが記載されています。Boxは速度重視、Bartlettは速度と品質の折衷、Multi-boxはNum Passesで品質を調整でき、Gaussianは高品質ですが比較的時間がかかります。まずSoft Edgeで必要なぼかし量を決めてから、境界の見え方や処理速度でFilterを選びます。

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

### 明るい窓だけをぼかし、同じ画面内の照明は残す

Bitmap MaskのChannelをLuminanceにすると、窓だけでなく明るい照明も選ばれます。Bitmap Maskの出力をRectangle Maskの青いEffect Mask入力につなぎ、Rectangle Maskを窓の位置へ合わせてPaint ModeをMultiplyにします。これにより「明るい」かつ「矩形内」という両方の条件を満たす範囲がMaskとして残ります。Rectangle Maskの出力をBlurのEffect Maskへつなげば、照明へのBlurを抑えられます。

### 二つのImageから作ったMaskを差し引く

Image AをBitmap Mask Aへ、Image BをBitmap Mask Bへ入力し、Bitmap Mask Aの出力をBitmap Mask Bの青いEffect Mask入力につなぎます。Bitmap Mask BでPaint ModeをSubtractにすると、Aが作ったMask値からBが作ったMask値が引かれます。差し引いた結果を後段のEffect Maskへ渡せば、Aで選んだ領域のうち、Bでも選ばれた部分だけ効果を除外できます。両Imageの寸法や位置が違う場合はFit InputとCenterを合わせてください。

### IDチャンネルを持つレンダー画像から選ぶ

Object ID / Material IDを含む3Dレンダー画像をBitmap MaskのInputへ入れ、Use Object / Use Materialで対象を選びます。出力をColor Correction等のEffect Maskへつなげば、背景と似た色の物体でもIDで区別して補正できます。必要なIDが元画像に保存されていることが前提です。

## Bitmap Maskを挟まなくてもよい場合

21.1 Manualでは、Effect Mask入力にImageを直接接続できる場合、Bitmap Maskは必須ではないと説明されています。

単純なEffect MaskならImageを直接接続し、処理を受けるNodeのCommon Settingsで使用するchannelを選択できます。Garbage MatteやPre-Maskのような別種のMask入力では、Bitmap Maskが必要になる場合があります。Thresholdによる切り詰め、Soft Edge、Maskの合成が必要ならBitmap Maskを挟みます。

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

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 108、pp.2463–2467で、Image / Effect Mask入力、Level、Soft Edge、Filter、Paint Mode、Fit Input、Channel、Threshold、Use Object / Use Materialの挙動を確認しました。運用例はこれらの仕様を組み合わせた構成例であり、21.1実機での再現は未確認です。

内部REGID、ID channelの生成方法、各Filterの実機差、Edition差は未確認のため `verification: partial` としています。
