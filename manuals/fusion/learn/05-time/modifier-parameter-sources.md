---
title: Modifier / パラメータの供給元
description: Fusionのパラメータが固定値・Keyframe・Expression・Modifier・共有値のどれで動いているかを調べ、意図しない変化を切り分ける。
doc_type: concept
term_id: modifier-parameter-sources
term_short: Inspectorの値を決めているKeyframe・Expression・Modifierなどの供給元。
verification: partial
aliases: [Modifier, parameter source, driven parameter]
concepts: [parameter-source, modifier, expression, keyframes]
tasks: [animate, automate, link-values, debug]
prerequisites: [frame-evaluation, expressions]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# Modifier / パラメータの供給元

<Term id="transform">Transform</Term>のCenterを動かしたつもりなのに、再生すると位置が戻る。別のNodeの設定を変えたら、こちらの値まで変わる。こうした場合、まず調べたいのは**現在表示されている数値ではなく、その数値を誰が決めているか**です。

Fusionのパラメータ（Center、Size、Blendなど）は、Inspectorへの直接入力だけでなく、Keyframe、計算式、Modifier、別パラメータとの接続から値を得られます。同じ数値が表示されていても、供給元が違えば、編集したときの挙動も変わります。

## 供給元を5つに分ける

| 方式 | 何が値を決めるか | 使う場面 | 調べる場所 |
| --- | --- | --- | --- |
| 固定値 | Inspectorで入力した値 | 動かさない位置や強さ | 対象パラメータ |
| <Term id="keyframes-spline-time">Keyframe / Spline</Term> | フレームごとの値と補間カーブ | 指定時刻で移動・変形する | Keyframes / Spline Editor |
| <Term id="expressions">SimpleExpression</Term> | 別の値、`time`などを使う式 | 他Nodeへの追従、条件分岐 | 対象パラメータの式欄 |
| Modifier | パラメータへ追加した処理 | 揺れ、演算、トラッキング、音への反応 | Inspectorの**Modifiers**タブ |
| Publish / Connect To | 公開されたパラメータやModifierとの共有接続 | 複数箇所で同じ値を使う | 右クリックメニュー、Modifiersタブ |

「Modifier」は、画像を処理する通常のNodeと同じ意味ではありません。**Nodeの中の特定のパラメータに追加し、その値を作ったり変化させたりする仕組み**です。たとえば、TransformのImage入力へ別の画像をつなぐことと、CenterにPerturbを付けることは別の操作です。

```text
MediaIn1 ── Image ──→ Transform1 ── Image ──→ MediaOut1
                         │
                         └─ Center（位置を決めるパラメータ）
                              ├─ Keyframeによる基本移動
                              └─ Perturbによる細かな揺れ
```

これはデータの関係を示した模式図です。KeyframeとPerturbが必ずNode Editor上の独立した接続線として表示される、という意味ではありません。

## 実例1：Keyframeの移動にPerturbの揺れを重ねる

Blackmagic Designの21.1 Reference Manualは、TransformのCenterにKeyframeを置いて大きな動きを作り、Perturbで小さな不規則な動きを加える例を紹介しています。

1. `MediaIn1 → Transform1 → MediaOut1`のようにImageを接続し、Transform1を選びます。
2. InspectorでCenterのKeyframeを有効にし、開始位置を指定します。
3. 再生位置を変えながらCenterを移動させ、まず大まかな軌道を作ります。Keyframeだけの状態でViewerを確認します。
4. InspectorのCenter Xのラベルを右クリックし、`Modify With > Perturb`を選びます。
5. **Modifiers**タブでPerturbの`Strength`、`Wobble`、`Speed`を調整し、再生しながら揺れの大きさと速さを比べます。

この例では、Keyframeが移動の大筋を決め、Perturbが細かな変化を加えます。**KeyframeかModifierか、必ず一方だけを選ばなければならないわけではありません。**

揺れが強すぎる場合、先にKeyframeを打ち直すのではなく、ModifiersタブのPerturbを調べます。逆に、軌道そのものが違う場合はKeyframeとSplineを確認します。まず「どちらの層が問題か」を分けると、必要のない修正を避けられます。

