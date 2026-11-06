---
title: Deflicker（Krokodove）
description: 連続フレームのちらつきを抑えるDeflicker。画面全体と局所的な明滅、AverageやResolve FXとの違いを整理する。
doc_type: node
term_id: deflicker
term_short: 連続するフレーム間で発生する画面全体または一部のちらつきを抑えるKrokodoveの画像ツール。
verification: partial
aliases: [Deflicker]
concepts: [image-data]
nodes: [Deflicker]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-20'
---

# Deflicker（Krokodove）

**Deflicker**は、動画の連続するフレーム間で発生する**ちらつき（フリッカー）**を減らすためのKrokodoveの画像ツールです。DaVinci Resolve 21.1 Reference Manualでは、連続フレームに生じる局所的（regional）または画面全体（global）のフリッカーを取り除くものと説明されています。

ここでいうちらつきとは、被写体が移動したことではなく、本来は安定して見えるはずの明るさや見え方がフレームごとに不規則に変わる現象です。たとえば固定カメラで撮った室内で、照明の影響により壁の明るさだけが上下して見える場合があります。

ただし、21.1 ManualのKrokodove項目は機能を一行で紹介する表です。**何を比較して補正するのか、どの範囲を分析するのか、Inspectorの正式項目や初期値**までは記載されていません。このページでは資料で確認できた役割と、そこから考えられる制作上の使い方を分けて説明します。

## 何を直すツールなのか

フリッカーには、見える範囲によって異なる例があります。

- **画面全体のちらつき：** 同じ構図なのに、あるフレームだけ映像全体が明るく、次のフレームでは暗く見える。Manualのglobalに当たる例です。
- **一部分のちらつき：** 背景の一角や照明の当たった領域など、特定の場所だけが明滅して見える。Manualのregionalに当たる例です。

この区別は、**補正の対象になり得る範囲**の説明です。「画面内を自動分割する」「動きベクトルで追跡する」「輝度だけを修正する」といった内部方式が確認できたわけではありません。色がどのように変化するのか、局所領域をどう検出するのかも未確認です。

フリッカーを直す際には、時間軸が重要です。静止画を一枚だけ見て色や露出を調整するのではなく、前後のフレームと見比べ、明るさの揺れが収まったかを**再生して判断**します。

<!-- capture:S269 -->

## 実機例：明るさが変わる合成入力

明るさを時間で変える単色の合成画像を `Deflicker` に接続し、ReferenceをFixed Time 0、TypeをGlobal、Based OnをAllに設定しました。フレーム61と63では、入力は明から暗へ変わり、出力はどちらも灰色に見えます。これは固定参照を使った合成入力の例です。出力画素の数値や実映像、ほかのモードは未検証です。[接続と設定の記録](/img/fusion/captures/S269/readback.json)に条件を記載しています。

[![単色画像をDeflickerへつなぐノード構成](/img/fusion/captures/S269/graph.png)](/img/fusion/captures/S269/graph.png)

明るさが変化する合成画像をDeflickerへ渡します。

[![DeflickerのInspector](/img/fusion/captures/S269/controls.png)](/img/fusion/captures/S269/controls.png)

Fixed Time 0、Global、Allを指定します。

[![フレーム63の暗い入力](/img/fusion/captures/S269/low.png)](/img/fusion/captures/S269/low.png)

フレーム63の入力は暗く見えます。

[![フレーム63の灰色の出力](/img/fusion/captures/S269/high.png)](/img/fusion/captures/S269/high.png)

フレーム63の出力は灰色に見えます。

[![フレーム61の明るい入力](/img/fusion/captures/S269/input-61.png)](/img/fusion/captures/S269/input-61.png)

フレーム61の入力は明るく見えます。

[![フレーム61の灰色の出力](/img/fusion/captures/S269/output-61.png)](/img/fusion/captures/S269/output-61.png)

フレーム61の出力も灰色に見えます。

[再現用Graph](/img/fusion/captures/S269/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S269/capture.json)

<!-- /capture:S269 -->

## 入力と出力

| 段階 | データ | 役割 |
| --- | --- | --- |
| 入力 | 2D <Term id="image">Image</Term> | ちらつきを含む動画・合成画像のフレーム列を渡す。 |
| 処理 | Deflicker | 時間とともに変動する局所的または全体的なちらつきを抑える。 |
| 出力 | 2D Image | 補正後の画像を後段の処理や出力へ渡す。 |

これは21.1 Manualの「Image Pixel Tools」という分類と、リポジトリの既存データ分類に基づく説明です。**端子の正確な数・色・名称、Effect Mask入力の有無、RGBAやAlphaの扱い**はこの資料だけでは確認できません。Imageの入力を説明していても、補助入力がないと断定するものではありません。

## どんなときに使うか

### 固定撮影で明るさが揺れるとき

タイムラプスや室内の固定撮影では、構図が変わらないのに一部のフレームだけ明るさが違って見えることがあります。まず元映像を再生し、変動が画面全体に及ぶのか、特定の領域だけなのかを観察します。そのうえでDeflickerによる変化を比較します。

ただし、タイムラプス専用モードがKrokodoveのDeflickerにあるとは確認できていません。素材によって補正できる範囲も未検証です。

### 照明の影響で一部が明滅するとき

蛍光灯やLEDなどの照明環境によって、一定の場所がフレームごとに明るくなったり暗くなったりする場合があります。局所的な揺れを抑えたい場面は、Manualのregionalという説明に合う使用候補です。

