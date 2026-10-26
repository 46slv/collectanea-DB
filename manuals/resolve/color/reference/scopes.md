---
title: Scopes（Waveform／Parade／Vectorscopeほか）
description: Resolve 21.1の5種類のVideo Scopes、表示スケールとExtentsを使い、明暗・色の変化を比較する方法。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Video Scopes, Waveform, Parade, Vectorscope, Histogram, CIE Chromaticity, Extents, Waveform Scale Style]
tasks: [read-scopes, balance-image, shot-matching, troubleshoot]
level: beginner
updated: "2026-10-26"
---

# Scopes：明暗と色の変化を、どの表示で確認するか

Scopes（Video Scopes）は、Colorページで調整中の映像信号をグラフとして分析する機能です。Viewerは被写体の見た目を、Scopesは明暗・色成分・彩度などの分布を確認するために併用します。Scopes上の線や点は画面の色づくりを直接変更しません。

例えば、隣り合うインタビューのショットで顔の明るさが合わない場合、まずWaveformで明暗のどの部分が違うかを見ます。無彩色の壁に色かぶりがあればParadeでRGB成分を比較します。色の方向や彩度の差を見たいときはVectorscopeを使います。ただし、グラフが一致すること自体をグレードの目標にはしません。

以下の操作名と機能区分は、Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 127、pp.3091–3104で直接確認したものです。実機による画面配置や出力映像の検証は未実施です。

## 5種類のScopeを使い分ける

| Scope | どんな情報を表示するか | 使う場面 |
| --- | --- | --- |
| **Waveform** | 画面の横方向の位置に対応するY（輝度）、CbCr、またはRGBの信号分布 | 顔と背景の明暗、黒・白付近の変化、補正前後の比較 |
| **Parade** | RGB／YRGB／YCbCrの成分を横並びで表示 | 無彩色の色かぶり、暗部・中間調・明部のチャンネル差 |
| **Vectorscope** | 色相を方向、彩度を中心からの距離として表示 | 肌や衣装の色方向、彩度の広がり、ショット間の色バランス |
| **Histogram** | RGBまたはYRGBについて、暗い値から明るい値までの画素数の分布 | 暗部や明部へ画素が偏っていないか、階調分布の変化 |
| **CIE Chromaticity** | CIE 1931 xy／CIE 1976 uvの色度図と色域三角形 | 現在の信号を色域の基準と比較する際の補助 |

WaveformとParadeは似た情報を別の配置で見せます。Waveformは同じ画面位置での上下分布を追うのに適し、ParadeはRGBを横に分けるため成分差を見比べやすくなります。Histogramは画像の**どの位置**にある画素かを示すものではなく、各値にどれくらいの画素が分布するかを示します。

### Waveform：全体の変化か、特定の明暗域か

Colorページで[Primaries](./primaries-color-wheels)を変更し、Waveformの暗部・中間調・明部がどう動いたかを見ます。Y表示は輝度成分の観察に向きます。RGB表示では3成分を重ねて見られ、Colorizeを有効にした状態でRGBの波形が重なる部分は白っぽく表示されます。

明るい領域のグラフが上端に集中して見えても、Scopeのスケールと表示設定、信号がどの段階の値なのかを確認せずに「出力が白飛びした」とは断定しません。画面内の実際の階調をViewerと元素材でも確認します。

### Parade：ニュートラルな被写体を手掛かりにする

ParadeはRGBの各波形を横並びに表示します。公式マニュアルはシャドウ・中間調・ハイライトでのチャンネルの高さを比較し、色かぶりの把握に使う方法を説明しています。

ただし、赤い壁が画面の大半を占めるショットでは、赤の波形が他の成分より高くなるのは自然です。**すべてのRGBグラフを同じ高さにする必要はありません。** 白い紙、グレーの壁など、撮影条件からニュートラルと判断できる被写体を手掛かりにします。照明自体に意図した色がある場合は、その演出を消すように機械的に中和しません。

### Vectorscope：色相と彩度を分けて読む

Vectorscopeの中心は彩度が低い状態を表し、中心から離れるほど彩度が高い成分を示します。どの方向へ延びるかで色相の傾向を把握します。調整後に分布の**方向が変わった**のか、**広がりだけが変わった**のかを分けて確認します。