→ [Perturb](../../nodes/modifiers/perturb.md) / [Keyframe・Spline・時間](./keyframes-spline-time.md)

## 実例2：1つの値を2つのパラメータで共有する

別々のNodeで同じ値を操作したい場合、`Publish`と`Connect To`を使えます。21.1 Reference Manualでは、公開されたパラメータへ複数のパラメータを接続し、値をまとめて変更できると説明されています。

1. 共有元にしたいパラメータの名前を右クリックして、`Publish`を選びます。
2. 連動させるパラメータを右クリックし、`Connect To > [公開したパラメータ名]`を選びます。
3. Modifiersタブの公開値を変更し、接続先が同じ値を使うことを確かめます。

`Connect To`によるこの接続は、Manualで**双方向**と説明されています。片方から調整したときに、もう片方も変わる共有関係です。ただし、選べる接続先はパラメータの型に応じて絞られます。Centerのような位置と、Blendのような単一数値を、互換性を確認せずそのまま共有できるとは考えません。

### SimpleExpressionとは何が違う？

SimpleExpressionは、たとえば次のように一方の値を読んで結果を計算できます。

```lua
Merge1.Blend
```

`Merge1.Blend`の結果に一定値を足したり、条件を付けたりできますが、**式を付けた側を動かしただけでMerge1.Blendも書き換わる、という双方向の接続ではありません。** 単に同じ値を共有したいなら`Publish / Connect To`、値から別の値を*計算したい*ならSimpleExpressionが候補です。

SimpleExpression欄の左にある`+`を参照先のパラメータへドラッグする**Pick Whip**でも参照式を作れます。手入力のNode名を間違えたくないときに使います。

→ [Publish](../../nodes/modifiers/publish.md) / [式（Expressions）](./expressions.md)

## 実例3：今の値ではなく「5フレーム前の値」を使う

SimpleExpressionは現在フレーム以外の値も参照できます。21.1 Manualには次の例があります。

```lua
Merge1:GetValue("Blend", time-5)
```

これは、**現在より5フレーム前のMerge1のBlend**を取得します。参照先のBlendが時間で変われば、現在の値をそのまま参照する`Merge1.Blend`とは違う結果になります。

同じ「Expression」という名前でも、**SimpleExpressionとExpression Modifierは別の機能**です。21.1 Manualでは、Expression Modifierは現在時刻以外のパラメータ値を直接参照できないと説明されています。過去フレームの値を読みたい場合、どの仕組みに式を置いているか確認してください。

→ [Expression Modifier](../../nodes/modifiers/expression.md) / [Calculation](../../nodes/modifiers/calculation.md)

## Modifierは連結できる

Modifierは一段で終わるとは限りません。21.1 Manualでは、Modifier同士をNodeのようにつなぎ、枝分かれさせる構成を説明しています。

例として**Calculation Modifier**には2つのNumber入力があります。その各入力へさらにModifierを付けることができます。すでに接続しているModifierと制御対象の間へ別のModifierを入れたいときは、パラメータの右クリックメニューにある`Insert`を使います。

つまり、最終的な数値を調べるとき、最初に見つかったModifierだけ見て終わりとは限りません。

```text
時間・外部情報・手入力
        ↓
   Modifier A
        ↓
   Modifier B
        ↓
   対象パラメータ
        ↓
   Nodeの処理結果
```

この図も概念図です。各Modifierがどの入力を持つか、どんな順序で接続できるかは種類によって異なります。詳細は個別の[Modifier一覧](../../nodes/modifiers/index.md)を参照してください。

## 値が意図と違うときの調べ方

### 1. 問題のパラメータを一つに絞る

「Transformが動かない」ではなく「Transform1のCenter Xが期待位置にならない」という単位まで絞ります。CenterとPivot、位置と拡大率のように、見た目が近くても別の設定を混同しないようにします。

### 2. 同じフレームで比べる

再生位置が違えば、KeyframeやExpressionの結果も変わります。**まず同じフレームに止めて**値とViewerの結果を見ます。比較時には、フレーム位置を不用意に変えません。

### 3. Modifiersタブを確認する

対象NodeにModifierがあると、Inspectorの**Modifiers**タブが強調表示されます。適用されていなければグレー表示です。Modifierの見出しを開き、どの値を入力として、何を出力しているかを確認します。

