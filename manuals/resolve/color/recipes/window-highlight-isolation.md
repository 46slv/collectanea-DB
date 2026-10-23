---
title: 逆光の窓だけを整える：Power Windowによる局所ハイライト補正
description: 室内インタビューの明るい窓をPower Windowで分離し、人物と室内の明るさを守りながら階調・境界・動きを確認する。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Power Window, Linear, Polygonal, Softness, Primaries, Tracker, Waveform, RGB Parade]
tasks: [highlight-correction, secondary-grading, window-isolation, shot-matching]
level: intermediate
updated: "2026-10-23"
---

# 逆光の窓だけを整える：Power Windowによる局所ハイライト補正

室内インタビューで顔の明るさを整えると、背後の窓だけが強く目立つことがあります。画像全体のGainを下げると顔や室内も暗くなるため、このレシピでは窓専用の補正ノードとPower Windowを使い、**人物の明るさを保ちながら窓の印象を調整**します。

目的は外の景色を必ず見せることではありません。窓だけが視線を奪わず、昼間の逆光としての自然さを残すことです。収録時に失われた雲や建物の模様は、窓を暗くしても復元できません。最初に[白飛び・黒つぶれの診断](../troubleshooting/highlight-shadow-clipping)で、どの段階に階調が残っているかを調べます。

## 想定するショットと完成条件

昼間の室内で人物が画面左側に座り、右奥に四角い窓があるショットを想定します。顔と白いシャツは適切な明るさで、窓の外の木々にはわずかな濃淡が残っています。会話中に人物の腕が窓の前を横切ります。

完成条件は、窓の明るさが落ち着いても昼間の窓光として見え、顔・シャツ・壁・窓枠の明るさや色が不自然に変わらないことです。さらに再生中にWindowの輪郭や位置ずれが見えず、前後カットとつながる必要があります。窓の白を特定のIRE値にそろえたり、すべてのショットで屋外のディテールを同じ量だけ見せたりすることは条件にしません。

## 1. Windowを作る前に階調を確認する

1. Colorページで対象クリップを選び、[カラーマネージメント](../learn/color-management-basics)のInput／Timeline／Output設定と既存のCST・LUTを確認します。Log素材を表示変換した後の見え方だけで元信号の限界を判断しません。
2. [ノードバイパス診断](../troubleshooting/node-bypass-diagnostics)で、ベース補正やLookの前後を比較します。窓の濃淡が消える段階が分かれば、その補正量を先に見直します。
3. [Scopes](../reference/scopes)のWaveformを使い、窓の位置に対応する明部がどのように変化するかを見ます。RGB Paradeでは、後の補正で窓の白に強い色かぶりが生じていないかを調べます。
4. RAW素材で収録時の階調が残っている可能性があれば、[Camera RAW](../reference/camera-raw)の設定を別に確認します。Windowで白い面を灰色へ下げたことを、失われた細部の復元と混同しません。

**判断例：** Gainを弱めたら窓の外の木々が見えるなら、まずベース補正で扱える問題です。一方、補正を外しても窓が完全に均一なら、Power Windowを追加しても元の木々を再生できるわけではありません。

## 2. 窓用のシリアルノードを分ける

1. [Gallery／Stills](../reference/gallery-stills)または[Versions](../reference/versions-and-grade-comparison)で、比較可能な状態を残します。
2. [Node Graph](../learn/color-node-graph)に、窓専用のシリアルノードを追加します。既存の全体補正用ノードへWindowを追加すると、そのノードの補正がWindow内に限定されるため、補正の役割を分けます。
3. Windowパレットから形状を選びます。単純な四角い窓では**Linear**、遠近で斜めに見える輪郭や不規則な形では**Polygonal**を候補とします。
4. ViewerでWindowの形、位置、範囲を合わせます。最初は細かな窓枠に完全一致させるより、窓を覆うおおよその形で弱い補正を試します。形状別の操作と性質は[Power Windows](../reference/power-windows)を参照してください。

Windowそのものは画素の明るさを判定しません。選択範囲に暗い窓枠や反射があれば、そこも同じノードの補正を受け得ます。必要な場合だけ[HSL Qualifier](../reference/hsl-qualifier)の輝度条件との交差を検討します。選択条件を増やすと、木の葉や反射が細かく出入りしたときにちらつく場合があるため、単純なWindowで成立するなら複雑にしません。

## 3. Softnessと補正量を別々に調整する

窓枠のように明瞭な境界に対してSoftnessを広げ過ぎると、壁まで暗くなる場合があります。逆に硬い境界のままでは、カメラの微小な動きで暗い矩形が見えることがあります。WindowのSoftnessは、窓枠・壁・人物を通常表示で見ながら調整します。