VectorscopeはALLのほか、Low／Mid／Highを選んで明暗域別の色を分析できます。Show Skin Tone Indicatorは一般的な肌色方向の参考線であり、すべての人物の肌を必ずその線に合わせるための規格値ではありません。必要ならColorize、Show 2X Zoom、グラティキュール表示を使います。

### Histogram・CIE：用途を限定して読む

Histogramは画素の明暗分布を把握する道具です。山が片側へ寄っているだけで露出失敗とは限らず、暗いシーンの演出や黒い衣装でも分布は変わります。

CIE Chromaticityでは色域三角形と現在の信号を比較し、Additional Gamutで二つ目の色域三角形も表示できます。ただし、マニュアルは**二次元の図に収まっていることだけでは色域内であると証明できない**と明記しています。明部・暗部の三次元的な範囲を図が完全には表さないためです。三角形の外へのはみ出しは警告として有用ですが、納品仕様への適合判定をこの表示だけで完結させません。

## Scopesの開き方と表示を変える手順

1. ColorページのパレットボタンバーにあるVideo Scopeボタンを使って、画面右下のScopeを表示します。
2. 必要ならScope右上のExpandボタンでフローティングウィンドウへ切り替えます。公式マニュアルにはWorkspace > Video Scopes > On/Offから開く方法も記載されています。
3. フローティングウィンドウでは1／2／4／9分割の表示を選べます。各ペイン左上のScope名メニューからWaveform、Paradeなど表示したい種類を選びます。同じ種類のScopeを複数表示して設定を分けることもできます。
4. Scope名の右側にあるオプションから、種類ごとのColorizeやExtentsなどを調整します。全体のVideo ScopesオプションではスケールやQualityを変更できます。
5. 補正前後を比べる際は、**Scopeの種類・スケール・表示オプションを同じ状態**にしてから観察します。見た目だけでなく再生中の変化も確かめます。

公式マニュアルではMedia／DeliverページからもVideo Scopesを開けると説明されています。本記事の操作例はColorページのグレーディングを前提にしています。

## スケール表示と信号そのものを混同しない

21.1 Manualによると、通常のWaveform／Paradeの目盛りは内部処理中の**10-bit full-rangeの0–1023**を基準に表示されます。これはプロジェクトのVideo／Data Level設定をそのままScopeの既定目盛りに置き換えるという意味ではありません。

Video Scopesのオプション内、**Waveform Scale Style**では10-bit、12-bit、Percentage（0–100）、mVなどの目盛り表示を選べます。**Video Level Scopes**も表示スケールの切り替えであり、マニュアルはモニタリング出力やレンダリング出力には影響しないと説明しています。目盛りを変更して値の見かけが変わっても、グレードが変更されたとは判断しません。

HDRのときは**HDR (ST.2084/HLG)** スケールでnit（cd/m²）に基づく表示へ変更できます。21.1 Manual p.3093では、このHDRスケールを**Studio版のみ**と明記しています。さらにp.3094は、Resolve Color Managementを使わないワークフローでHDRスケールを有効にすると、出力色空間を手動でRec.709に設定していてもHDRとして表示され、正確な評価にならない場合があると警告しています。

したがって、HDRスケールを見た目だけで選ぶ前に、[Color Management](../learn/color-management-basics)の設定と納品先の条件を確認します。HDRスケールが使えることと、表示モニターがHDRで正確に校正されていることは別です。Free／Studioのそのほかの機能差はここで推測しません。

## 細部を確認するための表示設定

- **Extents**：波形や分布の最大・最小の逸脱を外形で示します。明部や暗部の端を評価するときに役立ちます。
- **Low Pass Filter**：Scopeの表示上のノイズを減らして内部を見やすくします。一方で極端なハイライト・シャドウの値を弱く見せることがあるため、ManualはExtentsとの併用を推奨しています。これは元映像のノイズ除去ではありません。
- **Colorize**：信号の分布を色情報で区別しやすくします。必要なチャンネルや被写体との対応を観察する補助です。
- **Display Qualifier Focus**：ViewerでQualifierのスポイトを動かした際に、対象画素が表示中のScopeのどの位置に対応するかを示します。[HSL Qualifier](./hsl-qualifier)で選択候補を分析するときの補助にできます。
- **Quality（Auto／High／Medium／Low）**：Scopeグラフの描画品質と処理負荷のバランスを変更します。映像に適用する画質パラメータではありません。

