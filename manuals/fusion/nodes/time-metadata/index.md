---
title: Time / Metadata / Utilityノード
description: 時間操作、Metadata、DoD、Bit depth、入力切替、外部処理を目的とデータの流れから選ぶFusionノードガイド。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, retime, metadata]
updated: "2026-10-09"
---

# Time / Metadata / Utilityノード

このカテゴリには、映像の参照時刻、画像に付く情報、計算対象の範囲と精度、ノードの接続方法を変更するツールが集まっています。**同じ「Utility」でも変更しているものは異なります。** Time Speedは入力の何フレーム目を読むかを変えますが、Set Metadataは画素を変えません。Switchは入力を選び、Run Commandはレンダリングに伴って外部処理を起動します。

「Time / Metadata / Utility」はCOLLECTANEAの目的別分類です。21.1 Reference Manualでは主にChapter 110「Metadata Nodes」とChapter 111「Miscellaneous Nodes」に分けて掲載されています。

## 用語とデータの種類

- **Image**：通常の2D画像。RGBAなどの画素値を持ち、フレームごとに内容が変わります。
- **Source time**：今の出力フレームに、入力の何フレーム目を対応させるか。リタイムで変更します。
- **キーフレームの評価時刻**：Text+やTransformなどのアニメーションをいつ評価するか。素材の再生速度とは別です。
- **Metadata**：名前と値、タイムコードなど、Imageに付属する情報。見た目の画素値とは区別します。
- **Domain of Definition（DoD）**：有効な画素データが存在するとみなす矩形範囲。画像の幅・高さではありません。[DoDの基礎](../../learn/03-space/domain-of-definition.md)を参照してください。
- **Bit depth**：チャンネル値を保持する精度。計算精度とメモリ使用量、量子化誤差に関係します。

## 目的から選ぶ

| 目的 | Node | 入力から出力への変化 |
| --- | --- | --- |
| 一定速度の早送り・スロー・逆再生 | [Time Speed](./time-speed.md) | 2D Imageの参照時刻を一定比率で変更 |
| 途中で加減速・停止・逆再生する | [Time Stretcher](./time-stretcher.md) | Source TimeをSplineで指定 |
| 動きを解析して中間フレームを作る | [SpeedWarp](./speedwarp.md) | AI補間による2D Imageリタイム |
| 過去や未来のフレームを平均する | [Frame Average](./frame-average.md) | 複数時刻の画素を1フレームへ平均 |
| インターレースのフィールドを処理する | [Fields](./fields.md) | Fieldの分離・補間・再結合 |
| タイトルの入退場時間を保って尺を変える | [Keyframe Stretcher](./keyframe-stretcher.md) | 前段のキーフレーム評価時刻を伸縮 |
| 任意のMetadataを加える | [Set Metadata](./set-metadata.md) | Imageの付帯情報へName / Valueを追加 |
| 別のImageからMetadataを移す | [Copy Metadata](./copy-metadata.md) | ForegroundのMetadataをBackgroundへ反映 |
| タイムコードMetadataを作る | [Set Timecode](./set-timecode.md) | ImageへFPS基準のTimecodeを付与 |
| 有効領域を自動検出する | [Auto Domain](./auto-domain.md) | 画素内容からDoDを算出 |
| 有効領域を手動指定する | [Set Domain](./set-domain.md) | DoDの境界を指定・調整 |
| 画像処理の精度を変える | [Change Depth](./change-depth.md) | チャンネルBit depthを変更 |
| 数式で画素処理を作る | [Custom Tool](./custom-tool.md) | ImageやMatteの値から出力チャンネルを計算 |
| 複数入力のうち1つだけを通す | [Switch](./switch.md) | Image・Shape・Classic 3Dなどを選択 |
| 離れたNodeの画像を配線なしで参照する | [Wireless Link](./wireless-link.md) | Inspectorで指定した2D Nodeの画像を出力 |
| レンダリングに合わせて外部処理する | [Run Command](./run-command.md) | 外部コマンドを開始時・各フレーム後・終了時に実行 |

## 時間：同じリタイムでも使う情報が違う

### Time Speed / Time Stretcher / SpeedWarp

[Time Speed](./time-speed.md)は、`Speed = 0.5`で半速、`Speed = 2.0`で2倍速というように、一定の速度比率を指定します。途中でスピードを変化させたいなら、[Time Stretcher](./time-stretcher.md)の`Source Time`へキーフレームを置きます。停止区間は同じSource Timeを保持し、逆再生区間では値を減少させます。

