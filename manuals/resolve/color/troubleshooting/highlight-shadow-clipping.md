---
title: 白飛び・黒つぶれの診断
description: ハイライトとシャドウの階調が失われたように見える場合に、Scopesとノード比較で原因の段階を確認する。
doc_type: troubleshooting
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Waveform, RGB Parade, Histogram, Node Editor, Color Management]
tasks: [troubleshoot, color-correct, highlight-recovery, shadow-detail]
level: intermediate
updated: "2026-10-23"
---

# 白飛び・黒つぶれをどこで起きたか調べる

窓が真っ白になる、暗い服の織り目が見えない。こうした症状は撮影時に情報が記録されなかった場合と、補正・色管理・表示の途中で記録済みの差が見えなくなった場合に分けて考えます。明るさを下げて白が灰色になっても、雲や布の模様が出なければ細部を復元したとは言えません。

修正前に確認するのは、**どの段階まで階調が残っているか**です。ColorページのViewerと[Scopes](../reference/scopes)、[ノード無効化](./node-bypass-diagnostics)による比較を使います。

## 原因を三つに分ける

| 原因候補 | 症状 | 調べるもの |
| --- | --- | --- |
| 撮影・収録時点 | 補正を戻しても領域が均一 | カメラ原本、RAW現像設定、別露出の素材 |
| 補正の途中 | 特定ノードの前には模様があり、後で消える | Gain／Lift／Contrast、Curves、LUT、CST |
| 表示・出力側 | Viewerと書き出し、別モニターで見え方が異なる | RCMのOutput、Levels、タグ、表示経路 |

LogやHDRの素材では、表示用の変換を通す前後で明暗の見え方が大きく変わり得ます。バイパスでコントラストが下がっただけでは、階調が正常に戻ったと断定できません。Input／Timeline／Outputは[カラーマネージメント](../learn/color-management-basics)で確認します。

## Scopesで見る場所

**Waveform**では、画面のどの位置の信号が明暗の端に集中しているかを見ます。**RGB Parade**では、一部のチャンネルだけが上端または下端へ寄っていないかを比べます。**Histogram**では、全体の階調分布と明暗端への集中を確認します。

Blackmagic Designの公式Colorページは、Paradeをチャンネルの偏り、Histogramをハイライト・シャドウの細部の確認に利用できると説明しています。ただし、Scopeの端に山があることだけでクリッピングは証明できません。白い無地の壁や暗い背景は、もともと均一な場合があります。必ずViewerで対象領域を見て、同じフレーム・同じ表示条件の補正前後を比べます。

**数値を固定の合格ラインにしません。** IRE、コード値、nitsなどの解釈は表示設定・色空間・納品条件によって変わります。この記事では21.1で未照合の閾値や初期値は示しません。

## Colorページでの確認手順

1. 問題が分かるフレームを決めます。[Still](../reference/gallery-stills)や[Versions](../reference/versions-and-grade-comparison)で比較用の状態を残し、既に無効なノードも記録します。
2. プロジェクトのColor Management、素材のInput、CST／LUTの位置、Outputを確認します。RAW素材なら[Camera RAW](../reference/camera-raw)の現像解釈も調べます。
3. Viewerで問題のある窓・衣服・背景を特定し、Waveform／Parade／Histogramを同じフレームで見ます。
4. 露出、Contrast、Curves、Look、CST／LUTを一度に変えず、段階的に比較します。ノードを切ると後段の入力も変化するため、一度のOFFだけで原因を確定しません。
5. Clipノードだけで解決しなければ、[Group](../reference/group-grading)／[Timeline](../reference/timeline-grading)の共通補正とOutput変換を確認します。
6. 差が消えた最初の段階が分かったら、強過ぎる補正や二重変換を先に見直します。端の階調を滑らかにしたい場合は[Soft Clip](../reference/soft-clip)も比較します。
7. 調査中の無効化・バイパス状態を元へ戻し、複数フレームと前後のカットで結果を検証します。

## 判断例：二台のカメラで窓の白さが違う

同じインタビューのAカメラでは窓の外の雲が見え、Bカメラでは窓が白一色に見えるとします。まず撮影モードとInput変換を確認し、RCM／CST／LUTの二重適用がないかを調べます。次にBの共通Lookと明るさの補正を段階的に比較します。補正前のBに雲の濃淡が残っていれば、その差を消したノードを修正します。

元のB素材でも雲の濃淡が見つからない場合、単にGainを下げても失われた模様は戻らない可能性があります。RAW現像や別のテイクを確認します。窓を暗くするために顔まで不自然に暗くならないよう、A・Bを続けて再生して判断します。

## 判断例：暗いジャケットの質感が消えた

補正前のジャケットに襟と胴の明暗差があり、コントラスト調整後に消えた場合は、その調整を先に緩めます。特定の暗部だけを調整するなら[Log Wheels](../reference/log-wheels)も候補です。暗部を持ち上げるとノイズが目立つ場合があるため、形が見えることと完成画像として自然なことを分けて評価します。元から差が無い素材へ、Soft Clipを追加しても情報は新しく生成されません。

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月8日公開、[公式サポート](https://www.blackmagicdesign.com/support)）。公開は確認しましたが、大容量PDFの該当章は本runで直接照合できていません。
- **直接確認した一次資料：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』（2026年10月23日確認）。Scopes、Parade、Histogram、ノード処理順、Color Managementの一般的説明。
- **verification: partial。** 21.1実機、Scopesの表示モード・スケール、RAW素材での復元可能範囲、Free／Studio差は未検証。二つの例は仮想例であり実測ではありません。

関連：[納品前Color QC](../recipes/pre-delivery-color-qc)／[書き出しの色ズレ](./export-color-mismatch)。
