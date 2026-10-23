---
title: 暗部を持ち上げるとノイズが増える・黒が浮くとき
description: シャドウ補正後のざらつきと黒浮きを、収録信号、グレード、表示変換、ノイズリダクションに分けて診断する。
doc_type: troubleshooting
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Waveform, RGB Parade, Primaries, Log Wheels, HDR Palette, Motion Effects, Temporal Noise Reduction, Spatial Noise Reduction]
tasks: [troubleshoot, shadow-detail, noise-reduction, black-level, shot-matching]
level: intermediate
updated: "2026-10-23"
---

# 暗部を持ち上げるとノイズが増える・黒が浮くとき

夜の室内を明るくしたら壁がざらつき、黒い服が灰色に見える。暗部の補正では、**見えなかった被写体の情報を表示すること**と、**記録されたノイズまで目立たせること**が同時に起き得ます。さらに、ノードの補正ではなく、色管理や表示経路の違いで黒が浅く見える場合もあります。これらを一つの「Liftの上げ過ぎ」として処理すると、必要な影まで失いやすくなります。

ここでは、原因の特定、必要な暗部の決定、ノイズ処理、ショット間の確認を順に行います。具体的な補正量は素材ごとに決めます。**21.1 Reference Manual Chapter 153によれば、ここで扱うColorページのMotion EffectsパレットはStudio版専用**です。利用できない環境ではNRの手順を飛ばし、まずグレード・表示変換・撮影素材を切り分けます。

## 症状を三つに分ける

| 見える症状 | 最初に疑う対象 | 確認したいこと |
| --- | --- | --- |
| 暗部を明るくしたときだけ粒や色のまだらが目立つ | 収録ノイズの露出、補正による増幅 | 元素材にも時間的・空間的な揺れがあるか |
| 本来暗いはずの領域が画面全体で灰色に見える | Lift／Offset、Contrast、カーブ、変換 | どのノードや処理段階から黒の見え方が変わったか |
| Viewerと書き出し、またはモニターで黒の深さが異なる | Output変換、Levels、再生ソフト、表示条件 | 同じ信号と同じ表示条件で比較できているか |

ノイズの量、被写体の明るさ、黒レベルの見え方は別の判断軸です。Scopes上で低い値が観測されても、暗部にノイズが無い証明にはなりません。また波形の底に信号が集まっているからといって、黒く見えるべき場所の細部が確実にクリップしているとは限りません。記録時の情報欠落と後段の階調消失は、[Scopes](../reference/scopes)の表示とノードごとの比較を併用して分けます。

## 1. 補正と表示の基準を確保する

1. ノイズが目立つフレームと、その前後の動きが分かる短い区間を選びます。[GalleryのStill](../reference/gallery-stills)や[Versions](../reference/versions-and-grade-comparison)で比較状態を残します。静止画一枚だけでは時間方向のちらつきやNRの副作用を判定できません。
2. [カラーマネージメント](../learn/color-management-basics)でInput／Timeline／Outputの解釈、手動CSTやLUTの場所を確認します。Log素材が変換前には平坦に見えることや、出力変換の違いで黒が浅く見えることを、補正による黒浮きと混同しないようにします。
3. [Node Graph](../learn/color-node-graph)で「ベース調整」「暗部の調整」「Look」「ノイズ処理」を識別します。Clip側だけでなく、必要に応じて[Group](../reference/group-grading)と[Timeline](../reference/timeline-grading)の共通補正を確認します。
4. 同じ表示条件で、ノードを順に比較します。[Node Graph](../learn/color-node-graph)の各処理を個別に比較し、一度に全処理を切るより、変化が初めて現れる段階を探します。NRをオフにした画像とベース補正自体をオフにした画像は区別します。
5. [Waveform／RGB Parade](../reference/scopes)とViewerを併用します。Paradeのチャンネルごとの変化は暗部の色かぶりを探す助けになりますが、画面全体のScopeだけでは顔や服の局所ノイズの程度は断定できません。

この段階で、**黒をどこまで暗く残すか**を決めます。壁の質感や衣装の境目が必要なのか、照明されていない部屋の奥は見せないのか。すべての暗部を一様に持ち上げることは完成条件ではありません。

## 2. 暗部の補正だけを切り分ける