その後、窓専用ノードの[Primaries](../reference/primaries-color-wheels)などで明部の明るさを控えめに下げます。Gainはハイライト側を中心に作用しますが中間調にも影響し得るので、窓枠や窓に映り込んだ室内の見え方も確認します。値の目安を固定せず、ノードを有効／無効にして採否を判断します。

Viewerでは窓が灰色になっただけではないか、外の濃淡が自然に見えているかを調べます。Waveformでは明部の分布を、RGB Paradeでは補正後の色成分の差を確認します。窓光がもともと青い場合は、無条件に白へ補正しません。明部端で急に階調が切れているときは、前段の露出やContrastを再点検し、必要なら[Soft Clip](../reference/soft-clip)も比較します。Soft ClipとPower Windowは作用する対象が異なるため、目的を区別して使います。

## 4. 人物やカメラの動きを確認する

カメラが固定で窓が画面上の同じ位置にあるなら、Windowを固定したままで足りる場合があります。カメラがパン・チルト・ズームする場合は、[Tracker](../reference/color-tracker)でWindowを追従させる方法を検討します。Blackmagic Designの公式Colorページでは、Windowを選択してTrackerで動きを解析し、Windowをアニメートする流れが示されています。

Trackerの解析が終わっても、窓枠との一致が保証されるわけではありません。冒頭、中間、終盤を確認し、速い動きや遮蔽の前後は連続再生します。

**腕が窓の前を横切る場合：** Windowの内側に入った腕まで暗くなることがあります。窓の追従と腕の除外は別の問題です。補正を弱める、腕を除外する別Windowを検討する、ショットの問題区間だけ別の対応を行うなど、最も少ない調整で自然になる方法を選びます。腕が横切る瞬間だけ暗く変色するなら完成ではありません。

## 5. 画面全体で仕上がりを判断する

1. Windowの輪郭表示を外し、通常のViewerで窓枠、壁、人物を確認します。輪郭表示中には気付きにくい暗い縁が出ることがあります。
2. 窓用ノードだけを無効化し、視線誘導、人物の明るさ、室内外の光量差を比較します。補正前の方が自然なら採用しません。
3. 隣接ショットと続けて再生します。窓の輝度を無理に同じ数値へそろえるより、人物と背景のつながりを優先します。[マルチカメラのマッチング](./matching-multicamera-interview)も参照してください。
4. [外部モニタリング](../reference/external-monitoring)や[納品前Color QC](./pre-delivery-color-qc)で必要な表示・出力条件を確認します。Windowで明部を下げただけでは、納品信号の適合は証明できません。
5. 診断中に変えたノードの有効状態、バイパス、Viewer表示を元に戻し、最終グレードで再確認します。

## 症状と切り分け

| 症状 | 先に確認するもの |
| --- | --- |
| 窓を暗くしても木々が見えない | 原本の階調、前段のクリッピング、RAW現像 |
| 窓枠や壁だけ暗い | Windowの位置・形・Softness、補正量 |
| 顔まで暗くなる | Windowと人物の重なり、全体補正ノードとの分離 |
| 再生すると暗い形が動く | Tracker、遮蔽、Windowの時間変化 |
| 窓が灰色で不自然 | 明部を下げ過ぎていないか、昼間の光量差 |
| 窓の色が急に変わる | RGB別の変化、入出力変換、窓光の本来の色 |
| Viewerと書き出しで異なる | [出力色の相違](../troubleshooting/export-color-mismatch)、表示経路 |

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月8日公開、[公式サポート](https://www.blackmagicdesign.com/support)）。本runで大容量PDFの該当本文を直接照合できていません。既存の[Power Windows記事](../reference/power-windows)には「Secondary Windows」（PDF p.3265–3279）の照合記録がありますが、ここでは21.1固有のUI位置・数値・ショートカットの確定根拠には使いません。
- **直接確認した一次資料：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』（2026年10月23日確認）。Power Window、ノード、Tracker、Primaries、Scopesの機能説明に依拠。
- **verification: partial。** 本文は公式機能を組み合わせた仮想インタビュー素材のレシピです。Resolve 21.1実機の操作、実素材での効果量、トラッキング精度、Free／Studio差は未検証です。固定数値や収録済み情報の復元保証は示していません。

関連：[Power Windows](../reference/power-windows)／[Scopes](../reference/scopes)／[白飛びの原因診断](../troubleshooting/highlight-shadow-clipping)。
