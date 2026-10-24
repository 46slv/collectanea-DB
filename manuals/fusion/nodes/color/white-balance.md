---
title: White Balance
description: gray referenceまたはsource / target色温度を使い、Imageの色かぶりを補正する2D Color Node。
doc_type: node
term_id: white-balance
term_short: White Balanceは、gray referenceや色温度を基準に色かぶりを補正するNode。
verification: partial
aliases: [White Balance, WB]
concepts: [image-data, color-adjustment]
nodes: [White Balance]
node_family: color
controls: [Space, Method, Lock Black/Mid/White, Black/Mid/White Reference, Black/Mid/White Result, Temperature Reference, Temperature Result, Use Gamma, Ranges]
inputs: [image, mask]
outputs: [image]
tasks: [adjust-color, white-balance, color-temperature]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# White Balance

White Balanceは、2D <Term id="image">Image</Term>の色かぶりを、**本来grayであるpixel**または**撮影時と目標の色温度**を基準に補正するNodeです。

一般的なColor Correctorより目的が限定されているため、「まずneutralな色へ戻したい」という作業をGraph上で明確にできます。

## 役割

White Balanceは、入力Imageの色をneutralな基準へ合わせます。

```text
Image → White Balance → Output
             ↑
          Effect Mask
```

## 入力

### Input

オレンジ色の必須入力です。white balanceを調整する2D Imageを接続します。

### Effect Mask

青色の任意入力です。補正を適用する範囲を限定します。

21.1 ManualではEffect MaskはNode処理後に適用されると説明されています。

## 出力

white balance補正後の2D Imageを出力します。

## 主な設定項目

### Space

source Imageのcolor spaceが分かっている場合、そのspaceを指定します。

21.1 Manualでは、source color spaceを指定すると、そのspace固有のgammaを補正計算へ含められるため精度を上げられると説明されています。source spaceが分からない場合は既定値のまま使います。

### Method

補正方法を2種類から選びます。

- **Custom** — 本来neutral grayであるpixelをsampleして補正
- **Temperature** — sourceとtargetの色温度を指定して補正

## Custom method

### Black / Mid / White Reference

本来どの色であるべきか分かっているpixelをsource Imageからsampleします。

通常はneutral grayを基準にします。選んだReference colorがResult colorへ変わるように、Image全体のcolor balanceが補正されます。

### Black / Mid / White Result

Referenceとして選んだ色を、最終的に何色へ合わせるか指定します。

通常はneutralなgrayが基準です。

### Reference pixelの選び方

blackやwhite付近をsampleする場合、どれかのcolor channelがすでにclippingしているpixelは避けます。

たとえば見た目が白に近くてもRedだけ255でclippedしているpixelでは、補正に必要なcolor差を正しく判断できません。

## Temperature method

### Temperature Reference

source Imageが撮影された色温度を指定します。

### Temperature Result

補正後に目標とする色温度を指定します。

「撮影時が3200Kで、別の基準へ合わせる」のようにsource / targetが分かっている場合に使います。

### Use Gamma

Spaceで選択したcolor spaceのgammaを補正計算へ含めるかを指定します。

## Lock Black / Mid / White

有効にするとBlack / Midtones / Whiteをまとめて同じwhite balance補正で扱います。

無効にすると、暗部・中間部・明部へ別のReference / Resultを設定できます。

通常の全体white balanceではlockしたまま使い、tone rangeごとに色かぶりが異なる場合だけ分離して調整します。

## Ranges tab

Black / Midtones / Whiteの範囲をSplineで調整します。

shadow / midtone / highlightのどこを各white balance controlが担当するかを変えたい場合に使います。

## 最小構成

Custom methodでneutral grayを基準にする場合:

```text
MediaIn → White Balance → Output
```

1. Method = Custom
2. Lock Black / Mid / Whiteを有効
3. 本来grayであるpixelをReferenceとしてsample
4. Resultをneutral grayにする
5. Outputを確認

## 運用例

