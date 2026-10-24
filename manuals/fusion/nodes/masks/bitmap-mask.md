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


## LuminanceとAlphaを区別して選ぶ

同じ画像からMaskを作っても、Channelが**Luminance**か**Alpha**かで白くなる場所が変わります。

| 入力画像の状態 | Channel: Luminance | Channel: Alpha |
| --- | --- | --- |
| 黒く塗られた不透明な画素 | 暗いので低い値 | 不透明なので高い値 |
| 白く塗られた不透明な画素 | 明るいので高い値 | 不透明なので高い値 |
| 透明な部分 | RGBの格納方法やAlphaの扱いに左右される | 透明なので低い値 |

**人物やテキストの切り抜き形状を使うならAlpha**、**明るい場所を選ぶならLuminance**が基本です。「黒い場所がMaskでも黒い」とは限りません。不透明な黒い画素は、Alphaでは白い領域として扱われます。

たとえば、別の透過素材にある文字の形に合わせて背景の色補正をかける場合は、次のように接続します。

~~~text
MediaIn1（背景の映像） ─────────────────────→ ColorCorrector1 → MediaOut
MediaIn2（Alpha付き文字素材） → BitmapMask1 ──→ ColorCorrector1［Effect Mask］
                                    Channel: Alpha
~~~

1. 背景映像をColorCorrector1のImage入力へつなぎ、色の変化が分かるように調整します。
2. 透過部分を持つ文字素材をBitmapMask1のオレンジ色のInputへつなぎます。
3. BitmapMask1のChannelを**Alpha**にし、出力をViewerへ表示します。文字の形が白く、それ以外が黒いことを確認します。
4. BitmapMask1の出力をColorCorrector1の青いEffect Mask入力へつなぎます。色補正は文字の形に対応した範囲だけに適用されます。

この例では、MediaIn2の文字そのものを合成していません。**文字素材の透明度を「背景のどこを色補正するか」という範囲指定に利用**しています。MediaIn2のAlphaが全面1なら、BitmapMask1も全面白に近くなり、文字形状の限定には使えません。元素材のAlphaを先にViewerで確かめます。

## Thresholdで何を変えているか

Luminanceの値が0.2、0.5、0.9の場所を想定します。Threshold Lowを0.4へ上げると0.2の画素は黒側へ切り詰められ、Threshold Highを0.7へ下げると0.9の画素は白側へ切り詰められます。一方、LowとHighの間をすべて黒にする「明るさの帯だけの抽出」ではありません。

したがって「中間の明るさだけを残し、暗部もハイライトも除外したい」場合は、[Ranges Mask](./ranges-mask)で明暗域の選択を調整する方が適しています。Thresholdは元Channelの**下端と上端を制限する**操作として使い、Viewerでマスク値の残り方を確認してください。

## 意図した領域にならないとき

| 症状 | まず確認すること |
| --- | --- |
| 黒い物体まで白く選ばれる | ChannelがAlphaになっていないか。不透明な黒はAlphaでは高い値になる |
| 透過素材の輪郭が出ない | ChannelがLuminanceのままではないか。元ImageのAlphaが実際に部分透明か |
| 明るい窓だけのつもりが照明も選ばれる | Luminanceは位置を区別しない。Rectangle / Polygon MaskとMultiplyで範囲を限定する |
| 画像サイズを変えると選択位置がずれる | Fit Input、Center X / Y、マスクのOutput Sizeを確認する |
| Maskは正しいのに処理が全面に適用される | Bitmap Maskの出力が対象NodeのEffect Mask入力に接続されているか |
| 境界が硬い、または周囲まで広がりすぎる | Soft EdgeとFilterを確認する。Levelでは輪郭だけをぼかせない |
| IDによる選択が効かない | 元ImageにObject / Material ID channelが含まれているか |

問題を調べる順序は、**元ImageのRGBとAlpha → Bitmap Mask単体の白黒 → 後段NodeのEffect Mask接続 → 最終出力**です。マスクが正しいか確かめる前に後段の色補正やBlurを調整すると、原因を切り分けにくくなります。

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

## 実機例：ImageのAlphaとLuminanceからMaskを作る

<!-- capture-case:S77 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%の固定例です。チャートから作ったBitmap Maskを、オレンジ色のBackgroundのEffect Maskへ接続しました。元画像のRGBをBackgroundへコピーせず、どこを不透明にするかをMaskで指定しています。内部REGIDは`BitmapMask`、ImageとEffect Maskの2入力を確認しました。

