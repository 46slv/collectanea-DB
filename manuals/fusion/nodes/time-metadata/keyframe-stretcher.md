---
title: Keyframe Stretcher
description: compやtemplateの長さが変わったとき、前後のanimation timingを保ちながら指定した中央区間のkeyframe timingを伸縮するFusion Node。
doc_type: node
term_id: keyframe-stretcher
term_short: compの長さに合わせ、指定区間のkeyframe timingを伸縮するNode。
verification: partial
aliases: [Keyframe Stretcher, KFS]
concepts: [time, keyframes, template]
nodes: [Keyframe Stretcher]
node_family: time-metadata
controls: [Source Start, Source End, Stretch Start, Stretch End, Stretch Edges Instead]
inputs: [image]
outputs: [image]
tasks: [retime-animation, template, keyframe-stretch]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-07"
---

# Keyframe Stretcher

Keyframe Stretcherは、**Fusion compositionやtemplateの長さが変わったとき、前段で作ったkeyframe animationのtimingを新しい長さへ合わせるNode**です。

たとえばTitleで「最初の10 frameで入る → 中央で表示を保つ → 最後の10 frameで抜ける」というanimationを作った場合、clipを長くしてもintro / outroの長さはそのままにして、中央だけを伸ばせます。

これは素材の再生速度を変えるretimeではありません。前段のNodeに置かれたkeyframeの**評価timing**を、compositionの長さに合わせて再配分します。

## 何が変わるか

Keyframe Stretcherは、source animation全体の範囲と、その中で長さ変更を吸収する範囲を分けて扱います。

- `Source Start / Source End` — 元のanimationがどこからどこまでかを指定する
- `Stretch Start / Stretch End` — その中で伸縮させる区間を指定する
- Stretch範囲より前後にあるkeyframe — sourceのStart / Endからのframe距離を維持する
- Stretch範囲内のkeyframe — 新しいdurationに合わせて時間方向へscaleされる

そのため、intro / outroのspeedを保ったまま、中央の待ち時間や中間animationだけで長さの差を吸収できます。

重要なのは、**Spline Editor上の元keyframeそのものを移動する処理ではない**ことです。21.1 Manualでは、Spline Editorには元のkeyframe位置が表示されたままで、Keyframe Stretcherによって変わるのはanimationの評価結果だと説明されています。

## 入力と出力

21.1 Manualで確認できる入力は1系統です。

- **Input** — orangeの2D Image input。keyframe animationを含むNodeの出力を接続します。
- **Output** — Keyframe Stretcherでtimingを調整した前段animationを含む2D Imageを後段へ渡します。

接続先は、直前のNode自身がanimatedである必要はありません。Manualでは、Merge自身にkeyframeがなくても、そのForeground / Background側にanimated Nodeが含まれていれば、Mergeの出力をKeyframe Stretcherへ接続できる例が説明されています。

基本的には、長さ変更へ追従させたいanimated graphの後ろ、MediaOutやSaverの直前に置きます。

~~~text
animated nodes
     ↓
   Merge
     ↓
Keyframe Stretcher
     ↓
  MediaOut
~~~

Keyframe Stretcherより前段にあるanimationが、compositionのduration変更に応じて評価されます。後段に追加したanimationまで自動的にstretchされるわけではないため、配置位置が重要です。

## 主な設定項目

### Source Start / Source End

元のanimation範囲を指定します。

通常は、stretch対象にしたいanimation spline全体の開始frameと終了frameに合わせます。この範囲が「元はどの長さで設計したanimationか」を決める基準になります。

### Stretch Start / Stretch End

source rangeのうち、duration変更に合わせて伸ばしたり縮めたりする中央区間を指定します。

この範囲より外側のkeyframeはscaleされず、Start / Endからのframe距離を維持します。たとえばintroとoutroの所要frame数を変えたくない場合は、その2区間をStretch範囲の外側へ置きます。

### Stretch Edges Instead

有効にすると、`Stretch Start / Stretch End`で指定した中央区間ではなく、animationのedge側をstretchする動作へ切り替わります。

21.1 Manualでは、このcheckboxを有効にするとStretch Start / Stretch Endの指定を上書きすると説明されています。

## 50 frameのTitleを75 frameへ伸ばす例

21.1 Manualでは、元のanimationを50 frameとして次の例が示されています。

- `Source Start = 0`
- `Source End = 50`
- 2つ目のkeyframe = frame 10
- 3つ目のkeyframe = frame 40
- `Stretch Start = 11`
- `Stretch End = 39`

