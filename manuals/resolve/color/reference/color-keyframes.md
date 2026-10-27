---
title: ColorページのKeyframes（時間とともに補正を変える）
description: Resolve 21.1のKeyframe Editor、Dynamic／Static、対象トラック、Auto-Keyframe、コピー時の注意を操作例で解説。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Keyframes, Dynamic Keyframe, Static Keyframe, Color Corrector, Sizing]
tasks: [animate-grade, correct-exposure-drift, grade, troubleshoot]
level: intermediate
updated: "2026-10-27"
---

# ColorページのKeyframes：補正を時間とともに変える

カメラが屋外から室内へ移動すると、同じショットの途中で露出や色温度が変わります。最初のフレームに合わせたグレードをクリップ全体へ固定すると、後半では顔が暗くなったり、照明の色かぶりが目立ったりします。こうした**時間方向の補正**に使うのがColorページのKeyframesです。

Keyframesは「どの時点で、どんな補正状態にするか」を指定する仕組みです。静止したショット間でグレードを保存・切り替える[Gallery／Stills](./gallery-stills)や[Versions](./versions-and-grade-comparison)とは目的が異なります。また、人物の移動にPower Windowを追従させる[Tracker](./color-tracker)とも役割を分けて考えます。

## キーフレームを置く対象を選ぶ：All／Color／Sizing

21.1のKeyframe Editorには、現在のクリップのノードごとのトラックとSizingトラックが表示されます。ひし形はDynamic、丸はStatic Keyframeです。Editor右上の**Keyframe mode**（または**Mark > Keyframe Timeline mode**）で、キーを追加する範囲を切り替えます。

| モード | 対象 | 選ぶ状況 |
| --- | --- | --- |
| **All** | すべてのノードとSizingのトラック | 複数処理を同時にキーフレーム化するとき |
| **Color** | Node Editorで選択中の補正ノード | 色・露出をそのノードだけで時間変化させるとき |
| **Sizing** | Sizingトラック | Pan／Tilt／Zoom／Rotateなどの時間変化 |
| **EXT MATTE** | 外部Matte固有のトラック | External Matteノードがある場合に限り表示 |

**Allはマニュアル上の既定値**です。色だけを変える場合はColorへ切り替え、対象ノードを選んでからキーを打ちます。AllのままではほかのノードやSizingにも不要なキーが増えます。モードはグレードをコピーするときのColor／Sizingの範囲にも影響します。

### ノード内で一部の設定だけを変える

Colorモードでノード全体にキーを打つと、そのノードの多くのパラメータが対象になります。**ノード番号の横の三角形**を展開するとサブトラックを表示できます。21.1 ManualではColor Corrector（Camera RAW・Color Wheels・Primary Controls・RGB Mixer・Curves）、Qualifier、各Power Window、Defocus（Blur・Key）、NR、Open FX、Node Formatなどを区別しています。

1. Keyframe Editorで対象ノードを展開し、変更したいサブトラックを選びます。
2. 開始フレームのサブトラック上を右クリックし、**Add Dynamic Keyframe**または**Add Static Keyframe**を選びます。
3. 次の変化点にも同じ種類のKeyframeを追加し、そのトラックに対応する設定だけを操作します。
4. ViewerとScopesで中間フレームを再生し、WindowやSizingなど別の処理が動いていないことを確認します。

トラック左端の**Auto-Keyframe**を有効にすると、該当項目の操作で自動的にDynamic Keyframeが生成されます。作業が終わったらオフにします。キーを置くだけでは、調整がないノードのKeyframe badgeが出ない場合があります。

## DynamicとStatic：変化の途中を作るか、瞬時に切り替えるか

| 種類 | 時間方向の振る舞い | 使いどころ | 確認すべきこと |
| --- | --- | --- | --- |
| **Dynamic Keyframe** | 複数の時点に設定した状態の間を変化させる | 連続したショットで、徐々に変化する日照や色かぶりを補う | 始点・中間・終点で補正の速度と量が自然か |
| **Static Keyframe** | 指定した境界で補正状態を切り替える。途中の滑らかな変化を作らない | 一瞬で点灯する照明など、意図した不連続な変化 | 境界の直前と直後で不要な飛びがないか |

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 148「Keyframing in the Color Page」pp.3453–3465では、Dynamicを連続補間、Staticを1フレーム境界の切り替えと説明しています。以下のメニュー・トラック構造・操作は21.1の同章で確認しました。実機の動作結果は未検証です。

Dynamicは「カメラが動いたら必ず使う」という意味ではありません。カメラが動いても明るさが変わらなければ時間変化するグレードは不要です。逆にカメラが固定でも、日差しや舞台照明が変われば時間方向の補正を検討できます。

## 先に確認する三つの範囲

Keyframesを追加する前に、次の三つを切り分けます。

