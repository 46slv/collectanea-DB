---
title: Keyframeを置いたのにアニメーションしない
description: Fusionでキーフレームを打っても動かないとき、フレーム位置・値・補間・出力・パラメータの供給元を順番に切り分ける。
doc_type: diagnostic
verification: partial
aliases: [Animationしない, keyframe not moving, キーフレームが効かない]
concepts: [keyframes, frame-evaluation, parameter-source, animation-curve]
patterns: [last-good-first-bad]
nodes: [Transform, Text+, MediaOut]
tasks: [debug, animate]
symptoms: [animation-not-moving, keyframe-no-effect]
prerequisites: [keyframes, frame-evaluation]
level: foundation
product_scope: fusion
updated: "2026-10-26"
---

# Keyframeを置いたのにアニメーションしない

キーを置いたはずなのに画面が止まる場合は、**その時刻でパラメータの値が変わっているか**を最初に調べます。値が動かない問題と、値は動くのに画像が変わらない問題では確認先が異なります。

FusionのキーフレームはNode全体ではなく、Inspectorの各パラメータに設定します。Keyframes Editorでキーの**時刻**を、Spline Editorでキーの**値と間の補間**を、Viewerで**画像結果**を確認するのが基本です。

## まず確認すること

1. **再生位置**：Time Rulerの再生ヘッドが、目的のキーのある範囲を通っているか。Editページで通常のクリップを選んだときは、黄色のRender Rangeと素材全体のGlobal Rangeが一致しない場合があります。
2. **キーの有無**：対象Node・対象パラメータを選び、Inspectorのキーフレームボタンを見る。**オレンジ色は「現在位置にキーがある」表示**です。別フレームで灰色でも、アニメーション全体が消えたとは限りません。
3. **値の差**：開始と終了のフレームへ直接移動して、同じパラメータの表示値が異なるか。
4. **表示先**：ViewerにアニメーションしたNode、またはその後段の出力を割り当てているか。前段のText+を表示したままなら、後段Transformのサイズ変更は見えません。
5. **値の供給元**：SimpleExpression、Modifier、Connect Toなど別の仕組みを調べる。複数の仕組みが関わるときは、通常のキーを打っている場所と最終値を決める場所を分けます。

## 原因を切り分ける

### 最小テスト：Text+を2キーで拡大する

実案件を壊さないよう、0〜24フレームが表示できる確認用コンポジションで行います。既存の動画クリップでは表示中のRender Rangeの**先頭と、その24フレーム後**へ読み替えてください。素材のフレーム番号が0から始まるとは限りません。

```text
Text1（文字「TEST」）→ Transform1（Sizeだけを動かす）→ MediaOut1
```

1. Text+の文字を「TEST」にし、後ろにTransformを接続します。Transformの出力を右Viewerへ表示します。Nodeを選択して`2`を押すと右Viewerに割り当てられます。
2. フレーム0へ移動し、Transformの`Size = 0.8`に設定します。Size右側の**灰色のキーフレームボタン**を押して最初のキーを作ります。
3. フレーム24へ移動し、`Size = 1.2`へ変更します。この位置にもキーができたことを確認します。できていなければ、そのフレームでキーフレームボタンから追加します。
4. フレーム0と24をそれぞれ直接表示し、InspectorのSizeが`0.8`と`1.2`を示すか確かめます。Viewerでは同じ文字が縮小→拡大に変わるはずです。
5. Spline EditorでTransform1のSizeを表示し、2点の間を**Linear**にします。フレーム12のSizeは計算上`1.0`です。途中の値も変われば、キーの記録と補間は正常に働いています。

| フレーム | Transform1 / Size | 確認する結果 |
| ---: | ---: | --- |
| 0 | 0.8 | 「TEST」が小さく表示される |
| 12 | 1.0（Linear時） | 中間の大きさ |
| 24 | 1.2 | 「TEST」が大きく表示される |

この数値は**診断用の構成案**であり、今回新たに実機で確認した結果ではありません。元のグラフで同じ症状が出てもこのテストが成功するなら、元グラフ固有の時刻・供給元・接続に原因を絞れます。

