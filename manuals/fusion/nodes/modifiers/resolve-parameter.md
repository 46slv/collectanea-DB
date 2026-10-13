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
updated: "2026-10-13"
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

21.1 ManualのChapter 124では保存先をtemplate folderの変数で示しています。Chapter 67にはuser別の保存先も記載されています。以下は**Manual上の例示path**であり、実機のfolderを探索して得たpathではありません。個人名を表す`username`は使用するOSのユーザー名に読み替えます。

| OS | Transition template folder（Manual記載） |
| --- | --- |
| Windows | `C:\\Users\\username\\AppData\\Roaming\\Blackmagic Design\\DaVinci Resolve\\Support\\Fusion\\Templates\\Edit\\Transitions` |
| macOS | `/Users/username/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Templates/Edit/Transitions` |
| Linux | `/home/username/.local/share/DaVinciResolve/Fusion/Templates/Edit/Transitions` |

`Edit/Transitions`の下へ保存することが重要です。保存後はResolveを終了・再起動し、Edit pageの`Video Transitions > Fusion Transitions`から確認します。

## 既存のFusion Transitionを編集して作る方法

21.1 ManualのChapter 67は、上の「Fusion CompositionからDissolveをMacro化する」例とは別に、**既存のFusion Transitionを編集する作り方**を説明しています。

1. Edit pageでcutへ既存の`Fusion Transitions > Cross Dissolve`を配置します。
2. Timeline上のtransitionを右クリックし、`Open in Fusion Page`を選びます。
3. Fusion pageにはtransition用のNode treeが開きます。`MediaIn 1`は切り替え前の映像、`MediaIn 2`は切り替え後の映像です。二つの映像をどう合成するかを、DissolveやMerge / TransformなどのNodeで設計します。
4. 尺に追従させたいControlには、固定のKeyframeだけで済ませずResolve Parameterを追加します。変更を現在のTimeline上のtransitionへ反映するだけなら、Edit pageへ戻って結果を確認します。
5. **別の編集点でも再利用したい**場合はMacroとして保存します。Chapter 67の手順では、二つのMediaInとMediaOutも含めて必要なNodeを選択してから`Macro > Create Macro`を実行します。

二つの手順を混同しないでください。Chapter 124の作例は**Dissolve NodeのBackground / Foreground / Outputを公開するMacro**、Chapter 67の作例は**既存transitionのNode treeを編集し、MediaIn / MediaOutを含めてMacro化する方法**です。どちらも編集点の前後二つの映像を受け、一つの結果を返すtransitionを作る目的は共通ですが、選択・公開するNodeの構成が異なります。

Macro Editorでチェックする項目は、Edit pageのInspectorから編集できるControlにも関係します。Durationだけ変更できればよいtransitionと、ユーザーに独自の調整項目を公開するtransitionとでは、公開対象を分けます。

## transitionをtrimすると何が変わるか

Resolve Parameterの役割は、固定frame数のAnimationを作ることではなく、**現在のtransition durationへParameterのAnimationを合わせること**です。

たとえばEdit pageでtransitionを長くした場合、そのParameterの変化も新しい長さへ合わせて進みます。短くした場合も同様です。

そのため、編集段階でtransition durationを何度も調整する可能性があるtemplateでは、固定frame位置へKeyframeを置くだけの場合より扱いやすくなります。

Chapter 67は、transitionの進行を作る際に、単純なKeyframeの代わりとしてResolve Parameterの`Scale`と`Offset`を使うことも案内しています。これはEdit pageの尺を直接数値入力する欄ではなく、Modifier側の進行を調整するControlです。Manualの該当説明には全Control共通の推奨数値や計算式は示されていないため、出力先のParameterで変化の始点・終点と、尺を変更したときの挙動を確認しながら調整します。

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

## 期待どおり動かない場合

| 症状 | 最初に確認すること |
| --- | --- |
| Edit / Cut pageでtransitionを伸ばしても、効果が途中で止まる | アニメーションさせているControlにResolve Parameterが付いているか。固定frameのKeyframeだけで組んでいないか。 |
| Effects Libraryに保存したtransitionが表示されない | Macroを`Templates/Edit/Transitions`相当のfolderへ保存したか。保存後にResolveを終了・再起動したか。 |
| Transitionは見つかるが映像の切り替えにならない | Macroの**二つの入力と一つの出力**が正しく構成されているか。Chapter 124のDissolve作例ではBackground / Foreground / Outputの選択を確認する。 |
| 既存transitionを編集しても、別の編集点で同じ効果を選べない | Edit pageへ戻るだけでは現在のtransitionが更新される。Effects Libraryで再利用するには、新しいMacroをTransitions folderへ保存する。 |
| Edit pageのInspectorに調整項目がない | Macro Editorで公開したControlを確認する。Chapter 67では調整項目を公開せずDurationだけ変更できるtransitionも作れる。 |
| Fusion Studioで同じ手順を完結できない | Chapter 67のMediaIn / MediaOutを含む既存Edit page transitionの保存手順は、DaVinci Resolve内のFusion pageで行うと明記されている。 |

この表はManual記載の作成・保存条件から絞り込んだ確認順序であり、すべての症状を実機で再現・検証した結果ではありません。

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

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」p.3025、およびChapter 67「Node Groups, Macros, and Fusion Templates」pp.1438–1441を基準にしています。

21.1 Manualで、Resolve ParameterがFusion transition template用のModifierであること、対象Controlをtransition durationへ自動連動させること、Dissolveの`Background/Foreground`へ適用する例、Macroで2 input / 1 outputを公開する手順、保存後にEdit pageのFusion Transitionsから使用する流れを確認しています。Chapter 67の既存Fusion Transitionを`Open in Fusion Page`で編集する手順、MediaIn / MediaOutの役割、MacroのControl公開、OS別template folder、Scale / Offsetへの言及を追加で照合しました。