両Nodeの`Flow`補間は、前段で作ったOptical FlowのVector / BackVectorチャンネルを使います。**Time Speed / Time Stretcher自身はOptical Flowを生成しません。** これらの補助チャンネルはリタイム時に消費されるため、後段で必要ならOptical Flowを作り直します。

```text
MediaIn → Optical Flow → Time Stretcher → MediaOut
                        （Flow補間）
```

[SpeedWarp](./speedwarp.md)はDaVinciのニューラルネットワークで動きを解析し、中間フレームを生成します。21.1 Manualの`Speed`、`Delay`、`Mode: Faster / Better`により、速度と品質・処理負荷の優先度を調整できます。普通の速度変更なのか、補間品質が必要なのかで使い分け、複雑な動きの結果はViewerで比較します。

### 実機の参考例

<!-- capture-reuse:R76 -->

一定速度を変えたS40です。出力24を固定すると、Speed 0.5では素材12、Speed 2.0では素材48を表示します。Source TimeのSplineを作るTime Stretcherと、一定倍率を指定するTime Speedを区別できます。

[![番号入り連番LoaderからTimeSpeed1を経由してMediaOut1へ接続した実機Graph](/img/fusion/captures/S40/graph.png)](/img/fusion/captures/S40/graph.png)

[![TimeSpeed1のSpeedは0.5、Delayは0、補間はBlend、Sample Spreadは0](/img/fusion/captures/S40/inspector.png)](/img/fusion/captures/S40/inspector.png)

[![出力フレーム24、左の入力はSOURCE 024、右の半速出力はSOURCE 012](/img/fusion/captures/S40/compare.png)](/img/fusion/captures/S40/compare.png)

[![出力フレーム24、左はSOURCE 024、右の2倍速出力はSOURCE 048](/img/fusion/captures/S40/fast.png)](/img/fusion/captures/S40/fast.png)

Resolve Studio 21.1.0.14／Windows、両Viewer Color／40%。番号入り連番のSpeedだけを図示。この画像が示すのはTime Speedの固定例です。Flow/SpeedWarpの補間比較は未確認。 [撮影条件と確認範囲](/img/fusion/captures/S40/capture.json)

### Frame Average / Fields / Keyframe Stretcher

[Frame Average](./frame-average.md)は再生速度を変えません。過去・未来・前後の複数フレームから画素値を平均し、現在の1フレームを作ります。固定カメラの夜景でランダムなノイズを平均すると目立ちにくくなりますが、動いている車なども複数位置に重なり、残像になります。動体を追跡・補正してから平均する機能ではありません。

### 実機の参考例：平均する方向

<!-- capture-reuse:R77 -->

S42では出力24とFrames12を固定し、Backward／Both／ForwardをGUIで切り替えました。右へ動く緑barの残像が、過去側／前後／未来側へ変わります。

[![出力24でBackwardを選ぶと、右の緑barの残像が現在位置より過去側へ広がる](/img/fusion/captures/S42/backward.png)](/img/fusion/captures/S42/backward.png)

[![出力24でBoth、Frames12。左のSOURCE024に対し、右は前後の番号と移動する緑barが平均される](/img/fusion/captures/S42/compare.png)](/img/fusion/captures/S42/compare.png)

[![出力24でForwardを選ぶと、右の緑barの残像が現在位置より未来側へ広がる](/img/fusion/captures/S42/forward.png)](/img/fusion/captures/S42/forward.png)

Resolve Studio 21.1.0.14／Windows、両Viewer Color／40%。Frames12の固定例。Fields、Keyframe Stretcher、ノイズ低減性能は未確認。 [再現用Graph](/img/fusion/captures/S42/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S42/capture.json)

[Fields](./fields.md)はインターレース素材のField 1 / Field 2を扱い、分離、補間、再結合、フィールド順の調整を行います。映像速度の変更ではなく、1フレームを構成するフィールドの処理です。

[Keyframe Stretcher](./keyframe-stretcher.md)は**Modifierだけでなく、Flow上に置くNodeとして存在します**。前段にあるText+やTransformのキーフレームアニメーションを、コンポジションの尺に合わせて評価します。

たとえば「最初の10フレームで現れる、中央で静止、最後の10フレームで消える」というタイトルなら、中央だけをStretch区間に指定します。タイトルを長くしても、入退場の速度を保ったまま中央の表示時間を延ばせます。

```text
Text+（出現／退場のキーフレーム） ─┐
                              Merge → Keyframe Stretcher → MediaOut
Background ────────────────────┘
```

Source Timeを変えて素材をリタイムするのではありません。単一パラメータだけなら別機能のKey Stretcher Modifierもあります。

