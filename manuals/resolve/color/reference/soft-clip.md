---
title: Soft Clip（ハイライト・シャドウのロールオフ）
description: ColorページのSoft Clipで明暗端の急なクリッピングを緩める方法、High／LowとSoftの違い、RGB個別調整の副作用を整理する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Curves, Soft Clip, High Clip, High Soft, Low Clip, Low Soft, Gang, Scopes]
tasks: [highlight-rolloff, shadow-rolloff, contrast-correction, troubleshoot, grade]
level: intermediate
updated: "2026-10-22"
---

# Soft Clip：白飛び・黒つぶれの境界をどう整えるか

明るさを強く調整すると、窓や照明の明部が急に真っ白になったり、暗い服の階調が黒へ張り付いたりします。**Soft Clip**は、ColorページのCurvesにある明暗端の調整機能です。信号の端に近い範囲を段階的に圧縮し、明部・暗部が急に切れる見え方を緩める目的で使います。

Soft Clipでできるのは、**補正処理の中にまだ残っている階調を、出力の端へどのように収めるか**の調整です。撮影時に既に失われた模様や色を生成する機能ではありません。まず[Scopes](./scopes)とViewerで、元の信号に階調が残っているかを確認します。

通常のカーブによるコントラスト調整は[Custom Curves](./custom-curves)、色管理や出力変換による圧縮は[カラーマネージメント](../learn/color-management-basics)と[Color Space Transform（CST）](./color-space-transform)を参照してください。

## High／LowとHigh Soft／Low Softの違い

Soft Clipには、信号の上限・下限を決める側と、その手前をなだらかにする側があります。同じ「Clip」という名前でも作用は異なります。

| コントロール | 役割 | 調整時に確認すること |
| --- | --- | --- |
| **High Clip** | 明部がそれ以上増えない上側のクリッピング位置を扱う | 明るい部分が一様な値に張り付かないか |
| **High Soft** | 上側のクリッピング位置に達する手前から明部を圧縮する | 窓・雲・照明周辺の明暗差が自然につながるか |
| **Low Clip** | 暗部がそれ以下へ下がらない下側のクリッピング位置を扱う | 黒が一様になり、暗い衣服の質感が消えないか |
| **Low Soft** | 下側のクリッピング位置へ近づく暗部を圧縮する | 黒付近の階調が急に折れず、不要に浮き上がらないか |

「High Clipを下げる」ことと「High Softで明部の端を緩める」ことは逆の目的になり得ます。High Clipで上側を切れば、その位置より上の情報は後段のノードでGainを下げても戻せません。一方、High Softはクリップする手前の値を圧縮し、**元の処理信号に残っている明部差を可視範囲へ収める余地**を作ります。

同様に、Low Clipで暗い信号を切りそろえると黒つぶれを強める場合があります。Low Softは暗部の移行をなだらかにする用途です。いずれも「数値を大きくすれば高画質になる」コントロールではありません。

Blackmagic Designの公式資料では、Soft ClipはCurvesに属する明暗端の制御として説明されています。**ここでは21.1実機上の数値、スライダーの初期値、完全なUI配置を断定しません。** 使用する環境でCurvesのSoft Clip領域と選択中ノードを確認してください。

## Curves内で試す基本手順

以下は機能と確認順に基づく作業手順です。個々のマウス操作の位置や21.1固有のコントロール表示は実機未照合です。

