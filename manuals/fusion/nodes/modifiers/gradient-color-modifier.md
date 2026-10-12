---
title: "Gradient Color Modifier"
description: "Gradientを時間範囲へ割り当て、Gradient上の値をParameter animationとして返すModifier。"
doc_type: node
term_id: "gradient-color-modifier"
term_short: "Gradient Color Modifierは、Gradientを時間へ割り当て、Gradient上の値をParameterへ返してanimationを作るModifier。"
verification: partial
aliases: ["Gradient Color Modifier", "Gradient Color"]
concepts: ["parameter-data", "time"]
nodes: ["Gradient Color Modifier"]
node_family: "modifiers"
controls: ["Gradient", "Gradient Interpolation Method", "Repeat", "Gradient Offset", "Start Time", "End Time"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "animate"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-13"
---

# Gradient Color Modifier

Gradient Color Modifierは、**自分で作ったGradientを時間範囲へ割り当て、その時点のGradient上の値を対象Parameterへ返すModifier**です。

たとえばStart TimeからEnd Timeまでの間に、Gradientの左端から右端へ順に進むanimationを作れます。Gradientの色やcolor stopの位置も編集できるため、単純な2色変化だけでなく、途中に複数の色を挟んだ時間変化を1つのModifierで作れます。

Imageを直接加工するNodeではありません。対象Parameterへ時間に応じた値を供給します。

## 何をするModifierか

Gradient Color Modifierは、Gradientの横方向を時間へ対応させます。

~~~text
Gradient
左端 ───────────── 右端
  │                  │
Start Time        End Time
  │                  │
  └── 時間に応じてGradient上の値を返す ──→ 対象Parameter
~~~

Start TimeとEnd Timeで「Gradientを何frameから何frameまでに割り当てるか」を決めます。その間はGradient上を進み、各frameで対応する値がParameterへ返ります。

21.1 Manualでは、Start TimeとEnd Timeを両方0にした場合は、Gradientの開始位置にある値を返すと説明されています。

## 追加方法

対象Parameterを右クリックし、**Modify With > Gradient Color**を選びます。

ManualはGradient Colorを「parameterへ適用するModifier」として説明していますが、対応するParameter型の完全な一覧は示していません。このページでは、Manualにない型対応を推測して「どのParameterにも使える」とは扱いません。

## 入力と出力

Gradient Color ModifierはNode Editor上でImageを受け渡すNodeではありません。

- 対象: Gradient Colorを追加できるParameter
- 時間の入力: FusionのframeとStart Time / End Time
- 値の定義: Gradient bar上のcolor stopと補間
- 出力: 現在frameに対応するGradient上の値
- 主な編集場所: InspectorのModifier tab
- Image input / output: なし

frontmatterのinputs / outputsにあるparameterは、このModifierがParameterの値を制御することを表す分類です。

## 主なControl

### Gradient

Gradient barへcolor stopを追加し、色の並びを作ります。

各pointには色があり、pointそのものの位置と色の両方をanimationできます。つまり、時間に沿ってGradientを読むだけでなく、必要ならGradient自体も時間変化させられます。

21.1 Manualでは、このGradientへ[From Image](./from-image)を追加し、Imageからsampleした色でGradientを作ることもできます。

### Gradient Interpolation Method

color stopどうしの間を、どのcolor spaceで補間するかを決めます。

既定ではRGB color space上でpointからpointへ線形補間します。Manualでは、この補間で意図しない中間色が出る場合があり、別のcolor spaceを選ぶことで結果が改善する場合があると説明されています。

この項目では、21.1 ManualのGradient Color sectionに列挙されていない選択肢名までは固定しません。

### Repeat

Gradient OffsetでGradientを左右へ動かし、端を越えたときの扱いを決めます。

21.1 Manualで確認できるmodeは3つです。

- **Once** — 端を越えた側は、Gradient端の色を保つ
- **Repeat** — 反対側へ回り込み、Gradientを繰り返す
- **Ping Pong** — 端で向きを反転し、往復するように繰り返す

Gradientの始端と終端の色が大きく異なる場合、Repeatでは境界に急な色変化が出ます。Ping Pongでは逆方向へ戻るため、端のつながり方も変わります。

### Gradient Offset

Gradient上の位置をずらします。

Offsetを動かすと、Gradientそのものを左右へ送るように参照位置が変わります。Repeatとの組み合わせで、Gradientを繰り返し流したり、Ping Pongで往復させたりできます。

Manualでは、Start / End Timeによる自動的な時間割り当てを使わず、GradientをOnceにしてOffsetをanimationする方法でも同様の時間変化を作れると説明されています。

### Start Time / End Time

Gradientを割り当てる時間範囲をframe単位で指定します。

~~~text
Start Time                 End Time
    │                         │
    ▼                         ▼
Gradient開始 ───────────── Gradient終了
~~~

Start Timeを過ぎるとGradient上を進み、End Timeで終端へ到達します。

Start TimeとEnd Timeを両方0にすると、時間方向へGradientを進めず、Gradient開始位置の値を返します。

## 主な用途

### 複数の色を時間順に変化させる

2色の単純なtransitionだけでなく、複数のcolor stopを置いて「暗い色 → 中間色 → 明るい色」のような変化を1本のGradientとして設計できます。

Keyframeを色ごとに個別作成する代わりに、Gradient bar上で全体の色順と間隔を見ながら調整できます。

### Gradientの進行速度を場所ごとに変える

color stopの位置を詰めたり離したりすると、同じStart / End Timeの中でも各色へ到達するtimingが変わります。

たとえば中間の色を短時間だけ通過させたい場合は、そのcolor stop周辺の間隔を狭くできます。

### 繰り返す色変化を作る

RepeatまたはPing PongとGradient Offsetを組み合わせると、同じGradientを循環させるanimationを作れます。

一方向へ繰り返すならRepeat、端で折り返して往復させるならPing Pongを選びます。

## 最小構成

Gradient Colorを利用できるParameterへModifierを追加し、まず2点だけのGradientとStart / End Timeを設定します。

~~~text
対象Parameter
      ↑
Gradient Color Modifier
      ├─ Gradient: 色A ───── 色B
      ├─ Start Time
      └─ End Time
~~~

最初はRepeatやGradient自体のanimationを加えず、StartからEndまで一度だけ進む状態で結果を確認すると、時間範囲とGradientの関係を把握しやすくなります。

## 運用例: 10〜50フレームで3色を順に変える

次は、21.1 Manualに記載されたControlを組み合わせる**設定例**です。特定NodeやParameter型での実機検証結果ではありません。まず対象Parameterの右クリックメニューに `Modify With > Gradient Color` があることを確認してください。

60フレーム以上を確認できるCompositionを例に、10フレーム目は濃い青、30フレーム目はオレンジ、50フレーム目は白になるように色の変化を組み立てます。

1. 対応する色Parameterを右クリックして `Modify With > Gradient Color` を追加し、InspectorのModifiers tabを開きます。
2. Gradientの左端（0%）を濃い青、中央（50%）をオレンジ、右端（100%）を白に設定します。中央にstopがなければGradient barへ追加します。
3. `Start Time = 10`、`End Time = 50` を設定します。ここで指定するのはFusion内のframe番号です。
4. `Repeat = Once`、`Gradient Offset` は動かさない状態で、Fusionのframe 10・30・50を確認します。
5. 中間色をもっと早く見せたい場合は中央のstopを左へ、遅く見せたい場合は右へ移動します。Start / End Timeを動かさず、色の切り替わり方だけ変更できます。
6. 中間色が意図と異なる場合は`Gradient Interpolation Method`を確認します。RGB以外の補間を選ぶと、同じ色stopでも間の色が変わる場合があります。

Gradientの**横位置が「どの時刻の値を読むか」**を決め、各stopの**色が「その時刻に返す値」**を決めます。上の例では時間範囲が40フレームで、中央の50%の位置がその半分に対応します。Gradient自体のstop位置や色までanimationしている場合は、それらの変化も結果へ重なるため、最初は固定したGradientで確認します。

### Start / End Timeを使わず、Offsetで進める

21.1 Manualでは、`Repeat = Once` にして`Gradient Offset`をanimationする方法も案内されています。

- `Start Time` と`End Time` を両方0にし、Offsetを固定していると、Gradient開始位置の値を返します。
- 同じGradientでもOffsetをanimationすると、**どこを参照するか**が変わります。Start / End Timeによる自動進行とは分けて考えます。
- 端を越えたときの値の扱いは`Repeat`で決まります。繰り返しの境界で色が急変するなら、OffsetのanimationだけでなくRepeat modeも確認します。

## From Imageとの関係

[From Image](./from-image)は、Image上の線に沿って複数の色をsampleし、Gradientを作るModifierです。

Gradient Color ModifierのGradientへFrom Imageを使うと、Gradientを手作業だけで作らず、Imageから取得した配色を出発点にできます。

役割は次のように分かれます。

- **From Image** — ImageからGradientを作る
- **Gradient Color** — Gradientを時間へ割り当て、Parameterの値として使う

## Anim Curvesとの違い

[Anim Curves](./anim-curves)は、durationに追従する数値animation curveを作り、Easing、Mirror、Invert、Scale、Time Scaleなどで進み方を調整するModifierです。

Gradient ColorはGradientのcolor stopと補間を中心に値の変化を作ります。

- durationへ追従する数値curve、bounce、easingを作りたい — Anim Curves
- Gradientとして値の並びを作り、Start / End TimeやOffsetで進めたい — Gradient Color

対象Parameterでどちらが利用できるかは、実際のModify With menuとParameter型を確認します。

## うまく動かない場合

| 症状 | まず確認すること |
| --- | --- |
| 右クリックしてもGradient Colorが表示されない | Modifierの候補はParameter型によって異なります。対象Controlで利用できるかを確認します。 |
| Gradientを作ったのに値が変化しない | Start / End Timeが両方0のままではないか、現在frameが設定範囲内にあるかを確認します。 |
| 色の切り替わるタイミングだけが意図と違う | Start / End Timeだけでなく、各color stopの横位置を確認します。 |
| Gradientの端で急に色が飛ぶ | `Repeat`が有効で、始端と終端の色が異なっていないかを確認します。 |
| 端の色に戻る／往復する | `Repeat`と`Ping Pong`では端での参照方法が異なります。用途に合わせて選び直します。 |
| 中間の色が想定と違う | `Gradient Interpolation Method`と、途中のcolor stopを確認します。 |
| 指定範囲と関係ないframeでも色が動く | `Gradient Offset`、color stopの位置や色そのものにanimationが付いていないかを確認します。 |
| From Imageで作った色の並びが残っている | From Imageを外しても生成済みGradientは残る仕様です。現在のstop配置を確認します。 |

以上は、21.1 Manualに記載されたControlの作用から整理した**切り分け手順**です。未検証のParameter互換性やedition差を確定するものではありません。

## 注意点

Gradient Colorは、Gradient OffsetのRepeat modeによって端の挙動が大きく変わります。特にRepeatでは終端から始端へ回り込むため、両端の色が異なると境界に急な変化が生じます。

Gradient Interpolation Methodは見た目に影響します。RGBでの線形補間が常に望ましいとは限らないため、中間色が意図と違う場合は補間方法を確認します。

Start Time / End Timeはframe単位です。Templateの長さへ自動追従するduration-relativeなanimationが必要な場合は、[Anim Curves](./anim-curves)や用途に応じた別Modifierも比較します。

このページでは21.1 Manualで確認できるControl名と挙動を基準にしています。current runtimeのREGID、内部Parameter ID、対応Parameter型の完全な一覧、Manualに記載されていないdefault / range、edition差は確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [From Image](./from-image)
- [Anim Curves](./anim-curves)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3010–3011を基準にしています。

同Manualで、Gradient Colorの追加方法、Gradient、Gradient Interpolation Method、RepeatのOnce / Repeat / Ping Pong、Gradient Offset、Start Time / End Time、Start / Endを両方0にした場合の挙動を確認しています。

また、GradientへFrom Imageを適用できることを確認しています。current runtimeのREGID、内部Parameter ID、対応Parameter型の完全な一覧、Manualにないdefault / range、edition差は別のruntime verification対象です。
