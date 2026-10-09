---
title: Resolve Parameter
description: Fusion transition template内のParameterをEdit / Cut pageのtransition durationへ自動連動させるModifier。
doc_type: node
term_id: resolve-parameter
term_short: Resolve Parameterは、Fusion transitionのParameterをtransition全体の長さへ自動追従させるModifier。
verification: partial
aliases: [Resolve Parameter]
concepts: [template, modifiers, time]
nodes: [Resolve Parameter]
node_family: modifiers
outputs: [parameter]
tasks: [transition-template, modifier, edit-page]
product_scope: fusion
suite_surfaces: [fusion, edit, cut]
updated: "2026-10-06"
---

# Resolve Parameter

Resolve Parameterは、**Fusionで作るtransition templateのParameterを、Edit / Cut page上のtransition durationへ自動追従させるModifier**です。

transitionを短くしたり長くしたりしても、対象ParameterのAnimationがそのtransition全体の長さに合わせて更新されます。Edit / Cut pageで使うcustom transitionを作るときに、「transitionの長さが変わるたびにKeyframeを打ち直す」ことを避けるための仕組みです。

## 何をするModifierか

Resolve ParameterをControlへ追加すると、そのParameterはtransitionのdurationに合わせて自動的にAnimationされます。

これはNode Editor上でImageを受け渡すNodeではありません。DissolveのBackground/Foregroundのような**Inspector上のParameterへ直接付けるModifier**です。

```text
Edit / Cut pageのtransition duration
                ↓
        Resolve Parameter
                ↓
      対象ParameterのAnimation
```

transitionの長さをEdit / Cut page側で変更すると、Modifierが付いたParameterも新しいdurationへ追従します。

## 追加方法

21.1 Manualのcross dissolve例では、Dissolve Nodeの`Background/Foreground` ParameterへResolve Parameterを追加します。

1. Edit pageのTimelineへFusion Compositionを追加する。
2. Fusion pageでDissolve Nodeを追加する。
3. Inspectorの`Background/Foreground`を右クリックし、Modifierのcontextual menuから`Resolve Parameter`を選ぶ。

この時点で、Background/Foregroundの値はtransition durationへ連動するようになります。

## 具体例: custom cross dissolveを作る

DaVinci Resolve 21.1 Reference Manualでは、Resolve Parameterを使ったcustom transitionの例としてDissolveを使っています。

### 1. Dissolveの進行をtransition durationへ連動させる

Dissolveの`Background/Foreground`へResolve Parameterを追加します。

これにより、Edit / Cut pageでtransitionの長さを変更したときも、Dissolveの進行が変更後のdurationへ合わせて更新されます。

### 2. Macroへ必要な入出力を公開する

Node EditorでDissolveを右クリックし、`Macro > Create Macro`を選びます。

Fusion transitionとして使うMacroでは、Manualの例で次の3項目を有効にしています。

- `Output`
- `Background`
- `Foreground`

つまり、2つの映像Inputと1つのOutputを持つtransitionとしてMacroを保存します。

### 3. Fusion Transitionとして保存する

Macroへ名前を付け、ResolveのFusion Transition用template folderへ保存します。

保存後にDaVinci Resolveを再起動すると、Edit pageのEffects Libraryにある`Video Transitions > Fusion Transitions`からcustom transitionを選べるようになります。

ManualにはmacOS / Windowsそれぞれのtransition template folderも記載されています。保存場所はResolveのtemplate構成や使用範囲によって変わるため、このページではManual記載のpath変数を実在する固定pathへ展開せず、transition template folderとして扱います。

## transitionをtrimすると何が変わるか

Resolve Parameterの役割は、固定frame数のAnimationを作ることではなく、**現在のtransition durationへParameterのAnimationを合わせること**です。

たとえばEdit pageでtransitionを長くした場合、そのParameterの変化も新しい長さへ合わせて進みます。短くした場合も同様です。

そのため、編集段階でtransition durationを何度も調整する可能性があるtemplateでは、固定frame位置へKeyframeを置くだけの場合より扱いやすくなります。

## Anim Curvesとの違い

[Anim Curves](./anim-curves)も、Edit / Cut page側でdurationが変わるtemplate Animationに使えますが、役割が異なります。

- **Resolve Parameter** — transition内の対象Parameterをtransition durationへ自動連動させる
- **Anim Curves** — 既存Animationのtimingやvalue curveをModifierとして変形し、stretch / squash、easing、bounce、mirrorなどを調整する

単純にtransition全体の進行へParameterを合わせたい場合はResolve Parameter、Animation curveの形まで設計したい場合はAnim Curvesを検討します。

## Key Stretcher Modifierとの違い

[Key Stretcher Modifier](./key-stretcher-modifier)は、template durationが変わったときに既存KeyframeのrangeをstretchするためのModifierです。

intro / outroなど特定区間のtimingを保ちながらtemplate全体の長さへ対応させたい場合は、Key Stretcher Modifierの方が目的に合うことがあります。

Resolve Parameterは、transition templateのControlそのものをtransition durationへ連動させる用途に特化しています。

## Publishとの違い

[Publish](./publish)は、静的Parameterを`Connect To`から参照できるようにし、複数Parameterへ同じ値を共有するための仕組みです。

Publishはtransition durationに合わせてAnimationを作りません。

- transition durationへ自動追従させる → Resolve Parameter
- Parameter同士で同じ値を共有する → Publish / Connect To

という違いがあります。

## 使うときの判断

Resolve Parameterが向いているのは、次の条件がそろう場合です。

- Fusionでcustom transitionを作っている
- Edit / Cut pageから使うtemplateにする
- transitionの長さが編集時に変わる可能性がある
- その長さに合わせてParameterのAnimationも自動更新したい

通常のFusion Composition内でParameter同士を連動させたいだけなら、Publish、Expression、Calculationなど別のModifierを選びます。

## 注意点

Resolve Parameterは、21.1 Manualでは**DaVinci ResolveのEdit / Cut pageで使うtransition template用**として説明されています。通常のFusion compにおける汎用的なtime remapやParameter linkとして扱わない方が分かりやすくなります。

また、このページで確認しているのはManual上のtransition template動作です。current runtimeのREGID、内部Parameter ID、edition差、各hostでのtemplate保存pathの展開結果はこのrunでは確認していません。

## 関連ページ

- [Modifier](./)
- [Anim Curves](./anim-curves)
- [Key Stretcher Modifier](./key-stretcher-modifier)
- [Publish](./publish)
- [Calculation](./calculation)
- [Expression Modifier](./expression)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」p.3025を基準にしています。

21.1 Manualで、Resolve ParameterがFusion transition template用のModifierであること、対象Controlをtransition durationへ自動連動させること、Dissolveの`Background/Foreground`へ適用する例、Macroで2 input / 1 outputを公開する手順、保存後にEdit pageのFusion Transitionsから使用する流れを確認しています。