1. Colorページで対象クリップを選び、[Gallery／Stills](./gallery-stills)または[Versions](./versions-and-grade-comparison)に比較用の状態を残します。現在どのClip／Group／Timelineノードに調整を加えるかを確認します。
2. 明暗を強くしたノードとSoft Clip用ノードを識別できる構成にします。最初は別のシリアルノードで試すと、処理前後を比較しやすくなります。[Node Graph](../learn/color-node-graph)の処理順も確認します。
3. CurvesのSoft Clipコントロールを開き、まず**全RGBを連動させる設定（Gang）**を使います。調整前のViewerとWaveformを観察します。
4. 明部だけが急に切れているならHigh Soft側を小さく動かし、窓・白い服・空の明部の境界とWaveform上端の形を比較します。最初からHigh Clipの位置を下げて情報を切り捨てないようにします。
5. 暗部が急に黒へ落ちる場合はLow Soft側を同様に試し、暗い髪・服・背景の質感が残るかを見ます。黒を不必要に灰色へ浮かせないことも確認します。
6. 調整ノードを無効化して比較し、前後のカットを再生します。明るさのつながりだけでなく、肌の色や白い壁の色が変わっていないかを[RGB Parade](./scopes)で確認します。

変化が見えない場合、元画像に信号が残っていない、ほかのノードですでに切られている、後段のLUT／出力変換で再び圧縮されている、といった可能性があります。[ノード無効化による診断](../troubleshooting/node-bypass-diagnostics)と[書き出し後の色ズレ診断](../troubleshooting/export-color-mismatch)も参照してください。

## 全RGB連動とチャンネル別調整

Soft ClipはRGBを一緒に動かす方法と、色チャンネルごとに調整する方法が説明されています。

**最初は全チャンネル連動で調整する**方が、ニュートラルなハイライトやシャドウの色バランスを保ちやすくなります。赤だけ先に圧縮した場合、白い壁がシアン寄りに見えたり、暗部に予期しない色が付いたりする可能性があるためです。

色チャンネルごとのクリッピングが本当に問題になっている場合は、RGB Paradeで対象チャンネルを特定し、小さく個別調整する方法があります。ただし、チャンネルごとの信号上限を形だけそろえても、意図した色や納品規格を満たすとは限りません。問題が白バランス、色域変換、照明色、過度な彩度に由来する場合は、Soft Clipで隠さず先に原因を調べます。

放送規格やHDR納品の適合は、**規格に合わせた信号条件・Scopes・必要なQC**で評価します。Soft Clipの調整だけを「legalな出力」の証明にしません。

## 判断例1：窓が一様に白くなったインタビュー

同じ室内で人物を撮った2カメラのうち、BだけGain調整後に窓の外が均一な白になったとします。

1. まずBの入力色域・Gamma、RCM／CST、LUTを確認し、Aと同じ表示条件へそろえます。技術変換が二重になっていないか確認します。
2. BのGainを上げる前のノードを一時的に比較し、窓の外の明暗差が元の処理信号に残っているかを見ます。**元から均一な白であれば、Soft Clipに模様の復元を期待しません。**
3. 元信号に雲や建物の濃淡があり、Gainを強めた後で急に切れるなら、先にGainの補正量を見直します。それでも端をなだらかに整えたい場合にHigh Softを試します。
4. Waveformの上端に値が集中しているか、窓と壁の境界が不自然に平らになっていないかを比較します。肌の明るさが大きく変わるなら、全体のGain変更やPower Windowを含めて設計を見直します。
5. AとBをカットで続けて再生し、窓の階調を守るために顔が不自然に暗くなっていないか確認します。

これは仮想ショットを用いた**判断手順**です。特定のカメラ素材で何段分の階調が戻るという保証や、Resolve 21.1で測定した結果ではありません。

## 判断例2：暗いジャケットが黒一色に見える

黒いジャケットを着た人物で、コントラスト調整後に襟と胴の境目が消えた場面を想定します。

1. 先に調整前のノードを比較し、ジャケットの暗部に階調があったかを確かめます。撮影時点のノイズや圧縮による限界も見ます。
2. 現在のノードでLift／Contrastやカーブによって黒を切り詰めていれば、その調整量をまず戻す方向で確認します。
3. 暗部の境界が急に切れている部分だけを穏やかにしたいならLow Softを試します。低い信号が一様な値へ張り付く場合はLow Clipの位置も確認します。
4. ジャケットの構造が見え始めても、画面全体が灰色に浮き過ぎればSoft Clipの量を減らします。周囲の黒い背景・髪・影にも作用するためです。
5. 動画として再生し、ノイズが増えて目立たないか、同一シーンの前後カットで黒レベルの印象が飛ばないか確認します。