操作項目はManual Chapter 127、pp.3095–3104に基づきます。設定変更を試す前に、現在の表示条件を記録しておくと比較の誤認を防げます。

## 判断例1：インタビューの2カメラを合わせる

同じ室内のカメラA・Bで、Bの顔が暗く、背景の白い壁が少し緑に見える場合を想定します。

1. 両カメラの入力色域・Gammaと出力変換を先に確認します。設定が異なるまま色だけで合わせると、別の場所に差が残る場合があります。
2. [Gallery／Stills](./gallery-stills)の基準フレームなどを使い、照明や人物の向きが近いフレームを比較します。
3. WaveformのYで、Bが全体的に暗いのか、顔の中間調だけが低いのかを観察します。全体差と局所差を分けてから[Primaries](./primaries-color-wheels)の補正範囲を選びます。
4. ParadeのRGBで、白い壁に対応する部分のチャンネル差を観察します。緑の偏りがあっても、画面全体のRGBを一律に一致させることは目的にしません。
5. Vectorscopeで肌や背景の色方向がどう変わったか確認し、顔だけでなく衣装・壁の色が不自然になっていないかをViewerで判断します。最後にショットを連続再生します。

**採否の判断：** 壁のRGB差が小さくなっても肌が不自然に青く見えるなら補正量や範囲を見直します。この例は観察順を示す想定であり、実機の数値結果ではありません。

## 判断例2：明部の先端が見えない、HDR目盛りが合わない

窓の光が強いショットで、Low Pass Filterを有効にしたWaveformだけを見ると、ハイライトの先端が低く見える可能性があります。**Extentsを有効**にして最大の逸脱も見たうえで、Viewer上の窓の階調が残っているかを判断します。データがすでに失われている場合、Scopeの設定変更で階調が戻るわけではありません。

一方、Rec.709仕上げなのにHDRのnit目盛りで想定と違う値が出た場合は、まずWaveform Scale Styleとカラー管理の設定を確認します。スケールを変えて見た目だけ合わせる前に、信号処理と出力変換が適切かを分けて確認します。[外部モニタリング](./external-monitoring)の表示結果も別に点検します。

## 読み違えやすい症状

| 状況 | 確認すること |
| --- | --- |
| ParadeのRGBが一致しない | 無彩色と分かる被写体か、意図した照明・衣装の色ではないか |
| Vectorscopeが中心から離れている | 元のシーンの彩度・色相、色かぶりと演出の区別 |
| グラフの上端がはっきり見えない | Low Pass Filter、Extents、目盛り、Viewerの実際の明部 |
| 同じ映像なのにScopeの数値が変わる | Waveform Scale Style、Data／Video目盛り、HDRスケール |
| HDRのnit目盛りが出ない | ManualでStudio限定のHDR Scopeスケールかどうか |
| CIEの三角形内に収まる | 二次元投影では色域内適合を確証できない |
| Scopeを開くとプレビューが重い | ScopeのQualityや同時表示数、実機の処理負荷 |
| Scopesとモニターの印象が違う | 出力変換、モニター設定、表示経路。Scopeだけで表示品質は保証できない |

## 出典・版・未検証範囲

- **対象版・直接確認した一次資料：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（September 2026）、**Chapter 127「Viewers, Monitoring, and Video Scopes」pp.3091–3104**。5種類のScope、レイアウト、目盛り、各種表示設定、CIEの限界、HDRスケールのStudio限定を2026-10-26に本文照合。
- **補助資料：** [Blackmagic Design公式Colorページ](https://www.blackmagicdesign.com/products/davinciresolve/color)、[公式サポート](https://www.blackmagicdesign.com/support)。固有の操作名や版差は上記21.1 Manualを優先。
- **検証済み：** 21.1 Manualの機能説明・項目名・表示スケールと注意事項、原理に基づく観察方法。
- **未検証：** 21.1の実機UI配置、収録素材での数値・色の変化、モニターや出力経路、動作性能、その他のFree／Studio差、実際のHDR納品適合。上記の二つの判断例は想定手順で、実測ではありません。したがって `verification: partial` を維持します。

関連：[Primaries](./primaries-color-wheels)／[HDRパレット](./hdr-palette)／[HSL Qualifier](./hsl-qualifier)／[Gallery](./gallery-stills)／[Color Management](../learn/color-management-basics)。