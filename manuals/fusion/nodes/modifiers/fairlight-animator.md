---
title: Fairlight Animator
description: Timeline / Media PoolのaudioをFairlightで解析し、その変化をFusionの数値Parameterへ渡してaudio-reactive animationを作るModifier。
doc_type: node
term_id: fairlight-animator
term_short: Fairlight Animatorは、Timeline / Media Poolのaudio解析結果をFusionの数値Parameterへ渡すModifier。
verification: partial
aliases: [Fairlight Animator]
concepts: [audio, modifiers, time]
nodes: [Fairlight Animator]
node_family: modifiers
controls: [Clip Name, Analysis, Scale, Offset, High Pass Filter, Low Pass Filter, Time Scale, Time Offset]
outputs: [parameter]
tasks: [audio-reactive, modifier, motion-graphics]
product_scope: fusion
suite_surfaces: [fusion, fairlight]
updated: "2026-10-13"
---

# Fairlight Animator

Fairlight Animatorは、**Timeline上のclipやMedia PoolにあるaudioをFairlightのaudio engineで解析し、その結果でFusionの数値Parameterを動かすModifier**です。

Imageを直接処理するNodeではありません。Size、Glowの強さ、回転角度など、動かしたい数値Parameterへ追加して使います。手作業で音に合わせてkeyframeを打つ代わりに、audioの変化をParameterの値へ変換できます。

~~~text
Timeline / Media Poolのaudio
        ↓
Fairlight audio analysis
        ↓
Analysis / High・Low Pass Filter
        ↓
Scale / Offset
        ↓
Fairlight Animator
        ↓
対象の数値Parameter
~~~

## 追加方法

動かしたい数値Parameterを右クリックし、ModifierのメニューからFairlight Animatorを追加します。

ModifierはParameterの種類によって利用できるものが異なります。Fairlight Animatorを追加すると、InspectorのModifiers tabで設定します。

## 入力元と出力先

### 音声の参照元

21.1 Manualでは、Fairlight AnimatorはTimeline clipまたはMedia Pool sourceのaudioを処理すると説明されています。

`Clip Name`には現在参照しているclip名が表示されます。これは音声ファイルを選ぶボタンの説明ではありません。21.1 Manualの該当節には、音声をどの操作で割り当てるかまでは書かれていないため、ここでは選択手順を推測しません。反応がないときは、まず参照しているclipが意図した音声か確認します。

### 対象Parameter

出力は画像ではなく、Fairlightの解析結果から作った**数値**です。

Fairlight Animatorを追加したParameterがその値を受け取ります。したがって、Flow上でaudioをImage端子へ接続するのではなく、ParameterへModifierとして付ける機能として考えると構造を理解しやすくなります。

## Parameter tab

### Clip Name

現在Fairlight Animatorが参照しているclipの名前を表示します。

### Analysis

audioからどのFairlight analysis parameterを使うかを選びます。

21.1 ManualのFairlight Animator節では選択肢の一覧までは示されていないため、このページではAnalysis menuに存在する項目名を推測して列挙しません。

### Scale

解析結果へ倍率をかけ、対象Parameterで使う変化量を大きくしたり小さくしたりします。

audioから得た値がそのままでは動きとして弱すぎる、または強すぎる場合に調整します。

### Offset

解析結果へ基準値を加え、対象Parameterで使う値域をずらします。

たとえばScaleで変化幅を決めたあと、Offsetで「何も鳴っていないときの基準位置」を対象Parameterに合わせる、と考えると整理しやすくなります。

## 反応する周波数帯を絞る

### High Pass Filter

high-pass filterは高い周波数を通し、低い周波数を抑えます。

低域の成分へ反応させたくない場合に使います。

### Low Pass Filter

low-pass filterは低い周波数を通し、高い周波数を抑えます。

bassなど低域を中心に反応させたい場合は、low-pass側で高域を除外します。21.1 Manualでは、低域だけでanimationさせる例としてlow-pass filter sliderを下げる方法が示されています。

High / Low Pass Filterの単位はHzです。

~~~text
audio
  ↓
High Pass ── 低域を除外
Low Pass  ── 高域を除外
  ↓
必要な周波数帯だけをanalysisへ使う
~~~

2つを組み合わせれば、広いaudio全体ではなく必要な帯域を狙ってParameterを動かせます。

## Time tab

### Time Scale

audioを参照する時間の進み方を変えます。

21.1 Manualでは、current frameへ倍率をかけて参照するframeを決めるControlとして説明されています。Offsetのように全体を一定量ずらすのではなく、時間の進行率そのものを変えるためのControlです。

### Time Offset

audioを参照する開始位置を時間方向へずらします。

音の反応と映像側の動きに一定のずれがある場合や、audio内の別の位置を基準にしたい場合に使います。

`Time Scale`が時間の進み方、`Time Offset`が開始位置のずれを調整するもの、と分けて考えると使い分けやすくなります。

## 低音を選ぶことと、小さい音を無視することは別

High Pass / Low Pass Filterが選別するのは**音の周波数帯**です。たとえばLow Passを調整すると、高い周波数を抑え、低い音を中心に解析できます。しかし、低音のうち「小さい音量だけを無視する」設定ではありません。

この違いは、音に合わせてText SizeやGlowを動かすときに重要です。

- **低音だけに反応させたい** — Low Passで高域を抑える。低域も不要ならHigh Passと組み合わせて帯域を狭める。
- **動きが大きすぎる／小さすぎる** — `Scale`で解析結果から対象Parameterへ渡す変化量を調整する。
- **基準の値が合わない** — `Offset`で出力の基準位置を調整する。
- **静かな音では動かしたくない** — 周波数Filterだけでは目的が違う。解析結果の大きさに対するしきい値処理を別途検討する。