室内照明で全体が黄・橙方向へ寄ったshotにgray cardが写っている場合、gray cardのpixelをCustom Referenceとしてsampleします。

gray cardが本当にneutralへ戻ることを確認した後、必要ならColor Correctorでcreativeな色調整を追加します。

```text
MediaIn → White Balance → Color Corrector → Output
```

white balanceとcreative correctionを別Nodeにすると、どこでneutralへ戻し、どこからlookを作っているかを追いやすくなります。

## Color Correctorとの違い

- **White Balance** — gray reference / color temperatureを基準に色かぶりを補正
- **Color Corrector** — tone range別の色調整、Levels、Histogram Match、Suppress等を含む総合補正

white balanceが済んだ後にColor Correctorを使う構成は可能ですが、必ずこの順でなければならないという意味ではありません。Graphの目的に合わせて分けます。

## 関連する考え方

- [マスク（Mask）](../../learn/02-data/mask)
- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## 似たNode・関連Node

- [Color Corrector](./color-corrector) — 総合的なcolor correction
- [Brightness Contrast](./brightness-contrast) — 基本tone調整
- [Color Curves](./color-curves) — curveでchannel値をremap

## 実機例：参照と結果の色温度を分ける

<!-- capture-case:S73 -->

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の固定チャートを接続しました。両ViewerはColor／40%です。内部REGIDは`WhiteBalance`でした。左は入力、右はWhite Balanceの結果です。この例は設定の向きによる表示差を確認するもので、チャートの撮影色温度を測定した補正例ではありません。

[![LoaderからWhiteBalance1、MediaOut1へ接続した実機Graph](/img/fusion/captures/S73/graph.png)](/img/fusion/captures/S73/graph.png)

[![Temperature法、参照3200、結果6500、範囲ロックオンのWhite Balance Inspector](/img/fusion/captures/S73/inspector.png)](/img/fusion/captures/S73/inspector.png)

[![参照3200と結果6500では、右の白いパネルと灰色段階が青寄りになる](/img/fusion/captures/S73/compare.png)](/img/fusion/captures/S73/compare.png)

Temperature法、範囲ロックオンで、Temperature Reference3200／Result6500を指定すると、右の白いパネルや灰色段階が青寄りになりました。参照6500／結果3200へ逆にすると黄橙寄りになります。

[![参照6500、結果3200へ逆向きに設定したWhite Balance Inspector](/img/fusion/captures/S73/inverse-inspector.png)](/img/fusion/captures/S73/inverse-inspector.png)

[![参照6500と結果3200では、右の白いパネルと灰色段階が黄橙寄りになる](/img/fusion/captures/S73/inverse.png)](/img/fusion/captures/S73/inverse.png)

参照と結果をどちらも6500へ合わせると、左右のチャートが同じ見た目へ戻ります。

[![参照と結果をどちらも6500へ合わせたWhite Balance Inspector](/img/fusion/captures/S73/neutral-inspector.png)](/img/fusion/captures/S73/neutral-inspector.png)

[![参照と結果が6500で同じ場合は、左右のチャートが同じ見た目になる](/img/fusion/captures/S73/neutral.png)](/img/fusion/captures/S73/neutral.png)

撮影時のSpaceは初期表示のAdobe RGB (1998)、Use Gammaはオンを保ちました。素材に適した色空間の推奨値として示すものではありません。最後は参照3200／結果6500へ復元して保存しています。Custom法のピッカー、範囲ごとの独立調整、Ranges、他Space、Gammaオフ、Mask、実写の補正精度と性能は未確認です。

[再現用Graph](/img/fusion/captures/S73/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S73/capture.json)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 93、pp.2200–2202で、Image / Effect Mask入力、Space、Custom / Temperature method、Lock Black / Mid / White、Reference / Result、Temperature Reference / Result、Use Gamma、Ranges tabを確認しました。

source color spaceの選択肢一覧、色温度Controlの全数値範囲、内部変換式、実機性能、Edition差は未確認のため `verification: partial` としています。
