---
title: 納品前のColor QC：全編の色・階調・補正漏れを確認する
description: Lightbox、Scopes、Still比較、連続再生でColorページの色補正を点検し、出力後の確認と区別する実践手順。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Lightbox, Scopes, Waveform, RGB Parade, Vectorscope, Gallery, Still, Image Wipe, Split Screen, Clip Grade, Timeline Grade]
tasks: [quality-control, check-grades, match-shots, troubleshoot, delivery]
level: intermediate
updated: "2026-10-22"
---

# 納品前のColor QC：全編の色・階調・補正漏れを確認する

1カットずつグレーディングを終えても、編集順に並べると顔の明るさが急に変わる、数フレームだけQualifierの境界が見える、暗いショットで細部が消える、といった問題は残り得ます。ここでは**Colorページで補正漏れ・階調・色のつながり・動きのある局所補正・共通補正の副作用**を確認する手順を扱います。

Blackmagic Designの[公式Colorページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)は、Lightboxによるショット一覧、GalleryのStill、Wipe／Split Screen、Scopesを紹介しています。本記事はこれらの機能を組み合わせた制作上の点検方法であり、21.1実機での成功例ではありません。**Colorページの点検と、書き出したファイルの納品検査は分けます。**

## 0. 比較条件を固定する

まず対象の編集タイムラインと、案件で求められる出力条件を確認します。解像度、フレームレート、SDR／HDR、納品色空間・ガンマは指定内容を参照し、本レシピでは共通の数値を決めません。

[カラーマネージメントの基礎](../learn/color-management-basics)に沿って素材のInput、Timeline／Output、必要に応じてノード内CSTの担当を確認します。RCMと手動CSTの二重変換が疑われる場合は、微妙な色調整へ進む前に解消します。

Scopesの表示レンジや単位が変わっていないか、同じ比較条件で見ているかを確認します。SDRで使う慣用値をHDRのショットへ機械的に適用してはいけません。最後に、シーンごとの代表ショット、人物の肌、白い衣装、暗部、強い反射などの確認対象を決めておきます。

この時点でColorノードが**Clip、Group、Timelineのどのグレード段階**にあるかも確認します。[Group Grading](../reference/group-grading)と[Timelineグレーディング](../reference/timeline-grading)は作用する範囲が異なります。1ショットだけ直すつもりで全編共通ノードを変更しないようにします。

## 1. Lightboxで色の流れを一覧する

公式Colorページによれば、Lightboxはタイムライン内のクリップを、適用済みのグレードでサムネイル表示します。最初に全体を一覧して、補正漏れや場面内で浮くショットを探します。

1. Colorページ右上からLightboxを開き、場面ごとと全体の両方を確認します。
2. 同じ室内のカットで1枚だけ緑に偏る、夜のシーンに明るい未補正ショットが混じる、といった不連続を探します。
3. 気になるサムネイルを選んでLightboxを閉じ、該当クリップのViewer、Scopes、ノードを調べます。
4. 修正後に再びLightboxで比較し、周囲との差が適切になったか確認します。

意図的な照明変化、回想、挿入映像などは無理に同色へそろえません。また、サムネイルは時間変化を表さないため、LightboxだけでQC完了とはしません。

## 2. ScopesとViewerを一緒に見る

[Scopes](../reference/scopes)は信号の明暗・色成分・色相と彩度を客観的に比べるための道具です。モニターの見た目だけに依存せず、同じ条件で補正前後を確認します。

| Scope | QCで確認する例 | 誤判定しやすいこと |
| --- | --- | --- |
| Waveform | 明部への極端な集中、暗部のつぶれ、カット間の階調の跳び | 暗い演出そのものを失敗と決める |
| RGB Parade | 無彩色と考えた部分の色偏り、隣接カット間のチャンネル変化 | 画面全体のR・G・Bが一致すべきと考える |
| Vectorscope | 特定色の過剰な彩度、カットごとの色の方向 | 肌を固定の角度へ必ず一致させる |
| Histogram | ハイライトとシャドウの分布 | 画面上の問題位置や時間変化が確定すると考える |
| CIE Chromaticity | 色域の分布と出力先の関係を確認する材料 | 実際の書き出し・再生互換性まで証明したと考える |

例えば白いシャツが次のカットで急に真っ白になる場合、ViewerとWaveformでシャツの階調がどう変わったかを比べます。映像全体に暖色の壁が多い場合、RGB Paradeのチャンネル分布が違うこと自体は異常ではありません。**比較対象の面積や照明が異なれば、Scopeの図形も異なる**ためです。

上限・下限の数値で合否判定する場合は、出力仕様、色管理、Scopeの処理位置とレンジが確定してから適用します。このレシピでは未確認のIRE値や色域の閾値を指定しません。

## 3. Still／Wipeで同じ被写体を比較する

1. 照明が安定し自然に見える基準ショットを選び、[Gallery／Stills](../reference/gallery-stills)でStillを作ります。
2. 同じ人物や商品が映る別のショットを選び、基準Stillと**Image Wipe**または**Split Screen**で比べます。
3. 人物なら顔の中間調、肌と首のつながり、白い衣装を確認します。商品なら共通する素材色、反射、ハイライトの関係を見ます。
4. 差が大きいときはInput変換、[Primaries](../reference/primaries-color-wheels)、Group／Timelineの補正を確認します。異なる入力変換を強い二次補正で相殺する前に原因を調べます。
5. 静止画で比較した後、実際の編集順でも再生します。