## Metadata：画素と付帯情報を分ける

[Set Metadata](./set-metadata.md)は`Field Name = Field Value`の組をImageへ追加します。たとえば`ShotName = SH010`という識別情報を付け、ViewerのMetadata subviewで確認します。Field Nameに空白は使いません。

### 実機の参考例：Metadataの追加

<!-- capture-reuse:R78 -->

S43はShotName=SH010を追加した実機例です。Inspectorの2項目と、ViewerのMetadata subviewに表示された値が一致します。

[![Set MetadataのField NameはShotName、Field ValueはSH010](/img/fusion/captures/S43/inspector.png)](/img/fusion/captures/S43/inspector.png)

[![右ViewerのMetadata subviewにShotName=SH010が表示される](/img/fusion/captures/S43/metadata.png)](/img/fusion/captures/S43/metadata.png)

Resolve Studio 21.1.0.14／Windows、両Viewer Color／40%。Name/Valueの固定例。Set Timecodeと書き出し時の保持は未確認。 [再現用Graph](/img/fusion/captures/S43/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S43/capture.json)

[Copy Metadata](./copy-metadata.md)は**orangeのBackground Imageを出力の基準**として、**greenのForeground ImageからMetadataを移す**Nodeです。画素を合成するMergeとは異なります。`Merge (Replace Duplicates)`は同名項目でForegroundを、`Merge (Preserve Duplicates)`はBackgroundを優先します。`Replace`は付帯情報全体を置換、`Clear`は消去します。

### 実機の参考例：Metadataの優先と置換

<!-- capture-reuse:R79 -->

S44は青のBG001と赤のFG002を使った例です。Merge (Preserve Duplicates)ではShotName=BG001を残し、ReplaceではFG002と赤側だけのFGOnlyへ置き換わります。出力の画素は青です。

[![青と赤の各BackgroundにShotNameと固有項目を追加し、Copy Metadataの2入力へ接続した実機Graph](/img/fusion/captures/S44/graph.png)](/img/fusion/captures/S44/graph.png)

[![Preserve Duplicatesの結果。両方の固有項目を残し、ShotNameはBG001](/img/fusion/captures/S44/preserve-metadata.png)](/img/fusion/captures/S44/preserve-metadata.png)

[![Replaceの結果。FGOnly=keepFGとShotName=FG002が残り、BGOnlyは消える](/img/fusion/captures/S44/replace-metadata.png)](/img/fusion/captures/S44/replace-metadata.png)

Resolve Studio 21.1.0.14／Windows、両Viewer Color／40%。2入力のmetadata結合と置換。保存ファイルへの保持は未確認。 [再現用Graph](/img/fusion/captures/S44/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S44/capture.json)

```text
仕上げたPlate ──────────────────→ Copy Metadata → Set Metadata → 後段処理
                                    ↑             （ShotName等）
参照素材（Metadataを保持） ─────────┘
```

[Set Timecode](./set-timecode.md)はFPSと開始位置を基に、ImageのタイムコードMetadataを生成します。素材の速度やEditページのタイムライン開始時刻を変更するものではありません。

### 実機の参考例：タイムコード

<!-- capture-reuse:R80 -->

S45ではFPS24と8秒15フレームの開始オフセットを設定しました。出力0では00:00:08:15、出力24では00:00:09:15です。画素は青のままで、付帯情報の時刻だけが変わります。

[![Set TimecodeのMetadata subview。FrameRate24、TimeCode00:00:08:15](/img/fusion/captures/S45/metadata.png)](/img/fusion/captures/S45/metadata.png)

[![同じFPS24と開始オフセットで出力24へ進めると、右のTimeCodeは00:00:09:15になる](/img/fusion/captures/S45/frame24.png)](/img/fusion/captures/S45/frame24.png)

Resolve Studio 21.1.0.14／Windows、両Viewer Color／40%。固定オフセットと24fpsの時刻差。書き出し時のTimecode保持は未確認。 [再現用Graph](/img/fusion/captures/S45/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S45/capture.json)

**FusionでMetadataが存在することと、最終ファイルへ保持されることは別問題です。** 保存が必要な場合はSaver / Deliverと出力フォーマット、後段処理を別途確認します。

## DoDとBit depth：処理する場所と精度

[Auto Domain](./auto-domain.md)はImageのCanvas Colorと画素を比較して内容がある範囲を探し、DoDをフレームごとに設定します。透明背景に小さくCGキャラクターだけが映る場合、後段の処理範囲を減らせることがあります。

