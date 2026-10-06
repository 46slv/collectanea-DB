---
title: "Track"
description: "位置Parameterへ1点tracking結果を直接供給し、追従・stabilize・motion復元を行うTracker Modifier。"
doc_type: node
term_id: "track"
term_short: "Trackは、位置Parameterへ1点tracking結果を直接渡せるTracker Modifier。"
verification: partial
aliases: ["Track", "Tracker Modifier"]
concepts: ["parameter-data", "tracking"]
nodes: ["Track"]
node_family: "modifiers"
controls: ["Tracker Source"]
inputs: ["image", "parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "track-position", "stabilize-position"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-06"
---

# Track

Trackは、**位置を持つParameterへTrackerを直接追加し、1点のtracking結果をそのParameterへ渡すModifier**です。

DaVinci Resolve 21.1 Reference Manualでは本文中で「Tracker modifier」と呼ばれています。通常の[Tracker Node](../tracking/tracker)をNode Editorへ置かなくても、Transform、Text、MaskなどのCenter Controlへtrackingを付けられます。

画像自体を加工するNodeではありません。追跡に使うImageを参照し、その結果をPosition系Parameterへ返します。

## 何ができるか

Tracker Modifierを追加すると、次の3種類から用途を選べます。

- **Tracker Position** — source内の1点を追跡し、その位置をParameterへ返す
- **Steady Position** — source内の1点を基準に位置を安定させる
- **Unsteady Position** — stabilizeしたあと、元のmotionを戻す

「画面内の点を追い、その座標を別のCenterへ使いたい」程度なら、Tracker Nodeを別途組むよりParameterへ直接付けられるTrackの方が短く組めます。

一方、21.1 ManualではTracker Modifierには次の制約も明記されています。

- trackingできるpatternは1つだけ
- outputできる値も1つだけ
- 複雑なstabilizationやmatch move用途には使えない

複数点を使う処理や、より複雑なtracking処理が必要なら[Tracker Node](../tracking/tracker)を使います。

## 追加方法

位置を持つControlを右クリックし、Modify With > Trackerから目的のmodeを選びます。

21.1 Manualでは、Transform、Text、MaskなどのCenter Controlへ追加できると説明されています。

~~~text
追跡用Image
    ↓
Tracker Modifier
    ↓
対象のPosition Parameter
~~~

Node Editor上で「Imageを加工して次のNodeへ渡す」のではなく、**Imageから位置情報を取り出してParameterへ渡す**構成です。

## Tracker Source

Tracker Modifierには、trackingに使うsource imageがあります。

既定では、Modifierを持つNodeの直前にあるNodeの出力がsourceになります。Manualの例では、Glowを含む構成でそのままtrackingすると、effect後の見え方がtracking sourceになり、対象が見えにくくなる可能性が説明されています。

別のImageを使いたい場合は、Tracker Sourceへsource Node名を指定できます。21.1 Manualでは、Node Editorからsource NodeをInspectorのTrack Source欄へdragする方法も示されています。

trackingは特徴が見やすいImageを使った方が安定しやすいため、effect後のImageより前段のclean sourceを指定した方が適切な場合があります。

## 具体例: 目に付けたGlowを追従させる

21.1 Manualには、人物の目へGlowを付け、そのMaskをTracker Modifierで追従させる例があります。

1. sourceとなるLoaderを用意する。
2. その後ろへGlowを追加する。
3. GlowへEllipse Maskを付け、片方の目を囲む。
4. MaskのCenterを右クリックし、Modify With > Tracker > Positionを選ぶ。
5. tracking sourceがeffect後のImageになっている場合は、LoaderをTrack Sourceへdragする。
6. 目をtrackする。
7. もう片方の目も同様に設定する。

この構成では、Tracker Modifierが目の位置を求め、その結果でMaskのCenterを動かします。Glowそのものをtrackingするのではなく、**Glowを制限しているMaskの位置をtracking結果で動かす**ことで、発光範囲が目へ追従します。

## Tracker Nodeとの違い

Tracker ModifierとTracker Nodeは似たControlを持ちますが、用途は同じではありません。

Tracker Modifierが向いているのは、1点のtracking結果をその場でPosition Parameterへ渡したい場合です。構成が短く、目的のParameterとtrackingの関係もInspector内で確認できます。

Tracker Nodeは、複数patternや、より複雑なstabilization / match moveを組む場合に使います。Manualも、Tracker Modifierはsingle pattern / single outputに限定されるため、複雑な処理ではTracker Nodeを使う前提で説明しています。

## 入力と出力の考え方

Trackでは、2種類の入力を分けて考えると分かりやすくなります。

- **Image** — 何をtrackingするか。Tracker Sourceで参照する
- **Parameter** — tracking結果をどこへ返すか。Centerなど、Modifierを付けた対象

出力はImageではなく、対象Parameterへ渡す位置情報です。

そのため、Trackを選ぶときは「どのImageを処理するか」よりも、まず「どの位置Parameterを、どのsourceのtracking結果で動かすか」を決めます。

## 使うときの判断

Trackが向いているのは、次のような場合です。

- TextやMaskなどのCenterを1点trackingへ直接追従させたい
- 1点を基準にPositionをstabilizeしたい
- stabilize後に元のmotionを戻したい
- Tracker Nodeを別に組まず、Parameter側でtrackingを完結させたい

複数点trackingや複雑なstabilization / match moveが必要ならTracker Nodeへ切り替えます。

## 注意点

Tracker Sourceの既定値は、常に「trackingしやすいclean source」になるとは限りません。effectや処理を通した後のImageがsourceになる構成では、特徴が隠れてtrackingしにくくなる場合があります。

また、このページでは21.1 Manualで確認できるTracker Modifierの役割、3つのmode、single-pattern / single-output制約、Tracker Source、GlowとMaskを使った作例を基準にしています。current runtimeのREGID、内部Parameter ID、未記載のdefault / range、edition差はこのrunでは確認していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Tracker Node](../tracking/tracker)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3027–3029を基準にしています。

同Manualで、Tracker Position / Steady Position / Unsteady Position、Tracker ModifierとTracker Nodeの違い、single pattern / single output制約、Tracker Sourceの既定動作と差し替え、目へGlowを追従させる作例を確認しています。
