---
title: "Time Stretcher"
description: "Source TimeをSplineで直接mappingし、speed ramp・freeze・reverseを作るFusion Node。"
doc_type: node
term_id: "time-stretcher"
term_short: "Time Stretcherは、Source TimeをSplineで指定し、再生速度を時間に応じて変えたり、freezeやreverseを作ったりするNode。"
verification: partial
aliases: ["Time Stretcher", "TST"]
concepts: ["image-data"]
nodes: ["Time Stretcher"]
node_family: "time-metadata"
inputs: ["image"]
outputs: ["image"]
tasks: ["retime"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Time Stretcher

Time Stretcherは、**outputの各frameでsourceの何frame目を読むかを直接指定する**ためのNodeです。

素材全体を一律50%にするような一定速度のretimeではなく、途中で加速する、減速する、止める、逆再生するといった、時間とともに再生速度が変わる処理に向いています。時間の対応関係は`Source Time`のSplineで作ります。

一定速度だけを指定したい場合は、[Time Speed](./time-speed.md)の方が直接的です。

## 入力と出力

- **Input**: 2D Image 1系統。orange inputへ、retimeしたいImageを接続します。
- **Output**: `Source Time`に従って時間位置を読み直した2D Image。

基本構成は次の通りです。

    MediaIn → Time Stretcher → Result

Time Stretcher自身が新しい映像内容を描くのではなく、入力Image sequenceから「今のoutput frameではsourceのどこを読むか」を決めます。

## Source Timeは何を指定しているか

`Source Time`には、**そのoutput frameで表示したいsource frame番号**を指定します。

たとえば、output frame 0で`Source Time = 0`、output frame 24で`Source Time = 99`にすると、sourceの0〜99 frameをoutputの0〜24 frameへ収めます。DaVinci Resolve 21.1 Reference Manualでは、100 frameのsequenceを25 frameへ縮める例としてこの設定が使われています。

Time Stretcherを追加すると、`Source Time`には最初からBézier splineが入り、Nodeを追加したcurrent timeに値0.0のkeyframeが1つ作られます。Splineが見えない場合は、`Source Time`のcontext menuから`Edit`を選ぶか、Spline Windowで`Display all Splines`を使います。

`Source Time`の変化をSplineで作ることで、1本のNodeの中に加速、減速、停止、逆再生を組み合わせられます。

## 主なControls

### Source Time

outputの現在位置で読むsource frameを指定します。

一定の値を保てば同じsource frameを読み続けるためfreezeになります。時間が進むにつれて`Source Time`を大きく進めれば早送り方向、小さく戻せばreverse方向のmappingになります。

### Interpolate Mode

source frameとoutput frameが1対1で対応しないとき、frame間をどう補うかを選びます。

- **Nearest**: source frameをdrop / duplicateします。最も軽い方式ですが、slow motionでは動きが段階的に見えやすくなります。
- **Blend**: 隣接frameをblendします。Nearestより滑らかにできますが、動体には残像が出ることがあります。
- **Flow**: Optical Flowのvector channelを使って中間frameを生成します。直線的で推定しやすい動きでは滑らかにできますが、物体同士の交差や予測しにくいcamera movementではwarp artifactが出ることがあります。

`Flow`を選んでも、Time Stretcher自身はOptical Flowを生成しません。前段で[Optical Flow](../optical-flow/optical-flow.md)を使うか、Forward / BackVector channelを含むImageを入力します。

### Blend時: Sample Spread

`Interpolate Mode = Blend`のときだけ表示されます。前後frameを現在のframeへどの程度混ぜるかを調整します。

Manualでは`0.5`の例について、直前frameを50%、直後frameを50%、current frameを0%としてblendすると説明されています。

### Flow時: Depth Ordering

`Interpolate Mode = Flow`のときだけ表示されます。motion vectorの速さを手掛かりに、どの領域を手前へ描くかを選びます。

固定cameraで車だけが横切るshotでは、車のvectorが背景より速くなるため`Fastest on Top`が合う場合があります。cameraが車を追ってpanしているshotでは背景側のvectorが速くなるため、`Slowest on Top`が合う場合があります。

### Flow時: Clamp Edges / Edge Softness

frame補間で画面端に透明な隙間ができる場合、`Clamp Edges`で埋められます。ただし、画面端を引き伸ばしたようなartifactが出ることがあるため、小さなgapの補正に限定して使います。

`Edge Softness`は`Clamp Edges`によるstretch artifactを目立ちにくくするControlです。

### Flow時: Source Frame and Warp Direction

中間frameを作るとき、どのsource frameとvector directionを使うかを選びます。DaVinci Resolve 21.1 Reference Manualでは次の4方式が記載されています。

- `Prev Forward`
- `Next Forward`
- `Prev Backward`
- `Next Backward`

複数を有効にした場合、それぞれのwarp結果がblendされます。

## 具体的な使い方

### speed rampを作る

    MediaIn → Time Stretcher → Result

`Source Time`へ複数のkeyframeを置き、Splineでsource frameとの対応を変えます。一定速度の区間、加速する区間、停止する区間、reverseする区間を同じmappingの中で作れます。

速度そのものを直接animationするのではなく、**output timeとsource timeの対応をanimationする**と考えると挙動を理解しやすくなります。

### 100 frameを25 frameへ縮める

Manualの例では、次の2点を作ります。

- output frame 0: `Source Time = 0`
- output frame 24: `Source Time = 99`

Splineをlinearにすると、sourceの100 frameがoutputの25 frameへ収まります。

### 1 frameをfreezeしてclean plateを作る

Paint chapterでは、Planar Trackerでtrackしたclipからclean plateを作る例でTime Stretcherが使われています。

    MediaIn
      ├─→ Planar Tracker
      └─→ Time Stretcher → Paint

`Source Time`のdefault keyframeを無効にし、freezeしたいsource frame番号へ固定すると、その1 frameをPaintへ渡せます。動いている素材から静止したclean plateを作り、不要物をCloneで消すような処理に使えます。

### Optical Flowで補間する

    MediaIn → Optical Flow → Time Stretcher → Result

`Interpolate Mode = Flow`では、前段で作ったVector / BackVector channelを使って中間frameを生成します。

Time Stretcherはaux channelを補間して保持するNodeではなく、ManualではVector / BackVectorを含むaux channelを処理後に消費するとされています。**retime後にもmotion vectorが必要なら、Time Stretcherの後段でOptical Flowを作り直します。**

## Time Speedとの使い分け

[Time Speed](./time-speed.md)は、素材全体へ一定の速度比率を適用する場合に向いています。

- 全体を50%速度にする
- 2倍速にする
- 一定速度でreverseする
- 数frameのdelayを加える

Time Stretcherは、source time自体をSplineで動かしたい場合に使います。

- 徐々に加速 / 減速する
- 途中でfreezeする
- freeze後に再開する
- 途中からreverseする
- 1つのretimeの中で複数の速度変化をつなぐ

## 注意点

- `Flow`を選んでもTime Stretcher自身はOptical Flowを生成しません。
- Flow補間はocclusion、交差する動体、複雑なcamera movementでartifactが出ることがあります。
- Vector / BackVectorを含むaux channelはretime後にそのまま残る前提で使わないでください。
- Time Stretcher / Time Speedはcurrent frameの前後から複数frameを取得するため、network renderではfile serverへのI/Oが増えます。構成が重い場合は該当部分のpre-renderも検討します。
- Edit pageのRetime Curveとは別の、Fusion node tree内で完結するretime処理です。

## 関連

- [Time / Metadata / Utility Family Overview](./)
- [Time Speed](./time-speed.md)
- [Optical Flow](../optical-flow/optical-flow.md)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、Chapter 111「Miscellaneous Nodes」の`Time Stretcher [TST]`（pp.2610–2613）を基準に、入力、`Source Time`、Interpolation、Flow関連Control、100 frameから25 frameへのretime例を確認しています。

freezeを使ったclean plateの例はChapter 80「Paint」（pp.1768–1769）、network render時のI/O注意はChapter 65「Rendering Using Saver Nodes」（p.1376）を参照しています。

`verification: partial`は、本文で扱っていないcommon Settings controls、runtime REGID、Effects Library上のcurrent表示、host / edition差を別verification対象として残しているためです。