まず[Primaries](../reference/primaries-color-wheels)で全体の明暗関係を確認します。Liftだけを動かして目的を達成しようとせず、ContrastやOffsetを含む既存の調整がどの領域へ影響しているか見ます。カーブを使用している場合は、暗部に急な形を作っていないか[Custom Curves](../reference/custom-curves)も確認します。

たとえば黒いジャケットの襟を少し見せたいだけなのに、暗い背景全体が灰色になっているなら、全画面補正の調整範囲が広過ぎる可能性があります。[Log Wheels](../reference/log-wheels)または[HDRパレット](../reference/hdr-palette)を使うと、特定の階調を他の領域から分けて扱う考え方が取れます。ただし階調境界は素材とコントロールの設定により変化します。「Shadowsなら背景を変えずに衣装だけ変わる」と決めつけず、背景と人物を同時に見ながら補正します。

調整を小さく戻したときにノイズが落ち着くなら、収録ノイズの存在に加え、補正でそれを目立たせていたと考えられます。一方、補正を戻しても大きく揺れる色斑が残る場合、NR以前に素材の圧縮や撮影条件を確認します。[Camera RAW](../reference/camera-raw)素材では現像時の露出やホワイトバランスの解釈も切り分けます。撮影時に記録されなかった細部は、シャドウを持ち上げるだけでは生成されません。

## 3. ノイズの種類と動きを観察する

ノイズ処理を加える前に、同じショットの**静止部分**と**動く部分**を再生して見ます。

- 暗い壁や空に色の細かい揺れがある場合は、LumaとChromaのどちらに見える変動が大きいか比較します。色のちらつきを無理に明度のコントラストだけで隠さないようにします。
- 肌や髪の輪郭が粒と一緒に動いている場合は、その部分が実際の細部かノイズかを再生で確認します。小さなモニター表示では差が見えにくいことがあります。
- 被写体が横切る瞬間に残像や輪郭の崩れが現れる場合は、時間方向の処理が動きに適合していない可能性があります。静止フレームだけがきれいでも合格にしません。
- ノイズに見えても、ブロック状の崩れ、バンディング、強い圧縮の模様などでは原因と有効な対策が異なることがあります。NRで一律に解決できるとは限りません。

Blackmagic Design公式Colorページと**21.1 Reference Manual Chapter 153（pp.3513–3519）**は、**Temporal NR**が複数フレームの時間方向、**Spatial NR**が一枚のフレーム内を対象にすることを説明しています。両方にLuma（明るさ）とChroma（色）のノイズ処理があり、Temporalは動きによる副作用、Spatialは細部の軟化に注意します。21.1 Manualは、このMotion Effectsパレットを**Studio Version Only**と明示しています。本記事はManual本文の読み取りに基づき、21.1実機での操作確認や画質比較はしていません。

## 4. Studio版でNRを加えるときの判断順

ノイズが問題となる場所を決めてから、ColorページのMotion Effectsで比較します。下記は21.1 Manual Chapter 153の「Using Noise Reduction」（pp.3517–3518）に基づく開始手順です。元の補正状態を記録し、必ず同じ区間で比較します。

1. まずStudio版の**Temporal NR**で **Number of Frames** を1〜5の範囲から選んで有効にします。フレーム数を増やすほど計算負荷が上がり、速い動きでは副作用も生じ得ます。まず動きの少ない壁と、人物・車外の動きを同時に観察します。
2. **Motion Est. Type**と**Motion Range**をショットの動きに合わせて選びます。動く領域の処理が不自然なら、単にノイズ量を強めず、動きを検出する条件や**Motion Threshold**を比較します。
3. 初めは連動した**Luma／Chroma Threshold**を少しずつ上げ、静止領域でノイズが減り始める点を探します。色のまだらが優勢ならリンクを解除し、Lumaを過度に上げずChroma側を別に比較します。ここで特定の数値を全素材へ適用しません。
4. Temporalだけでは気になる細かい粒が残るときだけ**Spatial NR**を追加します。髪・ジャケットの織り目・肌・窓枠が平滑化されすぎないか確認します。Spatialの**Radius**を大きくすると品質と処理負荷の両方が変わるため、拡大画像だけでなく最終表示サイズでも比べます。
5. 両処理の**NR Blend**を使う場合は、未処理画像と処理後画像の混合量を調整できます。NR量を決めたら、NRなし／ありを同じフレーム・同じ表示倍率・通常速度で比較します。静止画の改善だけでなく残像・輪郭の崩れがないことを合格条件にします。