### 4. KeyframeとSplineを確認する

動きが特定フレームで変わるなら、Keyframes EditorとSpline Editorを確認します。狙った時刻にKeyframeがあるか、途中の補間カーブが思った動きになっているかを分けて調べます。

### 5. SimpleExpressionと値の共有を確認する

式欄があるなら参照先Node名・パラメータ名・戻り値の型を見ます。Publish / Connect Toで共有している場合は、**別Nodeを操作したときに連動する**ことが仕様どおりか確認します。

### 6. さらに上流へたどる

参照先のパラメータも別のModifierやKeyframeで動いている場合があります。値が決まる経路を、一段ずつ上流へたどります。Node EditorのImage接続線だけを見ても、この関係のすべては分かりません。

### 7. 外す前に、構成を記録する

ModifierやExpressionを削除すれば原因が消えるとは限りません。元のアニメーションを壊さないよう、現在のフレーム、値、参照先、Modifiersタブの設定を控えてから、**検証用に複製したNode**で供給元を一つずつ切り替えて比較します。

## 症状から供給元を絞る

| 症状 | 最初に見る場所 | 見分けるポイント |
| --- | --- | --- |
| 数値を変えても再生時に戻る | Keyframes / Spline、SimpleExpression、Modifiers | 現在値よりも時間や参照先が優先されていないか |
| 画像の移動に細かな揺れが混ざる | ModifiersタブのPerturb / Shake | 軌道は合っていて揺れだけが違うか |
| 片方の値を変えると別Nodeも変わる | `Publish / Connect To`、SimpleExpression、Instance | 双方向共有か、一方向の計算結果か |
| 同じ位置へ追従するはずなのにずれる | SimpleExpressionの参照先とPoint型 | 元値に計算やOffsetが入っていないか |
| 時間をずらした値が欲しいのに一致する | 使用中のExpression方式 | 別フレームの参照に対応する方式か |
| `Modify With`に目的の項目がない | パラメータの型 | Number / Point / Text等に対応したModifierか |
| Modifiersタブに複数項目がある | 上流のModifierと`Insert`の関係 | 最終値までの接続を見落としていないか |
| 音・トラッキングに反応しない | 対象Modifierと参照データ | 入力元、選択範囲、時間が合っているか |

## どの方式を使うか

値を固定したい場合は直接入力、指定した時刻で動かすならKeyframe、既存の値から計算するならSimpleExpressionを選びます。揺れ・トラッキング・音声解析など、特定の機能が必要なら対応するModifierを調べます。複数のパラメータに同じ値を使わせるだけならPublish / Connect Toが候補です。

参考になるModifierの例には、[Perturb](../../nodes/modifiers/perturb.md)、[Track](../../nodes/modifiers/track.md)、[Probe](../../nodes/modifiers/probe.md)、[Fairlight Animator](../../nodes/modifiers/fairlight-animator.md)があります。これらはそれぞれ、ランダムな動き、1点のトラッキング、Imageからのサンプリング、音声解析と目的が違います。**「外部データで動く」という理由だけで同じ設定方法だとは考えません。**

## 関連記事

- [パラメータ / Data](../02-data/parameter-data.md) — 値の型とNodeのImage入力との違い
- [Keyframe / Spline / 時間](./keyframes-spline-time.md) — 動きの指定と補間
- [式（Expressions）](./expressions.md) — SimpleExpressionの文法と戻り値
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression.md) — 複数Nodeの値を連動させる実例
- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary.md) — Instanceと値の共有を区別する

## 出典・検証範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）を基準にしています。

- Chapter 69「Editing Parameters in the Inspector」pp.1510–1511：Modifierの定義、Inspectorからの操作。
- Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1582–1585：`Modify With`、Modifiersタブ、KeyframeとPerturbの併用、Publish / Connect To、Modifierの連結、種類ごとの役割。
- 同Chapter 73 pp.1586–1588：SimpleExpression、Pick Whip、`GetValue()`、式の削除。

操作名や組み合わせ例はManualに基づきます。すべてのNode/Modifierの内部パラメータID、初期値、可用Edition、Resolve 21.1実機での表示・動作を網羅検証していないため、`verification: partial`のままです。
