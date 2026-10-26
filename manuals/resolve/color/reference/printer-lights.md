---
title: Printer Lights（Printer Points）によるショットの微調整
description: Resolve 21.1のPrinter Pointsを、Offset Barsの矢印、数字キーパッド、専用パネルから操作する方法と判断例で解説。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Printer Lights, Printer Points, P/LITE, RGB, CMY, Master, Scopes]
tasks: [primary-correction, shot-matching, balance-image, troubleshoot]
level: intermediate
updated: "2026-10-27"
---

# Printer Lights：ショット間の明るさと色かぶりを少しずつ合わせる

Printer Lights（Printer Points）は、色調整を「赤を少し上げる」「全体を少し暗くする」といった**増減の指示**として扱うための考え方です。フィルムのプリント工程に由来する名称ですが、デジタル映像では操作対象の信号やカラーマネージメントによって見え方が変わります。21.1 Manualによれば1 pointの増減幅はユーザー設定のStep／Densityで調整できます。**1 pointを固定した露出stopや画素値へ換算することはできません。**

Colorページ側の操作は、Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 131「Primaries Palette」pp.3157–3159で確認しました。物理パネルは別資料『DaVinci Resolve Advanced Panel』p.53に基づきます。実機での操作結果は未検証です。

Printer Lightsの使いどころは、ベースになるショットを決めた後の小さなずれを、比較しながら繰り返し整える場面です。最初の色管理や大きな露出補正を済ませる前に使うことは前提にしません。[最初のグレーディング](../learn/first-grade)、[Primaries](./primaries-color-wheels)、[Scopes](./scopes)を先に確認してください。

## RGB・CMY・Masterの違い

Blackmagic DesignのAdvanced Panel公式マニュアルは、Printer Pointsモードに次の3系統があると説明しています。

| 系統 | 公式マニュアル上の操作 | 変化を観察するときの考え方 |
| --- | --- | --- |
| RGB | Red／Green／Blueを個別に増減 | 特定チャンネルの上下で色バランスがどう変わるかを見る |
| Master | RGBをまとめて増減 | 全体の明るさの動きを確認する |
| CMY | Cyan／Magenta／Yellowを増減 | 対応する2つのRGBチャンネルを組み合わせた色方向を扱う |

同書ではRGBを加算的、CMYを減算的なカラーバランス操作として説明しています。ここでのCMYは、**Cyan＝BlueとGreen、Magenta＝RedとBlue、Yellow＝RedとGreen**というチャンネルの組み合わせに対応します。ただし、「減算的」という呼称だけから、現在の素材に対して特定の色変換行列やプリンターの物理特性が適用されると推測してはいけません。

例えばRGBのうちGreenを下げる操作と、Magenta方向を増やす操作は、見た目として緑の偏りを弱める候補になります。しかし他チャンネルの動き方が異なるため、**同じ操作として置換できるとは限りません**。画面内の無彩色、肌、背景、[RGB Parade](./scopes)を使って、実際に動いた成分を比べます。

### Masterと色バランスを分ける

MasterはRGBをそろえて動かすものとして記載されています。色の偏りを直したいときにMasterだけを動かしても、RGB間の相対的なずれは通常解決しません。一方、色を調整した結果として全体の明るさが動いて見える場合もあります。

先に「全体が暗い」のか「ニュートラルな部分が緑に寄る」のかを分け、必要な系統を選びます。21.1では[Primaries Bars](./primaries-color-wheels)のOffsetスライダーにPrinter Point用の上下矢印があり、連続調整と段階調整を使い分けられます。

## Colorページでの操作：Primaries Bars

21.1 Manual Chapter 131は、**Printer PointsをPrimariesパレットのBarsモードにあるOffsetの操作**として説明しています。専用パネルがなくても調整できます。

1. Colorページで対象クリップを選び、Primariesパレットを**Bars**表示にします。
2. **OffsetのRed／Green／Blueスライダー**を確認します。スライダーをドラッグすると、そのチャンネル全体を連続的に調整できます。
3. 各スライダーの**上端・下端の矢印**はPrinter Point単位で増減します。まず1回ずつ変え、[Scopes](./scopes)のRGB ParadeとViewerで結果を確認します。
4. Offsetスライダーの下の**Offset wheel**は、3チャンネルをまとめて動かすマスター調整です。色の偏りなら個別チャンネル、全体の明るさならマスターを検討します。

同章によれば、OffsetやPrinter Pointsは**Lum Mixで他チャンネルを自動補正しません**。Redを動かした場合はRedチャンネルだけに作用します。輝度を一定に保つ処理だと誤解しないようにします。

