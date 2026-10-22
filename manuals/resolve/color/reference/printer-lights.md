---
title: Printer Lights（Printer Points）によるショットの微調整
description: DaVinci ResolveのPrinter Lightsを、RGB・CMY・Masterの増減、ショット比較、色管理との関係から理解する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Printer Lights, Printer Points, P/LITE, RGB, CMY, Master, Scopes]
tasks: [primary-correction, shot-matching, balance-image, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# Printer Lights：ショット間の明るさと色かぶりを少しずつ合わせる

Printer Lights（Printer Points）は、色調整を「赤を少し上げる」「全体を少し暗くする」といった**増減の指示**として扱うための考え方です。フィルムのプリント工程に由来する名称ですが、デジタル映像では操作対象の信号やカラーマネージメントによって見え方が変わります。**1 pointが露出の何stopに相当するか、すべてのColorモードで同じ変化になるかは、この資料だけでは確定しません。**

このページで直接確認できた操作資料は、Blackmagic Designの公式『DaVinci Resolve Advanced Panel』マニュアル53ページの **Making Printer Points Adjustments** です。同書はAdvanced Panelの専用キーによる操作を説明しています。21.1ソフトウェアのキーボードショートカットや各UI項目の現行配置を保証するものではありません。

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

先に「全体が暗い」のか「ニュートラルな部分が緑に寄る」のかを分け、必要な系統を選びます。[Primaries Bars](./primaries-color-wheels)もRGB成分を観察しながら調整できるため、Printer Points操作そのものが利用できない環境では、同じ**目的の確認方法**として比較できます。両者の数値や処理結果が完全一致するという意味ではありません。

## Advanced Panelで公式に説明されている操作

以下は**DaVinci Resolve Advanced Panelの物理操作**に限定した説明です。通常のPCキーボードに同じキー配置があるという案内ではありません。

1. Colorページで対象ショットを選び、変更前の画像を[Gallery Still](./gallery-stills)などで参照できるようにします。ViewerとScopesの表示条件を固定します。
2. Advanced Panelの数字キー上方にある **P/LITE** ボタンを押すと、公式マニュアルでいうPrinter Pointsモードに入ります。操作中はP/LITEが強調表示されます。
3. 既定の **whole point** モードで、RGB／Master／CMYの対象キーのプラス・マイナスを使用して小さく調整します。何を動かしたか記録し、1つの意図ごとに結果を確認します。
4. 細かい増減が必要な場合、同書は **SHIFT UP＋P/LITE** をhalf point、**SHIFT DOWN＋P/LITE** をquarter pointのモードとして説明しています。この指定はパネルマニュアルの操作であり、映像信号上の普遍的な単位ではありません。
5. 調整後は同じフレームのViewerとScopesを見て、隣接ショットとのつながりを確認します。P/LITEを再度押してPrinter Pointsモードから出ます。

出典のPDFは現行21.1専用の操作資料ではなく、物理パネルのマニュアルです。21.1におけるパネルの割当変更、設定項目や接続構成、ソフトウェア側のUndo単位は未検証です。したがって、プロジェクトの元状態を失わないよう、調整前のStillや[Version](./versions-and-grade-comparison)を参照点として保持します。

## Printer LightsとPrimaries、Offsetを混同しない

Blackmagic Design公式Colorページでは、PrimariesのLift／Gamma／Gainは主に異なるトーン範囲、Offsetは画像全体の調整として紹介されています。Printer Pointsは「決められた単位の増減でカラーバランスを追う」操作概念であり、OffsetはColorページ内で画像全体を調整するコントロールです。

どちらも全体の見た目を変える場面で使えますが、**Printer Lights＝Offsetの特定数値**という対応は、21.1の処理方式・作業色空間・操作経路を照合するまで断定しません。Lift／Gamma／Gainのようなトーン範囲を分けた補正や、[Log Wheels](./log-wheels)・[HDR Palette](./hdr-palette)による範囲別調整とも区別します。

色かぶりの原因が入力色域やGammaの解釈違いであれば、RGBを動かして見た目だけ近づける前に[Color Management](../learn/color-management-basics)と[CST](./color-space-transform)を調べます。異なる信号条件のまま同じポイント操作を行っても、同じ出力結果になる保証はありません。

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

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（[公式サポート](https://www.blackmagicdesign.com/support)）。公開は確認済みですが、大容量PDFの該当章をこの環境で直接取得できず、21.1実機と照合できていません。
- **Printer Points操作の直接根拠：** Blackmagic Design『[DaVinci Resolve Advanced Panel](https://documents.blackmagicdesign.com/UserManuals/DaVinciResolveAdvancedPanel.pdf)』53ページ「Making Printer Points Adjustments」。P/LITE、whole／half／quarter、RGB／Master／CMYの三系統とCMYの対応チャンネルを確認（2026年10月22日）。**物理パネルの資料**であり、21.1ソフトウェアのメニュー・ショートカット配置は未確認です。
- **Primaries・Scopes・比較方法の根拠：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』のPrimaries、Scopes、Gallery／Still、ショット比較の公式説明（2026年10月22日）。
- **verification: partial。** 21.1 Reference ManualのPrinter Lights該当章、ホスト実機のパネル動作、Free／Studio差、1 pointと具体的な画素値・露出量の対応は未検証です。本記事の操作例は確認済みの機能概念を用いた判断例で、実測結果ではありません。

関連：[Primaries](./primaries-color-wheels)／[Scopes](./scopes)／[Gallery](./gallery-stills)／[ショットマッチ](../recipes/matching-multicamera-interview)。