1. **どのクリップか。** キーフレームで扱いたい時間が、一つのクリップの中に収まっているかを確認します。複数ショットが編集上独立しているなら、まずクリップごとの補正を検討します。
2. **どのノード／処理か。** 全体の基準グレードまで時間変化させるのか、後段に時間変化専用のCorrectorを置くのかを決めます。[Color Node Graph](../learn/color-node-graph)の処理順が変われば、最終結果も変わり得ます。
3. **どんな変化か。** 露出が徐々に変わるならDynamic、照明が一瞬で切り替わるならStaticを候補にします。位置だけを追従したい場合は、グレードのKeyframesではなく[Power Window](./power-windows)とTrackerの問題かもしれません。

同じノードで複数の補正項目を変える場合、操作するサブトラックと意図する変化を決め、想定外の項目が動いていないか再生で確認します。

## 操作例1：移動ショットの露出と色の変化をなだらかに補正する

屋外の人物を追いながら屋内へ入るワンカットを想定します。入口の前半は自然光、後半は暖色の室内灯が中心です。後半を基準にクリップ全体を暗くすると、前半の人物が不自然になります。

### 手順

1. Colorページで対象クリップを選択し、開始・中間・終了の三か所を確認します。[Scopes](./scopes)で明部・暗部とRGBの偏りを比較し、撮影中に何が変化しているかを把握します。
2. 最初のCorrectorでは、素材に共通する基本のバランスを整えます。時間方向の調整を分かりやすくするため、後段の別ノードを**変化分の補正**に割り当てることを検討します。
3. 補正ノードを選択してKeyframe modeを**Color**へ切り替えます。必要ならColor Correctorサブトラックを展開し、開始フレームに右クリックから**Add Dynamic Keyframe**を置きます。
4. 入口の手前に再生ヘッドを移動し、人物の露出と色を基準状態にします。この状態が前半の基点になるよう、該当CorrectorのKeyframeを設定・確認します。
5. 室内灯の影響が支配的になるフレームへ移動し、**同じトラックに2つ目のDynamic Keyframe**を作ります。[Primaries](./primaries-color-wheels)などで後半の状態を調整します。Auto-Keyframeを利用した場合は、終了時にオフにします。
6. **始点だけでなく遷移の中間を再生**します。明暗が急に変わる、肌だけ不自然な色になる、補正が早く始まりすぎる場合は、二つのKeyframeの位置や後半の補正量を見直します。
7. 最後に対象クリップを等倍で再生し、グレードの切り替わりが人物の移動や照明変化と矛盾しないかを確認します。中間だけを合わせて前後を悪化させないよう、始点・終点も再確認します。

**採否例：** 室内に入る前から肌が黄色くなってしまうなら、終点側の暖色補正を強めるのではなく、変化が始まるKeyframeの位置を見直します。中間の露出が一度大きく上下する場合は、余分なKeyframeや変化の速度を疑います。

この手順は21.1 Manual pp.3456・3459・3461を屋外から屋内への移動に適用した**想定例**であり、21.1実機での完了例ではありません。ManualによればDynamicの補間中、実画像が変化していても**CurvesなどのUIコントロールは中間値へ滑らかに動かず、次のKeyframeで表示が切り替わる**場合があります。中間の画像をViewerで確認してください。

## 操作例2：点灯の瞬間にグレードを切り替える

暗い部屋の人物が一瞬のライト点灯で照らされる場面を考えます。点灯前後の露出がはっきり異なり、滑らかなフェードを挟むと照明の動きに合いません。

1. 点灯の直前と直後のフレームを見比べ、画像に実際に変化が起きた境界を決めます。可能なら[Gallery／Stills](./gallery-stills)に比較用の状態を残します。
2. Keyframe modeをColorへ切り替えて補正ノードを選び、境界フレームで**Mark > Make Static Keyframe**を実行します。21.1 ManualではStaticは丸で表示されます。
3. 境界の前後で目的の補正状態を作ります。21.1 Manualでは、**再生ヘッドがStatic Keyframe上にあると後側の区間を編集する**ため、前側を調整する場合は境界より前のフレームへ移動します。
4. 境界の前フレーム、境界フレーム、次フレームを一枚ずつ確認します。必要以上の露出ジャンプや色の段差があれば、境界位置、前後の補正差、元映像の点灯タイミングを見直します。
5. 一連の再生で、点灯と補正の変化が一致するかを判定します。撮影時の光量変化を二重に増幅していないかも確認してください。

**判断例：** 光が1フレームで点灯しているのに補正が数フレーム前から変わるなら、Dynamicの補間が目的に合っていない可能性があります。反対に照明が徐々に明るくなるショットでは、Staticによる急な切り替えが不自然になるためDynamicを候補にします。

一つのメディアクリップに複数の独立したカットが含まれている場合、Staticで色を切り替えるよりEditページでクリップを適切に分割した方が、各ショットの管理が明確になることもあります。切り替え効果と編集上のショット境界は分けて判断します。