21.1 ManualのFairlight Animator節には「一定の音量以下を0にする」専用Controlは記載されていません。たとえば数値`x`に対して`max(0, x - しきい値)`を適用するのは、**値の変換方法の考え方**です。これをFairlight AnimatorのInspectorへ直接入力できるという意味ではありません。別の式・値変換を使う際は、対象Parameterへ接続できる構成を実機で確認してください。

## 数値Parameterかどうかを先に確かめる

Fairlight Animatorは、解析結果を**1つの数値**として返すModifierです。Transformの`Center`のようにX/Yを持つPoint型Controlを、単一の数値Controlと同じものとして扱わないでください。

位置を音で動かしたい場合も、まず利用可能な数値Controlを特定し、その数値が最終的な位置へどう影響するかを分けて確認します。21.1 Manualで示されているのはnumeric controlの駆動であり、Point型全体へ同じ手順で取り付けられるという保証ではありません。

## 運用例: bassに合わせてText Sizeを動かす

Text+のSizeを低域へ反応させる場合は、次のように組めます。

1. Text+のSizeなど、動かしたい数値ParameterへFairlight Animatorを追加する。
2. `Clip Name`で意図したaudio sourceを参照していることを確認する。
3. `Analysis`で使うFairlight analysis parameterを選ぶ。
4. `Low Pass Filter`で高域を落とし、bassを中心に反応する範囲へ絞る。
5. `Scale`でSizeの変化量を合わせる。
6. `Offset`でSizeの基準値を合わせる。
7. audioとvisualの反応位置が合わなければ`Time Offset`を調整する。速度関係を変える必要がある場合だけ`Time Scale`を使う。

この構成では、曲全体の音量変化へ無差別に反応させるのではなく、周波数filterで低域へ対象を絞ってからmotionへ変換できます。

## うまく動かないときの確認

以下は21.1 Manualに記載されたControlの役割をもとにした切り分けです。特定の音声素材・OS・editionでの動作を実測した結果ではありません。

| 症状 | 最初に確かめること |
| --- | --- |
| 何も反応しない | 音声を含むclipを参照しているか`Clip Name`を確認し、`Analysis`の選択とModifierを追加した数値Parameterを見直す。 |
| 値が変化しているのに映像が変わらない | 変更先が見た目に影響する数値Controlかを、Modifierを外した状態の手動操作でも確かめる。 |
| 音楽全体の音に反応してしまう | 低域だけを狙うなら`Low Pass Filter`で高域を減らす。逆に高域だけを狙うなら`High Pass Filter`を調整する。 |
| bassへの反応が弱い | `High Pass Filter`で必要な低域まで除外していないか、`Low Pass Filter`が狙った帯域を通す設定かを確認する。 |
| 静かな部分でも細かく動く | 周波数Filterは音量のしきい値ではない。`Scale`で変化幅を確認した上で、必要なら別の数値処理を検討する。 |
| 動きが小さすぎる／大きすぎる | `Scale`を見直す。`Offset`は変化の中心をずらす役割なので、振れ幅との調整を分ける。 |
| 動きの基準位置が合わない | `Offset`を確認し、対象Control自体に元の値やAnimationが残っていないかも見直す。 |
| 音と映像の反応タイミングがずれる | 一定のずれなら`Time Offset`、音声を読む時間の進み方が違うなら`Time Scale`を確認する。Offsetの正負による移動方向は短いテストで確かめる。 |
| Point型Controlに追加できない | Fairlight Animatorが数値Parameter用であることを確認する。Point全体へ同じ方式で付くとは扱わない。 |

切り分けでは、最初にFilterの範囲を広くして反応の有無を確かめ、次に`Scale / Offset`、最後に時間の調整を行うと、周波数の選択と数値の変換を混同しにくくなります。これは調整の手順例であり、21.1 Manualが指定した必須順序ではありません。

## MIDI Extractorとの違い

[MIDI Extractor](./midi-extractor)も外部の時間変化からParameterを動かしますが、読み取るdataが異なります。

- **Fairlight Animator** — Timeline / Media Poolの実audioをFairlightで解析して使う
- **MIDI Extractor** — MIDIファイル内のNote、Control Change、Aftertouch、Pitch Bend、tempoなどのeventを使う

実際の録音・楽曲・声の音響的な変化へ反応させたい場合はFairlight Animator、note番号やvelocity、MIDI CCなど演奏dataそのものを条件にしたい場合はMIDI Extractorを確認します。

## 注意点

Fairlight Animatorはaudio-reactive animationを作るModifierであり、Fairlight pageでaudioを編集するEffectそのものではありません。Fusion側では、解析結果を数値Parameterへ渡す役割を持ちます。

21.1 ManualのFairlight Animator節で確認できるのは`Clip Name`、`Analysis`、`Scale`、`Offset`、High / Low Pass Filter、`Time Scale`、`Time Offset`です。周波数選別と音量しきい値の区別、症状別の確認方法は、これらのControlの説明から組み立てた実務上の判断であり、実機で確認済みの追加仕様ではありません。Analysis menuの具体的な選択肢、audio sourceを割り当てる詳細UI、current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差はこのページでは確定しません。

## 関連ページ

- [Modifier Family Overview](./)
- [MIDI Extractor](./midi-extractor)
- [Calculation](./calculation)
- [Expression Modifier](./expression)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.2992, 3009を基準にしています。

p.2992でModifierがInspectorのParameterへ追加され、Parameter typeによって利用可能なModifierが異なることを確認しています。p.3009でFairlight AnimatorがTimeline clip / Media Pool sourceのaudioをFairlight audio engineで解析すること、`Clip Name`、`Analysis`、`Scale`、`Offset`、High / Low Pass Filter、`Time Scale`、`Time Offset`を確認しています。
