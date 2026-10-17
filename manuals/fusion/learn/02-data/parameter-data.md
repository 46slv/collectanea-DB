---
title: パラメータ / データ（Parameter / Data）
description: FusionのImage接続とCenter・Blendなどの制御値を区別し、値の供給元を診断する。
doc_type: concept
term_id: parameter-data
term_short: CenterやBlendなど、Nodeの動作を決める設定値。
verification: partial
aliases: [Parameter, Data, control value, scalar, Point]
concepts: [parameter-data, parameter-source, typed-data]
tasks: [animate, automate, link-values, debug]
prerequisites: [typed-connections]
level: foundation
product_scope: fusion
updated: "2026-10-17"
---

# パラメータ / Data

Fusionで映像を動かす場合、<Term id="transform">Transform</Term>に画像を接続し、InspectorでCenterを変えます。この2つは別の操作です。**接続線から渡るのは加工するImageで、Centerは「どこに配置するか」を決める設定値**です。

Center・Size・BlendのようにNodeの処理内容を決める設定をパラメータ（Parameter）と呼びます。パラメータは手で入力するだけでなく、Keyframe・Expression・Modifier・別パラメータとの共有によって値が決まることもあります。「値が戻る」「勝手に動く」「別のNodeと同期する」場合は、この供給元を確認します。

## Imageの接続とパラメータは違う

```text
MediaIn1 ── Image ──→ Transform1 ── Image ──→ MediaOut1
                         │
                    Inspector
                    ├─ Center：位置
                    ├─ Size：拡大率
                    └─ Angle：回転角度
```

MediaIn1からTransform1に渡るImageには、画素の色・Alpha・画像サイズなどが含まれます。Centerを変更してもImageの接続先は変わらず、配置結果が変わります。

| 種類 | 渡す情報 | 例 | 調べる場所 |
| --- | --- | --- | --- |
| <Term id="image">Image</Term> | 色やAlphaなどの画像情報 | MediaIn → Transform | Node EditorとViewer |
| Mask | 位置ごとの処理範囲 | Ellipse Mask → BlurのEffect Mask | Mask出力と入力端子 |
| Parameter | Nodeがどう処理するかの設定値 | TransformのCenter、MergeのBlend | InspectorのTools / Modifiers |

これがFusionで扱うすべてのデータ型というわけではありません。Shape・Particle・3Dなどもあります。詳しくは[Image / Mask / Dataを分ける](./image-mask-data.md)を参照してください。

## パラメータには型がある

パラメータが受け取るものは単一の数値とは限りません。Inspectorには数値欄、スライダー、チェックボックス、ドロップダウン、色の選択欄などがあります。

| 値の種類 | 内容 | 代表例 |
| --- | --- | --- |
| Number | 量、割合、角度などの単一数値 | Size、Blend |
| Point | XとYなど組になった値 | Center |
| Boolean | オン・オフ | チェックボックス |
| 選択値 | 用意された候補からの選択 | ドロップダウン |
| Text | 文字列 | Text+の文字内容 |
| Colorなど | 複数成分を持つ値 | 色の選択欄 |

たとえばCenterはPointです。Numberを返す式がCenter全体へそのまま使えるとは限りません。<Term id="expressions">Expression</Term>では、**式の戻り値と設定先が必要とする型**を合わせます。

21.1 Reference Manualでは、Number・Text・Polyline・Gradient・Pointなどの種類に応じて利用できるModifierが異なり、Inspectorの`Modify With`には対応する候補が表示されると説明されています。

## 値はどこで決まるのか

| 方法 | 値の供給元 | 主な用途 |
| --- | --- | --- |
| 固定値 | Inspectorへの直接入力 | 固定した位置・強さ |
| <Term id="keyframes-spline-time">Keyframe / Spline</Term> | 再生フレームに対応するAnimation Curve | 始点と終点を決める移動 |
| SimpleExpression | 別の値や時間を使った計算式 | 追従、ずらし、周期運動 |
| Modifier | パラメータに付けた追加処理 | 揺れ、値の演算、外部データ |
| Publish / Connect To | 公開された別パラメータやModifier | 値や動きの共有 |

これらが必ず1つだけ使われるわけではありません。ManualにはKeyframeで大きな軌道を作り、Perturbで小さな揺れを重ねる例があります。**Inspectorに見える最終値だけでは、その値がなぜ決まったか分からない場合があります。**

### 実例1：Transformを固定からアニメーションへ

```text
MediaIn1 → Transform1 → MediaOut1
```

1. Transform1のCenterを固定値にし、再生しても位置が変わらないことを確認します。
2. InspectorでCenterのKeyframeを有効にして、開始位置を記録します。
3. 後のフレームへ移動し、Centerを別の位置に変更します。
4. 再生すると、時間に応じて画像が移動します。
5. Spline EditorでCenterのカーブを表示し、開始・終了の値を保ったまま途中の変化を調整します。

Keyframeは「どの時点にどの値を指定するか」、Spline Editorは「その間をどう変化させるか」を確認・調整する画面です。詳しくは[キーフレーム / スプライン / 時間](../05-time/keyframes-spline-time.md)を参照してください。

### 実例2：別のNodeへ位置を追従させる

Text1のCenterを参照し、別のTransformのCenterを少しずらして追従させる例です。追従させたいCenterで`=`を入力してReturnを押すと、SimpleExpression欄が追加されます。

```lua
Point(Text1.Center.X, Text1.Center.Y-.1)
```

これはText1のX座標を使い、Y座標から`0.1`を引いたPointを返します。Text1を動かすと式を設定したCenterも追従します。`0.1`は正規化された位置の値であり、10ピクセルという意味ではありません。