```text
透明背景のCGパス → Auto Domain → Blur → Merge
```

[Set Domain](./set-domain.md)はDoDの境界を明示的に設定・調整します。どちらも**画像の物理的な幅・高さは変更しません**。必要な領域まで除外すると後段処理が欠けるため、ViewerのDoD表示で確認します。Cropによる画面の切り出しとは目的が異なります。

[Change Depth](./change-depth.md)はチャンネルのBit depthを変換します。高精度な色処理の後で必要なら16-bitへ下げて後段のメモリ負荷を減らせますが、量子化誤差が増える場合は`Dither`を検討します。Bit depthを上げても元素材に存在しない階調が復元されるわけではありません。

### 実機の参考例：bit depthの表示

<!-- capture-reuse:R83 -->

S48ではfloat32のGradientをChange Depthへ接続し、int16を選びました。右Viewerの画像情報がint16へ変わり、画像寸法は1920×1080を保っています。

[![黒白のHorizontal GradientからChangeDepth1を経由してMediaOut1へ接続した実機Graph](/img/fusion/captures/S48/graph.png)](/img/fusion/captures/S48/graph.png)

[![Change DepthのDepthをint16、Ditherをなしにした実機Inspector](/img/fusion/captures/S48/inspector.png)](/img/fusion/captures/S48/inspector.png)

[![左のGradientは1920×1080 float32、右のChange Depth出力は1920×1080 int16と表示される](/img/fusion/captures/S48/compare.png)](/img/fusion/captures/S48/compare.png)

Resolve Studio21.1.0.14／Windows、両Viewer Color／40%。設定とViewer表示の固定例。Dither画質・Effect Mask・memory/性能は未確認。 [再現用Graph](/img/fusion/captures/S48/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S48/capture.json)

### 実機の参考例：画像寸法とDoDを見分ける

<!-- capture-reuse:R88 -->

S50ではAuto Domainの初期4値0で、フルフレームのDoDが中央の矩形へ絞られました。寸法は1920×1080のままです。

[![透明PNGをLoaderからAutoDomain1、MediaOut1へ接続した実機Node Editor](/img/fusion/captures/S50/graph.png)](/img/fusion/captures/S50/graph.png)

[![Auto Domainの左・下・右・上がすべて0の実機Inspector](/img/fusion/captures/S50/inspector.png)](/img/fusion/captures/S50/inspector.png)

[![左LoaderのDoDは0,0から1920,1080、右Auto Domainは640,360から1280,720。画像寸法は両方1920×1080](/img/fusion/captures/S50/compare.png)](/img/fusion/captures/S50/compare.png)

Resolve Studio21.1.0.14／Windows、両Viewer Color／40%。透明PNGの固定例。Canvas color、Mask、動く素材、性能は未確認。 [再現用Graph](/img/fusion/captures/S50/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S50/capture.json)

## 計算・切替・外部連携

[Custom Tool](./custom-tool.md)はImageやMatteから画素値を読み、数式でRGB・Alphaなどのチャンネルを計算します。`Number In`などのControlをInspectorに出せます。`Setup`はフレーム単位、`Intermediate`とチャンネル式は画素単位で評価します。

[Switch](./switch.md)は複数入力のうち1つだけを後段へ渡します。2D ImageだけでなくShapeやClassic 3Dでも利用できますが、**入力の種類を自動変換したり合成したりしません**。背景だけを選んで共通のText+を合成する例です。

```text
背景A ──┐
背景B ──┴→ Switch ───→ Merge（Background）→ MediaOut
Text+ ────────────────→ Merge（Foreground）
```

### 実機の参考例：入力の選択

<!-- capture-reuse:R81 -->

S46は青と金色の2入力からGOLDを選んだ例です。左のBlue1は青のまま、右のSwitch出力だけが金色になります。SourceのBLUE／GOLDはConfigで付けた入力名です。

[![Blue1とGold1をSwitch1の2入力へ接続し、出力だけをMediaOut1へ渡す実機Graph](/img/fusion/captures/S46/graph.png)](/img/fusion/captures/S46/graph.png)

[![同じSwitchのSourceをGOLDへ切り替えたInspector](/img/fusion/captures/S46/gold-inspector.png)](/img/fusion/captures/S46/gold-inspector.png)

[![SourceでGOLDを選ぶと右のSwitch出力が金色になる。左Blue1は青のまま](/img/fusion/captures/S46/gold.png)](/img/fusion/captures/S46/gold.png)

