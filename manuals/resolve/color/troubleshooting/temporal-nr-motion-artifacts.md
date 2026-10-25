---
title: Temporal NRで動く輪郭に残像・にじみが出るとき
description: 時間方向のノイズ除去で手や顔の輪郭が引きずられる場合に、フレーム数、動き検出、しきい値、処理量を順に切り分ける。
doc_type: troubleshooting
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Motion Effects, Temporal NR, Number of Frames, Motion Est. Type, Motion Range, Motion Threshold, Luma Threshold, Chroma Threshold, NR Blend, Spatial NR]
tasks: [troubleshoot, denoise, preserve-detail, motion-artifacts]
level: intermediate
updated: "2026-10-25"
---

# Temporal NRで動く輪郭に残像・にじみが出るとき

暗い室内のノイズを減らした後、静止した壁は滑らかなのに、人物の手や顔が動くと輪郭が引きずられて見えることがあります。Colorページの**Temporal NR**は複数フレームを利用するため、動きのある領域にも強く適用すると不自然な時間方向の変化が生じ得ます。

このページは、**ノイズ除去を止めると症状が消えるか**から始め、動き検出と処理量を順に確認する診断手順です。ノイズが多い映像を最初から仕上げる手順や、全般的な設定項目は[Noise Reductionの機能解説](../reference/noise-reduction)を参照してください。

**対象はDaVinci Resolve 21.1 Studio版**です。公式Reference ManualのChapter 153は、ColorページのMotion EffectsパレットをStudio版専用と明記しています。Free版で同じパレットが使えるという前提で操作を案内しません。

## 最初に症状を切り分ける

例として、固定カメラで撮った薄暗いインタビューを考えます。背景の壁には細かな色ノイズがあり、話者は途中で顔を横に向け、手を顔の前で動かします。処理後は壁が落ち着いた一方、手と頬の境界が動く数フレームだけ不自然に見える、という想定です。

確認するのは、**壁のノイズ／髪や服の細部／動く輪郭**の三つです。問題のない静止フレームと、輪郭が崩れる短い区間を同じ表示条件で比べます。

| 見える状態 | 先に確認すること |
| --- | --- |
| Temporal NRを外すと動く輪郭の違和感が消える | フレーム数、動き検出、Motion Threshold、処理量 |
| Temporal NRを外しても同じ残像が見える | 元映像のモーションブラー、圧縮、別の効果や補正 |
| 輪郭の時間的な残像ではなく、毛髪や生地がぼやける | Luma／Chroma Threshold、Spatial NR、別のBlur／Sharpen |
| 静止画は良いが動き始めると急に質感が変わる | 動く箇所をNRが除外できているか、実再生で再確認 |

まずColorページの**Motion Effects**にあるTemporal NRの現設定を控えます。比較のために**Number of Framesを0**にすると、21.1 Manualで説明されるフレーム平均化を停止できます。元の値へ戻せるようにしてから、問題区間を再生します。ノードや他の補正も同時に無効化すると原因を分けにくくなります。

Temporal NRを外しても症状が残る場合、以下の調整だけで原因を説明しないでください。[Nodeのバイパス診断](./node-bypass-diagnostics)で別の効果も切り分けます。

## 動きのある領域にNRを適用しすぎないための判断

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 153（pp.3513–3514、3517）は、次の関係を説明しています。

| 項目 | 21.1 Manualで確認できる動作 | 残像が気になるときの判断 |
| --- | --- | --- |
| **Number of Frames** | 0～5。値を増やすと時間方向の参照が増え、計算負荷や速い動きの副作用も増え得る | まず少ないフレーム数へ戻して比較する。速い動きには1が適する場合がある |
| **Motion Est. Type** | Fasterは軽量、Betterは動きの判定がより正確だが重い。Noneは動き検出を無効化する | 動きの除外が不十分ならBetterを試す。Noneは「より高品質」の選択肢ではない |
| **Motion Range** | Small／Medium／Largeは、動きの速さやブレの範囲を想定して除外領域を変える | 速く動く手などではLarge側を比較する。常にLargeが正解とは限らない |
| **Motion Threshold** | **下げると**小さな動きも検出し、Temporal NRから除外する領域が増える。**上げると**動く領域にもNRがかかりやすい | 残像が出る場所をNRから外したいなら下げる方向を試す |
| **Luma／Chroma Threshold** | 明るさ・色に対するNRの強さを別々に調整できる。初期状態では連動する | 輪郭や細部が消えるなら強さを戻し、色ノイズ主体なら成分を分けて比較する |
| **NR Blend** | 0.0はNR処理側、100.0は未処理側 | 設定を戻したいのに見た目が変わらない場合、混合方向を取り違えていないか見る |