既存のResolve Studio 21.1.0.14（Windows）実機例では、Text+を3つのTransformへ分岐し、SizeのキーとLinear／曲線／Step Inを比較しています。今回の2キー構成とはキーの個数・値が異なります。

- [既存S36のNode構成](/img/fusion/captures/S36/graph.png)
- [LinearのSpline](/img/fusion/captures/S36/linear-spline.png)
- [Step InのSpline](/img/fusion/captures/S36/step-spline.png)
- [S36の撮影条件](/img/fusion/captures/S36/capture.json)

### 値が変わらない場合

Keyframes Editorを開き、Transform1のトラックを展開して**Size**のキーを探します。Nodeのトラックだけでなく、パラメータのトラックを表示する必要があります。

- **キーが1つしかない**：別フレームへ移動してもう1つキーを追加します。
- **キーが2つあるのに同じ値**：Keyframes EditorのSpreadsheet、または各キー位置のInspectorで値を比較します。
- **キーが見える時刻と再生区間がずれている**：Global Range／Render Rangeとキー位置を比較します。Render Rangeの変更だけでキーフレームの時刻は移動しません。
- **Inspector値は変わるのに再生で止まる**：1フレームずつ直接移動して結果を見る。再生速度やキャッシュの問題と、キーフレーム評価の問題を分けます。

Keyframes EditorのSpreadsheetにはキーの時刻と値を数値で表示できます。キーを左右へ動かせば時刻が変わりますが、**画像の前後関係はNode Editorの接続**が決めるため、Keyframes EditorでNodeトラックの並びを変えても合成順の修正にはなりません。

### 値は変わるが画像が動かない場合

Viewerが`Text1`を表示していたら`Transform1`へ切り替えます。それでも変化しなければ、MediaOutへ続く経路にTransform1が入っているか確認します。BlendやMaskで効果が見えなくなっている場合もあるので、対象Nodeの直後をViewerへ出して比較します。

切り分け時は**パラメータ値とViewerの結果を別々に記録**してください。時間に応じて値が変わっているなら、「キーが存在しない」とは判断しません。

## 主な原因

### 1. キーを置いたフレームが再生範囲の外にある

ResolveのFusionページでは、通常の動画クリップをEdit／Cutタイムラインから開いたとき、素材全体を示すGlobal Rangeと、タイムラインで使用中のIn／Outに対応するRender Rangeが異なる場合があります。

たとえば元の100フレームのうち20〜59を使用中なら、使用範囲の先頭から12フレーム後は元の位置では32です。これは位置関係の説明であり、実際のTime Rulerやタイムコードが必ず0起点であるという意味ではありません。

**修正**：Time Rulerの黄色い範囲を確認し、表示されるフレーム位置にキーを置きます。キーの時刻を変更したいときはKeyframes Editorでキー自体を移動します。

### 2. 同じ値のキーしかない／片方のキーがない

キーフレームは時刻と値を保持します。時刻を変えても値が同じなら、画像は変化しません。

**修正**：各キー位置に再生ヘッドを移動し、同じパラメータの値を読みます。2点の時刻と値をKeyframes EditorのSpreadsheetでも確認できます。

### 3. Step系の補間で、途中の値を保持している

Spline Editorの`Step In`／`Step Out`は、キー間で値を滑らかに変えるのでなく、次の切り替えまで値を保持します。開始と終了の2フレームだけを確認すると正常でも、途中のフレームでは止まって見える場合があります。

**修正**：連続的に拡大したいなら、比較用にSpline Editorで該当キーを`Linear`へ変更し、途中のフレームで値が変わるか確かめます。ステップ変化が意図どおりならそのまま残します。

### 4. 別のNode／パラメータを操作している

Transformの`Size`を動かしても、Viewerがその前のText+を表示していたら変化しません。また`Center`と`Pivot`は意味が異なります。

**修正**：Keyframes Editorのトラック名、InspectorのNode名・項目名、Viewer上部のNode名を同時に確認します。必要なら画像の流れを1Nodeずつたどります。

### 5. キー以外の仕組みが値を決めている

SimpleExpressionやModifierを使うと、別のパラメータや式から値を受け取れます。さらにConnect Toで同じアニメーションカーブを複数パラメータから参照することもできます。

