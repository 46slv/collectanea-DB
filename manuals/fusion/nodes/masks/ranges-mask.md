---
title: Ranges Mask
description: 2D画像の暗部・中間調・明部をSplineで選び、色補正などの適用範囲を表すMaskを作るFusionノード。
doc_type: node
term_id: ranges-mask
term_short: 画像の暗部・中間調・明部の範囲を曲線で調整し、効果の適用範囲をMaskとして出力するノード。
verification: partial
aliases: [Ranges Mask, RNG]
concepts: [mask-data, image-data, tonal-range]
nodes: [Ranges Mask]
node_family: masks
controls: [Show View Controls, Level, Filter, Soft Edge, Paint Mode, Invert, Center X/Y, Fit Input, Channel, Shadows/Midtones/Highlights, Mini Spline Editor, Presets]
inputs: [image, mask]
outputs: [mask]
tasks: [create-mask, tonal-mask, isolate-luminance]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Ranges Mask

Ranges Maskは、入力画像の明るさやチャンネル値を調べ、**暗部（Shadows）・中間調（Midtones）・明部（Highlights）のどこに効果をかけるか**を表す<Term id="mask">Mask</Term>を作るノードです。

例えば、雲の明るい部分だけ色を調整したい場合、画像をRanges Maskへ入力してHighlightsを選びます。出力したMaskをColor CorrectorのEffect Maskへ接続すると、色補正を明部中心に適用できます。Ranges Mask自体は画像の色を変えません。

選択する階調の境界はMini Spline Editorで調整します。単純な白黒の閾値とは異なり、ある階調から別の階調へ効果が徐々に変化するように設計できます。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input（オレンジ）** | 2D Image | 明るさやチャンネル値を判定する画像 |
| **Effect Mask（青、任意）** | Mask | 別のMaskと選択結果を合成する |
| **出力** | 単一チャンネルのMask | 後段ノードのEffect Mask入力へ渡す |

入力がカラー画像でも、出力は画像を加工したRGBA画像ではなく、**各画素への処理のかかり具合を示すMask**です。[ImageとMaskの違い](../../learn/02-data/image-mask-data)も参照してください。

```text
MediaIn ─────────────→ Color Corrector ─→ MediaOut
   └→ Ranges Mask ───────────↑ Effect Mask
```

MediaInから二つに分岐し、一方をColor Correctorの画像入力へ、もう一方をRanges MaskのInputへ接続します。Ranges Maskの出力はColor Correctorの青いEffect Mask入力へ接続します。画像を補正する処理と、どこを補正するかの判定を独立して調整できます。

## 階調範囲を決める

### Channel

どの画像情報をもとに階調を判定するか選びます。21.1のマニュアルにはRed・Green・Blue・Alpha・Hue・Luminance・Saturationと、入力画像に含まれる場合の補助Coverageチャンネルが挙げられています。範囲を調整する画面にもチャンネル選択があり、通常はLuminanceが基準です。

Luminanceを使えば明るさで、Redを使えば赤チャンネルの値で範囲を判定します。画面内の特定の色そのものを選ぶWand Maskとは異なるので、同じ結果になるとは限りません。

### Shadows / Midtones / Highlights

選択したボタンに応じて出力するMaskを切り替えます。

- **Shadows**：選択チャンネルの低い値を中心に選ぶ。暗部だけの色調整などに使う。
- **Midtones**：暗部と明部の間を選ぶ。黒つぶれ部分や強いハイライトへの影響を抑えながら中間調を調整するときに使う。
- **Highlights**：高い値を中心に選ぶ。白く明るい部分だけにグローや色補正をかけるときに使う。

出力Maskでは白が強い適用、黒が非適用、中間のグレーが部分的な適用を意味します。画像の見た目を白黒に変換する機能ではありません。

### Mini Spline Editor

曲線には**四つの制御点**があり、それぞれにBézierハンドルがあります。上側の二つがShadows・Highlightsの範囲の始まり、下側の二つが範囲の終わりを決めます。ハンドルで、完全に選ぶ範囲から選ばない範囲への減衰を変えます。

Midtones専用の制御点はありません。ShadowsとHighlightsの間がMidtonesになるため、両端の形を変えると中間調の選択も変わります。

選択した制御点・ハンドルの位置は、Editorの**X / Y**欄から数値で指定できます。似た条件のカットを揃えたい場合は値も確認してください。

**Presets**にはSimpleとSmoothがあります。Simpleは直線的な重み付け、Smoothはより滑らかな減衰の基準形状です。まずPresetを選んでから曲線を調整すると比較しやすくなります。

## 出力Maskの調整

### Level

Maskの値を下げ、後段の効果を弱めます。白い部分でもLevelを下げれば完全な白ではなくなります。別Maskと組み合わせた場合は結果全体への影響をViewerで確認してください。

