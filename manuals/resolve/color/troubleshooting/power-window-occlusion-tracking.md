---
title: 遮蔽物の前後でPower Windowの追跡がずれるとき
description: Colorページで遮蔽中に外れたPower Windowを、追跡できた前後の区間とTracker Graphの補間で修復する。
doc_type: troubleshooting
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Power Window, Cloud Tracker, Tracker Graph, Frame Mode, Clear Selected Track Data, Interactive Mode, Key Output Gain]
tasks: [tracking, secondary-grading, troubleshoot]
level: intermediate
updated: "2026-10-26"
---

# 遮蔽物の前後でPower Windowの追跡がずれるとき

人物を追う[Power Window](../reference/power-windows)が柱や通行人を通過した後に背景へずれる場合、まず**追跡経路が外れたのか、Windowの形や補正範囲が合わないのか**を分けます。遮蔽物の中で追跡できなかった区間は、前後の信頼できる追跡データを残して補間する方法があります。ただし、隠れた間の実際の軌道を復元できるわけではありません。

ここではColorページの**Windowモード**のTrackerを使います。映像全体の手ぶれ補正（Stabilizer）やFX用の追跡とは用途が異なります。[二次補正のちらつき診断](./secondary-matte-flicker)で扱うQualifierの画素選択の揺れも別の問題です。

## 想定する素材と完成条件

- **素材：** 1920×1080、25fps、約8秒、非RAWのRec.709原色・Gamma 2.4表示向け映像。入力の色管理と表示変換は適切に設定済みとします。
- **動き：** 人物が左から右へ歩き、3.0〜3.6秒付近で固定の柱に隠れてから再び現れます。カメラはほぼ固定、人物の移動方向は概ね一定です。
- **補正：** 顔に少し余裕を持たせた楕円形の柔らかいWindowで、人物の明るさを控えめに調整します。調整量は素材依存のため固定しません。
- **完成判定：** 顔が見えている区間でWindowが追従し、柱に補正が乗らず、再出現後に背景だけ明るくならないこと。冒頭・遮蔽前後・終盤をフレーム単位と通常速度の両方で確認します。

この素材と結果は説明用の**仮想例**です。以下の操作はResolve 21.1公式Manualに基づきますが、このショットを使った実機検証ではありません。

## 1. 最初に追跡できた区間を確かめる

1. Colorページで該当クリップと局所補正ノードを選び、[Power Window](../reference/power-windows)の輪郭を表示します。[Tracker](../reference/color-tracker)を**Windowモード**にします。
2. 顔の輪郭や模様が比較的はっきりしているフレームに再生ヘッドを置き、Windowを対象へ合わせます。クリップの先頭から開始する必要はありません。
3. 動きに必要なPan／Tilt、Zoom、Rotate、Perspective 3Dの解析項目を**追跡前に**選びます。移動だけのショットなら、不要な変形を増やさず試すことができます。解析後にチェックだけ変えても既存結果は変わらず、再解析が必要です。
4. Track Forward（必要ならTrack Reverse、または前後方向の解析）で追跡します。ViewerのWindowとTracker Graphの曲線を見て、**最初に外れるフレーム**を特定します。

初期位置から外れている場合は、追跡開始フレームとWindow内に含める特徴を見直します。やり直しの追跡はそのWindowの既存トラックデータを上書きするため、原因を観察してから行います。追跡後にWindowを動かす場合、Trackerの**Clipモードでは経路全体がオフセット**されます。ある一瞬だけ直したいときにClipモードのまま動かさないでください。

## 2. 柱の前後で追跡できる区間を残す

公式ManualのChapter 140が説明する、完全な遮蔽区間を補間する手順です。

1. 顔が見える最初のフレームからTrack Forwardを実行し、柱で隠れて**追跡が不確かになったところで停止**します。
2. Trackerパレットの**Frameモード**へ切り替えます。Clipモードの全区間オフセットと異なり、Frameモードでは位置や形の調整がそのフレームのキーフレームになります。
3. 顔が**再び見える最初のフレーム**へ移動してWindowを顔へ置き直し、そこからTrack Forwardで終盤まで追跡します。
4. Tracker Graphで、柱の手前と再出現後の**信頼できるデータを残し**、間の不正確な曲線区間だけをドラッグ範囲選択します。
5. Trackerパレットのオプションから**Clear Selected Track Data**を選びます。選択された不良データが消され、その間には前後の有効データを使う**線形補間**が適用されます。
6. 遮蔽前の数フレームから再出現後までを1フレームずつ確認し、その後に通して再生します。Windowの位置と補正結果をそれぞれ見ます。