これは項目の役割をまとめたもので、特定の素材に適用する推奨プリセットではありません。値を変えるたびに、壁のノイズだけでなく手・顔・髪の動きを確認します。

## 診断手順：人物が振り向く区間を使う

1. **比較位置を固定する。** 壁のノイズと人物の輪郭が同時に見える短い区間を選びます。Temporal NRの現設定を記録し、Number of Framesを0にして症状が消えるか確認します。消えなければここでTemporal NRの調整を止め、元映像や他の処理を調べます。
2. **フレーム数を減らす。** Temporal NRを再度使う必要がある場合、Number of Framesを少ない値から試します。壁のノイズが少し残っても、動く輪郭を守れるか確認します。フレーム数を増やすことだけで品質が改善するとは限りません。
3. **動き検出を比較する。** Motion Est. TypeをFaster／Betterで比較し、動きが速い区間ではMotion Rangeも確認します。BetterやLargeは計算負荷とノイズ低減の対象範囲を変えるため、見た目の採否を優先します。
4. **Motion Thresholdを下げる方向で比較する。** 手や顔の動きがNRに巻き込まれているようなら、少しずつ下げて動く領域の除外を増やします。壁のノイズ低減が弱くなる可能性があるので、背景と人物を同時に見ます。
5. **残像が軽くなっても細部が不自然なら処理量を戻す。** Luma／Chroma Thresholdを控えめにし、色ノイズだけが問題なら連動を解除してChroma側を必要な範囲で調整します。効果全体が強すぎる場合はNR Blendを未処理側へ寄せて比較します。
6. **同じ動きを再生して採否を決める。** 静止時の壁、振り向く顔、顔の前を横切る手、動き終わった輪郭を順に確認します。隣接ショットも再生し、処理したカットだけ異様に滑らかになっていないか見ます。

この手順はManual記載の調整方向に基づく**診断例**です。人物の動き、収録ノイズ、圧縮、解像度、GPU性能によって有効な組み合わせは異なります。「Better＋Large」や特定のThreshold値で必ず解決するとは断定しません。

## まだノイズが多い場合

動く輪郭を守るためにTemporal NRを弱めると、背景に粒が残ることがあります。21.1 Manual pp.3517–3518は、Temporal NRを試した後に、必要ならSpatial NRを追加する流れを説明しています。Spatial NRは時間方向ではなく単一フレーム内のノイズに作用するため、動く領域の残留ノイズを減らす候補になります。

ただし、Spatial NRを強くすると毛髪や衣服の微細な模様が失われ得ます。**Temporalの残像をSpatialで修復する**と考えず、時間方向の副作用を先に許容範囲まで減らし、その後で残ったノイズと細部を比較します。[暗部ノイズと黒浮きの診断](./shadow-noise-and-lifted-blacks)も併せて確認してください。

再生が重くなった場合は、処理時間の増加と画像の副作用を分けて評価します。プレビューが不安定なら、正規の書き出し結果でも同じ症状があるかを別途確かめます。再生性能やGPU構成ごとの閾値をここでは決めません。

## 完成判定と失敗条件

この例での合格条件は、背景のノイズが許容範囲まで減り、**動く手・顔の輪郭に新たな引きずりや不自然な質感の変化が見えない**ことです。すべての粒を消す必要はありません。静止画だけでなく、問題区間とその前後を通常速度で確認します。

不合格となるのは、壁は滑らかでも手の残像が残る、顔の動き始めだけ質感が変わる、髪の細部が過度に消える、または他ショットとの粒状感の差が目立つ状態です。Temporal NRを0へ戻しても変化しないなら、このページの原因分類を確定せず、元の映像・別ノード・Blurなどを確認します。

## 出典・対象版・未検証範囲

- **対象版：DaVinci Resolve 21.1 Studio。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』Chapter 153「The Motion Effects and Blur Palettes」pp.3512–3518。2026年10月25日に該当箇所を直接確認。Motion EffectsのStudio版限定、Temporalのフレーム数、Motion Estimation、Motion Range／Threshold、Luma／Chroma Threshold、NR Blend、Temporal後にSpatialを試す手順を確認しました。
- **verification: partial。** このインタビュー例は想定素材です。21.1 Studio実機での操作・処理結果、GPUごとの負荷、プレビューと書き出しの一致、具体的な数値プリセットの有効性は未検証です。撮影時のモーションブラーとNR副作用の見分け方は診断上の提案であり、個別素材での原因確定ではありません。

関連：[Noise Reduction](../reference/noise-reduction)／[Nodeのバイパス診断](./node-bypass-diagnostics)／[暗部ノイズと黒浮き](./shadow-noise-and-lifted-blacks)／[納品前Color QC](../recipes/pre-delivery-color-qc)