[![チャートからBitmap Maskを作り、その出力をオレンジBackgroundの青いEffect Mask入力へ接続した実機Graph](/img/fusion/captures/S77/graph.png)](/img/fusion/captures/S77/graph.png)

[![Luminance、Threshold下限0.25と上限0.75、InvertオフのBitmap Mask Inspector](/img/fusion/captures/S77/inspector.png)](/img/fusion/captures/S77/inspector.png)

[![左の白灰黒Maskに応じて、右のオレンジBackgroundに不透明と透明の模様が現れる](/img/fusion/captures/S77/compare.png)](/img/fusion/captures/S77/compare.png)

上の左はBitmap Mask単体、右はMaskを適用したBackgroundです。ChannelをLuminance、Thresholdを下限0.25／上限0.75にすると、明るいパネルや枠の形がオレンジに残り、暗い背景は透明になります。白灰黒のMaskと、色を持つImageの出力を区別して見ます。

最初のChannelはAlphaでした。不透明なチャートを使っているため、Threshold0／1ではMaskが全面選択となり、右にオレンジが全面表示されます。入力に黒い場所があっても、その画素が不透明ならAlphaは低くなりません。

[![初期Channel Alpha、Threshold0から1を示すBitmap Mask Inspector](/img/fusion/captures/S77/default-inspector.png)](/img/fusion/captures/S77/default-inspector.png)

[![不透明な入力チャートのAlphaを使うと右のオレンジBackgroundが全面表示になる](/img/fusion/captures/S77/default.png)](/img/fusion/captures/S77/default.png)

Threshold0／1を保ち、ChannelだけLuminanceへ変えると、チャートの明るさに応じた模様が現れました。LuminanceとAlphaで同じ範囲を選べるとは限りません。

[![ChannelだけLuminanceへ変え、Threshold0から1を保ったInspector](/img/fusion/captures/S77/luminance-inspector.png)](/img/fusion/captures/S77/luminance-inspector.png)

[![左のチャートの明るさに応じ、右のオレンジBackgroundの透明度に模様が現れる](/img/fusion/captures/S77/luminance.png)](/img/fusion/captures/S77/luminance.png)

Threshold0.25／0.75へ戻し、Invertだけオンにすると選択が反転します。暗い背景側がオレンジで埋まり、白いパネルに対応する部分が透明になりました。

[![LuminanceとThreshold0.25から0.75を保ちInvertをオンにしたInspector](/img/fusion/captures/S77/inverse-inspector.png)](/img/fusion/captures/S77/inverse-inspector.png)

[![Invertオンでは右の暗背景側がオレンジで埋まり、白いパネル部分が透明になる](/img/fusion/captures/S77/inverse.png)](/img/fusion/captures/S77/inverse.png)

下はInvertをオフに戻し、右にBitmap Mask単体を表示したものです。入力Colorの色パッチが、明るさに応じた白・灰・黒へ変わっています。後段の結果だけで原因を判断せず、この中間Maskを確認します。

[![左は入力チャートのColor、右はBitmap Maskが出力した白灰黒の単一チャンネルMask](/img/fusion/captures/S77/mask.png)](/img/fusion/captures/S77/mask.png)

Level1、Soft Edge0、Filterの初期表示Fast Gaussianを保ち、操作ガイドはShow View Controlsをオフにして撮影しました。最後はLuminance、Threshold0.25／0.75、Invertオフ、左Bitmap Mask／右Backgroundの比較へ戻して保存しています。

この例では背景色の生成にMaskを使いました。BlurやColor Corrector、Shape→sRenderの入力、Paint Modeでの別Mask合成、Soft Edge／Levelの変更、Fit Input／Center、異なる寸法、ID／Coverage、実写と性能は未確認です。

[再現用Graph](/img/fusion/captures/S77/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S77/capture.json)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 108、pp.2463–2467で、Image / Effect Mask入力、Level、Soft Edge、Filter、Paint Mode、Fit Input、Channel、Threshold、Use Object / Use Materialの挙動を確認しました。S77で固定チャートのAlpha／Luminance、Threshold、InvertとBackgroundへのEffect Mask接続を確認しました。窓・照明・透過文字・Shapeなどの運用例は、この固定例の確認範囲に含めていません。

REGIDは上の実機例で確認しました。ID channelの生成方法、各Filterの実機差、Edition差は未確認のため `verification: partial` としています。
