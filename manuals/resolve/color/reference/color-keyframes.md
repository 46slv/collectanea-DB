---
title: ColorページのKeyframes（時間とともに補正を変える）
description: Dynamic／Static Keyframesの使い分け、時間とともに変わる露出・色の補正、区間境界の確認手順を整理する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Keyframes, Dynamic Keyframe, Static Keyframe, Color Corrector, Sizing]
tasks: [animate-grade, correct-exposure-drift, grade, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# ColorページのKeyframes：補正を時間とともに変える

カメラが屋外から室内へ移動すると、同じショットの途中で露出や色温度が変わります。最初のフレームに合わせたグレードをクリップ全体へ固定すると、後半では顔が暗くなったり、照明の色かぶりが目立ったりします。こうした**時間方向の補正**に使うのがColorページのKeyframesです。

Keyframesは「どの時点で、どんな補正状態にするか」を指定する仕組みです。静止したショット間でグレードを保存・切り替える[Gallery／Stills](./gallery-stills)や[Versions](./versions-and-grade-comparison)とは目的が異なります。また、人物の移動にPower Windowを追従させる[Tracker](./color-tracker)とも役割を分けて考えます。

## DynamicとStatic：変化の途中を作るか、瞬時に切り替えるか

| 種類 | 時間方向の振る舞い | 使いどころ | 確認すべきこと |
| --- | --- | --- | --- |
| **Dynamic Keyframe** | 複数の時点に設定した状態の間を変化させる | 連続したショットで、徐々に変化する日照や色かぶりを補う | 始点・中間・終点で補正の速度と量が自然か |
| **Static Keyframe** | 指定した境界で補正状態を切り替える。途中の滑らかな変化を作らない | 一瞬で点灯する照明など、意図した不連続な変化 | 境界の直前と直後で不要な飛びがないか |

Blackmagic Designの公式教材『The Colorist Guide to DaVinci Resolve 20』は、Staticを不連続な切り替え、Dynamicを時間的な変化として説明し、同じアニメーション内で組み合わせる例も示しています。**これは20の公式教材を根拠にした区別であり、21.1のKeyframesパレットの全UI・補間設定を直接確認したものではありません。**

Dynamicは「カメラが動いたら必ず使う」という意味ではありません。カメラが動いても明るさが変わらなければ時間変化するグレードは不要です。逆にカメラが固定でも、日差しや舞台照明が変われば時間方向の補正を検討できます。

## 先に確認する三つの範囲

Keyframesを追加する前に、次の三つを切り分けます。

1. **どのクリップか。** キーフレームで扱いたい時間が、一つのクリップの中に収まっているかを確認します。複数ショットが編集上独立しているなら、まずクリップごとの補正を検討します。
2. **どのノード／処理か。** 全体の基準グレードまで時間変化させるのか、後段に時間変化専用のCorrectorを置くのかを決めます。[Color Node Graph](../learn/color-node-graph)の処理順が変われば、最終結果も変わり得ます。
3. **どんな変化か。** 露出が徐々に変わるならDynamic、照明が一瞬で切り替わるならStaticを候補にします。位置だけを追従したい場合は、グレードのKeyframesではなく[Power Window](./power-windows)とTrackerの問題かもしれません。

同じノードで複数の補正項目を変える場合、**何を動かしたいかを作業メモで明確にし、想定外の項目が途中で変化していないか**を再生して確認します。パラメータ単位の記録範囲・Keyframesパレットでの表示階層は、21.1の該当画面を確認するまでは断定しません。

## 操作例1：移動ショットの露出と色の変化をなだらかに補正する

屋外の人物を追いながら屋内へ入るワンカットを想定します。入口の前半は自然光、後半は暖色の室内灯が中心です。後半を基準にクリップ全体を暗くすると、前半の人物が不自然になります。

### 手順

1. Colorページで対象クリップを選択し、開始・中間・終了の三か所を確認します。[Scopes](./scopes)で明部・暗部とRGBの偏りを比較し、撮影中に何が変化しているかを把握します。
2. 最初のCorrectorでは、素材に共通する基本のバランスを整えます。時間方向の調整を分かりやすくするため、後段の別ノードを**変化分の補正**に割り当てることを検討します。
3. 補正を変えたいノードを選択してKeyframesパレットを開きます。公式20教材ではCorrector行のキーフレーム操作でカラー補正の時間変化を有効にします。**21.1での正確な配置・項目名は未照合**のため、現在の画面で対応する行を確認してから操作してください。
4. 入口の手前に再生ヘッドを移動し、人物の露出と色を基準状態にします。この状態が前半の基点になるよう、該当CorrectorのKeyframeを設定・確認します。
5. 室内灯の影響が支配的になる位置へ再生ヘッドを移動し、Dynamic Keyframeで後半の状態を作ります。[Primaries](./primaries-color-wheels)などを使い、人物の明るさと色の偏りを少しずつ補正します。
6. **始点だけでなく遷移の中間を再生**します。明暗が急に変わる、肌だけ不自然な色になる、補正が早く始まりすぎる場合は、二つのKeyframeの位置や後半の補正量を見直します。
7. 最後に対象クリップを等倍で再生し、グレードの切り替わりが人物の移動や照明変化と矛盾しないかを確認します。中間だけを合わせて前後を悪化させないよう、始点・終点も再確認します。

**採否例：** 室内に入る前から肌が黄色くなってしまうなら、終点側の暖色補正を強めるのではなく、変化が始まるKeyframeの位置を見直します。中間の露出が一度大きく上下する場合は、余分なKeyframeや変化の速度を疑います。

Blackmagicの公式20教材では、Color Correctorに対する動的キーフレームでGamma／Gainなどのカラー値を時間変化させる練習が紹介されています。ただし、この例で示した入口から室内への移動は**本記事の応用シナリオ**であり、21.1実機の完了例ではありません。

## 操作例2：点灯の瞬間にグレードを切り替える

暗い部屋の人物が一瞬のライト点灯で照らされる場面を考えます。点灯前後の露出がはっきり異なり、滑らかなフェードを挟むと照明の動きに合いません。

1. 点灯の直前と直後のフレームを見比べ、画像に実際に変化が起きた境界を決めます。可能なら[Gallery／Stills](./gallery-stills)に比較用の状態を残します。
2. 対象Correctorの時間変化を扱うKeyframesパレットで、境界となる時点に**Static Keyframe**を使用する方針を選びます。20の公式教材では、Staticは境界で補正値を瞬時に変えるものです。
3. 境界の前後それぞれで目的の補正状態を作ります。光がついた後だけを調整し、点灯前の階調が意図せず変わっていないかを確認します。
4. 境界の前フレーム、境界フレーム、次フレームを一枚ずつ確認します。必要以上の露出ジャンプや色の段差があれば、境界位置、前後の補正差、元映像の点灯タイミングを見直します。
5. 一連の再生で、点灯と補正の変化が一致するかを判定します。撮影時の光量変化を二重に増幅していないかも確認してください。

**判断例：** 光が1フレームで点灯しているのに補正が数フレーム前から変わるなら、Dynamicの補間が目的に合っていない可能性があります。反対に照明が徐々に明るくなるショットでは、Staticによる急な切り替えが不自然になるためDynamicを候補にします。

一つのメディアクリップに複数の独立したカットが含まれている場合、Staticで色を切り替えるよりEditページでクリップを適切に分割した方が、各ショットの管理が明確になることもあります。切り替え効果と編集上のショット境界は分けて判断します。

## SizingやResolve FXのKeyframesと混同しない

Keyframesは色補正だけの概念ではありません。20の公式Colorist Guideには、**SizingのDynamic Keyframeを使ってパンやズームを時間変化させる**手順もあります。[ColorページのSizing](./color-sizing)で説明したInput／Output／Node／Referenceの適用範囲を整理してから扱うと、意図しない変形の波及を避けられます。

またBlackmagic Designの現行[Color公式ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)には、ColorページのResolve FXでエフェクト設定の値をキーフレーム化できる旨が記載されています。ただし、**すべてのFXパラメータが同一方式でKeyframeを受け付けるとは確認していません**。利用するFXと項目の対応状況を実機で確認してください。

選択した人物や物体が動く場合、Windowの位置や形の変化と、ウィンドウ内部に適用する明暗・色の変化は別問題です。Trackerが正常に追従しても、照明が変化すれば補正値のKeyframesが必要になることがあります。逆に、グレードのKeyframesを追加してもWindowの追跡失敗は直りません。

## 変化の速度と中間フレームを評価する

Dynamic Keyframeでは、**両端がよく見えることだけでは十分ではありません**。公式20教材はKeyframeの時間位置を移動してアニメーション速度を調整する方法と、Dynamic Attributesを使って変化の仕方を変える例を扱っています。

操作するときは、始点・中間・終点を連続して確認します。たとえば色温度を補正しながら露出も変えると、ある時点で肌色だけ先に変わったように見える場合があります。補間の初期状態や21.1固有のカーブ操作を推測するのではなく、Viewerで時間変化を見て、必要な範囲だけKeyframeを調整してください。

ショットの途中に**本当に不連続な光の変化がある**のか、あるいは**補正が不連続に見えているだけ**なのかも区別します。前者はStatic、後者はDynamicの位置・速度・補正差を確認するのが出発点です。

## 期待した動きにならない場合

| 症状 | 最初の確認 | 切り分け |
| --- | --- | --- |
| 後半だけを変えたつもりが全尺で同じ補正になった | 正しいCorrectorでKeyframeを有効にしたか | 始点と終点に別々の状態があるか確認 |
| 変化が早すぎる／遅すぎる | Keyframeの時間位置 | 速度を変える前に目的の始点・終点を決め直す |
| 光が一瞬で切り替わるのに補正がフェードする | Dynamic／Staticの選択 | 不連続な切り替えならStaticを検討 |
| 滑らかな照明変化なのに色が跳ぶ | Staticや余分なKeyframeの存在 | 境界前後の状態と種類を点検 |
| グレードは動くが顔のWindowが外れる | Window／Trackerの追跡 | [追跡](./color-tracker)と[二次補正のちらつき](../troubleshooting/secondary-matte-flicker)を確認 |
| 色だけ変えたいのに構図も動いた | Sizing側のKeyframeや変形範囲 | [Sizing](./color-sizing)のモードと担当を分離 |
| 変化の中間だけ肌色が不自然 | 中間フレーム、[Scopes](./scopes) | 補正量と時間位置を両方見直す |
| FXだけ変化しない | 対象FXの操作可能項目 | FXのKeyframe対応を個別に確認 |
| 保存済みStillと違って見える | Stillを撮った時点と現在の再生位置 | 同じフレーム・同じ時点のグレードで比較 |

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Designの[公式サポート](https://www.blackmagicdesign.com/support)にある『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月8日公開）を現行版の参照先としています。ただし大容量PDFの取得制約により、**21.1のKeyframes該当章・画面・補間規則を直接照合できていません**。
- **Keyframesの具体的な公式教材：** Blackmagic Design『[The Colorist Guide to DaVinci Resolve 20](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf)』、Lesson 8「Adjusting Image Properties」内「Using Static Keyframes」「Changing Color Values Over Time」「Modifying Dynamic Attributes」。Dynamic／Staticの基本的な違い、CorrectorへのKeyframe、Sizingのアニメーション、時間位置・速度の調整を確認した資料です。**20のUIや動作細部を21.1の確定仕様として流用していません**。
- **現行Color機能の公式説明：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』（確認日：2026年10月22日）。ColorページのCorrector／Nodeの説明と、Resolve FXの設定値のKeyframe操作が可能であることを確認しました。このページ単独ではKeyframesパレットの全操作手順を裏付けられません。
- **verification: partial。** 二つの操作例は公式教材で説明された機能から構成した判断例であり、21.1実機の録画・スクリーンショット・レンダーによる完了確認はありません。21.1の正確なUI位置、補間既定値、パラメータごとの対応範囲、Free／Studio差は未検証です。

関連：[Node Graph](../learn/color-node-graph)／[Primaries](./primaries-color-wheels)／[Power Windows](./power-windows)／[Color Tracker](./color-tracker)／[Versions](./versions-and-grade-comparison)／[Key／Matte](./key-matte)
