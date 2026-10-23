---
title: "Anim Curves"
description: "CompositionやEdit/Cut側のdurationに追従しながら、Parameter animationのcurve・値・timingを調整できるModifier。"
doc_type: node
term_id: "anim-curves"
term_short: "Anim Curvesは、durationに追従するanimation curveをParameterへ供給し、curve shape・値・timingをModifier側で調整できる。"
verification: partial
aliases: ["Anim Curves", "Animation Curves"]
concepts: ["keyframes", "time", "modifiers"]
nodes: ["Anim Curves"]
node_family: "modifiers"
controls: ["Source", "Input", "Curve", "Mirror", "Invert", "Scale", "Offset", "Clip Low", "Clip High", "Time Scale", "Time Offset"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["retime-animation", "template", "modifier"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-12"
---

# Anim Curves

Anim Curvesは、**Compositionの長さに合わせて進行するanimation curveをParameterへ供給し、そのcurveの形・値・timingをModifier側で調整するためのModifier**です。

特にFusion Title、Transition、EffectをEdit / Cut pageで使うtemplateにするときに有効です。Timeline上でclipやtransitionのdurationを変更しても、Anim Curvesを使ったanimationはその長さに合わせてstretch / squashできます。

DaVinci Resolve 21.1 Reference Manualでは、timing・value・accelerationを動的に調整し、smooth motion、bounce、mirrorなどをSplineの手作業だけで組み直さず作る用途として説明されています。

## 何をするModifierか

Anim CurvesはImageを加工するNodeではありません。SizeやPathのDisplacementなど、**数値Parameterへ値を返すModifier**です。

ManualのTransition作例では、TransformのSizeへAnim Curvesを追加すると、transition durationの間にSizeが0から1へ変化します。

~~~text
Edit / Cut側のduration
        ↓
    Anim Curves
        ↓
   SizeなどのParameter
~~~

通常のKeyframe Animationでは、Compositionの長さが変わるとKeyframe位置を調整し直す必要が出る場合があります。Anim CurvesはSourceとしてTransition / Durationを使うことで、Timeline側の長さをanimationの基準にできます。

## 追加方法

対象Parameterを右クリックし、**Modify With > Anim Curves**を選びます。

ManualではTransformのSizeへ直接追加する例と、Path ModifierのDisplacementへ**Insert > Anim Curves**で挿入する例が確認できます。

対象Parameterの型によって利用できるModifierは異なるため、Manualで確認できていないParameter型まで対応範囲を推測しません。

## 入力と出力

Anim Curvesが扱う中心は数値Parameterです。

- 対象: Size、Displacementなどの数値Parameter
- 時間の基準: Transition duration、clip / comp duration、またはCustom Input
- 出力: そのframeで対象Parameterへ返す数値
- 主な編集場所: InspectorのModifier tab
- Image input / output: なし

frontmatterのinputs / outputsにあるparameterはdata domainを表す分類で、Node Editor上の画像端子を意味しません。

## Curve Shape Controls

### Source

Sourceは、animationの進行を何に合わせるかを選びます。

#### Transition

Edit pageのtransition effectからCompositionを作った場合に使うSourceです。

Manualでは、この場合Transitionが自動選択され、Edit pageでtransition durationを変更するとanimation timingも更新されると説明されています。

#### Duration

Edit page上のclipからCompositionを作った場合に使います。

clipをtrimしてdurationが変わると、animation timingもその長さに合わせて更新されます。

Fusion TitleやEffectのように、Timeline上でclip長を変えても同じanimation構造を保ちたい場合の中心になる設定です。

#### Custom

Timeline上のTransition / Durationへ自動追従させる代わりに、Inputを使って進行を手動制御します。

Customを選ぶとInput Controlが表示されます。

### Input

SourceがCustomのときだけ表示されます。

Manualでは、animationのinput keyframe valueを手動で変更するControlとして説明されています。Transition / Durationの自動追従ではなく、別の値からAnim Curvesの進行を操作したい場合に使います。

### Curve

Keyframe間の補間方法を選びます。

21.1 Manualで確認できる選択肢は3種類です。

- **Linear** — 一定の補間で開始から終了まで進む
- **Easing** — In / Outの補間方式を個別に選ぶ
- **Custom** — 小型のSpline Editorを開き、開始から終了までのcurveを直接調整する

単に0から1へ一定速度で進めるならLinear、開始・終了のeaseやBounceなどを選びたいならEasing、curve形状を自分で作りたいならCustomが候補になります。

### Mirror

animationを開始値から終了値まで進めたあと、開始値へ戻します。

同じ総durationの中で往復するため、forward方向だけに使える時間は半分になります。Manualでも、reverse animationが後半を使うため初期animationが2倍の速さになると説明されています。

「0 → 1」だけで終わらせず、「0 → 1 → 0」の往復にしたい場合に使えます。

### Invert

animation curveを上下反転します。

通常が低い値から高い値へ進むcurveなら、Invertによって高い値から低い値へ進む関係にできます。

ManualのTransition作例では、2つのTransform SizeへAnim Curvesを付け、一方だけInvertすることで、片方が大きくなる間にもう片方が逆方向へ変化する構成を作っています。

## Scaling

### Scale

Anim Curvesが返す値へ掛ける倍率です。

Manualの例では、Keyframe値が10でScaleが2なら結果は20になり、0は0のままです。

animation全体の変化量を広げたり狭めたりする場合に使います。

### Offset

Anim Curvesの値へ加算する値です。

Manualでは、animationのstarting valueを調整するControlとして説明されています。

たとえば0〜1のcurveをそのまま使うのではなく、別の基準値から始めたい場合にScaleと組み合わせて使えます。

### Clip Low

出力が0.0より下へ行かないようにします。

### Clip High

出力が1.0より上へ行かないようにします。

Scale / Offsetで値域を変えたあと、0〜1の範囲から外したくないParameterで使えます。

## Timing

### Time Scale

animationの時間方向の倍率を変えます。

- 1.0 — 基本となるComposition duration全体で進む
- 1より大きい — より速く進む
- 1より小さい — より遅く進む

21.1 Manualでは、Pathとの組み合わせ例でTime Scaleを2.0にしてanimationを2倍速くしています。

### Time Offset

animationの開始位置を、総durationに対する割合で遅らせます。

Manualでは0.0をdelayなし、0.5をComposition durationの半分だけ開始を遅らせる値として説明しています。

frame数そのものではなく、総durationに対する相対値として扱う点に注意します。

## 主な用途

### Timeline上で長さを変えられるTitle / Effect

Fusion TitleやEffectをtemplate化し、Edit / Cut pageでclip durationを変えてもanimation全体を追従させたい場合に使います。

SourceをDurationにしておけば、clipのtrimに合わせてanimation timingが更新されます。

### Transitionの両側を逆方向に動かす

2つの素材にそれぞれTransformを置き、両方のSizeへAnim Curvesを追加します。

片方を通常の0 → 1、もう片方をInvertした1 → 0として使えば、2つの素材を逆方向にscaleさせられます。

### Path上の進行へBounceを加える

Anim CurvesはPathのDisplacementへ挿入できます。

Pathが「どこを通るか」を持ち、Displacementが「Path上をどこまで進んだか」を表すため、DisplacementへAnim Curvesを入れると、経路そのものを描き直さず進行curveへEasingやBounceを加えられます。

## 運用例1: durationへ追従するScaling Transition

21.1 Manualには、Cross DissolveをFusion Transitionへ変換し、Anim Curvesでscaling dissolveを作る例があります。

~~~text
MediaIn1 → Transform1 ─┐
                       ├─ Transition
MediaIn2 → Transform2 ─┘

Transform1 Size ← Anim Curves + Invert
Transform2 Size ← Anim Curves
~~~

手順の中心は次のとおりです。

1. Edit pageでCross Dissolveを右クリックして`Convert to Fusion Cross Dissolve`を選び、再び右クリックして`Open in Fusion page`で開く。
2. Fusion pageでMediaIn1 / MediaIn2の両方へTransformを追加する。
3. MediaIn2側のSizeへAnim Curvesを追加する。
4. MediaIn1側のSizeにもAnim Curvesを追加し、Invertを有効にする。
5. CurveをEasingにし、In / Outの補間を調整する。
6. Macro / Transition templateとして保存する。

この構成では、Edit pageでtransition durationを変更するとAnim Curves側のtimingも追従します。

## 運用例2: PathのDisplacementへBounceを入れる

Manualでは、Textを画面上から下へ落とすPath AnimationにAnim Curvesを挿入する例もあります。

~~~text
Path
  └─ Displacement
         ↑
     Anim Curves
         └─ Easing / Bounce
~~~

1. TextのPositionに開始・終了Keyframeを作り、Pathを生成する。
2. Modifier tabでPathのDisplacementを右クリックし、**Insert > Anim Curves**を選ぶ。
3. SourceをDurationにする。
4. CurveをEasingにし、OutをBounceにする。
5. 必要に応じてScaleとTime Scaleを調整する。

Manualの作例ではScaleを0.05、Time Scaleを2.0へ変更しています。これらは作例上の値であり、一般的な推奨defaultとして扱うものではありません。到達位置はScaleだけで決めつけず、ViewerでPathとDisplacementの出力を確認して調整します。

## 時間の調整方法を選び分ける

「アニメーションを長くする」といっても、**クリップ全体に合わせて動きの進行を伸ばす**場合と、**出入りの速さを保って中央だけ長くする**場合では、使う機能が異なります。

| 方法 | 調整対象 | 適した用途 |
| --- | --- | --- |
| **Anim Curves** | 適用した数値パラメータへ供給する曲線と進行 | TitleやTransition全体の長さに合わせて、移動・拡大のタイミングを伸縮する |
| [Key Stretcher Modifier](./key-stretcher-modifier) | 一つのパラメータの既存キーに対する評価時刻 | 出現と退場の速度を保ち、中央の表示時間だけを伸ばす |
| [Keyframe Stretcher Node](../time-metadata/keyframe-stretcher) | Nodeを通る画像フローに含まれるアニメーション範囲 | 複数の動きを含むTitle / Effectの時間調整 |
| [Bézier Spline](./bezier-spline)とKeyframes / Spline EditorのTime Stretch | キーの時刻・補間曲線 | 固定のフレーム位置に合わせて直接キーを変更する |
| [Time Stretcher](../time-metadata/time-stretcher) | `Source Time`による素材の読み出し位置 | 映像素材をフリーズ、スロー再生、リタイムする |

例えば48フレームのTitleを72フレームへ伸ばしたとき、**拡大が終わるタイミングもクリップの相対時間へ追従させたい**なら`Source = Duration`のAnim Curvesが候補です。一方、最初と最後の10フレームの出入りはそのままにして**中央だけ24フレーム長くしたい**ならKey Stretcher系を選びます。

## Bézier Splineとの違い

[Bézier Spline](./bezier-spline)は、明示的なKeyframeとhandleを使って時間curveを直接編集するAnimation Modifierです。

Anim Curvesは、Edit / Cut側のdurationやCustom Inputを時間基準にし、Linear / Easing / Custom、Mirror、Invert、Scale、Offset、Time Scale / Offsetで**duration-relativeなAnimationを組み立てる**用途に向いています。

- 固定したframe位置にKeyframeを置き、curveを直接細かく編集したい — Bézier Spline
- Timeline上で長さが変わるTitle / Transition / Effectへ追従させたい — Anim Curves

## Pathとの関係

[Path](./path)はPosition Controlをmotion pathへ結び、Viewer上の経路とSpline Editor上のDisplacementを分けて扱うModifierです。

Anim CurvesをDisplacementへ挿入すると、Pathの形は維持したまま、経路上の進み方へEasingやBounce、Time Scaleなどを追加できます。

## Duration追従を検証する

以下は48フレームのTitleを72フレームへ延ばす比較例です。数値は説明用で、21.1のdefaultを表しません。

1. Fusionで`Text+ → Transform → MediaOut`をつなぎ、Transformの**Size**へ`Modify With > Anim Curves`を追加します。
2. InspectorのModifiersタブで`Source = Duration`、`Curve = Linear`を設定します。`Scale / Offset`は値域、`Time Scale / Time Offset`は進行の速度・開始位置へ作用するため、現在値を控えます。
3. Fusion Titleのtemplateとして保存し、Editページへ置きます。Titleが48フレームのときの開始・中間・終了のSizeと映像を確認します。
4. 同じTitleを72フレームへ延ばして比較します。Durationに沿って進む場合、絶対的なフレーム番号ではなく**クリップ全体に対する進行割合**が維持されるかを見ます。
5. 動きが違う場合は`Scale / Offset`と`Time Scale / Time Offset`を一緒に変えず、値域と時間のどちらの問題か切り分けます。

### Spline Editorで曲線を確認する

21.1 Manual（Chapter 124 p.2994）では、Spline Editorのheaderで対象パラメータ名を選ぶと、Anim Curvesの変更が反映された曲線を表示できると説明しています。Viewer上での見た目だけで判断せず、**Modifierを付けた同じパラメータ**を表示して確認します。

| 症状 | 先に確認すること |
| --- | --- |
| Titleを長くしても動きが追従しない | Edit / Cut側のTitleをtrimしたか、`Source = Duration`か、`Custom`のInputを固定していないか |
| Transitionに追従しない | EditのtransitionからFusion Transitionへ変換したか、`Source = Transition`か |
| 動きが早く終わる・開始が遅い | `Time Scale / Time Offset`とMirror |
| 動きの大きさが想定と異なる | `Scale / Offset`、`Clip Low / High`、適用先のパラメータ |
| Pathの終点へ到達しない | Path自体ではなくDisplacementに入れたAnim Curvesの出力 |

## 注意点

Anim Curvesは「既存Keyframeをstretchするだけ」のModifierではありません。ManualのTransition例では、Sizeへ追加したAnim Curves自体がdurationに沿う0〜1のanimationを供給しています。

一方、Path例では既存のDisplacementへInsertして、その進行curveをdurationへ正規化しながら加工しています。どのParameterへ直接付けるか、既存Modifierのどこへ挿入するかで役割が変わります。

SourceのTransition / Durationは、Edit page側でどの種類のCompositionから作られたかに対応します。Manualに記載されていないhostやtemplate種別まで自動追従すると推測しません。

また、このページでは21.1 Manualで確認できるControl名と動作を基準にしています。current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差は確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Bézier Spline](./bezier-spline)
- [Path](./path)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 67「Node Groups, Macros, and Fusion Templates」p.1446およびChapter 124「Modifiers」pp.2991–2994を基準にしています。

同Manualで、Anim Curvesの役割、SourceのTransition / Duration / Custom、Custom時のInput、CurveのLinear / Easing / Custom、Mirror、Invert、Scale、Offset、Clip Low / High、Time Scale / Time Offsetを確認しています。

また、同章のScaling Dissolve作例とPath DisplacementへAnim Curvesを挿入してBounceを作る作例を基準に、具体的な運用手順を整理しています。

current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差は別のruntime verification対象です。
