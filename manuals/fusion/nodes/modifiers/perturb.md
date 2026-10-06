---
title: "Perturb"
description: "Perlin noiseでParameterやPolyline、Grid Mesh、Gradientへ滑らかなランダム変化を加えるModifier。"
doc_type: node
term_id: "perturb"
term_short: "Perturbは、Perlin noiseでParameterやPolyline等へ滑らかなランダム変化を加えるModifier。"
verification: partial
aliases: ["Perturb"]
concepts: ["parameter-data"]
nodes: ["Perturb"]
node_family: "modifiers"
controls: ["Value", "Jaggedness", "Phase", "Random Seed", "Randomize", "Strength", "Wobble", "Speed"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "procedural-animation", "randomize-value"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-06"
---

# Perturb

Perturbは、**Perlin noiseを使って滑らかに変化するランダム値を作り、Parameterへ揺れやばらつきを加えるModifier**です。

画像を直接加工するNodeではありません。TransformのCenterや数値SliderのようなParameterへ付けると、その値へ時間変化する揺らぎを加えます。すでにKeyframe AnimationされているParameterにも使えるため、意図した大きな動きへ細かな揺れを重ねる用途にも向きます。

DaVinci Resolve 21.1 Reference Manualでは、数値Parameterだけでなく、Polyline、Shape、Grid Mesh、Color GradientにもPerturbを適用できることが明記されています。

## 何をするModifierか

Perturbの基本的な考え方は、元の値を中心にして、その周囲へ滑らかなランダム変化を加えることです。

~~~text
Value
  +
Strength / Wobble / Speed / Random Seed
  ↓
Perturb
  ↓
対象Parameterの値
~~~

たとえばTransformのCenterへ使えば位置が揺れ、Sliderへ使えば数値が揺れます。PolylineやMeshへ使う場合は、時間方向の揺れだけでなく、形状に沿ったばらつきも作れます。

Perturbは既存のAnimationへ揺れを足せますが、既存のAnimation Curveを滑らかにするModifierではありません。Manualでも、Perturbはjitterを加えることはできても、元のAnimationをsmooth outする用途には使えないとされています。

## 追加方法

通常のParameterでは、Inspectorで対象Controlを右クリックし、`Modify With > Perturb` を選びます。

すでにPath Animationを持つControlでは、contextual menuの `Insert > Perturb` を使って既存のAnimationへPerturbを挿入できる場合があります。21.1 ManualのPath作例では、Viewer上のcrosshairへPerturbを挿入してcamera shakeのような揺れを加えています。

Perturbを追加すると、InspectorのModifiers tabにControlが表示されます。

## 主なControl

### Value

Valueは、Perturbが揺らす基準値です。

表示されるControlの種類は、Perturbを付けた対象に応じて変わります。たとえばSliderへ付ければSlider、Gradientへ付ければGradientのControlが表示されます。

つまりValueは常に単一の数値とは限らず、**対象Controlの型に対応した基準値**として扱います。

### Strength

Strengthは、基準値からどの程度まで変化できるかを決めます。

値を大きくすると揺れ幅が増え、小さくすると元の値に近い範囲で変化します。既存のmotionへ細かなcamera shakeを加える場合は、まずStrengthを小さめにして調整すると挙動を把握しやすくなります。

### Wobble

Wobbleは、生成される変化の滑らかさと不規則さを調整します。

- 小さい値 — 値どうしの移り変わりが滑らかになる
- 大きい値 — 変化がより予測しにくくなる

揺れの速さそのものはSpeedで調整できるため、WobbleとSpeedは分けて考えます。

### Speed

Speedは、Perturbで作られた値が時間方向に変化する速さを決めます。

値を上げるほど変化が速くなり、細かな振動や慌ただしい揺れに近づきます。値を下げると、ゆっくりした漂いのような変化を作れます。

Manualでは、Wobbleよりも予測しやすい形で揺れの速さを調整するControlとして説明されています。

### Random Seed / Randomize

Random Seedは、Perturbが生成するrandom patternを決めます。

同じ設定でもSeedが違えば結果は変わります。Randomizeを押すと別のSeedが割り当てられるため、StrengthやSpeedを変えずに揺れ方だけを切り替えたいときに使えます。

### Jaggedness

Jaggednessは、**PolylineとMeshへPerturbを使った場合だけ**利用するControlです。

時間方向の動きではなく、PolylineやMeshの長さに沿ってどの程度ばらつきを増やすかを調整します。値を上げるとPolylineはより細かく曲がり、Meshはより入り組んだ形になります。

### Phase

PhaseもPolylineとMesh向けのControlです。

PhaseをAnimationすると、PolylineやMeshに生じた波状の変化を端から端へ移動させられます。Manualでは、Speedを `0.0` にするとPhaseによる形状変化を確認しやすいと説明されています。

## 具体例1: Keyframeで作った動きへ細かな揺れを足す

Fusion Fundamentalsでは、Keyframe AnimationとPerturbを組み合わせる例が紹介されています。

1. TransformのCenter X/YへKeyframeを付ける。
2. Viewer上で位置を動かし、figure-8のような大きなmotion pathを作る。
3. Center Xなどの対象Parameterへ `Modify With > Perturb` を追加する。
4. Modifiers tabでStrength、Wobble、Speedを調整する。

この構成では、Keyframeが「どこからどこへ動くか」という主運動を担当し、Perturbがその上へ細かな揺れを加えます。

~~~text
Keyframe Animation
       +
     Perturb
       ↓
意図した移動 + 細かな揺れ
~~~

主運動までrandomにせず、演出として必要なmotionと自然な揺れを分けて作れます。

## 具体例2: Pathへ3種類の揺れを加える

Path Animationでは、Perturbを入れる場所によって結果が変わります。

### Positionへ入れる

Viewer上のcrosshairから `Insert > Perturb` を使うと、Pathで動く位置そのものへ揺れを加えられます。Manualではcamera shakeを加える例として紹介されています。

### PathのPolylineへ入れる

Pathの `Right-click here for shape animation` からPerturbを適用すると、**移動する物体ではなくPath自体の形**を変化させられます。

この使い方はPolylineのpointが多いほど効果を作りやすく、Manualではtracked pathやDraw Append pencilで手描きしたPolylineが例に挙げられています。

### Displacementへ入れる

PathのDisplacement ControlへPerturbを挿入すると、物体はPathから外れず、**Path上を前後に揺れながら進む**ようになります。

Path自体を歪ませる場合とは結果が異なるため、「位置を揺らしたい」「経路を揺らしたい」「経路上の進行位置を揺らしたい」のどれかを先に決めると、Perturbを入れる場所を選びやすくなります。

[Path](./path)では、PathとDisplacementの関係を別途説明しています。

## Shakeとの違い

[Perturb](./perturb)と[Shake](./shake)は、どちらも滑らかに変化するrandom Animationを生成できます。

ShakeはMinimum / MaximumやSmoothnessを使って、値が動ける範囲と滑らかさを直接決める構成です。PerturbはValueを中心にStrength、Wobble、Speedで揺れを作り、Polyline、Shape、Grid Mesh、Color Gradientへの適用もManualで明示されています。

そのため、単純なPosition / Valueのrandom Animationではどちらも候補になりますが、既存Animationへ細かな揺れを足したい場合や、Polyline / Mesh / Gradientまで扱いたい場合はPerturbのControl構成を確認すると選びやすくなります。

## 入力と出力の考え方

PerturbはNode Editor上でImage Input / Outputを持つ画像処理Nodeとして使うものではありません。

~~~text
対象Control ← Perturb
~~~

基本の入力は、Perturbを付けるParameterやControlです。出力は、その対象へ返される変化後の値です。

ただし対象がPolyline、Mesh、Gradientなどの場合は、Value Controlの型も対象に合わせて変わります。単純なSliderだけを前提に考えない方が安全です。

## 注意点

Perturbは既存Animationへ揺れを追加できますが、元のAnimation Curveをsmoothに補正するものではありません。

また、このページでは21.1 Manualで確認できるPerturbの役割、対応Control、Control名、Pathでの作例を基準にしています。current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差はこのrunでは確認していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Shake](./shake)
- [Path](./path)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3020–3022を基準にしています。

同Manualで、Perlin noiseによるsmoothly varying random values、Polyline / Shape / Grid Mesh / Color Gradientへの適用、Value、Jaggedness、Phase、Random Seed / Randomize、Strength、Wobble、Speed、およびPathへPerturbを適用する3種類の作例を確認しています。

また、Fusion Fundamentals Chapter 73 pp.1582–1583で、PerturbをParameterへ追加する方法と、Keyframe Animationへsecondary motionを重ねる作例を確認しています。
