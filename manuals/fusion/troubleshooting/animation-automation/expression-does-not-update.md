---
title: Expressionが期待どおり更新されない
description: FusionのSimpleExpressionが反応しないとき、式欄・参照先・型・時間・画像結果を順に分離して原因を特定する。
doc_type: diagnostic
verification: partial
aliases: [Expressionが効かない, expression not updating, 式が更新されない]
concepts: [expression, parameter-source, frame-evaluation]
patterns: [link-values-with-expression]
nodes: [Merge, Transform, Text+, Expression]
tasks: [debug, automate, link-values]
symptoms: [expression-not-working, value-not-updating]
prerequisites: [expressions, parameter-source]
level: intermediate
product_scope: fusion
updated: "2026-10-25"
---

# Expressionが期待どおり更新されない

SimpleExpressionを入れたのに値が変わらない場合は、**式が計算されていない**のか、**計算した値は変わっているが画像に反映されない**のかを先に分けます。Fusionでは画像の接続と、パラメータ同士を式で参照する関係は別です。

このページで扱うのはInspectorのパラメータに直接付ける`SimpleExpression`です。`Modify With > Expression`から追加する**Expression Modifier**は別の仕組みです。

## まず確認すること

1. **式欄があるか**：対象パラメータの下にSimpleExpression欄と黄色の表示があるか確認します。数値欄で`2+4`と計算しただけなら結果の数値が入るのみで、式は保持されません。
2. **参照元が存在するか**：`MergeMaster.Blend`のような式なら、`MergeMaster`というNodeと`Blend`パラメータが現在の構成にあるか確認します。
3. **値そのものが変わるか**：参照元を`0.8`から`0.3`へ動かしたとき、参照先のInspector値も変わるか見ます。Viewerの見た目より先にここを確認します。
4. **同じフレームを見ているか**：`time`やKeyframeが式に含まれる場合、参照元と対象を同じフレームで比べます。
5. **戻り値の型が合うか**：`Blend`は単一の数値、`Center`は2次元位置です。数値を受ける場所へPoint全体を返していないか確認します。

## 原因を切り分ける

### 最小テスト：MergeのBlendを一方向に連動させる

作業中のNodeを壊さないよう、確認用の構成で試します。画像結果も比べるなら、2つのMergeそれぞれへBackgroundとForegroundの画像を接続します。値の追従だけを調べるならInspector上で判定できます。

1. 2つのMergeを用意し、名前を`MergeMaster`と`MergeDerived`にします。ここでは同じコンポジション内に置きます。
2. `MergeMaster`の`Blend`を`0.8`にします。
3. `MergeDerived`の`Blend`の数値欄に`=`を入力し、Returnを押してSimpleExpression欄を開きます。
4. 式欄へ次を入力します。

```lua
MergeMaster.Blend
```

5. 両方のInspectorのBlendが`0.8`であることを確認します。
6. `MergeMaster`のBlendだけを`0.3`に変更します。`MergeDerived`側も`0.3`へ追従すれば、**パラメータ参照の評価は成立**しています。
7. 画像を接続している場合は、各Mergeの出力をViewerへ割り当て、前景の重なり具合も比べます。最後に基準値を`0.8`へ戻します。

この数値`0.8 → 0.3`と2つのMergeの結果は、Resolve Studio 21.1.0.14（Windows）の既存S37実機例で確認済みです。Node同士の画像線はつながっていなくても、Blendは式で連動します。

- [S37のNode構成](/img/fusion/captures/S37/graph.png)
- [式のあるInspector](/img/fusion/captures/S37/inspector.png)
- [0.3へ追従したInspector](/img/fusion/captures/S37/low-inspector.png)
- [比較結果](/img/fusion/captures/S37/low.png)
- [撮影条件と確認範囲](/img/fusion/captures/S37/capture.json)

このテストが成功し、元の式だけが失敗するなら、元の参照名・演算・型・時刻条件を調べます。最小テストも失敗する場合は、最初に式欄の有無とNode名を見直します。

### 値は変わるがViewerの見た目が変わらない場合

式の問題と決めつけず、対象Nodeの**出力**をViewerへ表示しているか確認します。Mergeなら前景と背景の接続、Blendの対象、後段で画像が置き換わっていないかを順にたどります。`Blend`が変わっても、前景がないなどの構成では期待した画面上の変化を比較できません。

→ [Viewerに何も表示されない](../viewer/nothing-visible) / [Node同士を接続できない](../connections/nodes-do-not-connect)

## 主な原因

### 1. 一度きりの数値計算と式を混同している

21.1 Manualでは、数値欄の`2.0 + 4.0`は`6.0`として入力される計算例です。参照を保持するには、`=`から**SimpleExpression欄**を開き、式をその欄へ書きます。式が残っていることをInspectorで確かめてください。

### 2. Node名・パラメータ名の参照が違う

たとえば`Merge1.Blend`は、`Merge1`というNodeの`Blend`を読む式です。実際のNode名が`MergeMaster`なら、そのままでは意図した参照先を指しません。

