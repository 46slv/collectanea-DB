---
title: "Shake"
description: "PositionやValue Parameterへ、再現可能なランダム変化と滑らかな揺れを与えるModifier。"
doc_type: node
term_id: "shake"
term_short: "Shakeは、PositionやValueへ滑らかさを調整できるランダムAnimationを与えるModifier。"
verification: partial
aliases: ["Shake"]
concepts: ["parameter-data"]
nodes: ["Shake"]
node_family: "modifiers"
controls: ["Random Seed", "Smoothness", "Lock X/Y", "Minimum", "Maximum"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "procedural-animation", "randomize-value"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-06"
---

# Shake

Shakeは、**PositionやValue Parameterへ半ランダムな数値変化を自動生成するModifier**です。

画像そのものを加工するNodeではありません。TransformのCenterや、数値SliderのようなParameterへ付けると、その値を時間とともにランダムに変化させます。完全にばらばらな変化にも、連続した穏やかな揺れにもできます。

## 何をするModifierか

Shakeが作るのはImageではなく、対象Parameterへ返す数値Animationです。

```text
Random Seed / Smoothness / Minimum / Maximum
                    ↓
                  Shake
                    ↓
           対象Parameterの値
```

たとえばTextのCenterへShakeを付けると、文字そのものを変形するのではなく、CenterのX/Y値が変化することで画面上の位置が揺れます。

DaVinci Resolve 21.1 Reference Manualでは、Shakeを「PositionまたはValue Controlをrandomizeしてsemi-randomなnumeric inputを作るModifier」と説明しています。

## 追加方法

対象Parameterのcontextual menuから `Modify With > Shake` を選びます。

21.1 ManualのText Centerを使った作例では、Viewer上のCenter Controlを右クリックし、`Modify With > Shake Position`を選んでいます。Position系Controlでは、対象に応じたShake項目が表示される場合があります。

Shakeを追加すると、Inspector上部のModifiers tabからShakeのControlを調整できます。

## 主なControl

### Random Seed

Random Seedは、random number generatorへ渡すseed値です。

同じSeedからは同じrandom sequenceが生成されます。現在の揺れ方が合わない場合はSeedを変えることで、強さや範囲を保ったまま別のrandom patternへ切り替えられます。

「毎回違う結果になるrandom」ではなく、**同じSeedなら同じ結果を再現できるrandom**として扱えます。

### Smoothness

Smoothnessは、Shakeが作るrandomな変化をどの程度滑らかにつなぐかを決めます。

- 値を上げる → 変化が滑らかになり、連続した揺れに近づく
- `0` → smoothingなしの完全にrandomな結果

手持ちカメラのような緩い揺れや、オブジェクトの自然なふらつきではSmoothnessを上げ、フレームごとに不規則な変化が必要なら低くします。

### Lock X/Y

PositionのようなX/Yを持つParameterでは、X軸とY軸の扱いを切り替えられます。

X/Yのlockを外すと、それぞれを独立して調整するSliderが表示されます。横方向だけ大きく揺らす、縦方向は狭い範囲に抑える、といった調整に使います。

### Minimum / Maximum

MinimumとMaximumは、randomizerが生成できる値の下限と上限を決めます。

つまりShakeの「強さ」を直接1つのAmountで決めるのではなく、**生成値が動ける範囲**を指定します。

Positionの例では、21.1 Manualに次の設定が示されています。

- `Minimum 0.0 / Maximum 1.0` — CenterがImage全体を動ける範囲
- `Minimum 0.70 / Maximum 0.90` — 右下付近の狭い範囲だけで揺らす

Positionはnormalized coordinateを使うため、この例では0〜1がImage内の位置範囲として使われています。Value ParameterへShakeを付ける場合は、そのParameterで意味を持つ値域に合わせてMinimum / Maximumを決めます。

## 具体例: Textを大きく揺らしてから中央へ収束させる

21.1 Manualには、TextのCenterへShakeを追加し、揺れの範囲自体をAnimationする例があります。

1. Textを作成し、Viewerへ表示する。
2. Viewer上のCenter Controlから `Modify With > Shake Position` を選ぶ。
3. Modifiers tabでSmoothnessを `5.0` にする。
4. Minimumを `0.1`、Maximumを `0.9` にする。
5. frame 0でMinimumとMaximumへKeyframeを追加する。
6. frame 90でMinimumを `0.45`、Maximumを `0.55` にする。

開始時はCenterが0.1〜0.9の広い範囲を動けます。時間が進むにつれてその範囲が0.45〜0.55へ狭くなるため、Textは画面内を大きく動いたあと、中央付近へ収束していきます。

ここで重要なのは、Shakeの出力だけでなく**Minimum / Maximum自体もKeyframe Animationできる**ことです。揺れを急にON/OFFする代わりに、揺れ幅を時間とともに広げたり狭めたりできます。

## Keyframe Animationと組み合わせる

ShakeのようにParameterを自動AnimationするModifierは、通常のKeyframeと組み合わせられます。

Fusion FundamentalsのModifier解説では、Center X/YをKeyframeで大きなmotion pathとして動かし、その上へPerturb系のsecondary motionを加える考え方が説明されています。Shakeでも同様に、主運動をKeyframeで設計し、細かな揺れをModifier側で作る構成を検討できます。

たとえば、

- Keyframe — オブジェクトを左から右へ移動
- Shake — その移動へ細かな上下左右の揺れを追加

というように、意図したmotionとrandom motionの役割を分けられます。

## Shakeを使う判断

Shakeが向いているのは、次のような場合です。

- Positionへ不規則な揺れを追加したい
- 数値Parameterを一定範囲内でランダムに変化させたい
- random patternをSeedで再現したい
- 完全なrandomと滑らかな揺れをSmoothnessで調整したい
- Minimum / MaximumをAnimationして、揺れ幅そのものを時間変化させたい

値を数式で厳密に決めたい場合は[Expression](./expression)、同じrandom系Modifierを比較したい場合は[Perturb](./perturb)も確認してください。

## 入力と出力の考え方

ShakeはNode Editor上でImage Input / Outputを接続するNodeではありません。

```text
対象Parameter ← Shake
```

対象となるPosition / Value ParameterへModifierとして付与し、そのParameterの値を生成します。したがって「何の画像を入力するか」ではなく、**どのParameterをどの範囲で揺らしたいか**を先に決めると選びやすくなります。

## 注意点

Minimum / Maximumの意味は対象Parameterの値域に依存します。Centerのようなnormalized Positionで使った0〜1の例を、すべてのValue Parameterへそのまま適用しないでください。

また、このページでは21.1 Manualに記載されたShakeのControlと作例を基準にしています。current runtimeのREGID、内部Parameter ID、Controlの未記載default / range、edition差はこのrunでは確認していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Perturb](./perturb)
- [Expression](./expression)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3026–3027を基準にしています。

21.1 Manualで、Position / Value Controlのrandomize、Random Seed、Smoothness、Lock X/Y、Minimum / Maximum、Text CenterへShake Positionを適用して揺れ幅をAnimationする作例を確認しています。

また、Fusion Fundamentals Chapter 73 pp.1583–1585で、ShakeがPerturbと同様にsmoothly varying random animationを生成するModifierであることと、auto-animation系ModifierをKeyframe Animationと組み合わせる考え方を確認しています。
