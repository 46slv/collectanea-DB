---
title: "Time Speed"
description: "一定の速度比率・逆再生・時間オフセットを指定してImage sequenceをリタイムするFusion Node。"
doc_type: node
term_id: "time-speed"
term_short: "Time Speedは、一定の速度比率でImage sequenceを速く・遅く・逆再生し、必要に応じて時間オフセットや補間方式も指定するNode。"
verification: partial
aliases: ["Time Speed", "TSpd"]
concepts: ["image-data"]
nodes: ["Time Speed"]
node_family: "time-metadata"
inputs: ["image"]
outputs: ["image"]
tasks: ["retime"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-20"
---

# Time Speed

Time Speedは、**Image sequenceを一定の速度比率で再生し直す**ためのNodeです。素材を半速にする、2倍速にする、逆再生する、数frameぶん時間をずらす、といった「速度が途中で変化しない」リタイムに向いています。

速度を時間とともに変えるspeed rampや、途中で止めてから逆再生するといった非線形なリタイムには、[Time Stretcher](./time-stretcher.md)を使います。

## 入力と出力

- **Input**: 2D Image 1系統。orange inputへ、リタイムしたいImageを接続します。
- **Output**: リタイム後の2D Image。

Time Speed自身はOptical Flowを生成しません。後述する`Flow`補間を使う場合は、前段でOptical Flowを作るか、Forward / Reverse vector channelを含むImageを入力します。

## 何が変わるか

Time Speedは、current frameで「sourceのどのframeを読むか」を一定の速度比率と時間オフセットから決めます。BlurやColor Correctionのように同じframeの画素を加工するNodeではなく、**時間方向のsamplingを変えるNode**です。

たとえば`Speed = 0.5`なら50%速度、`Speed = 2.0`なら200%速度です。負の値を指定すると逆再生になります。`Speed`はanimated parameterではないため、速度を途中で変える用途にはTime Stretcherを使います。

## 主なControls

### Speed

出力するImage sequenceの速度を倍率で指定します。

- `1.0`: 100%
- `0.5`: 50%
- `2.0`: 200%
- 負の値: 逆再生

DaVinci Resolve 21.1 Reference Manualでは、Time Speedの`Speed`はanimation不可とされています。

### Delay

Image sequenceの時間位置をframe単位でずらします。21.1 Manualは負の値でtimeを後方へoffsetし、正の値で前方へadvanceすると表現しています。以下の実機例では、出力フレームを固定したときに実際に読む素材番号で向きを確認します。

単純な「速度は変えず、映像だけ数frameずらしたい」場合にも使えます。

### Interpolate Mode

速度変更によってsource frameとoutput frameが1対1で対応しなくなったとき、どのようにframeを補うかを選びます。

- **Nearest**: frameをdrop / duplicateする最も軽い方式。動きは段階的になりやすい一方、余計なblendやmotion estimationを行いません。
- **Blend**: 隣接frameをblendして、Nearestより滑らかな見た目を作ります。
- **Flow**: Optical Flowのvector channelを使って中間frameを生成します。最も計算量が大きい方式ですが、直線的で推定しやすい動きでは滑らかな結果を得やすくなります。

`Flow`はTime Speed内でmotion vectorを解析する方式ではありません。**前段のOptical Flow等でvectorを用意する必要があります。**

人物や物体が交差するshot、複雑なocclusion、予測しにくいcamera movementでは、Flowでもwarp artifactが出ることがあります。

### Blend時: Sample Spread

`Interpolate Mode = Blend`のときだけ表示されます。前後frameをcurrent frameへどの程度混ぜるかを調整します。

### Flow時: Depth Ordering

`Interpolate Mode = Flow`のときだけ表示されます。motion vectorの速さを手掛かりに、どちらの領域を手前として描画するかを選びます。

たとえば固定cameraで車だけが横切るshotでは、背景より車のvectorが速くなりやすいため`Fastest on Top`が合う場合があります。cameraが車を追ってpanしているshotでは背景側のvectorが速くなるため、`Slowest on Top`が合う場合があります。

### Flow時: Clamp Edges / Edge Softness

frame補間によって画面端に透明な隙間が出る場合、`Clamp Edges`で端を埋められます。ただし、端のpixelを引き伸ばしたようなartifactが出ることがあります。

`Edge Softness`は、そのstretch artifactを目立ちにくくするためのControlです。Clamp Edgesを常時有効にするのではなく、画面端の小さなgapを補正するときに使います。

### Flow時: Source Frame and Warp Direction

どのsource frameとvector directionを中間frame生成に使うかを指定します。21.1 Manualでは次の4方式が記載されています。

- `Prev Forward`
- `Next Forward`
- `Prev Backward`
- `Next Backward`

複数を有効にした場合は、それぞれの結果がblendされます。

### Freeze Frame

現在選択しているframeで再生を止めるように、`Speed`と`Delay`を自動調整します。

## 具体的な使い方

### 一定のslow motion

    MediaIn → Time Speed → 後段処理

`Speed = 0.5`にすると、source sequenceを50%速度で読みます。まずNearest / Blendで結果を確認し、より滑らかな補間が必要ならOptical Flowを前段に追加してFlowへ切り替えます。

### 実機で速度とDelayを比べる

Resolve Studio 21.1.0.14、Windows、日本語UIで、S39と同じ番号入り100枚の連番を読み込みました。出力フレーム24を固定し、速度とDelayを別々に変更しています。補間はBlend、Sample Spreadは0、両ViewerはColor／40%です。

[![番号入り連番LoaderからTimeSpeed1を経由してMediaOut1へ接続した実機Graph](/img/fusion/captures/S40/graph.png)](/img/fusion/captures/S40/graph.png)

[![TimeSpeed1のSpeedは0.5、Delayは0、補間はBlend、Sample Spreadは0](/img/fusion/captures/S40/inspector.png)](/img/fusion/captures/S40/inspector.png)

[![出力フレーム24、左の入力はSOURCE 024、右の半速出力はSOURCE 012](/img/fusion/captures/S40/compare.png)](/img/fusion/captures/S40/compare.png)

[![Speedだけを2.0へ変更したTimeSpeed1のInspector。Delayは0](/img/fusion/captures/S40/fast-inspector.png)](/img/fusion/captures/S40/fast-inspector.png)

[![出力フレーム24、左はSOURCE 024、右の2倍速出力はSOURCE 048](/img/fusion/captures/S40/fast.png)](/img/fusion/captures/S40/fast.png)

Speed 0.5では素材12、Speed 2.0では素材48を表示しました。次はSpeedを1.0に戻し、Delayだけを変えています。

[![Speed 1.0、Delay +6のInspector](/img/fusion/captures/S40/delay-inspector.png)](/img/fusion/captures/S40/delay-inspector.png)

[![出力フレーム24、左はSOURCE 024、Delay +6の右出力はSOURCE 018](/img/fusion/captures/S40/delay.png)](/img/fusion/captures/S40/delay.png)

[![Speed 1.0、Delay −6のInspector](/img/fusion/captures/S40/advance-inspector.png)](/img/fusion/captures/S40/advance-inspector.png)

[![出力フレーム24、左はSOURCE 024、Delay −6の右出力はSOURCE 030](/img/fusion/captures/S40/advance.png)](/img/fusion/captures/S40/advance.png)

| 出力フレーム | Speed | Delay | 右Viewerの素材番号 |
| ---: | ---: | ---: | ---: |
| 24 | 0.5 | 0 | 12 |
| 24 | 2.0 | 0 | 48 |
| 24 | 1.0 | +6 | 18 |
| 24 | 1.0 | −6 | 30 |

この条件では、正のDelayは同じ出力時刻で前の素材フレームを読み、負のDelayは先の素材フレームを読みました。「advance」という語だけで参照番号が増えると判断せず、入力と出力を同じ時刻で比較してください。

### 逆再生

`Speed`へ負の値を指定するとreverse playbackになります。一定速度の逆再生ならTime Speedだけで完結します。

### 実機で逆再生とFreeze Frameを確認する

Speed −1.0、Delay −48のまま出力を0→24へ進めると、右の素材番号は52→28へ減りました。次の例はこの固定条件での観察です。速度が負の場合の参照位置の一般式や、範囲外の処理までは検証していません。

[![逆再生のSpeed −1.0、Delay −48を指定したInspector](/img/fusion/captures/S40/reverse-inspector.png)](/img/fusion/captures/S40/reverse-inspector.png)

[![逆再生で出力0を表示。左はSOURCE 000、右はSOURCE 052](/img/fusion/captures/S40/reverse0.png)](/img/fusion/captures/S40/reverse0.png)

[![同じ逆再生設定で出力24を表示。左はSOURCE 024、右はSOURCE 028](/img/fusion/captures/S40/reverse24.png)](/img/fusion/captures/S40/reverse24.png)

Freeze Frameは別に確認しました。出力24、Speed 1、Delay +6で素材18を表示している状態からボタンを押すと、Speed 0／Delay −24になり、素材24を表示しました。現在の右Viewerに出ている素材18を固定する動作と取り違えないでください。撮影した日本語UIでは、Inspector下部のこのボタンは「入力」と表示されています。

[![出力24でFreeze Frameを押した後のInspector。Speed 0、Delay −24](/img/fusion/captures/S40/freeze-inspector.png)](/img/fusion/captures/S40/freeze-inspector.png)

[![Freeze Frame直後の出力24。左入力と右出力がともにSOURCE 024](/img/fusion/captures/S40/freeze.png)](/img/fusion/captures/S40/freeze.png)

[![出力を0へ移動しても右はSOURCE 024に固定。左の入力はSOURCE 000](/img/fusion/captures/S40/freeze0.png)](/img/fusion/captures/S40/freeze0.png)

出力0へ移動しても右は素材24のままです。最後はSpeed 0.5、Delay 0、出力24へ戻しました。Nearest／Flowの画質、Optical FlowやEXR再利用、Free edition、書き出し性能は未確認です。

[再現用Graph](/img/fusion/captures/S40/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S40/capture.json)

### Optical Flowを使ったretime

    MediaIn → Optical Flow → Time Speed（Flow） → Result

`Interpolate Mode = Flow`では、現在frameから次frameへの`Vector`と、前frameへの`BackVector`を使って中間frameを作ります。Time Speed自身はベクトルを解析しません。前段でOptical Flowを生成するか、保存済みのベクトルを入力します。

#### 直結しただけでは、解析が1回で済むとは限らない

21.1 Reference ManualのOptical Flow節（p.2618）は、Optical FlowをTime Speedへ直結すると**Optical Flowが2回レンダーされる**と説明しています。Time Speedが要求するレイヤー順は`A. FwdVec → B. BackVec`で、Optical Flowが処理時に生成する順序は`A. BackVec → A. FwdVec`と記載されています。前段にOptical Flowがあるだけで、余分な解析を避けられるとは限りません。

同じ解析を繰り返し使いたい場合は、Optical Flowの出力をSaverでOpenEXR連番へ保存し、Loaderから読み直す方法があります。

    MediaIn → Optical Flow → Saver（OpenEXR連番）
    Loader（OpenEXR連番） → Time Speed（Flow） → MediaOut

ただし、**EXRを保存しただけでは、Flow補間で再解析が不要になる保証はありません**。保存したベクトルが読めることと、Time Speedが再解析せずに使えたことを別々に確認します。

1. LoaderのFormatで保存されたチャンネルを確認し、`Vector`と`BackVector`の両方を割り当てます。Copy Auxを確認専用の枝に接続すればX/YをRGBAへコピーして数値を比較できます。レイヤー表記だけからチャンネル名や符号を推測しないでください。
2. 前後のframeがある区間でベクトル値を確かめます。最初のframeに前のframeがない場合は`BackVector`、最後のframeに次のframeがない場合は`Vector`が0になります。Proxy表示中でもベクトル値は**元の解像度を基準にしたピクセル移動量**です（Chapter 87、pp.1909–1910）。
3. 直結構成とEXR再読込構成で同じ区間の結果と処理時間を比較します。EXRにベクトルが保持されていても、追加の解析が消えたと断定しないでください。

詳しい保存・再読込・Copy Auxでの確認手順は[Optical FlowをEXRに保存・再利用するレシピ](../../recipes/animation/optical-flow-exr-roundtrip.md)にまとめています。

Time Speedはaux channelを補間して保持せず、処理後にVector / BackVectorを破棄します。**リタイム後にもmotion vectorが必要なら、Time Speedの後段でOptical Flowを再生成します。**

## Time Stretcherとの使い分け

Time Speedを選ぶ基準は「一定の速度」です。

- 素材全体を50%にする
- 2倍速にする
- 一定速度で逆再生する
- 数frameのdelayを加える

このような処理はTime Speedが直接的です。

一方、速度を徐々に上げる、途中で停止する、再開後にreverseするといった**時間に応じてsource timeを変化させる処理**は[Time Stretcher](./time-stretcher.md)の担当です。

## 注意点

- Flowを選んでもTime Speed自身はOptical Flowを生成しません。
- Flowはmotion estimationが難しいshotではartifactが出ることがあります。
- Time Speedはaux channelをそのままretimeして保持する用途には向きません。
- network renderでは前後frameを取得する必要があるため、Time Speed / Time Stretcherを含むcompositionはfile serverへのI/O負荷が増える場合があります。
- Edit pageのRetime Controls / Retime Curveとは別の、Fusion node tree内でのretime処理です。

## 関連

- [Time / Metadata / Utility Family Overview](./)
- [Time Stretcher](./time-stretcher.md)
- [Optical FlowをEXRに保存・再利用するレシピ](../../recipes/animation/optical-flow-exr-roundtrip.md)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、Chapter 111「Miscellaneous Nodes」の`Time Speed [TSpd]`（pp.2607–2609）を基準に、入力、Speed / Delay、Interpolation、Flow関連Control、Freeze Frame、aux channelの扱いを確認しています。レイヤー順と二重レンダーの注意はChapter 112「Optical Flow」（p.2618）、前後ベクトルの時間方向・frame境界・Proxy時の単位はChapter 87「Optical Flow and Stereoscopic Nodes」（pp.1909–1910）で確認しています。

network render時の注意はChapter 65「Rendering Using Saver Nodes」のTime Stretching節で確認しています。

`verification: partial`は、記事本文で説明していないcommon Settings controls、runtime REGID、Effects Library上のcurrent表示、host / edition差を別verification対象として残しているためです。