名前の入力ミスを減らすには、SimpleExpression欄左側の`+`（Pick Whip）を参照したいパラメータへドラッグします。21.1 Manualに記載の操作です。Nodeを改名・複製した後に式が正しく追従するかは、**式欄の現在の参照文字列を確認**して判断します。改名時に自動修正されるかどうかは、このページでは保証しません。

### 3. 数値（Number）と位置（Point）が合っていない

`MergeMaster.Blend`は単一の数値を返します。一方、`Center`のような位置にはXとYがあります。別のTextのCenterから少し下へずらすなら、21.1 Manualには次のPointを返す例があります。

```lua
Point(Text1.Center.X, Text1.Center.Y-.1)
```

これを`Blend`のような数値パラメータへ入れるのではなく、Pointを受ける位置パラメータへ使います。式の内容だけでなく、**結果を受け取る側の型**を見ます。

### 4. 時間を読む位置が違う

`time`は現在のフレーム番号です。別フレームの値を読む`SimpleExpression`には、Manualに次の例があります。

```lua
Merge1:GetValue("Blend", time-5)
```

これは現在より5フレーム前の`Merge1.Blend`を参照します。元のBlendにKeyframeがある場合、`Merge1.Blend`と同じ値にならないことがあります。式が時刻に依存するなら、問題のフレームを固定して比較し、[Spline Editor](../../learn/05-time/keyframes-spline-time)で評価結果の変化を確認します。

### 5. SimpleExpression以外の仕組みを見ている

Inspectorの`Modifiers`タブやKeyframes/Spline Editorに別の値の供給元がないか確認します。`Publish / Connect To`は共有関係、SimpleExpressionは計算式による**一方向の参照**であり、同じものではありません。

特に`Modify With > Expression`で追加するExpression ModifierとSimpleExpressionでは入力欄も機能も異なります。どちらを使っているか確かめてから、対応する設定を調べます。

→ [Modifier / パラメータの供給元](../../learn/05-time/modifier-parameter-sources) / [Expression Modifier](../../nodes/modifiers/expression)

## 修正方法

1. 元の式、参照Node名、現在フレーム、表示値を控えます。実案件では、元のNodeを直接削除せず、検証用に複製したNodeで試します。
2. `=`からSimpleExpression欄が正しく開いていることを確認します。
3. 式を`MergeMaster.Blend`のような**同じフレームの単一パラメータ参照**に縮め、参照先を変えたとき値が更新されるか確かめます。
4. 必要ならPick Whipで参照式を作り直します。
5. 期待する型に合う結果を返すように修正し、`time`、`GetValue()`、`iif()`、算術演算などを一つずつ戻します。
6. 値の追従とViewer出力を別々に確認した後、元の制作構成へ反映します。

式を完全に取り除く場合、21.1 Manualでは対象パラメータ名を右クリックし、`Remove Expression`を選びます。元の式を残す必要があるなら先に記録してから実行してください。

## なぜ起きるか

FusionのNode Editor上でつながる画像の流れと、Inspectorパラメータへ値を渡す関係は独立しています。SimpleExpressionは別Nodeの数値・現在フレーム・条件などから**対象パラメータの値**を計算します。その結果が画像へどう効くかは、接続されている画像と各Nodeの処理内容によって変わります。

→ [式（Expressions）](../../learn/05-time/expressions) / [フレームの評価](../../learn/05-time/frame-evaluation) / [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## バージョン・例外

この診断はDaVinci Resolve **21.1**のSimpleExpressionを対象とします。`time`、`GetValue()`、`Point()`、Pick Whip、Splineへのplot、`Remove Expression`は21.1公式Manualに記載があります。内部Parameter ID、すべてのNode名変更ケース、任意のLua関数、Editionごとの差はこのページでは確定していません。

## 関連する症状

- [KeyframeとExpressionが競合している](./keyframe-expression-conflict)
- [アニメーションが動かない](./animation-does-not-move)
- [Viewerに何も表示されない](../viewer/nothing-visible)

## 出典と検証範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 73「Using Modifiers, Expressions, and Custom Controls」**pp.1586–1588**。数値欄の一度きりの計算、SimpleExpressionの追加、参照構文、`time`、`GetValue()`、`Point()`、`iif()`、Pick Whip、Spline Editor、`Remove Expression`を原典で確認。
- [Blackmagic Design公式サポート](https://www.blackmagicdesign.com/jp/support) — 21.1資料の配布元。
- [既存S37の実機記録](/img/fusion/captures/S37/capture.json) — Resolve Studio 21.1.0.14 / Windows、`MergeMaster.Blend`の`0.8 → 0.3`追従を確認したもの。ここで提示した**切り分け全体を再実機検証したことは意味しません**。

実機でのNode改名、複雑な式とModifierの併用、Point / Text型の各エラー、別フレーム参照、他Editionでの挙動は未検証です。このため`verification: partial`を維持しています。
