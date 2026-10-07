---
title: Modifier
description: NodeのParameterへAnimation・式・tracking・audioなどの値を供給するModifierを、目的と値の種類から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
concepts: ["modifier-parameter-sources"]
tasks: [lookup-node, animate, drive-parameter]
updated: "2026-10-07"
---

# Modifier

<Term id="modifier-parameter-sources">Modifier</Term>は、Nodeそのものを置き換えるのではなく、**NodeのParameterへ値を供給する仕組み**です。たとえば、TransformのCenterへ軌道を与える、Sizeへランダムな揺れを加える、別Parameterの値から計算する、音声解析の結果で数値を動かす、といった使い方をします。

通常のImage処理NodeのようにFlow上で映像を受け取って映像を返すものではありません。対象Parameterを右クリックして `Modify With` から追加し、追加後はInspectorの**Modifiers** tabで設定します。どのModifierを選べるかはParameterの種類によって変わり、数値・Point・Polyline・Gradientなどで候補が自動的に絞られます。

詳しい「Parameterの値がどこから来るか」という考え方は、[Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)で説明しています。

## 基本の流れ

```text
値の供給元
keyframe / expression / tracking / audio / image sample ...
        ↓
Modifier
        ↓
対象Parameter
        ↓
Nodeの結果
```

Modifierは1つだけとは限りません。21.1 Manualでは、Modifier同士をつないだり、既存Modifierの途中へ別Modifierを挿入したり、1つのModifierやPublishしたParameterを複数Parameterへ接続したりできます。

また、keyframeとModifierを組み合わせることもできます。たとえばCenterの大きな移動をkeyframeで作り、その上へPerturbを加えて小さなランダム移動を重ねる構成です。

## Animation curveを作る

数値Parameterを時間で変化させる場合は、まずSpline系を確認します。

- [Bézier Spline](./bezier-spline) — keyframe間のcurveをhandleで調整しながら作る基本的なAnimation Spline
- [B-Spline](./b-spline-modifier) — B-SplineとしてAnimation curveを扱う
- [Cubic Spline](./cubic-spline) — 数値Parameter向けのCubic Spline
- [Natural Cubic Spline](./natural-cubic-spline) — control handleを直接使わず、control point間を滑らかにつなぐ
- [Anim Curves](./anim-curves) — Animationの時間・値・加減速を相対的に調整し、templateの尺変更にも追従させる

「どのframeでどの値にするか」を直接作りたいならSpline系、「作ったAnimation全体の長さや形を後から調整したい」ならAnim Curvesが候補です。

## Edit / Cut pageで尺が変わるtemplateに対応する

Fusion Title、Transition、EffectをEdit / Cut pageで伸縮して使う場合は、通常のkeyframeだけでなくtemplate向けModifierを確認します。

- [Key Stretcher Modifier](./key-stretcher-modifier) — intro / outroなど残したい区間を保ちながら、中央のAnimation区間を伸縮する
- [Anim Curves](./anim-curves) — compやtransitionのdurationに合わせてAnimation timingを相対的に調整する
- [Resolve Parameter](./resolve-parameter) — Edit page側のtransition durationとFusion内のAnimationを連動させる用途

3つは同じ機能ではありません。どの区間を固定したいか、Animation全体を相対調整したいか、Resolve側のdurationを直接Animationへ反映したいかで選びます。

## 値を計算・共有する

別Parameterとの関係を作る場合は、次を使い分けます。

- [Expression](./expression) — 数式や変数から値を計算する。Number / Pointの両方を扱える
- [Calculation](./calculation) — 2つの値を演算で組み合わせる。operandごとのTime Scale / Offsetも扱える
- [Publish](./publish) — 1つのParameterを公開し、別Parameterから `Connect To` で共有できるようにする
- [Offset](./offset-modifier) — Angle / Distance / Positionなど、2つの位置関係から差分を作る
- [Vector Result](./vector) — origin・distance・angleからvectorを作り、位置系Parameterへ利用する