**判断例：** 正面ショットの白いシャツは自然なのに、斜めからのショットでは青みが強い場合、カメラのInputの違いと窓光を先に調べます。全カットが同じ光源下ならClipの色バランスを調整できますが、斜めショットだけ窓光を強く受けている場合は、その差を残す判断もあります。[複数カメラのショットマッチング](./matching-multicamera-interview)も参照してください。

## 4. 動きのある区間を再生する

静止画像で自然でも、顔が動くとWindowが外れたり、ノイズ処理の残像が見えたりします。全編を通して再生し、特に次の区間では停止・再生を繰り返して点検します。

- **顔・手・髪が動く場所：** [HSL Qualifier](../reference/hsl-qualifier)のキーがちらつかないか、[Power Window](../reference/power-windows)と[Tracker](../reference/color-tracker)が遮蔽や顔の回転に追従するか。
- **暗い室内・歩行中：** [Noise Reduction](../reference/noise-reduction)で顔や服が不自然に平滑化されていないか、動く輪郭に残像がないか。
- **商品反射・細い線：** [Blur／Sharpen](../reference/blur-sharpen)で輪郭のにじみや過度な強調が生じていないか。
- **空・単色の壁・ゆるいグラデーション：** 局所補正の境界、帯状の階調、時間的な色の変化がないか。元素材、補正、圧縮に由来する問題を分けて調べます。
- **照明が変わる場面：** [Color Keyframes](../reference/color-keyframes)で調整が不連続になっていないか。

補正をかけた顔の縁に色が現れるなら、単純にTrackerを回し直す前に、キーの条件、Window、追跡結果、補正量を分けて評価します。[二次補正のちらつき](../troubleshooting/secondary-matte-flicker)も参照できます。

## 5. Group／Timeline共通補正の副作用を探す

共通補正を使っている場合、代表ショットだけが良く見えても、異なる条件の素材で悪化する可能性があります。

1. Clip、Group Pre-Clip／Post-Clip、Timelineのどの段階に補正があるかを確認します。
2. 最も明るいショット、暗いショット、肌、原色の衣装、白い商品など、性質の異なるカットを選びます。
3. 対象ノードの有効／無効を一時的に比べ、共通補正の利点と副作用を評価します。試験後は目的の状態へ戻します。
4. 特定シーンだけ問題があるなら、Timelineの一括処理を強める前に、ClipやGroupで扱えるか検討します。
5. 全体の見え方を変えたら、Lightboxへ戻って他のシーンも再確認します。

**判断例：** 全編の彩度を少し上げた結果、室内の家具は良く見えても、屋外の赤い看板だけ強くなったとします。全編へさらに別の補正を重ねるより、共通の彩度調整を弱め、屋外だけをClipで調整する方が適用範囲を制御できます。

## 6. Color QCを閉じ、出力後QCへ渡す

| 点検対象 | Colorページでの完成判定 |
| --- | --- |
| 補正漏れと色の流れ | Lightboxで不連続を特定し、意図した差と修正対象を区別した |
| 信号と階調 | ScopesとViewerで、納品条件に反する疑いを評価した |
| ショット間の連続性 | Still／Wipeで比較し、編集順の再生でも不要な跳びがない |
| 時間的な問題 | Window・Qualifier・Tracker・ノイズ処理などを動く区間で点検した |
| 共通補正の副作用 | Clip／Group／Timelineの作用範囲を確認し、別シーンも見直した |

**書き出し後のファイルは別に検査します。** Deliverページで出力した実ファイルについて、指定された形式、解像度、フレームレート、色空間・ガンマ等の納品条件を満たすか、映像と音声に欠落がないか、想定する再生環境で表示が大きく変わらないかを確認します。必要に応じて書き出し結果を再読み込みして比較します。ColorページのScopesだけでは、エンコード・タグ・再生アプリの解釈まで証明できません。

## 症状から原因を絞る

| 症状 | 先に調べること | 修正箇所の候補 |
| --- | --- | --- |
| 1カットだけ色が違う | Input、Clip補正、照明 | Clip |
| 1台のカメラ全体が違う | カメラInputとGroupの設定 | Input／Group |
| 全編に共通した偏りがある | Output変換、表示条件、Timeline補正 | 色管理／Timeline |
| 静止画は良いが再生で色が浮く | Qualifier、Window、Tracker、Keyframes | Clipの局所ノード |
| ハイライトがつぶれて見える | 素材の階調、出力変換、Scopeのレンジ | 変換／Clip |
| Viewerは正常だが納品ファイルが違う | 出力設定、色タグ、再生環境、実ファイル | 出力後QC |

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design[『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（2026年9月8日公開）。Lightbox、Scopes、Deliverの21.1該当章と実機画面は今回直接照合できず、UIの正確な位置や値域の確定根拠とはしていません。
- **直接確認した一次資料：** Blackmagic Design[「DaVinci Resolve — Color」](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)（2026年10月22日確認）。Scopes、Gallery／Still、Image Wipe／Split Screen、Lightboxの用途、およびCIE色度表示の説明を確認しました。
- **verification: partial。** 操作例とQC手順は公式機能に基づく想定ワークフローです。21.1実機、納品素材、SDR／HDRの規格値、Free／Studio差、書き出し後の再生互換性は未検証です。

関連：[Scopes](../reference/scopes)／[Gallery／Stills](../reference/gallery-stills)／[Timelineグレーディング](../reference/timeline-grading)／[カラーマネージメント](../learn/color-management-basics)