## SizingやResolve FXのKeyframesと混同しない

Keyframesは色補正だけの概念ではありません。21.1 Manualは、**Sizingの独立したKeyframeトラックでPan／Tilt／Zoom／Rotateなどを時間変化させられる**と説明しています。[ColorページのSizing](./color-sizing)で説明したInput／Output／Node／Referenceの適用範囲を整理してから扱うと、意図しない変形の波及を避けられます。

21.1ではResolve FX／OFXが補正ノード内にある場合はそのノードのサブトラック、独立したFXノードなら専用FXトラックとして表示されます（pp.3455、3460）。ただし各プラグインの全パラメータが同じ方式で補間できるかは未検証です。

選択した人物や物体が動く場合、Windowの位置や形の変化と、ウィンドウ内部に適用する明暗・色の変化は別問題です。Trackerが正常に追従しても、照明が変化すれば補正値のKeyframesが必要になることがあります。逆に、グレードのKeyframesを追加してもWindowの追跡失敗は直りません。

## 変化の速度と中間フレームを評価する

Dynamic Keyframeでは、**両端がよく見えることだけでは十分ではありません**。21.1 Manual pp.3462–3463では、Keyframeを左右へドラッグして時間位置を変更でき、Keyframeの右クリック**Change Dynamic Attributes**からStart／Endの補間曲線を調整できます。Dynamicの既定補間は線形です。

操作するときは、始点・中間・終点を連続して確認します。たとえば色温度を補正しながら露出も変えると、ある時点で肌色だけ先に変わったように見える場合があります。Viewerで時間変化を確認し、必要ならKeyframe位置やDynamic Attributesを調整してください。

ショットの途中に**本当に不連続な光の変化がある**のか、あるいは**補正が不連続に見えているだけ**なのかも区別します。前者はStatic、後者はDynamicの位置・速度・補正差を確認するのが出発点です。21.1 Manual pp.3457–3458によると、Staticの**右側にDynamicを置いてもその間は補間せず**、Dynamicの右側にStaticを置く場合は補間が生じます。意図と違う種類なら、対象Keyframeを右クリックして**Change to Dynamic Keyframe／Change to Static Keyframe**で変更できます。

## GradeコピーとGallery Stillでの注意

21.1 Manual p.3464によると、別ノードへのKeyframeコピーは**Edit > Copy／Paste**、サブトラックを選んだコピーは**Edit > Paste Attributes**のKeyframe項目で操作します。別クリップへGradeを適用すると、Keyframeの位置は元クリップの**source timecode**に基づいて配置されるため、まったく別の撮影素材では意図したタイミングと一致しない場合があります。

**通常のGallery StillにはKeyframeが保存されません。** Manualによると、再生ヘッドより前にある直近のKeyframeの値が保存されたGradeへ反映されます。時間変化も含めて適用したい場合は、Gallery背景の**Apply Grades Using**にある**Keyframes Aligning…**の該当方式を選択します。Stillとして保存した画像とGradeの時間変化を同一視しないでください。

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
| FXだけ変化しない | FXを入れた位置と対応するトラック | FXのKeyframe対応を個別に確認 |
| 色だけ変えたつもりで構図まで動く | Keyframe modeがAllのままか | Color／Sizingの対象を分ける |
| CurvesのUIが途中で滑らかに動かない | Viewerの実画像が補間されているか | UI表示と実画像の補間を区別する |
| 保存済みStillと違って見える | Stillを撮った時点と現在の再生位置 | 同じフレーム・同じ時点のグレードで比較 |

## 出典・対象版・確認範囲

- **21.1の直接根拠：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（September 2026）、**Color / Chapter 148「Keyframing in the Color Page」pp.3453–3465**。2026年10月27日に本文を直接確認。Editor／All・Color・Sizing／Dynamic・Static／Auto-Keyframe／サブトラック／Dynamic Attributes／Gradeコピー／Gallery Stillの記述と照合。
- **公式配布元：** [Blackmagic Design Support](https://www.blackmagicdesign.com/support)。補助資料：[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)。
- **21.1で確認済み：** マニュアル上の操作名・トラック構造・補間ルール・コピー時の時間基準。屋外から室内への移動や照明点灯は、マニュアルの機能を使った**想定例**です。
- **未検証：** Resolve 21.1実機での操作結果、Windows／Macでのショートカット、個別FXのキーフレーム対応、Free／Studio差、RAW／RCMとの組み合わせ、異なるsource timecodeの素材へのコピー結果。**verification: partial**。

関連：[Node Graph](../learn/color-node-graph)／[Primaries](./primaries-color-wheels)／[Power Windows](./power-windows)／[Color Tracker](./color-tracker)／[Versions](./versions-and-grade-comparison)／[Key／Matte](./key-matte)
