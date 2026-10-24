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
updated: "2026-10-12"
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

### Shadows / Highlightsは「明るさ」だけを意味しない

Shadows・Midtones・Highlightsという名前は明暗の選択を連想させますが、**実際にはChannelで選んだ値の低域・中域・高域**を取り出します。ChannelをLuminance以外へ変更した場合、この三つは必ずしも画面の暗部・中間調・明部には対応しません。

| Channel | Shadows（低い値）の例 | Highlights（高い値）の例 |
| --- | --- | --- |
| Luminance | 明るさの低い画素 | 明るさの高い画素 |
| Alpha | 透明に近い画素 | 不透明に近い画素 |
| Saturation | 彩度の低い画素 | 彩度の高い画素 |
| Red | 赤チャンネル値の低い画素 | 赤チャンネル値の高い画素 |

例えばAlphaのShadowsを選ぶと、暗い物体ではなく**透明に近い部分**が選ばれます。不透明な黒い物体はAlpha値が高いため、AlphaのHighlights側です。SaturationのHighlightsなら、暗い色でも彩度が高ければ選択対象になり得ます。

Hueを選択した場合も明るさの範囲ではなく色相のチャンネル値を判定します。特定の色に対応する範囲を決める前に、Ranges MaskをViewerで表示して選択結果を確認してください。

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

## 運用例3：彩度が高い部分だけを少し抑える

鮮やかな看板と彩度の低い壁が同時に写った映像で、看板の強い色だけを弱めたい場合です。

1. MediaInをColor CorrectorとRanges MaskのInputへ分岐させます。Ranges Maskは**補正前の映像**から判定させます。
2. Ranges MaskのChannelを**Saturation**、出力範囲を**Highlights**へ切り替えます。このHighlightsは「明るい部分」ではなく「彩度の高い部分」です。
3. Ranges MaskをViewerに表示し、看板が白に近く、壁が黒に近いか確認します。Mini Spline Editorで彩度の高い側への減衰を調整します。
4. Ranges Maskの出力をColor CorrectorのEffect Maskへ接続し、Color Correctorで彩度を少し下げます。
5. 他の鮮やかな物体まで変わる場合は、Rectangle MaskやPolygon MaskをMultiplyで組み合わせて場所も限定します。

選択結果は色の強さから決まります。**「看板」という物体を識別しているわけではない**ため、同程度に鮮やかな衣服なども選ばれる可能性があります。

## 選択結果が想定と違うとき

先にRanges Maskの出力をViewerへ表示し、**白く見える場所がどこか**を確認します。最初からColor Correctorの値を大きく動かすより、選択自体の誤りと補正の強さを分けて調べられます。

| 症状 | 確認・対処 |
| --- | --- |
| 暗い物体を選んだつもりが、透明部分を選んでいる | ChannelがAlphaになっていないか確認。暗い画素を選ぶならLuminanceのShadowsを起点にする |
| 明るさで選んだはずなのに彩度の高い色が選ばれる | ChannelがSaturationなどに変わっていないか確認。Shadows / Highlightsは選択Channelの値に対して働く |
| Midtonesが想定より広い、または狭い | Midtones固有の制御点はない。Mini Spline EditorのShadows・Highlights側の範囲とBézierハンドルを調整する |
| 背景の同じ明るさ・彩度にも効果が出る | Ranges Maskは画素値で選ぶ。Ellipse / Polygon MaskなどをMultiplyで重ねて場所を限定する |
| 境界に急な段差が残る | まずMini Spline Editorの減衰を確認し、必要ならSoft Edgeを加える。階調の判定と画面上のぼかしを分けて調整する |
| Maskの位置や大きさがずれる | 判定に使う画像とMaskの出力寸法を比較し、Fit Input・Center X/Yを確認する |
| 動く被写体からMaskが外れる | Ranges Maskは形状を追跡しない。併用する形状Maskをキーフレーム等で追従させる |
| 効果の有無が分からない | Color CorrectorのEffect Maskへ接続しているか、Ranges MaskのLevelと出力範囲、後段の効果量をそれぞれ確認する |

**切り分けの順序**は、①Channel → ②Shadows / Midtones / Highlights → ③Splineの減衰 → ④位置・寸法と併用Mask → ⑤Soft Edge・Level → ⑥後段のEffect Mask接続です。この順なら「どの画素を選ぶか」と「選んだ場所へどれだけ処理をかけるか」を混同しにくくなります。

## 似たMaskとの使い分け