Expressionは自由度が高い一方、21.1 Manualでは別frameの値を直接参照する用途にはCalculationの時間Controlの方が扱いやすい場合があると説明されています。

## Position・path・trackingで動かす

位置系Parameterでは、「画面上の軌道を作る」「X/Yを別々に編集する」「tracker結果を使う」で選択が変わります。

- [Path](./path) — Viewer上のmotion pathと、Spline EditorのTime splineを組み合わせて位置をAnimationする
- [XY Path](./xy-path) — XとYを別々のSplineとして編集して位置をAnimationする
- [Track](./track) — 選んだParameterへsingle-point trackerを直接付ける
- [CoordTransform Position](./coord-transform-position) — 3D hierarchy内でTransformを受けたobjectの現在位置を求める

Trackは通常のTracker Nodeより手早く1つのParameterを追従させたい場合に向きます。Manualではsingle-pointに限定される分、通常のTracker Nodeより柔軟性が低いことも明記されています。

## 自動的な揺れを作る

- [Perturb](./perturb) — Parameterへ滑らかに変化するrandom Animationを加える
- [Shake](./shake) — Perturbと同様に、滑らかなrandom Animationを作る

大きな移動をkeyframeで決め、細かな揺れだけModifierで加えるように、既存Animationへ二次的な動きを重ねる用途にも使えます。

## Image・audio・外部dataから値を作る

画面の色や音声などをParameterへ変換したい場合は、値の供給元で選びます。

- [Probe](./probe) — Image内のpixelまたは矩形領域をsampleし、color / luminosityからParameterを自動Animationする
- [From Image](./from-image) — Image上の指定したlineからcolorをsampleし、gradientを作る
- [Fairlight Animator](./fairlight-animator) — Fairlightのaudio解析結果からParameterを動かす
- [MIDI Extractor](./midi-extractor) — MIDI file内のevent / valueからParameterを動かす

「音に反応させたい」場合はFairlight Animator、「MIDI dataを使いたい」場合はMIDI Extractorです。旧indexにあった `Sound` というまとめ方は、21.1 ManualのModifier名に合わせてFairlight Animatorへ整理しています。

## Polyline・Gradientを加工する

数値やPoint以外にも、特定のdata type向けModifierがあります。

- [Custom Poly](./custom-poly) — Polygon maskやpathの各pointをexpressionで移動・再生成する
- [Gradient Color Modifier](./gradient-color-modifier) — custom gradientを時間範囲へmappingし、Parameterの変化へ使う

このようなModifierは、右クリックしたParameterのtypeが対応している場合だけ候補へ表示されます。Text+ / Text3Dには、Chapter 124の一般Modifierとは別にtext固有のModifierもあります。

## 迷ったときの選び方

まず「何をParameterの値にしたいか」を決めます。

1. keyframeとcurve → Bézier / B-Spline / Cubic系
2. templateの尺変更 → Anim Curves / Key Stretcher / Resolve Parameter
3. 別Parameterとの計算・共有 → Expression / Calculation / Publish
4. 画面上の位置やtracker → Path / XY Path / Track
5. 自動的な揺れ → Perturb / Shake
6. Image sample → Probe / From Image
7. audio → Fairlight Animator
8. MIDI → MIDI Extractor
9. Polygon / path自体を式で変形 → Custom Poly

Modifier名から選ぶより、「対象Parameterの種類」と「値の供給元」を先に決めると候補を絞りやすくなります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）を基準にしています。

- Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1582–1585 — Modifierの追加方法、Parameter typeによる候補の絞り込み、Modifiers tab、keyframeとの併用、Publish / Connect To、Modifier同士の接続、主要Modifierの役割
- Chapter 124「Modifiers」pp.2991–3030 — 21.1で掲載されているModifier各項目と個別Control

各Modifierのexact Control名、default、range、edition差は個別ページの確認範囲に従います。ここではFamily全体の選択基準だけを整理し、Manualや実機で確認できていない差は補っていません。