一部分だけ暗部を見せたい場合、Soft Clipで画像全体を変えるより、[Power Windows](./power-windows)や[Log Wheels](./log-wheels)を使った調整が合うこともあります。

## Soft Clipとほかの処理を使い分ける

| 目的・症状 | 先に検討する処理 |
| --- | --- |
| 露出・ホワイトバランスが全体にずれている | [Primaries](./primaries-color-wheels)やCamera RAW設定の確認 |
| コントラストの中間調や曲線形状を設計したい | [Custom Curves](./custom-curves) |
| 明部／暗部の切れる手前をなだらかにしたい | **Soft Clip** |
| HDRからSDRへの表示・納品変換で強い圧縮が必要 | [RCM／CST](../learn/color-management-basics)の出力変換とTone Mappingを確認 |
| 肌だけ明るさを守り、窓の見え方を変えたい | [Power Windows](./power-windows)等を検討 |
| 書き出し後にだけ階調が変わる | [出力の色ズレ診断](../troubleshooting/export-color-mismatch) |

Soft ClipとCSTのTone Mappingはどちらも階調端の見え方へ影響し得ますが、**作用する段階と目的が異なります**。同じ映像に両方を使う場合、最終出力だけでなく各ノード前後を比較し、意図しない二重の圧縮やクリッピングがないかを見ます。

## よくある失敗

- **High Softを動かしても雲の模様が出ない**：撮影時に飽和した、または前段で既にクリップされた可能性があります。Soft Clipを後段に置くだけで失われた信号は戻りません。
- **ハイライトが暗く鈍く見える**：上端の圧縮量が大き過ぎるか、High Clip自体を下げた可能性があります。調整前と同じフレームで比較します。
- **シャドウが灰色に見える**：Low Soft／Low Clipと黒側の元の補正量を見直し、黒レベルと中間調を分けて評価します。
- **明るい物体が変色する**：RGB個別調整の影響を確認します。最初にGangで揃えた結果と比較します。
- **Viewerでは正常だが納品で違う**：出力変換、Video／Data Levels、色タグ、外部モニタリングの条件を別に点検します。[外部モニタリング](./external-monitoring)は表示系の比較に使えます。

## 出典・対象版・検証範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（[公式サポート](https://www.blackmagicdesign.com/support)、2026年9月8日公開）。公式配布は確認しましたが、本runでは容量約183MBのPDFを取得できず、Curves章のSoft Clip（既存Color記事ではPDF p.3198–3199と記録）を**直接再照合できていません**。
- **機能の直接根拠：** Blackmagic Design『[DaVinci Resolve 17 New Features Guide](https://documents.blackmagicdesign.com/SupportNotes/DaVinci_Resolve_17_New_Features_Guide.pdf)』、「Soft Clipping Adjustments」。Advanced Panelでのganged／RGB個別のSoft Clip制御が公式に説明されています。**Resolve 17時点の資料**であり、21.1のUI・パネル操作の完全一致は保証しません。
- **Soft Clipの概念とCurves内の位置：** Blackmagic Design『[DaVinci Resolve 11 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_11_Reference_Manual.pdf)』「Soft Clip」。明暗端にkneeを作り、RGBを連動または個別調整する説明を参照しました。**旧版の概念資料であり、現在の数値・UI配置の証拠には使用しません。**
- **Scopes／Primariesの一般説明：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』、2026年10月22日確認。
- **verification: partial。** 21.1のSoft Clip各パラメータの表示名と設定範囲、実機操作、Free／Studio差、素材を使った効果量の測定は未確認です。本文の例は公式に説明された処理概念に基づく仮想例です。

関連：[Custom Curves](./custom-curves)／[Scopes](./scopes)／[CST](./color-space-transform)／[ノード無効化による診断](../troubleshooting/node-bypass-diagnostics)。