### Soft EdgeとFilter

**Splineのハンドル**は「どのチャンネル値をどの程度選ぶか」を調整します。一方、**Soft Edge**は生成したMaskの画面上の境界をぼかします。階調の選択が硬い場合は先にSplineを調整し、境界が画面上で目立つときにSoft Edgeを補います。

FilterはSoft Edgeの計算方式を選びます。マニュアルにはBox、Bartlett、Multi-box、Gaussianがあります。Multi-boxを選ぶとNum Passesが表示され、ぼかしの回数を調整できます。

### Fit Input・Center X / Y

判定用画像と生成するMaskの寸法が異なる場合、**Fit Input**で元画像をどう収めるかを指定します。Cropは元の大きさを基準に切り取り、Stretchは縦横を伸縮します。Inside、Width、Height、Outsideは縦横比を保ちながら、それぞれ収め方や幅・高さへの合わせ方を変えます。

**Center X / Y**でMaskの位置を調整します。異なる解像度の画像を判定に使う場合は、選択結果と補正対象の位置がずれていないか確認してください。

### Paint ModeとInvert

青いEffect Mask入力へ別のMaskをつなぐと、**Paint Mode**で二つを合成できます。例えばMultiplyではMask値を掛け合わせて共通部分を残し、Subtractでは入力MaskからRanges Maskが作るMaskを引きます。Addは値を加算、Maximumは大きい方の値を選び、Copyは新しいMaskだけ、Ignoreは入力Maskだけを使います。

Merge、Minimum、Average、Replace、Invertも選択できます。**Paint ModeのInvert**は新しいMaskが重なる部分の入力Maskを反転しますが、**Invertチェックボックス**は出力Mask全体を反転します。この二つは別の操作です。

## 運用例1：明部だけに色補正をかける

白い雲を含む風景映像で、明るい部分だけを少し暖色にする例です。

1. MediaInをColor CorrectorとRanges MaskのInputへ分岐させます。
2. Ranges MaskのChannelをLuminance、対象をHighlightsにします。
3. Mini Spline Editorで中間調から明部への減衰を調整し、雲の明部が白、空や地面が暗めに出るようにします。
4. Ranges Maskの出力をColor CorrectorのEffect Maskへ接続し、Color Corrector側で色を調整します。
5. 選択の境界が目立つ場合はSplineを見直し、必要なときだけSoft Edgeを追加します。

雲以外に明るいものがあれば、そこにも補正が及びます。**Ranges Maskは「雲」という物体を認識するわけではありません**。被写体を限定したい場合は別のMaskを組み合わせます。

## 運用例2：顔の中間調だけを調整する

人物の顔の中間調を調整し、背景の同じ階調には影響を与えたくない場合です。

```text
MediaIn → Color Corrector → MediaOut
    └→ Ranges Mask (Input)

Ellipse Mask → Ranges Mask (Effect Mask)
                Paint Mode: Multiply

Ranges Mask (output) → Color Corrector (Effect Mask)
```

1. [Ellipse Mask](./ellipse-mask)で顔の周囲を囲み、必要ならSoft Edgeを加えます。
2. Ranges MaskへMediaInの映像を入力し、Midtonesを選びます。
3. Ellipse MaskをRanges Maskの青いEffect Maskへ接続し、Paint ModeをMultiplyにします。
4. Ranges Maskが選ぶ中間調とEllipse Maskの顔領域が重なる場所だけにColor Correctorの処理がかかります。

人物が動く場合は、Ellipse Maskの位置をキーフレームなどで追従させる必要があります。Ranges Mask自体は顔の位置を追跡しません。

## 似たMaskとの使い分け

- [Bitmap Mask](./bitmap-mask)：チャンネル値や閾値からMaskを作る。AlphaやID情報を使いたい場合にも向く。
- **Ranges Mask**：低・中・高の階調範囲をSplineで設計し、境界の重み付けを調整する。
- [Wand Mask](./wand-mask)：Viewerで指定した点から、色の近い連続領域を選ぶ。
- [Polygon Mask](./polygon-mask)：画素値ではなく、手描きの輪郭で場所を指定する。

Mask同士の合成は[Maskノードの概要](./index)、基本概念は[マスク（Mask）](../../learn/02-data/mask)も参照してください。

## 出典と確認範囲

**DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 108「Mask Nodes」、**pp.2485–2490**で、Input / Effect Mask、Channel、Shadows / Midtones / Highlights、Mini Spline Editor、Presets、Level、Filter、Soft Edge、Paint Mode、Invert、Center、Fit Inputを確認しました。

内部REGID、Inspector設定の細かなデフォルト値や範囲、Edition別の挙動は実機確認していないため、`verification: partial`を維持しています。
