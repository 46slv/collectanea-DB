---
title: Key Stretcher Modifier
description: Edit / Cut pageでtemplateの長さを変えても、intro / outroのtimingを保ちながら既存Keyframeの中央区間を伸縮できるModifier。
doc_type: node
term_id: key-stretcher-modifier
term_short: Key Stretcher Modifierは、templateのduration変更に合わせて既存Keyframeの一部だけを時間方向へ伸縮するModifier。
verification: partial
aliases: [Key Stretcher Modifier, Keyframe Stretcher Modifier, KeyStretcher]
concepts: [keyframes, time, template, modifiers]
nodes: [Key Stretcher Modifier]
node_family: modifiers
controls: [Source Start, Source End, Stretch Start, Stretch End, Stretch Edges Instead]
inputs: [parameter]
outputs: [parameter]
tasks: [template, retime-animation, modifier]
product_scope: fusion
suite_surfaces: [fusion, edit, cut]
updated: "2026-10-07"
---

# Key Stretcher Modifier

Key Stretcher Modifierは、**Edit / Cut pageでFusion templateの長さを変えたとき、既存のKeyframe Animationを新しいdurationへ合わせて時間方向に伸縮するModifier**です。

Imageを処理するNodeではありません。すでにKeyframeが付いているParameterへ追加し、そのParameterのAnimationをどの区間で伸ばすかを指定します。

特に、titleのintroとoutroは元の速さのまま保ち、中央の静止区間だけを長くしたい場合に使います。

~~~text
既存のKeyframe Animation
        ↓
Key Stretcher Modifier
        ↓
Edit / Cut側でtemplateをtrim
        ↓
指定した区間だけstretch / squash
~~~

## 追加方法

対象のanimated Parameterを右クリックし、**Modify With > KeyStretcher**を選びます。

21.1 Manualでは「Key Stretcher Modifier」という見出しと、「Keyframe Stretcher modifier」という説明表記が併用されています。このページではrepo内のNode名に合わせてKey Stretcher Modifierと表記します。

## 何が変わるのか

Key Stretcher Modifierは、元のSplineそのものを書き換えて別のKeyframe配置へ変換する機能ではありません。

DaVinci Resolve 21.1 Reference Manualでは、Keyframe Stretcherによるstretch後もSpline Editorには元のKeyframe位置が表示され、**Spline自体ではなくAnimationの評価timingが変更される**と説明されています。

そのため、元のAnimation設計を保ったまま、templateの長さに応じて再生timingだけを適応させるものとして考えると分かりやすくなります。

## Keyframes Controls

Modifierの詳細Controlは、21.1 ManualのKeyframe Stretcher Node節へ案内されています。Manualでは次のControlが確認できます。

### Source Start / Source End

元になるAnimationの時間範囲を指定します。

通常は、対象ParameterのAnimation全体を含むrangeへ合わせます。

たとえば元のAnimationがframe 0から50までなら、Source Startを0、Source Endを50として、どの時間範囲を元のAnimationとして扱うかを決めます。

### Stretch Start / Stretch End

Source rangeの中で、**どの区間をstretch / squashするか**を指定します。

この範囲より外側のKeyframeはscaleされず、Start側・End側からのframe距離を維持します。

つまり、introとoutroのAnimation速度を変えずに、その間のholdやloop部分だけを長くしたい場合に使えます。

### Stretch Edges Instead

有効にすると、Stretch Start / Stretch Endで指定した中央区間を伸ばす方式ではなく、Animationの両端側をstretchします。

21.1 Manualでは、このcheckboxを有効にするとStretch Start / Stretch Endの指定をoverrideすると説明されています。

## 具体例: 50 frameのtitleを75 frameへ伸ばす

21.1 Manualの例では、元のAnimationが50 frameで、次のようにKeyframeが配置されています。