**修正**：Inspectorの式欄やModifiersタブ、Keyframes／Spline Editorの対象トラックを確認し、元の設定を控えてから検証用の複製で供給元を一つに絞ります。実案件のExpressionやModifierを診断目的で即座に削除しません。

→ [Expressionが期待どおり更新されない](./expression-does-not-update) / [KeyframeとExpressionが競合している](./keyframe-expression-conflict)

### 6. Effect Nodeの有効区間が短い

Keyframes Editorで**Effect Node自体のセグメント**を短くすると、その区間外ではNodeが無効として扱われます。キーが存在しても、そのフレームで効果を出していなければViewerでは動きません。

**修正**：キーの位置だけでなく、Nodeのセグメントの開始と終了も確認します。素材のIn／OutやEditor上のトラック順の変更とは区別してください。

## 修正方法

1. 現在フレーム、対象Node、対象パラメータ、開始・終了の値、Viewerの表示先を控えます。
2. 値が変わらないなら、キーの個数と時刻をKeyframes Editorで確認します。必要なら2キーに減らし、Spline EditorをLinearにして比較します。
3. 値が変わるなら、対象Nodeの直後をViewerへ出し、MediaOutまでの経路を確認します。
4. Expression／Modifier／Connect Toが関係している場合は、複製した検証用Nodeで切り分け、元の仕組みを残すか置き換えるか判断します。
5. 元の構成へ戻す前に、問題の開始・中間・終了フレームを**直接指定**して、Inspector値とViewer結果が対応していることを確認します。

アニメーションそのものを消す操作は、Inspectorの対象パラメータのキーフレームコントロールを右クリックし、`Remove [パラメータ名]`を選びます。**オレンジ色のボタンをクリックすると現在フレームのキーを消す操作**なので、曲線全体の削除と混同しないでください。どちらも実案件では元の値・キーを保存してから行います。

## なぜ起きるか

Fusionは、その時刻のパラメータ値をキーフレーム間のSplineや式から計算し、Nodeを通して画像を作ります。**キーの存在、時刻に対する値の変化、Viewerに表示する画像は別の確認対象**です。どこで値が止まるかが分かれば、不要なNodeの作り直しを避けられます。

→ [キーフレーム／スプライン／時間](../../learn/05-time/keyframes-spline-time) / [フレーム評価](../../learn/05-time/frame-evaluation) / [Modifierとパラメータの供給元](../../learn/05-time/modifier-parameter-sources)

## バージョン・例外

対象は**DaVinci Resolve 21.1のFusionページ**です。キーフレームボタン、Keyframes Editor、Spline Editor、Time RulerとRender Rangeの扱いは21.1公式Manualの記載に基づきます。実際の開始フレームは通常クリップ／Fusion Clip／Fusion Studioで異なります。

ここで示した2キーの診断フロー全体、Effect Nodeの期間と各Modifierの組合せ、別OS・Edition・複雑なキャッシュ条件は今回の実機検証に含みません。`verification: partial`を維持します。

## 関連する症状

- [KeyframeとExpressionが競合している](./keyframe-expression-conflict)
- [Expressionが期待どおり更新されない](./expression-does-not-update)
- [Viewerに何も表示されない](../viewer/nothing-visible)
- [Node同士を接続できない](../connections/nodes-do-not-connect)

## 出典と検証範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 63 **pp.1290–1294**（Viewer割り当て、Time Ruler、Global / Render Range）、Chapter 70 **pp.1519–1525**（InspectorのKeyframe、Remove、Keyframes EditorとSpreadsheet、Effect Nodeの有効区間）、Chapter 71 **pp.1535–1537, 1556–1557**（Spline、Linear、Smooth、Step）。本runでLibrary上の原典PDFから該当本文を直接確認。
- [Blackmagic Design公式サポート](https://www.blackmagicdesign.com/jp/support) — 21.1資料の配布元。
- [既存S36の実機記録](/img/fusion/captures/S36/capture.json) — Windows / Resolve Studio 21.1.0.14で確認済みの3キー・補間比較。**今回の診断全体や2キーの新規実機試験を示すものではありません**。

全手順の実機再現、複雑な参照関係、Edition差は未検証です。