### 1 pointの増減幅

21.1 Manualは、**User PreferencesのColorパネルにあるPrinter Light Step Calibration**で増分を設定でき、**Step／Density**の値を変更できると説明しています。既定値はフィルムプリンターの調整を模したものですが、露出stopへの一律換算値ではありません。他の編集端末とpoint数をそろえるときも、このユーザー設定を確認します。

## 数字キーパッドでの操作：Printer Light Hotkeys

21.1 Manualでは、**Color → Printer Light Hotkeys**で数字キーパッドの専用操作を有効にできます。Macの切替ショートカットは**Option–Command–グレーブアクセント（`）**です。Windows版の切替ショートカットはこの資料箇所で確認できなかったため、メニューから有効にする方法を示します。

| 数字キーパッド | 操作 |
| --- | --- |
| 7／8／9 | Red／Green／Blueをそれぞれ増やす |
| 4／5／6 | Red／Green／Blueをそれぞれ減らす |
| 1／2／3 | Cyan／Magenta／Yellow方向をそれぞれ増やす |
| −／0／. | Cyan／Magenta／Yellow方向をそれぞれ減らす |

この割当はHotkeysが有効なときのものです。ManualはMacで**Commandを押しながら操作するとquarter increment（1/4単位）**になり、**half increment（1/2単位）はショートカットの手動割当が必要**と説明しています。独自の割当を増やしたくなければBarsの矢印を使う方法もあります。Windows固有の修飾キー、数値キーパッドのないキーボード、カスタマイズ済みのショートカット構成での動作は未検証です。

## Advanced Panelで公式に説明されている操作

以下は**DaVinci Resolve Advanced Panelの物理操作**に限定した説明です。通常のPCキーボードに同じキー配置があるという案内ではありません。

1. Colorページで対象ショットを選び、変更前の画像を[Gallery Still](./gallery-stills)などで参照できるようにします。ViewerとScopesの表示条件を固定します。
2. Advanced Panelの数字キー上方にある **P/LITE** ボタンを押すと、公式マニュアルでいうPrinter Pointsモードに入ります。操作中はP/LITEが強調表示されます。
3. 既定の **whole point** モードで、RGB／Master／CMYの対象キーのプラス・マイナスを使用して小さく調整します。何を動かしたか記録し、1つの意図ごとに結果を確認します。
4. 細かい増減が必要な場合、同書は **SHIFT UP＋P/LITE** をhalf point、**SHIFT DOWN＋P/LITE** をquarter pointのモードとして説明しています。この指定はパネルマニュアルの操作であり、映像信号上の普遍的な単位ではありません。
5. 調整後は同じフレームのViewerとScopesを見て、隣接ショットとのつながりを確認します。P/LITEを再度押してPrinter Pointsモードから出ます。

この物理パネル手順の出典は21.1専用資料ではありません。21.1でのパネル割当変更、接続構成、ソフトウェア側のUndo単位は未検証です。したがって、プロジェクトの元状態を失わないよう、調整前のStillや[Version](./versions-and-grade-comparison)を参照点として保持します。

## Printer PointsとOffset・ほかのPrimariesの関係

21.1 Manual Chapter 131ではPrinter Pointsの矢印を**Primaries BarsのOffsetスライダーを段階的に動かす操作**と説明しています。別のColorエフェクトではなく、Offset調整の入力方法の一つです。Offset wheelはRGB全体を動かし、OffsetのRGB個別調整は各チャンネルへ独立に作用します。ただし「1 point＝Offsetの一定数値／露出stop」という普遍的な換算は、Calibration設定と信号条件を確認するまで置けません。

一方、Lift／Gamma／Gainは主に異なるトーン範囲を調整するコントロールです。画面全体を動かすか、[Log Wheels](./log-wheels)・[HDR Palette](./hdr-palette)などで範囲を絞るかは、ずれが生じている場所で判断します。

色かぶりの原因が入力色域やGammaの解釈違いなら、RGBを動かして見た目だけ近づける前に[Color Management](../learn/color-management-basics)と[CST](./color-space-transform)を調べます。異なる信号条件で同じpoint数を使っても同じ出力結果になる保証はありません。

## 実践例1：カメラBの緑かぶりを少し抑える

同じ場所を撮った架空のインタビューで、基準ショットAに対してBだけがわずかに緑がかっている場合を想定します。

1. まずAとBの入力色域・Gamma、RCM／CST、共通LUTの適用位置を確認します。[LUTの管理](./luts)にある二重変換のチェックも先に済ませます。
2. Aの代表フレームをStillとして保存し、Bの照明条件が近いフレームと比較します。顔の位置だけでなく、白い壁や無彩色の布など、**実際にニュートラルと判断できる被写体**も見ます。
3. BでPrinter Pointsを使える場合、まずGreenを一段階下げた結果を観察します。別案としてMagenta方向を使うことも考えられますが、同じ値に置き換えず、元に戻して別々に比較します。
4. RGB Paradeの変化と肌・背景の見え方を比べます。緑かぶりが減っても肌の血色や背景の色が不自然になった場合は、調整を採用しません。
5. 正しい入力変換と基準ショットが保たれた状態で、Bの調整結果をStillに保存します。次のショットも同じ観察条件で確認します。

これは色バランス調整の**仮想例**で、特定カメラ・数値・21.1実機で結果を測定したものではありません。「一段階」の量は使用するパネルモードと環境に依存します。

## 実践例2：明るさの微差を合わせる

同一シーンのAとBで色相はおおむね合っているものの、Bの顔と背景が一緒に暗く見える場合を考えます。

1. 最初に[Waveform](./scopes)で、Bのどの範囲がAと違うか確認します。露出差なのか、照明で影の比率が違うのかを分けます。
2. 色がほぼ合っていて画面全体を少し動かしたいなら、Master系の小さな調整が候補です。一方、暗部だけに差がある場合は、全体を上げるよりLiftやLogなどの範囲別補正を先に検討します。
3. Masterを変更した後、顔が合っても白い衣服や窓が不自然に明るくなっていないか確かめます。必要なら元の状態へ戻します。
4. 同一シーンの前後カットを再生し、止め画だけでなくカットをまたぐ明るさの連続性を確認します。

この例でも、特定のWaveform値やPrinter Pointsの数値を正解として指定しません。完了条件は「基準ショットとの違いを説明でき、意図した場所が変わり、他の場所に大きな副作用がないこと」です。

## よくある失敗と確認順

| 症状 | まず確認すること | 次の判断 |
| --- | --- | --- |
| RGBを動かしてもショットが合わない | カメラ別の入力変換と素材の照明差 | 技術変換を整えた後、必要なら範囲別の補正へ移る |
| Masterで顔を合わせると窓が明るすぎる | 明暗差が全体か一部か | Lift／Gamma／GainやWindowの必要性を検討 |
| ポイントを戻したのに見た目が違う | 別ノード・Group・Timeline・LUTの作用 | [ノード無効化診断](../troubleshooting/node-bypass-diagnostics)で順に切り分ける |
| AのStillとBが違って見える | 比較フレーム・Viewer・出力表示環境 | [Gallery](./gallery-stills)と[外部モニタリング](./external-monitoring)を点検 |
| ショットごとに同じ操作量なのに結果が違う | 入力の色域／Gamma、元の露出と色分布 | 同じポイント数で結果一致を要求しない |

Printer Lightsは小さな修正を素早く反復するための方法であり、入力変換の誤りや局所的な補正不足を解決する万能なプリセットではありません。複数クリップへ共通補正を適用する場合は、[Group](./group-grading)の適用範囲も確認します。

## 出典・対象版・確認範囲

- **21.1の直接根拠：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（September 2026）、**Chapter 131「Primaries Palette」pp.3157–3159**。Offset BarsのRGB／上下矢印／マスター調整、Lum Mix非適用、Printer Light Hotkeys、数字キーパッド割当、quarter／half単位、User PreferencesのPrinter Light Step Calibrationを2026年10月27日に本文確認。
- **物理パネルの補助資料：** Blackmagic Design『[DaVinci Resolve Advanced Panel](https://documents.blackmagicdesign.com/UserManuals/DaVinciResolveAdvancedPanel.pdf)』p.53「Making Printer Points Adjustments」。P/LITE、whole／half／quarter、RGB／Master／CMYの物理操作。21.1実機での動作は未確認。
- **関連する公式製品説明：** [DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)。Primaries、Scopes、Galleryの説明。
- **verification: partial。** 21.1実機でのメニュー・数字キーパッド・パネル操作、Windows固有の修飾キー、Calibration数値と実画素／露出stopの対応、Free／Studio差は未検証です。判断例は実測報告ではありません。

関連：[Primaries](./primaries-color-wheels)／[Scopes](./scopes)／[Gallery](./gallery-stills)／[ショットマッチ](../recipes/matching-multicamera-interview)。