Center全体にはPointが必要なので`Point(...)`を返しています。最初はSimpleExpression欄の`+`を別のパラメータへドラッグするPick Whipで参照を作り、後からずらし量を加えても構いません。詳しくは[式（Expressions）](../05-time/expressions.md)を参照してください。

### 実例3：値を2箇所で共有する

21.1 Manualでは`Publish`と`Connect To`を使って値を連動できます。

1. 基準にするパラメータを右クリックし、`Publish`を選びます。
2. 連動させたい別のパラメータを右クリックし、`Connect To`から公開された項目を選びます。
3. 値を変更し、両者が連動するか確かめます。

Manualでは、この方法による共有は双方向に操作できると説明されています。一方、SimpleExpressionは**参照先から設定先へ結果を渡す一方向の関係**です。「基準値より0.1小さくする」などの計算を加えるなら、共有だけでなく式を使います。

### 実例4：2つ目の合成を5フレーム遅らせる

たとえば、1つ目のタイトルが現れてから、5フレーム遅れて2つ目のタイトルが現れる構成を作ります。2つのMergeの**Blend**を個別にキーフレーム設定する代わりに、後段のBlendが前段のアニメーションを参照するようにします。

```text
Background ──→ Merge1［Background］ ──→ Merge2［Background］ ──→ MediaOut
Text+ A ─────→ Merge1［Foreground］       ↑ Foreground
Text+ B ────────────────────────────────┘
```

1. Merge1のBlendにKeyframeを設定し、1つ目のタイトルが徐々に見えるようにします。
2. Merge2のBlendの数値欄で`=`を入力してReturnを押し、表示されたSimpleExpression欄へ次の式を設定します。

   ```lua
   Merge1:GetValue("Blend", time-5)
   ```

3. 再生して、Text+ BがText+ Aより5フレーム遅れて現れるか確認します。`time`は現在のフレーム番号で、`GetValue`の第2引数に`time-5`を渡すと、**Merge1のBlendを現在より5フレーム前の時点で評価した値**を返します。単位は秒ではありません。

式を付けたMerge2のBlendは、Merge1側のBlendが変わると追従します。一方、Merge1の値をMerge2から逆方向に変更する仕組みではありません。`Merge1.Blend`は「今の値」を参照し、`Merge1:GetValue("Blend", time-5)`は「過去の指定フレームの値」を参照する、という違いがあります。アニメーション開始直後は参照時刻が開始位置より前になる場合があるため、その前の値も意図どおりか確認してください。

詳しくは[式（Expressions）](../05-time/expressions.md)と[Modifier / Parameter Sources](../05-time/modifier-parameter-sources.md)を参照してください。

## Inspectorで値の供給元を追う

Inspectorの`Tools`パネルはNode自身の設定、`Modifiers`パネルはパラメータに追加した処理を表示します。ModifierがあるNodeではModifiersタブが強調されます。

1. **対象を特定する。** どのNodeのどのパラメータか。CenterとPivot、MergeのBlendとMaskなどを混同していないか。
2. **型を調べる。** NumberかPointか、どんな値が必要か。
3. **Keyframeを確認する。** 再生位置で値が変わるならSpline Editorを見る。
4. **SimpleExpressionを確認する。** 参照先のNode名・Parameter名・戻り値の型を調べる。
5. **Modifiersと値の共有を確認する。** Modifiersタブ、Publish / Connect Toを確認する。
6. **参照先をさらに追う。** 1段目のModifierや式も別の値から計算されていないか確認する。

元のAnimationを壊さないよう、設定を外す前に値・参照先・再生位置を控えます。固定値との差を比べたいときは、検証用に複製したNodeで試すと安全です。

## 症状別の切り分け

| 症状 | まず調べること |
| --- | --- |
| 入力した数値が再生時に戻る | Keyframe・Expression・Modifierが値を決めていないか |
| 別のNodeの値も同時に変わる | Publish / Connect To、Expression、Instanceによる共有がないか |
| Centerに式を書いても期待どおりにならない | Center全体にPointが必要か、X・Yの参照先が正しいか |
| 式の値が毎フレーム変わる | `time`やアニメーションする別Parameterを参照していないか |
| 5フレーム前の値と一致しない | `Merge1:GetValue("Blend", time-5)`のように、対象Nodeと評価フレームを明示しているか確認する |
| Modifierの候補が出ない | その型に使えるものが`Modify With`にあるか |
| 画像は出るが移動しない | 接続線だけでなく、TransformのCenterを動かしているか |

Node Editorの線をつなぎ直す前に、**その値がどこから来るか**を追うのが基本です。

## 関連記事

- [Image / Mask / Dataを分ける](./image-mask-data.md)
- [接続できるdata / 接続できないdata](./connection-compatibility.md)
- [Modifier / Parameter Sources](../05-time/modifier-parameter-sources.md)
- [Transform](../../nodes/transform/transform.md)
- [Expression Modifier](../../nodes/modifiers/expression.md)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression.md)

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）を参照しました。

- Chapter 69「Editing Parameters in the Inspector」pp.1494–1495、1504–1506、1511–1513：Inspector、Controlの種類、Keyframe、Publish / Connect To、Pick Whip。
- Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1582–1584：型によるModifierの違い、Keyframeとの併用、パラメータの共有。
- 同Chapter 73 pp.1586–1588：SimpleExpression、`Point()`、`time`、`GetValue()`。

ここでは公式Manualで確認できる操作と、値の供給元を読む考え方を説明しています。全Nodeの内部Parameter ID、初期値・数値範囲、21.1実機動作、Edition差を網羅検証したものではないため`verification: partial`を維持します。
