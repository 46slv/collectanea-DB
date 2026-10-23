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
updated: "2026-10-17"
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

## 具体例：1920×1080の映像に数ピクセルの微振動を加える

Shakeを画面全体のごく小さな揺れに使う場合は、**Centerの値域を広く取らない**ことが重要です。以下は1920×1080のImageを中央（Center X/Y = 0.5）に置き、左右に最大2px、上下に最大1pxだけ動かす設定例です。

```text
MediaIn → Transform（CenterにShake Positionを設定） → MediaOut
```

1. TransformのCenterを右クリックして `Modify With > Shake Position` を選び、Modifiersタブを開きます。Position系Controlであることを確認してください。
2. `Lock X/Y` を外し、X方向とY方向のMinimum / Maximumを個別に設定します。
3. Xは `Minimum = 0.498958`、`Maximum = 0.501042`、Yは `Minimum = 0.499074`、`Maximum = 0.500926` を出発点にします。
4. Smoothnessを上げて連続した揺れに寄せ、数秒再生して動きと画面端を確認します。値は見た目に合わせて調整します。

この数値はFusionの**正規化されたCenter座標**をピクセル数へ換算したものです。X方向は `0.5 ± 2 / 1920`、Y方向は `0.5 ± 1 / 1080` から求めています。**Shakeへ「2」という値を直接入力して2px揺らす設定ではありません**。解像度が変わる場合は、適用対象のImage寸法で割り直します。位置の基準となる画像サイズや既存のCenter値が異なる場合も、その値に合わせて範囲を計算してください。

フレーム端に余白が現れる場合は、Transformの前段で映像を少し拡大するなどして、最大変位時の見切れを確認します。位置と回転の揺れをまとめて設定し、揺れの速さや波形まで調整したい場合は[Camera Shake](../transform/camera-shake)の方が直接的です。Shake ModifierのSmoothnessは変化の滑らかさであり、Camera ShakeのSpeedやFrequency Methodと同じControlではありません。

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

## 期待どおりにならないとき

| 症状 | 確認すること |
| --- | --- |
| 文字や画像が画面全体へ飛び回ってしまう | Shake Positionの`Minimum` / `Maximum`を確認します。Centerのような正規化位置では、`0`〜`1`を広く指定すると移動範囲も広がります。まず範囲を狭め、意図した場所の近くで動くようにします。 |
| 横方向と縦方向の揺れ幅を別々に調整できない | Positionを対象としているか、`Lock X/Y`を確認します。Lockを外すとXとYで独立した範囲を設定できます。数値1つだけのValue Controlでは同じX/Y操作はできません。 |
| 揺れがフレームごとに急に切り替わる | `Smoothness`を確認します。21.1 Manualでは`0`をsmoothingなしのrandom、値を大きくした状態を滑らかな変化として説明しています。 |
| 揺れの範囲を狭めたのに中央へ完全には止まらない | `Minimum = 0.45` / `Maximum = 0.55`は、中央付近の**範囲内でまだ動く**設定です。一定の値へ収束させたい場合は、最終frameで両方を目的の同じ値にする方法を検討します。最終位置の精度は対象Parameterの座標系で判断します。 |
| `Random Seed`を変えても揺れの位置や強さが期待と違う | Seedは生成されるrandom sequenceを切り替えるControlです。移動できる値の範囲は`Minimum` / `Maximum`、変化の滑らかさは`Smoothness`で調整します。SeedだけをAmountやSpeedの代わりに使わないでください。 |
| Modifierを追加したのに操作項目が見えない | 対象Nodeを選択し、Inspector上部の`Modifiers` tabを確認します。Shakeは通常の画像Nodeではなく、Parameterへ付けるModifierです。 |

この表は21.1 Manual記載のControlsとText Centerの作例をもとに整理した確認順序です。各症状を実機で再現した記録ではありません。

## 注意点

Minimum / Maximumの意味は対象Parameterの値域に依存します。Centerのようなnormalized Positionで使った0〜1の例を、すべてのValue Parameterへそのまま適用しないでください。

また、このページでは21.1 Manualに記載されたShakeのControlと作例を基準にしています。current runtimeのREGID、内部Parameter ID、Controlの未記載default / range、edition差はこのrunでは確認していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Perturb](./perturb)
- [Expression](./expression)
- [Camera Shake](../transform/camera-shake)：映像全体の位置・回転・揺れ速度をまとめて調整する画像Node。

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3026–3027を基準にしています。

21.1 Manualで、Position / Value Controlのrandomize、Random Seed、Smoothness、Lock X/Y、Minimum / Maximum、Text CenterへShake Positionを適用して揺れ幅をAnimationする作例を確認しています。

また、Fusion Fundamentals Chapter 73 pp.1583–1585で、ShakeがPerturbと同様にsmoothly varying random animationを生成するModifierであることと、auto-animation系ModifierをKeyframe Animationと組み合わせる考え方を確認しています。

1920×1080の微振動例の数値は、同ManualのCenter正規化位置（0.0〜1.0）をもとにした換算値です。2px / 1pxの設定による実機描画結果は未検証です。