この状態でclipのdurationを75 frameへ伸ばすと、最初の10 frameと最後の10 frameは元と同じspeedを保ち、中央部分が長さの差を吸収するようにstretchされます。

つまり、Titleの入口と出口を作り直さなくても、中央の表示時間を増やして長いclipへ合わせられます。

~~~text
元の50 frame
| intro 10 |------ middle ------| outro 10 |

75 frameへ変更
| intro 10 |------------- middle -------------| outro 10 |
             ↑ ここが主にstretchされる
~~~

## 主な用途

### 長さを変えられるFusion Titleを作る

Edit / Cut pageでTitleのdurationを変更しても、intro / outroのanimation speedを一定に保ちたい場合に使います。

たとえば文字が10 frameで出現し、最後の10 frameで消えるTitleなら、その間の表示区間だけをstretch対象にします。editorがclipを長くしても、出入りのanimationまで間延びしにくくなります。

### 複数のanimated Nodeをまとめて追従させる

複数のText+やTransformなどをMergeしてからKeyframe Stretcherへ入れると、前段にある複数のanimationを同じduration変更へ追従させられます。

個々のparameterへ別々にModifierを設定するのではなく、graphの後段でまとめて扱いたい場合に向いています。

### transitionやeffect templateの固定区間を残す

開始直後と終了直前に決まった動きがあり、その間だけ長さを可変にしたい構成でも同じ考え方を使えます。

「どの区間を固定し、どの区間にduration差を受け持たせるか」を先に決めてからSource / Stretch rangeを設定します。

## Key Stretcher Modifierとの違い

Keyframe StretcherにはNode版とは別に、**Key Stretcher Modifier**があります。

- **Keyframe Stretcher Node** — graphのImage streamに置き、その前段にあるanimationをduration変更へ追従させる
- **Key Stretcher Modifier** — 1つのanimated parameterへ適用して、そのparameterのkeyframe timingを伸縮する

21.1 Manualでも、1つのparameterだけを対象にする場合はKey Stretcher Modifierを使えると案内されています。

複数Nodeを含むTitle全体のtimingをまとめて扱うならNode版、特定parameterだけをstretchしたいならModifier版、という切り分けが分かりやすいです。

## Time Stretcherとの違い

[Time Stretcher](./time-stretcher.md)は、outputの各frameで**input Imageのどのsource frameを読むか**を変えるretime Nodeです。

Keyframe Stretcherは、input clipのsource timeを読み替えるためのNodeではありません。前段で作ったparameter animationのtimingを、compositionやtemplateのdurationへ合わせるために使います。

- 映像そのものをspeed ramp / freeze / reverseする — Time Stretcher
- Titleやeffectのkeyframe animationを可変durationへ合わせる — Keyframe Stretcher

名前は似ていますが、変更している時間の対象が異なります。

## 注意点

- Keyframe Stretcherの配置より**前段**にあるanimationが対象です。MediaOut / Saver直前へ置く基本構成は、この対象範囲をまとめやすくします。
- Spline Editor上のsource keyframe位置自体が書き換わるわけではありません。見えているkeyframe位置と、最終的に評価されるtimingを混同しないようにします。
- `Source Start / Source End`は、元のanimation rangeに合わせて設定します。source rangeが実際のanimationとずれていると、期待したintro / outro timingになりません。
- `Stretch Start / Stretch End`の外側に置いたkeyframeは、Source Start / Endからのframe距離を維持します。固定したい区間をどちら側へ残すかを先に決めます。
- このページでは21.1 Manualで確認できるControl名と挙動だけを扱っています。runtime REGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差は確定していません。

## 関連する考え方

- [キーフレーム / スプライン / 時間](../../learn/05-time/keyframes-spline-time.md)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates.md)
- [Modifier / パラメータ Sources](../../learn/05-time/modifier-parameter-sources.md)

## 関連Node

- [Time / Metadata / Utility Family Overview](./)
- [Time Stretcher](./time-stretcher.md)
- [Time Speed](./time-speed.md)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual、Chapter 111「Miscellaneous Nodes」の`Keyframe Stretcher [KFS]`（pp.2597–2599）を基準にしています。

pp.2597–2598で、single orange 2D Image input、MediaOut / Saver直前へ置く基本構成、50 frameから75 frameへ伸ばす例、Spline Editor上の元keyframe位置を変更しないことを確認しています。p.2599で`Source Start / Source End`、`Stretch Start / Stretch End`、`Stretch Edges Instead`の役割を確認しています。

`verification: partial`は、runtime REGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差を別verification対象として残しているためです。
