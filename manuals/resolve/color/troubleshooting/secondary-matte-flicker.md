---
title: 二次補正がちらつく・範囲が揺れるとき
description: ColorページのQualifier、Power Window、Tracker、Keyの状態を時間方向に分けて確認し、局所補正のちらつきや境界の不自然さを切り分ける。
doc_type: troubleshooting
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Qualifier, Highlight, Matte Finesse, Power Window, Tracker, Key Output Gain]
tasks: [secondary-grading, matte-refinement, tracking, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# 二次補正がちらつく・範囲が揺れるとき

Colorページで肌や衣服だけを補正したとき、静止フレームでは自然なのに、再生すると色が点滅したり輪郭が揺れたりすることがあります。同じ「ちらつき」でも、**選択する画素が変わる問題**、**選択領域の位置がずれる問題**、**選択は正しいが補正の見え方が変わる問題**は、確認する場所が異なります。

このページでは、通常のColor補正ノードで[Qualifier](../reference/hsl-qualifier)、[Power Window](../reference/power-windows)、[Tracker](../reference/color-tracker)を使う場合に、原因を絞る順序を説明します。時間方向の挙動を観察するためのトラブルシューティングであり、時間的なキー平滑化を一括適用するレシピではありません。

## まず、何が揺れているかを分ける

| 再生時に見える症状 | 最初に見るもの | 主な切り分け |
| --- | --- | --- |
| シャツの内側に補正された点とされない点が増減する | QualifierのHighlight／白黒のキー表示 | 明るさ・色の変動で選択条件から外れていないか |
| 顔の輪郭に沿った明暗の帯が左右へ動く | Power Windowの位置とSoftness | Windowが顔と同じように動いているか |
| 遮蔽後に補正が背景へ残る | Tracker結果とWindowの位置 | 隠れる前後で追跡対象がずれていないか |
| 選択範囲は安定しているのに色が強くなったり弱くなったりする | 補正ノードの有効／無効、前段の状態 | Matte以外の色・露出の変動を見ていないか |
| あるフレームだけ境界に色の縁が出る | Matteの穴・境界と補正の強さ | マットの粗さと補正量のどちらが目立たせているか |

一度にQualifier、Tracker、補正量を全部変更すると、改善した理由が分からなくなります。最初に**問題が発生する数フレームの前後を特定**し、その箇所と正常な箇所を交互に見てください。Viewerで通常画像と選択範囲を切り替え、必要なら[Scopes](../reference/scopes)で全体の明暗・色の変化も見ます。

## 1. Highlightで「選択のちらつき」を確認する

[HSL Qualifier](../reference/hsl-qualifier)は、色相・彩度・輝度などの条件から画素を選びます。被写体が同じ場所に留まっていても、照明、影、反射、圧縮ノイズ、ブレなどで画素の値が変われば、同じ条件で選ばれる部分が変化し得ます。これは**Windowの追跡ずれと同じ原因ではありません**。

1. 問題の局所補正ノードを選び、Qualifierの**Highlight（選択表示）**を有効にします。白黒のキー表示が利用できる場合は、選択側・非選択側の小さな穴を見やすくできます。
2. 正常なフレームと、ちらついたフレームを往復して、被写体のどの部分が白／黒へ変わったかを比べます。選択の境界だけか、内部まで変わるのかも分けます。
3. 衣服の影だけが抜けるなら、HSLのLuma範囲とSoftnessが狭すぎないかを確認します。反射した部分が抜ける場合は、HueやSaturationの条件も確認します。
4. 除外したい背景まで選ばれるなら、範囲を無制限に広げるのではなく、[Power Window](../reference/power-windows)で位置を限定できるか検討します。
5. キーに細かな穴や孤立点がある場合は、**Matte Finesse**のClean Black／Clean Whiteや境界調整を参照します。元の被写体まで削っていないか、調整後に再生で確認してください。

Clean Black／Clean Whiteは、位置を追従させる機能ではありません。Blur Radiusなどの境界調整も、フレームごとに抽出される色条件そのものを安定させる保証ではありません。マットが一見滑らかになっても、通常表示へ戻して補正のはみ出しがないか確認します。

## 2. Windowが動いているか、選択が変わっているかを分ける

顔の補正で輪郭が揺れる場合は、まず**Windowの輪郭を表示したまま**問題区間をスクラブします。被写体が移動するのにWindowが残っていれば、色条件を調整しても位置の問題は直りません。

[Color Tracker](../reference/color-tracker)は、Power Windowを被写体の動きに合わせて追従させるためのものです。Blackmagic Design公式Colorページは、Windowを選んでTrackerを開き、動きに応じた解析条件を選び、順方向へ解析する基本操作を説明しています。

- **開始直後から外れている**：Windowの初期配置と、どの物体の動きを追うかを確認します。
- **後半ほど外れる**：移動量だけでなく、ズーム・回転・遠近変化が増えていないか、Viewerで結果を見ます。
- **遮蔽物を通った後だけ外れる**：遮蔽前後のフレームを分けて点検します。追跡の完了表示だけで正しい対象に戻ったとは判断しません。
- **Windowは合っているのに境界だけ目立つ**：追跡よりもSoftness、Windowの大きさ、補正量の不均一さを確認します。

QualifierとWindowを併用しているときは、**両方の状態を独立して見る**ことが重要です。Windowの追跡が合っていても、肌のハイライト部分がQualifierから抜ければ、補正は不安定に見えます。逆に、キー表示が安定していてもWindowが被写体から外れると、意図した範囲へ補正できません。

## 3. Matteが安定しているなら、補正側を疑う

選択範囲とWindowの位置が正常なのに見た目だけがちらつくときは、[KeyパレットとMatte](../reference/key-matte)で説明した「選択」と「補正強度」を区別します。

1. Highlightを解除し、対象の補正ノードだけを有効／無効にして差を確認します。オフでも同じ変化が残るなら、少なくともそのノードの局所選択だけでは説明できません。
2. [Primaries](../reference/primaries-color-wheels)など、当該ノードに設定した調整の方向と量を確認します。境界が自然でも、補正が強いと動く部分だけ目立つことがあります。
3. 同じクリップで全体の明るさや色温度が変わっていないか、ノードの前後の処理を分けて観察します。撮影時の自動露出や照明変化がある素材では、固定したグレードでも結果の見え方が変わり得ます。
4. **選択と補正の方向は適切で、強さだけが過剰**なら、Key Output Gainなどで効果を弱めて比較できます。ただし、これで不正確なキーや追跡が正しくなるわけではありません。
5. [カラーマネージメント](../learn/color-management-basics)やCSTを含む構成では、前段の変換とグレーディングの役割も確認します。色空間の設定不整合を、キーのぼかしだけで直そうとしないでください。

ここでの「強さを下げる」は**見た目の症状を抑える選択肢**であって、Matteの欠陥を修復する操作ではありません。原因を特定した後に使います。

## 例1：歩く人物の服だけ彩度を下げると、暗い部分が点滅する

青いジャケットだけをQualifierで選び、彩度を落としたいショットを想定します。人物は歩いており、服の表面に照明と影が交互に入ります。

最初にHighlightで見比べると、明るいフレームはジャケット全体が選ばれる一方、暗いフレームでは生地の折り目が選択から外れているとします。この場合、Windowの位置だけを追い直しても、**暗部がキーから抜ける現象**は解消しません。まずHue／Sat／Lumのうち何が条件を絞りすぎているかを調べ、特にLuma側の範囲と境界を確認します。背景にも青があるなら、色条件をむやみに広げず、追従するWindowで衣服の周辺へ限定します。

調整後は、明るい箇所だけでなく、影が深い箇所・人物が回転する箇所・背景と重なる箇所を確認します。合格の目安は、**再生時にジャケットの彩度だけが不自然に点滅せず、背景が意図せず変色しないこと**です。

## 例2：顔を明るくした補正が、振り向いた瞬間に背景へ漏れる

顔より少し大きい柔らかなWindowを作り、Trackerで追わせたインタビュー映像を想定します。正面を向いている間は自然でも、人物が振り向いた瞬間に壁が明るくなる場合があります。

まず、問題の前後フレームでWindowの位置と大きさを見ます。Windowが顔からずれて壁を覆っているならTracker側を点検し、Windowは顔を追えているが境界から壁に明るさが広がるならSoftnessと補正量を見直します。両者が正常で、顔の一部だけ明るさが抜ける場合は、併用中のQualifierが選択から外していないか確認します。

**Trackerが成功したか、Matteが正しいか、補正が自然か**は別の判定です。最終確認は静止フレームだけでなく、問題区間の再生で行います。

## 切り分けても解決しない場合

問題の一部分だけを切り出し、**正常なフレーム／異常なフレーム、Highlight表示、Windowの位置、対象ノードのオン／オフ**を同じ条件で比較します。これにより、「選択が変わった」「追跡が外れた」「補正の見え方だけが変わった」のどこに未解決が残るかを明確にできます。

表示上の変化がクリップの再生速度やプレビュー状態でしか起こらない場合は、素材のフレームを見直し、実際の出力でも再現するかを別に確認してください。本記事はキャッシュ・デコード・GPU固有の原因診断や、それらの操作パラメータを扱いません。

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1**。Blackmagic Design [『DaVinci Resolve 21.1 Reference Manual』](https://www.blackmagicdesign.com/support)（公式公開：2026年9月8日）。本記事の執筆環境ではPDFが大きく、Qualifier／Window／Tracker該当章をこの回で直接再取得できていません。**21.1固有の自動安定化機能、パラメータ範囲、初期値は未確認**です。
- **基本操作の一次根拠：** Blackmagic Design [DaVinci Resolve — Color](https://www.blackmagicdesign.com/products/davinciresolve/color) の「Secondary Color Correction」「Target Objects Using Power Windows」「Track and Follow Objects」。Qualifierの画素条件、選択表示、Windowの領域限定、Trackerによる移動追従を照合しました。
- **関連する既存記事：** [HSL Qualifier](../reference/hsl-qualifier)（記事内のManual Chapter 137／PDF p.3240–3255）、[Power Windows](../reference/power-windows)、[Color Tracker](../reference/color-tracker)、[Keyパレット](../reference/key-matte)。それぞれの出典・未検証範囲を併せて参照してください。
- **verification: partial。** 21.1実機のフレームごとの挙動、マットの時間方向の安定性、数値プリセット、Free／Studio差、書き出し結果は未検証。2つの例は判断方法を説明する仮想シナリオであり、実機検証済みの修正結果ではありません。

関連：[HSL Qualifier](../reference/hsl-qualifier)／[Power Windows](../reference/power-windows)／[Color Tracker](../reference/color-tracker)／[KeyとMatte](../reference/key-matte)