- [Bitmap Mask](./bitmap-mask)：チャンネル値や閾値からMaskを作る。AlphaやID情報を使いたい場合にも向く。
- **Ranges Mask**：低・中・高の階調範囲をSplineで設計し、境界の重み付けを調整する。
- [Wand Mask](./wand-mask)：Viewerで指定した点から、色の近い連続領域を選ぶ。
- [Polygon Mask](./polygon-mask)：画素値ではなく、手描きの輪郭で場所を指定する。

Mask同士の合成は[Maskノードの概要](./index.md)、基本概念は[マスク（Mask）](../../learn/02-data/mask)も参照してください。

## 実機例：低域・中域・高域のMaskを比べる

<!-- capture-case:S78 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%で撮影しました。チャートをRanges Maskへ入力し、出力したMaskをオレンジ色のBackgroundのEffect Maskへ接続しています。内部REGIDは`RangesMask`、ImageとEffect Maskの2入力を確認しました。

[![チャートからRanges Maskを作りオレンジBackgroundの青いEffect Mask入力へ渡す実機Graph](/img/fusion/captures/S78/graph.png)](/img/fusion/captures/S78/graph.png)

[![LuminanceとHighlightsを選び初期の範囲カーブを表示したRanges Mask Inspector](/img/fusion/captures/S78/inspector.png)](/img/fusion/captures/S78/inspector.png)

[![左のHighlights Maskで白い部分に対応して右のオレンジBackgroundが残り暗部が透明になる](/img/fusion/captures/S78/compare.png)](/img/fusion/captures/S78/compare.png)

上の左はHighlightsのMask、右はそれを適用したBackgroundです。白いパネルや外枠は強く選ばれ、暗い背景はほぼ選ばれていません。範囲はLuminanceを基準に判定しており、画像内の物体を認識しているわけではありません。

次の3枚は左を入力チャート、右をBackgroundに揃え、ChannelをLuminance、カーブを同じ状態に保った比較です。最初に表示されたShadowsでは暗い背景がオレンジで埋まり、白いパネル部分は透明になりました。

[![LuminanceのShadowsを選んだRanges Mask Inspector](/img/fusion/captures/S78/shadows-inspector.png)](/img/fusion/captures/S78/shadows-inspector.png)

[![Shadowsでは左チャートの暗い背景に対応する右側がオレンジで埋まり白いパネルは透明になる](/img/fusion/captures/S78/shadows.png)](/img/fusion/captures/S78/shadows.png)

Midtonesへ切り替えると中間の色パッチや階調にオレンジが残り、白いパネルや暗い背景への適用は弱まりました。

[![同じカーブでMidtonesへ切り替えたRanges Mask Inspector](/img/fusion/captures/S78/midtones-inspector.png)](/img/fusion/captures/S78/midtones-inspector.png)

[![Midtonesでは中間の色パッチや階調にオレンジが残り白いパネルと暗背景の適用が弱くなる](/img/fusion/captures/S78/midtones.png)](/img/fusion/captures/S78/midtones.png)

Highlightsでは白いパネルや枠が残り、暗い背景は透明になります。各領域には灰色の重みもあり、すべての画素を白か黒へ二分したMaskではありません。

[![Highlightsでは右に白いパネルや枠の形がオレンジで残り暗い背景は透明になる](/img/fusion/captures/S78/highlights.png)](/img/fusion/captures/S78/highlights.png)

下は右にRanges Mask単体を表示したものです。後段の色や強さで選択結果が分かりにくい場合は、この中間Maskを見て、白・灰・黒の場所を確認します。

[![左のチャートからRanges Maskが抽出したHighlightsを右に白灰黒で表示している](/img/fusion/captures/S78/mask.png)](/img/fusion/captures/S78/mask.png)

Level1、Soft Edge0、Center0.5／0.5、Fit Input Cropを保ち、操作ガイドはShow View Controlsをオフにしました。今回作成したノードのFilter初期表示はFast Gaussianでした。最後はLuminance／Highlights、左Ranges Mask／右Background、フレーム0、両Viewer40%へ戻して保存しています。

カーブの手動編集、Simple／Smoothの切替結果、Luminance以外のChannel、Invert、Soft Edge・Levelの変更、別Maskとの合成、異なる寸法、実写の色補正、数値出力と性能は未確認です。上の運用例すべてを再現した撮影ではありません。

[再現用Graph](/img/fusion/captures/S78/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S78/capture.json)

## 出典と確認範囲

**DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 108「Mask Nodes」、**pp.2485–2490**で、Input / Effect Mask、Channel、Shadows / Midtones / Highlights、Mini Spline Editor、Presets、Level、Filter、Soft Edge、Paint Mode、Invert、Center、Fit Inputを確認しました。

S78でREGID、Luminanceの3領域、中間Mask、BackgroundへのEffect Mask接続を実機確認しました。全Control・範囲・Edition差は未確認のため、`verification: partial`を維持しています。