- Source Start: 0
- Source End: 50
- intro側のKeyframe: frame 10
- outro側のKeyframe: frame 40
- Stretch Start: 11
- Stretch End: 39

この状態でtemplateを75 frameへ伸ばすと、最初の10 frameと最後の10 frameは元と同じ速さで再生され、その間の区間だけが新しいdurationに合わせて伸びます。

~~~text
元の50 frame
| intro 10f |------ middle ------| outro 10f |

75 frameへ延長
| intro 10f |----------- stretched middle -----------| outro 10f |
~~~

titleの出現Animationと退場Animationの速度を固定し、画面上に留まる時間だけを編集時に自由に変えたい場合の典型的な使い方です。

## Keyframe Stretcher Nodeとの違い

[Keyframe Stretcher](../time-metadata/keyframe-stretcher)は、Node graphに置いて複数の上流Nodeに含まれるAnimationをまとめてdurationへ追従させます。

21.1 Manualでは、Keyframe Stretcher NodeをMediaOut / Saverの直前へ置く構成が示されており、その手前にあるanimated Node群のtimingへ作用します。

一方、Key Stretcher Modifierは**特定のParameterへ直接追加**します。

- 複数Nodeや複数ParameterのAnimationをまとめて扱う — Keyframe Stretcher Node
- 1つのParameterだけを対象にする — Key Stretcher Modifier

という使い分けです。

## Anim Curvesとの違い

[Anim Curves](./anim-curves)もEdit / Cut側のduration変更へ追従できますが、目的が異なります。

Anim CurvesはLinear / Easing / Custom curve、Mirror、Invert、Scale、Offsetなどを使い、Modifier自身がduration-relativeなAnimationを作ったり加工したりできます。

Key Stretcher Modifierは、**すでに存在するKeyframe Animationのtimingを、指定rangeに従ってstretch / squashする**用途が中心です。

- 既存Keyframeのintro / outroを残して中央区間だけ伸ばしたい — Key Stretcher Modifier
- durationに追従するAnimation curve自体を作り、easingやbounce等も設計したい — Anim Curves

という違いがあります。

## Resolve Parameterとの違い

[Resolve Parameter](./resolve-parameter)は、Fusion transition template内のParameterをEdit / Cut page上のtransition durationへ自動連動させるModifierです。

Key Stretcher Modifierはtransition専用ではなく、既存Keyframeのどの区間を伸縮するかを指定します。

custom transition全体の進行値をdurationへ直接追従させたい場合はResolve Parameter、既存Animationのintro / middle / outroの時間構造を保ちたい場合はKey Stretcher Modifierを確認します。

## 注意点

Key Stretcher Modifierは、すべてのKeyframeを一律にspeed changeする機能ではありません。Source rangeとStretch rangeを分けることで、stretchしない区間とstretchする区間を作れます。

また、Spline Editor上で元のKeyframe位置が動いて見えなくても、stretchが無効という意味ではありません。21.1 Manualでは、Splineは変更せずAnimationの評価timingだけを変える動作として説明されています。

このページでは21.1 Manualで確認できるControl名と挙動を基準にしています。current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差は確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Keyframe Stretcher](../time-metadata/keyframe-stretcher)
- [Anim Curves](./anim-curves)
- [Resolve Parameter](./resolve-parameter)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 67「Node Groups, Macros, and Fusion Templates」pp.1446–1447、Chapter 111「Miscellaneous Nodes」pp.2597–2599、Chapter 124「Modifiers」p.3011を基準にしています。

Chapter 67で、Keyframe Stretcher Modifierがtitle templateのintro / outro timingを維持しながら中央のHold区間を伸ばす用途を確認しています。Chapter 111でSource Start / End、Stretch Start / End、Stretch Edges Instead、Spline Editor上の元Keyframe位置を変えずAnimationのtimingを変更する挙動を確認しています。Chapter 124で、animated Parameterへ`Modify With > KeyStretcher`から適用することを確認しています。