**ノードの配置でも結果が変わります。** Manual p.3519は、ノードツリーの前段でNRを行うと後続補正でノイズが強調されにくい一方、細部が柔らかくなる可能性があること、後段なら輪郭の鮮明さが残る場合もあることを説明しています。また、同一ノードでNRと色補正を使う場合はNRが先に処理されます。NR専用ノードを作って配置を比較すると、結果の差を切り分けやすくなります。

Studio版の処理を利用できない環境では、ここでの具体的なNRコントロールを探す必要はありません。グレードの調整量を見直し、素材の暗部情報と納品表示条件を確認するところまでを実施します。

## 判断例：車内の夜景と暗い上着

車内から街灯を背景に乗員を撮影したショットを想定します。運転席側の上着はほぼ黒い一方、窓の外の街灯は明るく、車も走行している状況です。全体の明るさを上げると上着のしわは見えますが、車外の暗い建物と車内の天井に色ノイズが現れました。

この場合、街灯の明るさを基準に露出を一括変更する前に、上着のしわを視認できる程度と背景を暗く保つ程度を決めます。暗部補正ノードを弱め、背景ノイズと上着の質感の変化を比べます。それでも上着を明るくする必要があれば、[Power Window](../reference/power-windows)での局所補正や階調範囲を限定した補正を検討します。色ノイズを抑える処理が使える場合でも、走る車外の明かりに残像が出ないか、カメラ移動中の窓枠が滲まないかを確認します。

この例は架空のショットです。夜景の黒を完全に0へそろえることも、すべての服のしわを見せることも正解とは限りません。意図した暗さ、車内外の空間感、前後ショットとのつながりを完成条件にします。

## NRを使っても直らない場合

| 状況 | 先に確認すること | 次の判断 |
| --- | --- | --- |
| 黒が灰色のまま | Display／Output変換、全体のLift・Offset、Group／Timeline | ノイズではなく信号と表示の問題なら補正経路を修正する |
| NRを加えると顔がのっぺりする | Luma／Chromaの処理量、Spatialによる細部減少 | 質感の重要な箇所を優先して処理を弱める |
| 動く人物に残像が出る | Temporalを使った区間と動きの速さ | 時間方向の処理を弱めるか、別の方法を比較する |
| 補正を戻しても暗部が色斑だらけ | カメラ原本、現像、圧縮、撮影条件 | 取り除けるノイズと残す細部の限界を確認する |
| Viewerでは正常なのに納品物だけ黒が浅い | 書き出し後のプレーヤー、表示モニター、Levelsと色タグ | [書き出し時の色ズレ](./export-color-mismatch)を調べる |
| 一つのショットだけNRの質感が異なる | 別カメラ／ISO／圧縮形式、他ショットの補正 | 同一数値の適用よりショット別に見直す |

## 完成判定

暗部を持ち上げた理由と必要な階調が説明でき、意図した黒の深さが維持され、人物の動きや細部に不自然な残像・塗りつぶしがない状態を目標にします。背景を完全に無ノイズへすることだけを基準にせず、隣接ショットと通常速度で通して確認します。[納品前Color QC](../recipes/pre-delivery-color-qc)でも、ノードの有効状態、比較表示、色管理が最終状態へ戻っていることを確かめます。

## 出典・対象版・確認範囲

- **対象版と直接照合したマニュアル：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（[公式サポート](https://www.blackmagicdesign.com/support)、2026年9月8日付）、Chapter 153「The Motion Effects and Blur Palettes」pp.3513–3519（2026年10月23日、公式PDF本文を直接抽出して確認）。Studio専用のMotion Effects、Temporal／Spatial NR、Luma／Chroma、Motion Estimation、NR Blend、ノード内のNR処理順を確認しました。
- **公式Color資料：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』（2026年10月23日確認）。「Advanced Noise Reduction」「Professional Scopes」「Professional Color Management」「Log Grading」「Primary Adjustment Controls」の説明を参照。
- **verification: partial。** マニュアルの該当項目とStudio版条件は一次資料で確認済みです。素材と判断例は仮想ケースであり、21.1実機の操作、特定のNR数値・画質・GPU性能、Color Managementの個別構成、再生・書き出し結果は未検証です。

関連：[Noise Reduction](../reference/noise-reduction)／[Log Wheels](../reference/log-wheels)／[書き出し後の色ズレ](./export-color-mismatch)。