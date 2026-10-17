---
title: "MIDI Extractor"
description: "MIDIファイルのNote・Control Change・Aftertouch・Pitch Bend・Beatを数値へ変換し、FusionのParameterを自動AnimationするModifier。"
doc_type: node
term_id: "midi-extractor"
term_short: "MIDI Extractorは、MIDIファイル内のeventを数値へ変換し、FusionのParameterへAnimationとして渡すModifier。"
verification: partial
aliases: ["MIDI Extractor"]
concepts: ["parameter-data", "time"]
nodes: ["MIDI Extractor"]
node_family: "modifiers"
controls: ["MIDI File", "Time Scale", "Time Offset", "Result Offset", "Result Scale", "Result Curve", "Mode", "Combine Events", "Beat (Quarters)", "Note Range", "Pitch Scale", "Velocity Scale", "Control Number", "Channels"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "midi-driven-animation"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-13"
---

# MIDI Extractor

MIDI Extractorは、**MIDIファイルに記録されたNote、Control Change、Aftertouch、Pitch Bend、tempo由来のBeatを読み、その値でFusionのParameterを動かすModifier**です。

Imageを処理するNodeではありません。動かしたいParameterへModifierとして追加し、MIDI eventから得た値をそのParameterへ返します。音声波形そのものを解析する機能でもなく、21.1 Manualで確認できる入力はMIDIファイルです。

~~~text
MIDI File
   ↓
Mode / Channel / event filter
   ↓
Time / Result / Envelope
   ↓
MIDI Extractor
   ↓
対象Parameter
~~~

## 追加方法

動かしたいParameterを右クリックし、`Modify With > MIDI Extractor`を選びます。

追加後はInspectorのModifiers tabからMIDIファイル、時間関係、読み取るevent、出力値の範囲などを設定します。

## 入力と出力

### MIDI File

`MIDI File`で、値を読み取るMIDIファイルを指定します。

MIDI Extractorはファイル内のeventを読み、選択したModeやChannel条件に合うeventから数値を作ります。Node Editor上でImage端子へMIDIを接続する構成ではありません。

### 対象Parameter

MIDI Extractorを追加したParameterが結果を受け取ります。

通常のMIDI dataは0〜127の値を持ちますが、21.1 ManualではFusion側で多くの結果を0〜1へ正規化して扱うと説明されています。Pitch Bendは14-bit dataを使い、結果は-1〜1です。

必要な値域が対象Parameterと合わない場合は、`Result Scale`と`Result Offset`で調整します。

## 時間を合わせる

### Time Scale

MIDIファイル側の時間とFusion側の時間の進み方を合わせます。

- `1.0` — 通常速度
- `2.0` — MIDI eventを2倍速で読む

映像側の尺や動きに対してMIDIが速すぎる、遅すぎる場合に使います。

### Time Offset

MIDI eventの開始位置をFusionの時間へ対して前後にずらします。

MIDIの反応が映像より遅れている場合や、曲の途中から使いたい場合などに同期位置を調整できます。

## 出力値を整える

### Result Offset / Result Scale

MIDI eventから得た値を、対象Parameterで使いやすい範囲へ変換します。

21.1 Manualでは通常の結果を0〜1、Pitch Bendを-1〜1として説明しています。そのままでは対象Controlの値域に合わない場合にScaleで幅を変え、Offsetで基準値をずらします。

### Result Curve

出力の中間値の反応をcurveで変えます。

最小値と最大値の範囲を保ちながら、中間のevent値へ強く反応させたり、反応を抑えたりできます。単純なScaleだけでは反応の感触を合わせにくい場合に使います。

## Mode

`Mode`で、MIDIファイルのどの情報をParameterへ使うかを選びます。

- **Beat** — MIDIファイルのtempo mapから一定間隔のpulseを作る。特定のMIDI messageは使わない
- **Note** — Note eventを読み、pitchやvelocityを値へ反映する
- **Control Change** — 指定したMIDI controller numberの値を読む
- **Poly AfterTouch** — noteごとのpressureを読む
- **Channel AfterTouch** — channel全体のpressureを読む
- **Pitch Bend** — pitch bend dataを読む。21.1 Manualでは-1〜1の範囲として扱う

Modeによって表示される追加Controlが変わります。

### Beat (Quarters)

Beat Modeでpulseを作る間隔をquarter note単位で指定します。

`1.0`ならquarter noteごとにBeatが発生します。MIDIファイル内のtempo mapを基準にするため、曲中でtempoが変わるデータにも追従します。

**Beat Modeは、実際に演奏されたkickやsnareのNoteを検出するModeではありません。** MIDIファイルの拍子・tempoに従って一定間隔でpulseを発生させます。特定のドラムの打点へ合わせたい場合は`Mode: Note`に切り替え、`Channels`と`Note Range`でそのNote eventを絞ります。

### Note Range

Note / Poly AfterTouch Modeで、反応させるnote番号の範囲を絞ります。

たとえば21.1 Manualは、GM drum trackからkickだけを拾う例としてnote番号`35–36`を挙げています。1つのMIDI track内に複数の音が入っていても、必要なnoteだけをParameter sourceとして使えます。

### Pitch Scale / Velocity Scale

Note Modeで、note番号（pitch）と打鍵の強さ（velocity）を数値へ変換する際の寄与を調整します。

- `Pitch Scale` — 高いnoteほど結果を変えるための倍率。21.1 Manualでは`1.0`の場合、pitchの範囲を0〜1の変化として利用すると説明されています。
- `Velocity Scale` — 強く演奏されたnoteほど結果を変えるための倍率。同じく`1.0`でvelocityの範囲を0〜1の変化として利用します。

**21.1 Manualでは、Velocity Scaleによる値はPitch Scaleの結果へ加算されます。** 二者択一の入力切り替えではありません。たとえばkickの強弱だけでText Sizeを変えたいなら、pitch由来の寄与を抑え、velocity由来の寄与を使う構成から調整します。最終的なSizeの範囲は`Result Scale` / `Result Offset`で合わせます。個別設定の既定値や出力の上限は、実機で未確認のためここでは断定しません。

### Control Number

Control Change Modeで、どのMIDI controllerを読むかを番号で指定します。

Control Changeには0〜127のcontrollerがあり、MIDIではVolume、Pan、Reverb、Chorusや各種controllerなどに使われます。必要なCC番号だけを選び、Fusion Parameterへ変換できます。

## 同時に複数eventがある場合

`Combine Events`は、同時に複数のeventが有効なとき、どの値を結果へ使うかを決めます。

21.1 Manualには、次の考え方が記載されています。

- 最も新しいevent
- まだ継続している最も古いevent
- 最大値 / 最小値
- Average
- Sum
- Median

Note Modeで和音を扱う場合や、複数Channelを有効にした場合に、複数eventを1つのParameter値へどうまとめるかを指定できます。

## Envelope

Note / Beat Modeでは、eventの前後に時間的な変化を付けられます。瞬間的なMIDI eventを、そのまま数値の段差にするのではなく、立ち上がりと余韻を持つ動きへ変換する設定です。

- **Pre-Attack Time** — eventの発生より前から、指定したPre-Attack Levelへ向けて値を上げ始める時間。画面上の動きを打点より少し先行させたい場合に使います。
- **Attack** — eventが発生してからAttack Levelへ向かう立ち上がり。
- **Decay / Sustain** — Attack後の減衰と、Noteが押され続けている間の維持。Sustain段階はNote向けです。
- **Release** — eventの終了後に値を下げる時間。Beatは継続時間のあるNoteと違い、発生後すぐにReleaseへ移るため、Releaseが短すぎると画面上ではほとんど見えない場合があります。

21.1 Manualは**MIDI Extractorの時間値を秒単位**としています。Fusionのフレーム単位の操作と取り違えないようにします。なお、実際の音声より早めに動かすことと、単に変化を長く残すことは別です。先行させる場合はPre-Attack、余韻を延ばす場合はReleaseを調整します。

## Channels tab

`Channels`では、MIDIファイルにある16 Channelのうち、どのChannelをevent判定へ使うかを選びます。

複数の楽器を別Channelへ分けたMIDIなら、必要な楽器のChannelだけを有効にして他を無視できます。

たとえばdrumとbassが別Channelなら、drum側だけを選択したうえでNote Rangeを絞る、といった二段階のfilterができます。

## 運用例1: kickに合わせてText Sizeを動かす

ManualのGM drum例を、motion graphicsへ当てはめると次のように組めます。

1. Text+のSizeなど、動かしたい数値ParameterへMIDI Extractorを追加する。
2. `MIDI File`で曲と対応するMIDIファイルを指定する。
3. `Mode`をNoteにする。
4. drumが入っているChannelだけを有効にする。
5. `Note Range`をkickに対応する`35–36`へ絞る。
6. 同じkick番号の演奏の強弱だけを使いたい場合は、`Pitch Scale`の寄与を抑え、`Velocity Scale`でvelocityを反映させる。両者は加算されるので、意図しない変化があれば分けて確認する。
7. `Result Scale` / `Result Offset`でText Sizeに適した範囲へ合わせる。
8. Attack / Releaseなどで、反応の立ち上がりと戻り方を整える。

この構成では、すべてのnoteへ反応するのではなく、kick eventだけをmotionのtriggerとして使えます。`Beat`へ切り替えるとtempo map由来の一定間隔のpulseになり、実際のkick演奏位置とは必ずしも一致しません。

## 運用例2: MIDI CCでEffect量を動かす

MIDI controllerの動きを記録したファイルがある場合は、`Mode: Control Change`と`Control Number`を使います。

~~~text
MIDI CC
  ↓
Control Numberで対象を選ぶ
  ↓
Result Scale / Offset
  ↓
Effectのnumeric Parameter
~~~

たとえばcontrollerの0〜127の変化を、対象Effectで使いやすい範囲へResult Scale / Offsetで変換して利用できます。

## Fairlight Animatorとの違い

[Fairlight Animator](./fairlight-animator)も外部の時間変化からParameterを動かしますが、参照するsourceが異なります。

- **MIDI Extractor** — MIDIファイル内のevent、note、CC、aftertouch、pitch bend、tempoを使う
- **Fairlight Animator** — Timeline / Media Poolのaudioを解析した値を使う

演奏情報やMIDI controllerの値そのものを利用したいならMIDI Extractor、実際の音声のlevelや周波数帯へ反応させたいならFairlight Animatorを確認します。

## 期待した動きにならないとき

| 症状 | 確認すること |
| --- | --- |
| 何も反応しない | `MIDI File`が意図したファイルかを確認し、`Mode`、`Channels`、Noteなら`Note Range`、CCなら`Control Number`の条件を順に緩める。フィルター外のeventでは値は作られない。 |
| kickに合わせたいのに一定間隔で動く | `Mode: Beat`はtempo mapから拍を生成する。実際のkickのNote Onを使うなら`Mode: Note`とし、対象Channel・note番号を選ぶ。GM drumの場合、Manualの例は35〜36。 |
| snareや別の楽器にも反応する | `Channels`で楽器のChannelを絞り、Noteなら`Note Range`を絞る。曲のMIDIデータがGM準拠かどうかはファイル側で確認する。 |
| NoteのたびにSizeが想定以上に変わる | `Pitch Scale`と`Velocity Scale`の結果は加算される。noteの高さとvelocityのどちらを使うかを整理し、`Result Scale` / `Result Offset`を調整する。 |
| Beatの反応がほとんど見えない | Beat eventは瞬間的なため、Envelopeの`Release`に十分な時間を与えて確認する。時間値の単位はフレームではなく秒。 |
| MIDIの進行速度が映像と合わない | `Time Scale`を確認する。`1.0`が通常速度、`2.0`が2倍速。Beatの場合はMIDIのtempo mapに変更があるかも調べる。 |
| 曲全体に対して反応が前後にずれる | `Time Offset`でMIDIとFusionの開始位置を調整する。Scaleによる再生速度の不一致と、Offsetによる同期位置の不一致を分けて確認する。 |
| 和音で値が急に変わる | `Combine Events`の合成方法（最新event、最大値、合計、平均など）を確認する。複数Channelが選択されている場合も同時eventが増える。 |
| MIDI CCに反応しない | `Mode: Control Change`と`Control Number`、`Channels`を確認する。指定した番号のCC eventがMIDIファイルに含まれているかも調べる。 |
| 中間の強弱だけ不自然 | `Result Curve`は中間値の応答を変える。まず`Result Scale` / `Result Offset`で全体の範囲を決め、必要な場合に曲線を調整する。 |

ここでの診断は21.1 Manualに記載された各Controlの働きに基づくもので、実機の特定バージョンで同一MIDIファイルを動作検証した結果ではありません。

## 注意点

21.1 Manualで確認しているMIDI Extractorは、`MIDI File`でファイルを指定する方式です。このページでは、その記述だけからlive MIDI inputの対応可否を断定しません。

Note、Control Change、Aftertouchなどは同じ0〜127系のMIDI dataでも意味が異なります。単に「MIDIの値」としてまとめず、Mode、Channel、Note Range / Control Numberを先に決めてからResult mappingを調整すると挙動を追いやすくなります。

current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差はこのページでは確認していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Fairlight Animator](./fairlight-animator)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3012–3015を基準にしています。

同Manualで、`MIDI File`、Time Scale / Offset、Result Offset / Scale / Curve、6種類のMode、Combine Events、Beat / Note / Control Change固有Control、Note / Beat Envelope、16 Channel選択、MIDI message / eventの値域、およびPitch Bendの-1〜1表現を確認しています。

current runtimeのvisible menu、live MIDI input対応、REGID、内部Parameter IDは別のruntime verification対象です。