**注意：** Clear Selected Track Dataは、選んだ区間の追跡データを消す操作です。**Reset Track Data on Active Window**は選択Windowのトラックデータを全消去する別操作なので、混同しません。グラフの正常な曲線まで選択すると、残したかった追跡情報も消します。

## 3. 柱そのものを明るくしていないか確認する

Windowが前後の顔を結んで滑らかに移動しても、**顔が柱の後ろにある間は、Windowが柱を覆う**ことがあります。追跡の補間と、手前の物体を補正対象から除外することは別です。

同一ノード内で顔のWindowに加えて柱の形のWindowを作り、柱側の**Maskをオフにして減算Window**として使う方法があります。公式Manual Chapter 138は、前景の物体を減算Windowで覆い、追跡対象が背後に入ったときにその補正を消す構成を説明しています。柱と顔のWindowが重なる前後でも、不自然な切れ目や硬い境界が出ないか確認します。

人物がそのまま画面から消えて戻らない場合は、追跡の終端以降に[Keyパレット](../reference/key-matte)の**Key Output Gain**を動的キーフレームで1から0へ下げ、補正を消す方法もあります。これは追跡位置を直す操作ではありません。

## 4. まだずれる場合の切り分け

| 症状 | 次に確認する点 |
| --- | --- |
| 柱の縁へ追跡点が移り、再出現後もずれる | Cloud Trackerの**Interactive Mode**で柱側の不要な点を範囲選択してDeleteし、残した点で追跡し直す。必要な場合は人物側の適切な領域に点を追加する |
| 顔の位置は追うが、Windowが急に回る／拡大する | 元の解析にZoom／Rotate／Perspective 3Dが必要だったかを検討し、設定を決めてから再解析する |
| 背景の点しか追えない | **Point Tracker**で同じ動きをする高コントラストの特徴へ十字を置く。顔と遠景のように異なる動きの点を混ぜない |
| 遮蔽中の軌道が直線的でない | 線形補間だけでは正しい位置を推定できない。Frameモードで必要な箇所を補正し、柱への補正漏れも別途処理する |
| Windowは顔に合うのに肌の一部だけ点滅する | [QualifierとMatteの診断](./secondary-matte-flicker)へ戻る。位置の追跡では画素の選択条件を直せない |
| 補正が柱の外側へにじむ | WindowのSoftness、減算Windowの範囲、補正量を通常画像で点検する |

Interactive ModeはCloud Tracker用で、Viewer上の選択範囲内のトラッキング点を削除・追加する機能です。適切な特徴がなければ追加されません。IntelliTrackは**Studio版限定**の別の選択肢ですが、ここで紹介する補間手順の必須条件ではありません。

## 結果をどう判断するか

この仮想素材では、柱の両側の顔を追跡でき、遮蔽区間の誤った曲線だけが補間されれば、再出現後にWindowが背景へ残る問題を減らせると期待できます。ただし、補間された区間の軌道が撮影時の実際の動きに一致する保証はありません。柱にかかった光や、顔が再出現する瞬間の急な明暗変化を通常速度で見て、必要なら減算Windowや[Keyframe](../reference/color-keyframes)を併用します。

対象が完全に見えない区間では位置の正解を映像から直接確認できません。複雑な旋回、急加速、手持ちカメラの大きな視差、遮蔽後に別の人物が現れるショットは、この例の線形補間だけで合格としません。追跡グラフが滑らかでも、**局所補正が自然に見えるか**を最終判定にします。

## 出典・対象版・未検証範囲

- **対象：DaVinci Resolve 21.1**。Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月版）、**Chapter 140 “Motion Tracking Windows” pp.3308–3316、3316–3324**。Clip／Frame、Tracker Graph、Clear Selected Track Data、遮蔽時の補間、Interactive Mode、Point Trackerを、2026-10-26に公式PDF本文で直接確認。
- **前景を除外するWindow：** 同Manual **Chapter 138 “Secondary Windows” pp.3276–3277**。Maskをオフにした減算Windowの例を直接確認。
- **verification: partial。** Resolve 21.1実機操作、素材別のトラック精度、効果の見え方、レンダー、色管理の出力結果は未実施です。メニュー表記と操作の根拠は21.1公式Manualであり、仮想素材の成功を実測したものではありません。

関連：[Color Tracker](../reference/color-tracker)／[Power Windows](../reference/power-windows)／[二次補正がちらつくとき](./secondary-matte-flicker)／[肌の二次補正](../recipes/skin-tone-secondary-grading)。