Resolve Studio 21.1.0.14／Windows、両Viewer Color／40%。2D Imageの固定選択。Shape/3DとSourceアニメーションは未確認。 [再現用Graph](/img/fusion/captures/S46/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S46/capture.json)

両方の背景を同時に重ねるならMerge、クロスフェードするならDissolveを検討します。

[Wireless Link](./wireless-link.md)は入力端子ではなくInspectorの`Input`フィールドへ2D Nodeをドラッグして参照し、長い配線を引かずに同じImageを出力します。便利ですが、画面上のパイプだけでは依存先を追いにくくなります。

### 実機の参考例：配線を省いた参照

<!-- capture-reuse:R82 -->

S47ではText1のタイルをWireless LinkのInputへドラッグしました。Text1へ画像pipeを引かずに参照し、元の文字をUPDATEDへ変えるとWireless側もUPDATEDになります。

[![Text1からWireless1へ画像のpipeを引かず、Wireless1からMediaOut1だけを接続した実機Graph](/img/fusion/captures/S47/graph.png)](/img/fusion/captures/S47/graph.png)

[![Wireless LinkのInspector Input欄へText1をドラッグした後の表示](/img/fusion/captures/S47/inspector.png)](/img/fusion/captures/S47/inspector.png)

[![参照元Text1の文字をUPDATEDへ変えると、右Wireless1の文字もUPDATEDになる](/img/fusion/captures/S47/updated.png)](/img/fusion/captures/S47/updated.png)

Resolve Studio 21.1.0.14／Windows、両Viewer Color／40%。Text+の2D Image参照。参照元のrename/deleteや参照切れは未確認。 [再現用Graph](/img/fusion/captures/S47/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S47/capture.json)

[Run Command](./run-command.md)はレンダリング開始時・各フレームの完了時・レンダリング終了時に外部コマンドを実行します。`Saver → Run Command`と接続すると、フレームの保存が完了した後の後処理に使えます。外部プロセスの内容、対象ファイル、起動回数、終了待ちを確認してからレンダリングします。

### 実機の参考例：画素式へGainを渡す

<!-- capture-reuse:R98 -->

S57はNumber In 1をGainへ改名し、Setup 1=n1、Intermediate 1=r1*s1、RGBA=i1/g1*s1/b1*s1/a1とした例です。左が元画像、右がGain0.5の結果です。

[![LoaderのImageをCustomTool1のImage1へ接続しMediaOut1へ出した実機Graph](/img/fusion/captures/S57/graph.png)](/img/fusion/captures/S57/graph.png)

[![Redにi1、Greenにg1*s1、Blueにb1*s1、Alphaにa1を入力したChannels](/img/fusion/captures/S57/channels.png)](/img/fusion/captures/S57/channels.png)

[![元のチャートが左、RGBへGain0.5を掛けて暗くなったCustom Toolの結果が右](/img/fusion/captures/S57/compare.png)](/img/fusion/captures/S57/compare.png)

Resolve Studio21.1.0.14／Windows、両Viewer Color／40%。Custom Tool独自の画素式。SimpleExpressionの構文・評価対象とは区別する。Matte/Mask/LUT/他channel/性能は未確認。 [再現用Graph](/img/fusion/captures/S57/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S57/capture.json)

## 判断を間違えやすい点

- **リタイムとアニメーション伸縮**：素材の再生時間はTime Speed / Time Stretcher、タイトルのキーフレーム評価はKeyframe Stretcherです。
- **フレーム補間と平均**：SpeedWarpやFlowは中間時刻の画像生成を狙い、Frame Averageは複数フレームを重ねて平均します。
- **画素とMetadata**：Metadataは色を変えないため、必要ならViewerのMetadata subviewを確認します。
- **DoDと画像寸法**：Auto Domain / Set DomainはCropの代わりではありません。
- **接続とデータの種類**：SwitchはShapeや3Dでも動作しますが、Wireless Linkについて21.1 Manualが明記しているのは2D Nodeです。
- **性能と精度**：SpeedWarpの`Better`、Flowの補間、Frame Averageの平均枚数、Change DepthのBit depthは、素材や後段処理に応じて選びます。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）Chapter 110「Metadata Nodes」（pp.2571–2578）、Chapter 111「Miscellaneous Nodes」（pp.2579–2614）に基づき、役割・主要Control・データの流れを整理しました。個別設定の説明はリンク先のNode記事を参照してください。

このページは目的別のガイドで、現行Effects Libraryの全Nodeについて実機確認が済んだという意味ではありません。runtime REGID、内部Parameter ID、edition差、未記載の既定値や範囲は別確認事項のため、`verification: partial`を維持します。