撮影時のシャッターや照明の周期による帯状の変化まで、Krokodove版がどの程度修正できるかは未確認です。あらゆる照明フリッカーを除去できるとは考えず、問題のあるカットで効果を確認します。

### 他の時間処理に入る前の素材を整える

フレーム間で色や明るさが大きく変わる映像は、光学フローの解析や隣接フレームを使った補修で、つながりが不自然に見える原因になることがあります。21.1 ManualのOptical FlowとRepair Frameの説明でも、フリッカーがある素材を事前に整えることが有用な場合があると案内しています。

ただし、それらの記述は**一般的な前処理の助言**であり、Krokodove Deflickerを必須とする指定ではありません。ほかの補正方法でも目的を達成できる場合があります。

## 確認用の接続例

次は作業順を理解するための**構成案**で、Krokodove Deflickerの公式作例ではありません。

    MediaIn（明滅のある素材） → Deflicker → MediaOut

1. 明るさが揺れている数秒の素材を用意し、何も処理していない状態で繰り返し再生します。明るさが変わる位置とタイミングを確認します。
2. Deflickerを挿入し、処理前と処理後を別々のViewerで比較します。静止した一枚だけでなく、必ず複数フレームを通して観察します。
3. 画面全体の明滅なら、背景など動きの少ない場所で変化を見ます。局所的な明滅なら、その領域以外の色や階調まで変わっていないかも確認します。
4. Inspectorで操作できる項目は**実際に表示されたものだけ**を使い、効果の変化を一つずつ確認します。今回の実機例ではFixed Time 0、Global、Allを使用しました。別の設定との比較は未検証です。
5. 人物やカメラが動くカットでも確認します。輪郭に二重像が出る、必要な光の点滅まで弱まるなどの副作用があれば、そのカットへの適用を再検討します。

フレームごとに点滅するデザインや演出上のストロボは、修正対象のフリッカーとは限りません。**意図した変化を残すべきか**を先に決めてから処理します。

## AverageやResolve FXとの違い

| 対象 | Manualで確認できる中心的な働き | 選ぶときの考え方 |
| --- | --- | --- |
| **Deflicker（Krokodove）** | 連続フレームの局所的・全体的なフリッカーを除去する。 | 明滅の補正が目的のときに検討する。 |
| [Average（Krokodove）](./average) | 連続する複数フレームを平均し、frame blending効果を作る。 | 時間の異なる像を混ぜる表現が中心。ちらつき補正専用とは説明されていない。 |
| **Resolve FX Deflicker** | タイムラプスや照明などに起因するフリッカーを扱う、Resolve FX Revivalの別エフェクト。 | 公式ManualではStudio専用で、TimelapseやFluoro Lightなどの設定が記載されている。 |

特に注意したいのは、**KrokodoveのDeflickerとResolve FXのDeflickerを同じ設定画面だと思わないこと**です。前者はChapter 105のKrokodove NodesにあるImage Pixel Toolで、後者はChapter 163のResolve FX Revivalにある別項目です。Resolve FX側の「Deflicker Settings」「Timelapse」「Fluoro Light」などの名前を、Krokodove側のInspector項目として記載する根拠はありません。

Averageについても、複数フレームを混ぜればちらつきが目立たなくなることは考えられますが、移動するものが重なって見える可能性があります。**明滅の補正を試すならDeflicker、時間の違う像を重ねたいならAverage**という目的の違いから選びます。

## 運用上の注意

- **補正結果は再生して確認する：** 一枚の静止フレームでは時間的な揺れを評価しにくいため、問題が出ている範囲の前後も確認します。
- **被写体の動きと区別する：** 明るさのちらつきと、被写体の移動による画素の変化は別の現象です。動く輪郭や細い線の見た目も確認します。
- **必要な点滅を消さない：** 警告灯、看板、演出上のフラッシュなど、意図的な明滅を補正対象にしないようにします。
- **その他のInspectorと動作は未確認：** 参照フレーム数、分析方向、領域判定、色空間、Alphaの処理、フレーム端やクリップ端での動作は、Krokodoveの短いManual項目からは確定できません。
- **Edition・登録状態は別途確認：** Resolve Free／Studio／Fusion StudioでのKrokodove Deflickerの利用可否、現在のノード登録名、効果の性能は未検証です。Resolve FX DeflickerのStudio専用表記をKrokodoveへ転用しません。

## 出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2436、Image Pixel Tools — Deflicker**。この項目で確認できるのは、連続フレームのregional/global flickeringを除去するという役割です。

比較に使った[Average](./average)は同Chapterのp.2435、Resolve FX Deflickerの詳細とStudio専用表記はChapter 163「Resolve FX Revival」のpp.3640–3641です。Optical FlowとRepair Frameの前処理についてはChapter 112のpp.2618、2622を参照しました。公式資料の入口は[Blackmagic Designサポート](https://www.blackmagicdesign.com/jp/support/)です。

使用例・接続例・想定される副作用は、これらの記述に基づく説明と**確認案**です。実機例は合成入力と固定参照の一条件に限られます。正確な端子、その他のInspectorの動作、内部方式・Edition差は未確認のため、verification: partialを維持しています。関連するデータの説明は[Imageの解説](../../learn/02-data/image)、Krokodove全体の分類は[ファミリー概要](./)を参照してください。
