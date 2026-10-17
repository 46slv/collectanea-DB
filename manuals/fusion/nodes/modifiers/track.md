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
updated: "2026-10-13"
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

位置を持つControlを右クリックし、Modify Withから目的のTracker modeを選びます。21.1 ManualではChapter 124にTrackerのサブメニュー、Chapter 81にTracker Positionの直接選択という表記があります。画面に表示される項目に従ってください。

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

別のImageを使いたい場合は、Inspectorの**Modifiers** tabにある**Tracker Source**へsource Node名を指定できます。21.1 ManualではNode Editorからsource Nodeをその欄へドラッグする方法も示されています。

trackingは特徴が見やすいImageを使った方が安定しやすいため、effect後のImageより前段のclean sourceを指定した方が適切な場合があります。

## 具体例: 目に付けたGlowを追従させる

人物の片目に発光を重ね、顔の動きに合わせて光る場所を移動する例です。Chapter 81ではMediaInとSoft Glow、Chapter 124ではLoaderとGlowを使って同じ考え方を説明しています。

1. MediaInからSoft Glowを通してMediaOutへ接続します。
2. Ellipse Maskで片目の範囲を囲み、Soft Glowの白いEffect Mask入力へつなぎます。Glowが画面全体ではなく目の近くにだけ適用されます。
3. EllipseのCenterを右クリックし、Modify With > Tracker Positionを選びます。階層表示ではTracker > Positionを選ぶ表記もあります。
4. InspectorのModifiers tabで**Tracker Source**へMediaInをドラッグします。Glowで加工された映像ではなく、元映像の目を追いかけるためです。
5. Viewerで追跡点を目の識別しやすい部分へ置き、追跡したいフレーム範囲を確認します。
6. Track Forwardで解析します。始点・中間・終点を再生し、Ellipseの中心が目から外れていないか確認します。
7. 両目に適用する場合は、別のEllipseとTracker Modifierを用意して、もう一方の目も追跡します。

位置を追跡しているのはGlowではなく**映像内の特徴点**です。Tracker ModifierからEllipseのCenterへ座標が渡され、Glowの適用範囲が移動します。

Chapter 81では追跡後にSoft Glowを挿入していますが、ここでは完成構成を先に作っています。重要なのは追跡対象のsourceをMediaInに設定することです。

## Tracker Nodeとの違い

Tracker ModifierとTracker Nodeは似たControlを持ちますが、用途は同じではありません。

Tracker Modifierが向いているのは、1点のtracking結果をその場でPosition Parameterへ渡したい場合です。構成が短く、目的のParameterとtrackingの関係もInspector内で確認できます。

Tracker Nodeは、複数patternや、より複雑なstabilization / match moveを組む場合に使います。Manualも、Tracker Modifierはsingle pattern / single outputに限定されるため、複雑な処理ではTracker Nodeを使う前提で説明しています。

## 追跡方向とフレーム範囲

21.1 ManualのChapter 81では、標準Trackerの解析方向とRender Rangeの関係を説明しています。Tracker ModifierはTracker Nodeとほぼ同じ追跡操作をInspector内で扱いますが、すべてのmodeに同じControlが表示されるとは限りません。

- **Track Forward**：Render Rangeの開始から順方向へ解析します。
- **Track Forward from Current Frame**：現在フレームから順方向へ解析します。
- **Track Backward from Current Frame**：現在フレームから逆方向へ解析します。
- **Track Reverse**：Render Rangeの終端から逆方向へ解析します。

追跡点が見えている区間にRender Rangeを合わせてから解析します。解析中に被写体が隠れたり画面外に出たりする場合は、問題が起きる直前と直後のフレームを確認します。Chapter 81ではStop TrackingやEscapeキーで解析を中断できることも説明されています。

## うまく追跡できないとき

| 症状 | 確認・対処 |
| --- | --- |
| 違う映像を追跡している | Tracker Sourceが正しいMediaIn / Loaderを参照するか確認します。Glowなどの加工後を避け、必要なら元映像へ変更します。 |
| 追跡点が別の模様へ飛ぶ | 模様が目立ち、形が変化しにくい部分を選びます。背景や他の物体をパターン領域へ入れすぎないようにします。 |
| 速い動きで追跡を失う | 検索領域がフレーム間移動より狭くないか確認します。動く方向に探索範囲を広げると解析時間は増えます。 |
| 解析が途中で終了する | Render Rangeと追跡点が映っている区間を確認します。 |
| 発光が目からずれる | EllipseのCenterと追跡点の相対位置を確認し、複数フレームを再生します。 |
| 安定化の動きが逆に見える | Tracker Position / Steady Position / Unsteady Positionの選択を確認します。回転・Scaleを解く複数点解析はTracker Nodeを使います。 |

パターンと探索領域、解析範囲の説明はChapter 81の標準Trackerを根拠にしています。Modifier側に同名Controlがない場合は、まずTracker Source、mode、解析区間と結果の確認を優先します。

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

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3027–3029、Chapter 81「Using the Tracker Node」pp.1783–1786、1796–1798を基準にしています。

Chapter 124で3つのmode、single-pattern / single-output制約、Tracker Sourceの既定動作を確認しました。Chapter 81でModifierの作例、Pattern / Search Rectangle、解析方向とRender Rangeの基本操作を確認しています。
